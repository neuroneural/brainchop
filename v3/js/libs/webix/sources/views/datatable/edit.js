import {isUndefined, bind} from "../../webix/helpers";
import {_event} from "../../webix/htmlevents";
import EditAbility from "../../core/editability";


// #include core/drag.js
// #include core/edit.js
// #include ui/inputs.js

const Mixin = {

	/////////////////////////
	//    edit start       //
	/////////////////////////
	_get_editor_type:function(id){
		return this.getColumnConfig(id.column).editor;
	},
	getEditor:function(row, column){
		if (!row)
			return this._last_editor;

		if (arguments.length == 1){
			column = row.column;
			row = row.row; 
		}
		
		return ((this._editors[row]||{})[column]);
	},
	_for_each_editor:function(handler){
		for (var row in this._editors){
			var row_editors = this._editors[row];
			for (var column in row_editors)
				if (column!="$count")
					handler.call(this, row_editors[column]);
		}
	},
	_init_editor:function(id, type, show){
		var row = id.row;
		var column  = id.column;
		var col_settings = type.config = this.getColumnConfig(column);
		//show it over cell
		if (show !== false)
			this.showCell(row, column);

		var node = type.render();

		if (type.$inline)
			node = this._locateInput(id);
		type.node = node;
			
		var item = this.getItem(row);
		var format = col_settings.editFormat;

		var value;
		if (this._settings.editMath)
			value = item["$"+column];
		value = value || item[column];

		if (isUndefined(value))
			value="";

		type.setValue(format?format(value):value, item);
		type.value = item[column];
		this._addEditor(id, type);

		if (!type.$inline)
			type._editor_pos = this._sizeToCell(id, node, true);
		

		if (type.afterRender)
			type.afterRender();
		
		if (this._settings.liveValidation){
			_event(type.node, "keyup", this._bind_live_validation(id, this));
			this.validateEditor(id);
		}

		return node;
	},
	_bind_live_validation:function(id, that){
		return function(){
			that.validateEditor(id);
		};
	},
	_get_new_value:function(editor){
		var parser = this.getColumnConfig(editor.column).editParse;
		var new_value = editor.getValue();
		return parser?parser(new_value):new_value;
	},
	_set_new_value:function(editor, new_value, copy){
		var item = copy ? {} : this.getItem(editor.row);
		item[editor.column] = new_value;

		if (this._settings.editMath)
			item["$"+editor.column] = null;

		return item;
	},
	//register editor in collection
	_addEditor:function(id, type){
		var row_editors = this._editors[id.row]=this._editors[id.row]||{};

		row_editors.$count = (row_editors.$count||0)+1;

		type.row = id.row; type.column = id.column;
		this._last_editor = row_editors[id.column] = type;

		this._in_edit_mode++;
		this._last_editor_scroll = this.getScrollState();
	},
	_removeEditor:function(editor){
		if (this._last_editor == editor)
			this._last_editor = 0;
		
		if (editor.destroy)
			editor.destroy();
		
		var row = this._editors[editor.row];
		delete row[editor.column];
		row.$count -- ;
		if (!row.$count)
			delete this._editors[editor.row];
		this._in_edit_mode--;
	},
	_changeEditorId:function(oldid, newid)	{
		var editor = this._editors[oldid];
		if (editor){
			this._editors[newid] = editor;
			delete this._editors[oldid];
			for (var key in editor)
				if (key != "$count")
					editor[key].row = newid;
		}
	},
	//get html cell by combined id
	_locate_cell:function(id){
		var area, i, index, j, node, span,
			config = this.getColumnConfig(id.column),
			cell = 0;

		if (config && config.node && config.attached){
			index = this.getIndexById(id.row);
			if(this._spans_pull){
				span = this.getSpan(id.row,id.column);
				if(span){
					for (i=0; i<3; i++){
						area = this._spans_areas[i];
						for(j=0; !cell && j < area.childNodes.length; j++){
							node = area.childNodes[j];
							if(node.getAttribute(/*@attr*/"row") == index && node.getAttribute(/*@attr*/"column") == this.getColumnIndex(id.column))
								cell = node;
						}
					}
				}
			}

			if (!cell && index >= (config._yr0-this._settings.topSplit) && index< config._yr1)
				cell = config.node.childNodes[index-config._yr0+this._settings.topSplit];
		}
		return cell;
	},

	
	/////////////////////////
	//    public methods   //
	/////////////////////////
	editCell:function(row, column, preserve, show){
		column = column || this._settings.columns[0].id;
		return EditAbility.edit.call(this, {row:row, column:column}, preserve, show);
	},
	editRow:function(id){
		if (id && id.row)
			id = id.row;

		var next = false;
		this.eachColumn(function(column){
			this.edit({ row:id, column:column}, next, !next);
			next = true;
		});
	},
	editColumn:function(id){
		if (id && id.column)
			id = id.column;

		var next = false;
		this.eachRow(function(row){
			this.edit({row:row, column:id}, next, !next);
			next = true;
		});
	},
	eachRow:function(handler, all){
		var order = this.data.order;
		if (all) 
			order = this.data._filter_order || order;

		for (let i=0; i<order.length; i++)
			handler.call(this, order[i]);
	},
	eachColumn:function(handler, all){
		const hidden = this._hidden_column_order;
		if(all && hidden.length){
			for(let i = 0; i < hidden.length; i++){
				const column = this.getColumnConfig( hidden[i] );
				handler.call(this, column.id, column);
			}
		}
		else{
			const columns = [].concat(this._columns);
			for (let i = 0; i < columns.length; i++){
				const column = columns[i];
				handler.call(this, column.id, column);
			}
		}
	},


	////////////////////
	//    edit next   //
	////////////////////
	_after_edit_next:function(editor_next){
		if (this.getSelectedId){	//select related cell when possible
			var sel = this.getSelectedId(true);
			if (sel.length == 1){
				this._select(editor_next);
				return false;
			}
		}
	},
	_custom_tab_handler:function(tab, e){
		if (this._settings.editable && !this._in_edit_mode){
			//if we have focus in some custom input inside of datatable
			if (e.target && e.target.tagName == "INPUT") return true;

			//init editor related to a single selected row/column/cell
			var selection = this.getSelectedId(true);
			if (selection.length == 1){
				var sel =  selection[0];
				if(this._settings.select == "row")
					sel.column = this._settings.columns[e.shiftKey?0:this._settings.columns.length-1].id;
				this.editNext(tab, sel);
				return false;
			}
		}
		return true;
	},

	_find_cell_next:function(start, check, direction){
		var row = this.getIndexById(start.row);
		var column = this.getColumnIndex(start.column);
		var order = this.data.order;
		var cols = this._columns;

		if (direction){

			for (let i=row; i<order.length; i++){
				for (let j=column+1; j<cols.length; j++){
					let id = { row:order[i], column:cols[j].id};
					if (check.call(this, id) && (!this._checkCellMerge || !this._checkCellMerge(start,id))){
						return id;
					}
				}
				column = -1;
			}
		} else {
			for (let i=row; i>=0; i--){
				for (let j=column-1; j>=0; j--){
					let id = { row:order[i], column:cols[j].id};
					if (check.call(this, id))
						return id;
				}
				column = cols.length;
			}
		}

		return null;
	},


	/////////////////////////////
	//    scroll correction    //
	/////////////////////////////
	_correct_after_focus_y:function(){
		if (this._in_edit_mode){
			if (this._ignore_after_focus_scroll)
				this._ignore_after_focus_scroll = false;
			else {
				this._y_scroll.scrollTo(this.getScrollState().y+this._body.childNodes[1].firstChild.scrollTop);
				this._body.childNodes[1].firstChild.scrollTop = 0;
				this._ignore_after_focus_scroll = true;
			}
		}
	},
	_correct_after_focus_x:function(){
		if (this._in_edit_mode){
			this._x_scroll.scrollTo(this._body.childNodes[1].scrollLeft);
		}
	},
	_component_specific_edit_init:function(){
		this.attachEvent("onScrollY", this._update_editor_y_pos);
		this.attachEvent("onScrollX", this._update_editor_y_pos);
		this.attachEvent("onScrollY", this._refocus_inline_editor);
		this.attachEvent("onColumnResize", function(){ this.editStop(); });
		this.attachEvent("onAfterFilter", function(){ this.editStop(); });
		this.attachEvent("onRowResize", function(){ this.editStop(); });
		this.attachEvent("onAfterScroll", function(){ if(this._settings.topSplit) this.editStop(); });
		this._body.childNodes[1].firstChild.onscroll = bind(this._correct_after_focus_y, this);
		this._body.childNodes[1].onscroll = bind(this._correct_after_focus_x, this);
	},
	_update_editor_y_pos:function(){
		if (this._in_edit_mode){
			var old  = this._last_editor_scroll;
			this._last_editor_scroll = this.getScrollState();

			var diff = this._last_editor_scroll.y - old.y;
			this._for_each_editor(function(editor){

				if (editor.getPopup){
					const node = this.getItemNode(editor);
					let isHidden = false;

					if(this._settings.prerender){
						const pos = editor._editor_pos;
						let ydiff = pos.top - this._scrollTop;
						let xdiff = pos.left - this._scrollLeft;

						isHidden = (ydiff < 0 || ydiff+pos.height > this._dtable_offset_height || 
							xdiff < 0 || xdiff+pos.width > this.$width - this._scrollSizeX);
					}
					if(!node || isHidden)
						editor.getPopup().show({ x:-10000, y:-10000 });
					else
						editor.getPopup().show(node);
					
				}
				if (!this._settings.prerender && !editor.linkInput && !editor.$inline){
					editor.node.top -= diff;
					editor.node.style.top = editor.node.top + "px";
				}
			});
		}
	}

};

export default Mixin;