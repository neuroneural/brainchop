import {offset, pos as getPos, preventEvent, remove, removeCss, create, addCss} from "../../webix/html";
import env from "../../webix/env";
import {extend, delay} from "../../webix/helpers";
import {$$} from "../../ui/core";
import {_event, event, eventRemove} from "../../webix/htmlevents";
import AutoScroll from "../../core/autoscroll";


// #include core/autoscroll.js
const Mixin = {
	blockselect_setter:function(value){
		if (value && this._block_sel_flag){
			if (env.touch)
				this.attachEvent("onLongTouch", this._bs_down);
			else 
				_event(this._viewobj, env.mouse.down, this._bs_down, {bind:this});

			_event(this._viewobj, env.mouse.move, this._bs_move, {bind:this});
			this._block_sel_flag = this._bs_ready = this._bs_progress = false;
			this.attachEvent("onAfterScroll", this._update_block_selection);
			// auto scroll
			extend(this, AutoScroll, true);
			this.attachEvent("onBeforeAutoScroll",function(){
				return this._bs_progress;
			});
		}
		return value;
	},
	_block_sel_flag:true,
	_childOf:function(e, tag){
		let src = e.target;
		while (src){
			if (src.getAttribute && src.getAttribute(/*@attr*/"webixignore")) return false;
			if (src == tag)
				return true;
			src = src.parentNode;
		}
		return false;
	},
	_bs_down:function(e){
		// do not listen to mousedown of subview on master
		if (this._settings.subview && this != $$(e.target)) return;
		if (this._childOf(e, this._body)){
			//disable block selection when we have an active editor
			if (e.target && e.target.tagName == "INPUT" || this._rs_process) return;

			this._bs_position = offset(this._body);
			const pos = env.touch ? e : getPos(e);
			this._bs_ready = [pos.x - this._bs_position.x, pos.y - this._bs_position.y];

			preventEvent(e);
			this._bs_up_init();
		}
	},
	_bs_up_init:function(){
		const handler = event(document.body, env.mouse.up, e => {
			eventRemove(handler);
			return this._bs_up(e);
		});
	},
	_bs_up:function(e){
		if (this._block_panel){
			this._bs_select("select", true, e);
			this._block_panel = remove(this._block_panel);
		}
		removeCss(document.body,"webix_noselect");
		this._bs_ready = this._bs_progress = false;
		if (this._auto_scroll_delay)
			this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);
	},
	_update_block_selection: function(){
		if (this._bs_progress)
			delay(this._bs_select, this, [false, false]);
	},
	_bs_select:function(mode, theend, e){
		let start = null;
		if(!this._bs_ready[2])
			this._bs_ready[2] = this._locate_cell_xy.apply(this, this._bs_ready);
		start = this._bs_ready[2];

		const end = this._locate_cell_xy.apply(this, this._bs_progress);

		if (!this.callEvent("onBeforeBlockSelect", [start, end, theend, e]))
			return;

		if ((!this._bs_do_select || this._bs_do_select(start, end, theend, e) !== false) && (start.row && end.row)){
			if (mode === "select"){
				this._clear_selection();
				this._selectRange(start, end);
			} else {
				let startx, starty, endx, endy;

				if (mode === "box"){
					startx = Math.min(this._bs_ready[0],this._bs_progress[0]);
					endx = Math.max(this._bs_ready[0],this._bs_progress[0]);

					starty = Math.min(this._bs_ready[1],this._bs_progress[1]);
					endy = Math.max(this._bs_ready[1],this._bs_progress[1]);
				} else {
					const startn = this._cellPosition(start.row, start.column);
					const endn = this._cellPosition(end.row, end.column);
					const scroll = this.getScrollState();

					let startWidth = startn.width;
					let endWidth = endn.width;

					if (this._right_width && this._bs_ready[0] > this._left_width+this._center_width){
						startn.left += this._left_width+this._center_width;
					} else if (this._left_width){

						if (this._bs_ready[0] > this._left_width){
							if(startn.left < scroll.x){
								startWidth -= scroll.x-startn.left;
								startn.left = this._left_width;
							}
							else
								startn.left+=this._left_width-scroll.x;

						}

					} else startn.left -= scroll.x;



					if (this._right_width && this._bs_progress[0] > this._left_width+this._center_width){
						endn.left += this._left_width+this._center_width;
					} else if (this._left_width){
						if (this._bs_progress[0] > this._left_width){
							if(endn.left < scroll.x){
								endWidth -= scroll.x-endn.left;
								endn.left = this._left_width;
							}

							else
								endn.left+=this._left_width-scroll.x;
						}
					} else endn.left -= scroll.x;

					if(this._settings.prerender){
						startn.top -= this._scrollTop;
						endn.top -= this._scrollTop;
					}


					startx = Math.min(startn.left, endn.left);
					endx = Math.max(startn.left+startWidth, endn.left+endWidth);

					starty = Math.min(startn.top, endn.top);
					endy = Math.max(startn.top+startn.height, endn.top+endn.height);

					if (this._settings.topSplit)
						starty += this._getTopSplitOffset(start);

					if (this._auto_scroll_delay)
						this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);
					if (e && (!env.touch || this._settings.prerender))
						this._auto_scroll_delay = delay(this._auto_scroll, this, [getPos(e)], 250);
				}

				const style = this._block_panel.style;
				style.left = startx+"px";
				style.top = starty+"px";
				style.width = (endx-startx)+"px";
				style.height = (endy-starty)+"px";

			}
		}

		if (theend)
			this.callEvent("onAfterBlockSelect", [start, end]);
	},
	_bs_start:function(){
		this._block_panel = create("div", {"class":"webix_block_selection"},"");

		this._body.appendChild(this._block_panel);
	},
	_bs_move:function(e){
		if (this._rs_progress) return;
		if (this._bs_ready !== false){
			if(!this._bs_progress) addCss(document.body,"webix_noselect");

			const pos = env.touch ? env.mouse.context(e) : getPos(e);
			const progress = [pos.x - this._bs_position.x, pos.y - this._bs_position.y];

			//prevent unnecessary block selection while dbl-clicking
			if (Math.abs(this._bs_ready[0] - progress[0]) < 5 && Math.abs(this._bs_ready[1] - progress[1]) < 5)
				return;

			if (this._bs_progress === false)
				this._bs_start(e);

			this._bs_progress = progress;
			this._bs_select(this.config.blockselect, false, e);

			if (env.touch) preventEvent(e);
		}
	},
	_locate_cell_xy:function(x,y){
		let inTopSplit = false,
			row = null,
			column = null;


		if (this._right_width && x>this._left_width + this._center_width)
			x+= this._x_scroll.getSize()-this._center_width-this._left_width-this._right_width; 
		else if (!this._left_width || x>this._left_width)
			x+= this._x_scroll.getScroll();

		if(this._settings.topSplit && this._render_scroll_top > this._settings.topSplit) {
			const splitPos = this._cellPosition(this.getIdByIndex(this._settings.topSplit-1), this.columnId(0));
			if(splitPos.top + splitPos.height > y){
				inTopSplit = true;
			}
		}
		if(!inTopSplit)
			y += this.getScrollState().y;

		if (x<0) x=0;
		if (y<0) y=0;

		const cols = this._settings.columns;
		const rows = this.data.order;

		let summ = 0; 
		for (let i=0; i<cols.length; i++){
			summ+=cols[i].width;
			if (summ>=x){
				column = cols[i].id;
				break;
			}
		}
		if (!column)
			column = cols[cols.length-1].id;

		summ = 0;

		const start = this.data.$min || 0;
		if (this._settings.fixedRowHeight){
			row = rows[start + Math.floor(y/this._settings.rowHeight)];
		} else for (let i=start; i<rows.length; i++){
			summ+=this._getHeightByIndex(i);
			if (summ>=y){
				row = rows[i];
				break;
			}
		}
		if (!row)
			row = rows[rows.length-1];

		return {row:row, column:column};
	},
	_getTopSplitOffset: function(cell, area){
		let y = 0,
			startIndex = this.getIndexById(cell.row);

		if(startIndex >= this._settings.topSplit){
			const startPos = this._cellPosition(this.getIdByIndex(startIndex), cell.column);
			const splitPos = this._cellPosition(this.getIdByIndex(this._settings.topSplit-1), cell.column);
			if(splitPos.top + splitPos.height > startPos.top)
				y = splitPos.top + splitPos.height - ((startPos.top > 0 || !area) ? startPos.top : 0);
		}

		return y;
	}
};

export default Mixin;