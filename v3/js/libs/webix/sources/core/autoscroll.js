import {offset} from "../webix/html";
import {delay} from "../webix/helpers";


const AutoScroll = {
	_auto_scroll:function(pos){
		let yScroll, xScroll;
		let mode = this._settings.dragscroll;

		if (typeof mode !== "string")
			mode = this._settings.layout||"xy";
		xScroll = mode.indexOf("x") !== -1;
		yScroll = mode.indexOf("y") !== -1;

		const data = this._body || this.$view;
		const box = offset(data);

		const sense = Math.max((this._settings.rowHeight||(this.type&&!isNaN(parseFloat(this.type.height))?this.type.height:0))+5, 40); //dnd auto-scroll sensivity
		let reset = false;

		if (yScroll && this._auto_y_scroll(pos, box, sense) ) reset = true;
		if (xScroll && this._auto_x_scroll(pos, box, sense) ) reset = true;

		if (reset)
			this._auto_scroll_delay = delay(this._auto_scroll, this, [pos], 100);
	},
	_auto_scroll_column:function(pos){
		const mode = this._settings.dragscroll;
		if (typeof mode === "string" && mode.indexOf("x") === -1)
			return;

		const data = this._header || this.$view;
		const box = offset(data);

		const sense = Math.max(this._settings.headerRowHeight||0, 40);
		if ( this._auto_x_scroll(pos, box, sense) )
			this._auto_scroll_delay = delay(this._auto_scroll_column, this, [pos], 100);
	},
	_auto_y_scroll:function(pos, box, sense){
		let top = box.y;
		let bottom = top + box.height;
		const scroll = this.getScrollState();

		const config = this._settings;
		if(config.topSplit){
			const topSplitPos = this._cellPosition(this.getIdByIndex(config.topSplit-1), this.columnId(0));
			top += topSplitPos.top + topSplitPos.height;
		}

		if (pos.y < (top + sense)){
			return this._auto_scrollTo(scroll.x, scroll.y-sense*2, pos, "y");
		} else if (pos.y > bottom - sense){
			return this._auto_scrollTo(scroll.x, scroll.y+sense*2, pos, "y");
		}
		return false;
	},
	_auto_x_scroll:function(pos, box, sense){
		let left = box.x;
		let right = left + box.width;
		const scroll = this.getScrollState();

		if (pos.x < (left + sense)){
			return this._auto_scrollTo(scroll.x-sense*2, scroll.y, pos, "x");
		} else if (pos.x > right - sense){
			return this._auto_scrollTo(scroll.x+sense*2, scroll.y, pos, "x");
		}
		return false;
	},
	_auto_scrollTo:function(x, y, pos, mode){
		if (this.callEvent("onBeforeAutoScroll", [pos])){
			this.scrollTo(x, y);
			this.callEvent("onAfterAutoScroll", []);

			const scroll = this.getScrollState();
			return Math.abs((mode === "x" ? x : y) - scroll[mode]) < 1;
		}
		return false;
	}
};

export default AutoScroll;