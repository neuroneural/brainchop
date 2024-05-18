import {posRelative, pos as getPos, offset, remove, removeCss, addCss} from "../../webix/html";
import {isArray, bind, extend, delay} from "../../webix/helpers";
import {$$} from "../../ui/core";
import DragItem from "../../core/dragitem";
import DragControl from "../../core/dragcontrol";
import AutoScroll from "../../core/autoscroll";

const DragOrder = {
	_set_drop_area:function(target){
		for (let i=0; i<this._columns.length; i++){
			let column = this._columns[i];
			let node = this.getItemNode({ row:target, cind:i});
			if (node){
				node.parentNode.insertBefore(DragControl._dropHTML[i], node);
			} else column.node.appendChild(DragControl._dropHTML[i]);
		}
	},
	_init_drop_area:function(){
		let dropArea = [];
		let count = this._columns.length;
		let node = document.createElement("div");

		node.className = "webix_drop_area";
		node.style.height = this._settings.rowHeight + "px";
		node.innerHTML = this.$dropHTML();

		for (let i=0; i<count; i++)
			dropArea.push(node.cloneNode(true));

		return dropArea;
	}
};

const Mixin = {
	drag_setter:function(value){
		// disable drag-n-drop for frozen rows
		this.attachEvent("onBeforeDrag", function(context){
			return this._checkDragTopSplit(context.source);
		});
		this.attachEvent("onBeforeDragIn", function(context){
			let result = this._checkDragTopSplit(context.target);

			if (!result && DragControl._dropHTML){
				remove(DragControl._dropHTML);
				this._marked_item_id = DragControl._dropHTML = null;
			}
			return result;
		});

		DragItem.drag_setter.call(this,value);
		if (value == "order" || value == "move")
			extend(this, DragOrder, true);

		return value;
	},
	_add_css:function(source, css, mark){
		let context = DragControl._drag_context;

		if (!this._settings.prerender && !mark)
			source = [context.start];

		for (let i=0; i<source.length; i++){
			for (let j=0; j<this._columns.length; j++){
				let node = this.getItemNode({ row:source[i], cind:j});
				if (node)
					addCss(node, css);
			}
			this.data.addMark(source[i], css, 1, 1, true);
		}
	},
	_remove_css:function(source, css, mark){
		let context = DragControl._drag_context;

		if (!this._settings.prerender && !mark)
			source = [context.start];

		for (let i=0; i<source.length; i++){
			for (let j=0; j<this._columns.length; j++){
				let node = this.getItemNode({ row:source[i], cind:j});
				if (node)
					removeCss(node, css);
			}
			this.data.removeMark(source[i], css, 1, true);
		}
	},
	_checkDragTopSplit: function(ids){
		var i, index,
			frozen = false;
		if(this._settings.topSplit && ids){
			if(!isArray(ids))
				ids = [ids];
			for(i=0; !frozen && i< ids.length;i++ ){
				index = this.getIndexById(ids[i]);
				frozen = index >= 0 && index < this._settings.topSplit;
			}
		}
		return !frozen;
	},
	_toHTML:function(obj){
		var width = this._content_width - this._scrollSizeY;
		var html="<div class='webix_dd_drag' style='width:"+width+"px;'>";
		var cols = this._settings.columns;
		for (var i=0; i<cols.length; i++){
			var value = this._getValue(obj, cols[i]);
			html += "<div style='width:"+cols[i].width+"px;'>"+value+"</div>";
		}
		return html+"</div>";
	},
	getHeaderNode:function(column_id, row_index){
		return this._getHeaderNode(column_id, row_index, this._header);
	},
	getFooterNode:function(column_id, row_index){
		return this._getHeaderNode(column_id, row_index, this._footer);
	},
	_getHeaderNode:function(column_id, row_index, group){
		if(this.isColumnVisible(column_id)){
			var ind = this.getColumnIndex(column_id);
			var hind = this._settings.leftSplit > ind ? 0 : (this._rightSplit <=ind ? 2 :1 );
			row_index = row_index || 0;

			const groupNode = group.childNodes[hind];

			const row = /*@attr*/"column";
			const column = /*@attr*/"row";
			return groupNode.querySelector(`div[${row}="${ind}"][${column}="${row_index}"]`);
		}
		return null;
	},
	getItemNode:function(id){
		if (id && !id.header){
			const row = id.row || id;
			const rowindex = (typeof id.rind === "number") ? id.rind : this.getIndexById(row);
			const state = this._get_y_range();
			const minRow = state[0]-this._settings.topSplit;
			//row not visible
			if (rowindex < minRow && rowindex > state[1]) return;

			//get visible column
			const x_range = this._get_x_range();
			let colindex = this._settings.leftSplit ? 0 : x_range[0];
			const specific = (typeof id.cind === "number");
			if (id.column || specific){
				colindex = specific ? id.cind : this.getColumnIndex(id.column);
				//column not visible
				if (colindex < this._rightSplit && colindex >= this._settings.leftSplit && (colindex<x_range[0] || colindex > x_range[1]))
					return;
			}

			const column = this._settings.columns[colindex];

			if (column && column.attached && column.node){
				if (row === "$webix-drop")
					return DragControl._dropHTML[colindex];

				let nodeIndex = (rowindex<this._settings.topSplit || this._settings.prerender)?rowindex:(rowindex-minRow);
				const nodes = column.node.childNodes;
				const length = Math.min(nodes.length, nodeIndex+1);

				for (let i=0; i<length; i++)
					if (nodes[i].className === "webix_drop_area")
						nodeIndex++;

				return nodes[nodeIndex];
			}
		}
	},
	_isDraggable:function(e){
		var nodeName = e.target.nodeName;
		return nodeName != "INPUT" && nodeName != "TEXTAREA";
	},
	dragColumn_setter:function(value){
		var control; //will be defined below
		if (value == "order"){
			control = {
				$drag:bind(function(s,e){
					if(!this._isDraggable(e) || this._rs_process) return false;
					var id = this.locate(e);
					if (!id || !this.callEvent("onBeforeColumnDrag", [id.column, e])) return false;
					DragControl._drag_context = { from:control, start:id, custom:"column_dnd" };

					var column = this.getColumnConfig(id.column);

					this._relative_column_drag = posRelative(e);
					this._limit_column_drag = column.width;

					this._auto_scroll_force = true;
					return "<div class='webix_dd_drag_column' style='width:"+column.width+"px'>"+(column.header[0].text||"&nbsp;")+"</div>";
				}, this),
				$dragPos:bind(function(pos, e, node){
					var context = DragControl.getContext();
					var box = offset(this.$view);
					node.style.display = "none";
					var html = document.elementFromPoint(pos.x, box.y + (this._settings.headerRowHeight/2));

					var id = (html?this.locate(html):null);

					var start = DragControl.getContext().start.column;

					if (id && id.column != start && (!this._column_dnd_temp_block || id.column != this._last_sort_dnd_node )){
						//ignore normal dnd , and dnd from other components
						if (context.custom == "column_dnd" && $$(html) == this){

							if (!this.callEvent("onBeforeColumnDropOrder",[start, id.column,e])) return;

							var start_index = this.getColumnIndex(start);
							var end_index = this.getColumnIndex(id.column);

							//on touch devices we need to preserve drag-start element till the end of dnd
							if(e.touches){
								this._dragTarget = e.target;
								this._dragTarget.style.display = "none";
								this.$view.parentNode.appendChild(this._dragTarget);
							}

							this.moveColumn(start, end_index+(start_index<end_index?1:0));
							this._last_sort_dnd_node = id.column;
							this._column_dnd_temp_block = true;
						}
					} if (id && id.column == start){
						//flag prevent flickering just after column move
						this._column_dnd_temp_block = false;
					}

					node.style.display = "block";

					pos.x = pos.x - this._relative_column_drag.x;
					pos.y = box.y;

					if (pos.x < box.x)
						pos.x = box.x; 
					else {
						var max = box.x + this.$view.offsetWidth - this._scrollSizeY-this._limit_column_drag;
						if (pos.x > max)
							pos.x = max;
					}
					DragControl._skip = true;

					if (this._auto_scroll_delay)
						this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);

					if (this._settings.dragscroll !== false)
						this._auto_scroll_delay = delay((pos) => this._auto_scroll_column(pos), this, [getPos(e)], 250);
				}, this),
				$dragDestroy:bind(function(a, node){
					this._auto_scroll_force = null;
					if (this._auto_scroll_delay)
						this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);
					remove(node);

					//clean dnd source element
					if(this._dragTarget)
						remove(this._dragTarget);
					var id = DragControl.getContext().start;
					this.callEvent("onAfterColumnDropOrder",[id.column, this._last_sort_dnd_node, a]);
				}, this),
				$drop: function(){}
			};
		} else if (value) {
			control = {
				_inner_drag_only:true,
				$drag:bind(function(s,e){
					if(!this._isDraggable(e) || this._rs_process) return false;
					var id = this.locate(e);
					if (!id || !this.callEvent("onBeforeColumnDrag", [id.column, e])) return false;
					DragControl._drag_context = { from:control, start:id, custom:"column_dnd" };

					var header = this.getColumnConfig(id.column).header;
					var text = "&nbsp;";
					for (var i = 0; i < header.length; i++)
						if (header[i]){
							text = header[i].text;
							break;
						}

					this._auto_scroll_force = true;
					return "<div class='webix_dd_drag_column'>"+text+"</div>";
				}, this),
				$drop:bind(function(s,t,e){
					var target = e;
					//on touch devices event doesn't point to the actual drop target
					if(e.touches && this._drag_column_last)
						target = this._drag_column_last;

					var id = this.locate(target);

					if (!id) return false;
					var start = DragControl.getContext().start.column;
					if (start != id.column){
						if (!this.callEvent("onBeforeColumnDrop",[start, id.column ,e])) return;
						var start_index = this.getColumnIndex(start);
						var end_index = this.getColumnIndex(id.column);

						this.moveColumn(start, end_index+(start_index<end_index?1:0));
						this.callEvent("onAfterColumnDrop",[start, id.column, e]);
					}
				}, this),
				$dragIn:bind(function(s,t,e){
					var context = DragControl.getContext();
					//ignore normal dnd , and dnd from other components
					
					if (context.custom != "column_dnd" || context.from != control) return false;

					var target = e.target;
					while ((target.className||"").indexOf("webix_hcell") == -1){
						target = target.parentNode;
						if (!target) return;
					}


					if (this._auto_scroll_delay)
						this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);

					if (this._settings.dragscroll !== false)
						this._auto_scroll_delay = delay((pos) => this._auto_scroll_column(pos), this, [getPos(e)], 250);

					if (target != this._drag_column_last){	//new target
						if (this._drag_column_last)
							removeCss(this._drag_column_last, "webix_dd_over_column");
						addCss(target, "webix_dd_over_column");
					}

					return (this._drag_column_last = target);
				}, this),
				$dragDestroy:bind(function(a,h){
					this._auto_scroll_force = null;
					if (this._auto_scroll_delay)
						this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);

					if (this._drag_column_last)
						removeCss(this._drag_column_last, "webix_dd_over_column");
					remove(h);
				}, this)
			};
		}

		if (value){
			DragControl.addDrag(this._header, control);
			DragControl.addDrop(this._header, control, true);
			this.attachEvent("onDestruct", () => DragControl.unlink(control));

			if (!this._auto_scroll)
				extend(this, AutoScroll, true);
		}

		return value;
	}
};

export default Mixin;