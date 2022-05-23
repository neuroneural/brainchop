import {pos, addCss, denySelect, removeCss, allowSelect, offset, posRelative} from "../../webix/html";
import {delay} from "../../webix/helpers";
import {$$, ui} from "../../ui/core";
import {_event} from "../../webix/htmlevents";

//indirect import
import "../resizearea";

const Mixin = {
	resizeRow_setter:function(value){
		this._settings.scrollAlignY = false;
		this._settings.fixedRowHeight = false;
		return this.resizeColumn_setter(value);
	},
	resizeColumn_setter:function(value){
		if (value && this._rs_init_flag){
			_event(this._viewobj, "mousemove", e => this._rs_move(e));
			_event(this._viewobj, "mousedown", e => this._rs_down(e));
			_event(this._viewobj, "mouseup", () => this._rs_up());
			this._rs_init_flag = false;
		}
		return value;
	},
	_rs_init_flag:true,
	_rs_down:function(e){
		// do not listen to mousedown of subview on master
		if (!this._rs_ready || (this._settings.subview && this != $$(e.target))) return;
		this._rs_process = [pos(e), this._rs_ready];
		addCss(document.body,"webix_noselect");
		denySelect();
	},
	_rs_up:function(){
		this._rs_process = false;
		removeCss(document.body,"webix_noselect");
		allowSelect();
	},
	_rs_start:function(){
		if (this._rs_progress) return;

		const [dir, size, node, cell] = this._rs_process[1];
		let eventPos = this._rs_process[0];
		let start;

		if (dir == "x"){
			start = offset(node).x + size - offset(this._body).x;
			eventPos = eventPos.x;
		} else {
			start = offset(node).y + size - offset(this._body).y + this._header_height;
			eventPos = eventPos.y;
		}

		this._rs_progress = [dir, cell, start];
		const resize = new ui.resizearea({
			container:this._viewobj,
			eventPos,
			start,
			dir,
			cursor:(dir == "x"?"col":"row")+"-resize"
		});
		resize.attachEvent("onResizeEnd", pos => this._rs_end(pos));

		this._rs_ready = false;
	},
	_rs_end:function(result){
		if (this._rs_progress){
			const cell = this._rs_progress[1];
			let newsize = result - this._rs_progress[2];

			if (this._rs_progress[0] == "x"){
				//in case of right split - different sizing logic applied
				if (this._settings.rightSplit && cell.cind >= this._rightSplit){
					newsize *= -1;
				}
				
				const col = this._columns[cell.cind];
				const oldwidth = col.width;

				delete col.fillspace;
				delete col.adjust;

				this._setColumnWidth(cell.cind, oldwidth + newsize, true, true);
				this._updateColsSizeSettings();
			} else {
				const id = this.getIdByIndex(cell.rind);
				const oldheight = this._getRowHeight(this.getItem(id));
				this.setRowHeight(id, oldheight + newsize);
			}
			this._rs_up();
		}
		this._rs_progress = null;
	},
	_rs_move:function(e){
		if (this._rs_ready && this._rs_process)
			return this._rs_start();
		this._rs_ready = false;

		let mode = false;
		const node = e.target;
		const config = this._settings;
		//we can't use node.className because there can be SVG (in SVG it is an SVGAnimatedString object)
		const element_class = node.getAttribute("class")||"";

		//ignore resize in case of drag-n-drop enabled
		const in_body = element_class.indexOf("webix_cell") != -1;
		if (in_body && config.drag) return this._mark_resize(mode);

		const in_header = element_class.indexOf("webix_hcell") != -1;
		if (in_body || in_header){
			const pos = posRelative(e);
			const cell = this._locate(node);

			mode = this._is_column_rs(cell, pos, node, config.resizeColumn, in_body)
				|| (in_body && this._is_row_rs(cell, pos, node, config.resizeRow));
		}

		//mark or unmark resizing ready state
		this._mark_resize(mode);
	},
	_is_column_rs:function(cell, pos, node, rColumn, in_body){
		// if resize is only within the header
		if (!rColumn || (in_body && rColumn.headerOnly)) return false;

		const dx = node.offsetWidth;
		rColumn = rColumn.size ? rColumn.size : 3;

		let col, config;
		if (pos.x < rColumn){
			if (cell.cind < this._rightSplit)
				cell.cind -= (cell.span||1);
			col = this._columns[cell.cind];
			config = ["x", 0, node, cell];
		}
		else if (dx-pos.x < rColumn+1){
			if (this._settings.rightSplit && cell.cind+1 >= this._rightSplit)
				cell.cind++;
			if (!this._settings.rightSplit || cell.cind < this._columns.length){
				col = this._columns[cell.cind];
				config = ["x", dx, node, cell];
			}
		}

		if (col && col.resize !== false){
			this._rs_ready = config;
			return "col-resize";
		}
		return false;
	},
	_is_row_rs:function(cell, pos, node, rRow){
		// if resize is only within the first column
		if (!rRow || (rRow.headerOnly && cell.cind > 0)) return false;

		// block selection in progress
		if (this._bs_progress) return false;

		const dy = node.offsetHeight;
		rRow = rRow.size ? rRow.size : 3;

		if (pos.y < rRow){
			if (cell.rind > 0){			// avoid resize header border
				cell.rind--;
				this._rs_ready = ["y", 0, node, cell];
			}
		}
		else if (dy-pos.y < rRow+1)
			this._rs_ready = ["y", dy, node, cell];

		return this._rs_ready ? "row-resize" : false;
	},
	_mark_resize:function(mode){
		if (this._cursor_timer) window.clearTimeout(this._cursor_timer);
		this._cursor_timer = delay(this._mark_resize_ready, this, [mode], mode?100:0);
	},
	_mark_resize_ready:function(mode){
		if (this._last_cursor_mode != mode){
			this._last_cursor_mode = mode;
			this._viewobj.style.cursor = mode || "";
		}
	}
};

export default Mixin;