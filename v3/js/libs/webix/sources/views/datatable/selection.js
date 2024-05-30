import {bind, extend, isUndefined} from "../../webix/helpers";
import {_event} from "../../webix/htmlevents";
import {assert} from "../../webix/debug";
import SelectionModel from "../../core/selectionmodel";
import DragControl from "../../core/dragcontrol";
import env from "../../webix/env";

const Mixin = {
	hover_setter:function(value){
		if (value && !this._hover_initialized){
			this._enable_mouse_move();
			this.config.experimental = true;

			this.attachEvent("onMouseMoving", e => {
				// do not show hover while dragging
				if (DragControl.active) {
					if (this._last_hover)
						this._last_hover = this.removeRowCss(this._last_hover, this._settings.hover);
					return;
				}

				let pos = this.locate(e);
				// when we click inner html element, edge calls mousemove with incorrect e.target
				if(!pos && env.isEdge && e.relatedTarget)
					pos = this.locate(e.relatedTarget);

				const row = pos ? pos.row : null;
				if (this._last_hover != row){
					if (this._last_hover)
						this.removeRowCss(this._last_hover, this._settings.hover);

					this._last_hover = row;
					if (this._last_hover)
						this.addRowCss( this._last_hover, this._settings.hover );
				}
			});

			_event(this.$view, "mouseout", e => {
				const trg = e.target;

				// inner html elements blinking in case of hover:true
				// ie and edge call mouseout when clicking inner html element
				if (this._last_hover && document.body.contains(trg)){
					const pos = e.relatedTarget ? this.locate(e.relatedTarget) : null;
					if (!pos){
						this.removeRowCss(this._last_hover, this._settings.hover);
						this._last_hover = null;
					}
				}
			});

			this._hover_initialized = 1;
		}
		return value;
	},
	select_setter:function(value){
		if (!this.select && value){
			extend(this, this._selections._commonselect, true);
			if (value === true)
				value = "row";
			else if (value == "multiselect"){
				value = "row";
				this._settings.multiselect = true;
			}
			assert(this._selections[value], "Unknown selection mode: "+value);
			extend(this, this._selections[value], true);
		}
		return value;
	},
	getSelectedId:function(mode){
		return  mode?[]:""; //dummy placeholder
	},
	getSelectedItem:function(mode){
		return SelectionModel.getSelectedItem.call(this, mode);
	},
	_selections:{
		//shared methods for all selection models
		_commonselect:{
			_select_css:" webix_cell_select",
			$init:function(){
				this._reinit_selection();

				this.on_click.webix_cell = bind(this._click_before_select, this);

				//temporary stab, actual handlers need to be created
				this._data_cleared = this._data_filtered = function(){
					this.unselect();
				};

				this.data.attachEvent("onStoreUpdated",bind(this._data_updated,this));
				this.data.attachEvent("onSyncApply", bind(this._data_synced, this));
				this.data.attachEvent("onClearAll", bind(this._data_cleared,this));
				this.data.attachEvent("onAfterFilter", bind(this._data_filtered,this));
				this.data.attachEvent("onIdChange", bind(this._id_changed,this));

				this.$ready.push(SelectionModel._set_noselect);
			},
			_id_changed:function(oldid, newid){
				for (let i=0; i<this._selected_rows.length; i++)
					if (this._selected_rows[i] == oldid)
						this._selected_rows[i] = newid;

				for (let i=0; i<this._selected_areas.length; i++){
					var item = this._selected_areas[i];
					if (item.row == oldid){
						oldid = this._select_key(item);
						item.row = newid;
						newid = this._select_key(item);
						item.id = newid;

						delete this._selected_pull[oldid];
						this._selected_pull[newid] = true;
					}
				}
			},
			_data_updated:function(id, obj, type){
				if (type == "delete") 
					this.unselect(id);
			},
			_data_synced:function(){
				for (let i = this._selected_areas.length-1; i >=0 ; i--){
					var row = this._selected_areas[i].row;
					if (!this.exists(row)){
						this._selected_areas.splice(i,1);
						delete this._selected_pull[row];
					}
				}
			},
			_reinit_selection:function(){
				//list of selected areas
				this._selected_areas=[];
				//key-value hash of selected areas, for fast search
				this._selected_pull={};
				//used to track selected cell objects
				this._selected_rows = [];
			},
			isSelected:function(id, column){
				var key;
				if (!isUndefined(column))
					key = this._select_key({ row:id, column: column});
				else 
					key = typeof id === "object"? this._select_key(id) : id;

				return this._selected_pull[key];
			},
			getSelectedId:function(asArray, plain){
				var result;

				//if multiple selections was created - return array
				//in case of single selection, return value or array, when asArray parameter provided
				if (this._selected_areas.length > 1 || asArray){
					result = [].concat(this._selected_areas);
					if (plain)
						for (let i = 0; i < result.length; i++)
							result[i]=result[i].id;
				} else {
					result = this._selected_areas[0];
					if (plain && result)
						return result.id;
				}

				return result;
			},
			_id_to_string:function(){
				return this.row;
			},
			_select:function(data, preserve){
				var key = this._select_key(data);
				//don't allow selection on unnamed columns
				if (key === null) return;

				if (preserve === -1)
					return this._unselect(data);

				data.id = key;
				data.toString = this._id_to_string;

				if (!this.callEvent("onBeforeSelect",[data, preserve])) return false;

				//ignore area, if it was already selected and
				// - we are preserving existing selection
				// - this is the only selected area
				// otherwise we need to clear other selected areas
				if (this._selected_pull[key] && (preserve || this._selected_areas.length == 1)) return;

				if (!preserve)
					this._clear_selection();

				this._selected_areas.push(data);
				this._selected_pull[key] = true;

				this.callEvent("onAfterSelect",[data, preserve]);

				
				this._finalize_select(this._post_select(data));
				return true;
			},
			_clear_selection:function(){
				if (!this._selected_areas.length) return false;

				for (let i=0; i<this._selected_areas.length; i++){
					if (!this.callEvent("onBeforeUnSelect", [this._selected_areas[i]])) return false;
				}

				for (let i=0; i<this._selected_rows.length; i++)
					this.data.removeMark(this._selected_rows[i], "webix_selected", 0, true);

				var cols = this._settings.columns;
				if (cols)
					for (let i = 0; i < cols.length; i++) {
						cols[i].$selected = null;
					}

				var data = this._selected_areas;
				this._reinit_selection();
				for (let i=0; i<data.length; i++){
					this.callEvent("onAfterUnSelect", [data[i]]);
				}
				return true;
			},
			unselectAll:function(){
				this.clearSelection();
			},
			selectAll:function(){
				this.selectRange();
			},
			clearSelection:function(){
				if (this._clear_selection()){
					this.callEvent("onSelectChange",[]);
					this.render();
				}
			},
			_unselect:function(data){
				var key = this._select_key(data);
				if (!key && this._selected_areas.length){
					this.clearSelection();
					this.callEvent("onSelectChange", []);
				}

				//ignore area, if it was already selected
				if (!this._selected_pull[key]) return;

				if (!this.callEvent("onBeforeUnSelect",[data])) return false;

				for (let i = 0; i < this._selected_areas.length; i++){
					if (this._selected_areas[i].id == key){
						this._selected_areas.splice(i,1);
						break;
					}
				}
				
				delete this._selected_pull[key];

				this.callEvent("onAfterUnSelect",[data]);
				this._finalize_select(0, this._post_unselect(data));
			},
			_add_item_select:function(id){
				var item = this.getItem(id);
				return this.data.addMark(item.id, "webix_selected", 0, { $count: 0 }, true);
			},
			_finalize_select:function(id){
				if (id)
					this._selected_rows.push(id);
				if (!this._silent_selection){
					this.render();
					this.callEvent("onSelectChange",[]);	
				}
			},
			_click_before_select:function(e, id){
				var preserve = e.ctrlKey || e.metaKey || (this._settings.multiselect == "touch");
				var range = e.shiftKey;

				if (!this._settings.multiselect && this._settings.select != "multiselect" && this._settings.select != "area")
					preserve = range = false;

				if (range && this._selected_areas.length){
					var last = this._selected_areas[this._selected_areas.length-1];
					this._selectRange(id, last);
				} else {
					if (preserve && this._selected_pull[this._select_key(id)])
						this._unselect(id);
					else
						this._select({ row: id.row, column:id.column }, preserve);
				}
			},
			_mapSelection:function(callback, column, row){
				var cols = this._settings.columns;
				//selected columns only
				if (column){
					var temp = [];
					for (let i=0; i<cols.length; i++)
						if (cols[i].$selected)
							temp.push(cols[i]);
					cols = temp;
				}

				var rows = this.data.order;
				var row_ind = 0;

				for (let i=0; i<rows.length; i++){
					var item = this.getItem(rows[i]);
					if (!item) continue; //dyn loading, row is not available
					var selection = this.data.getMark(item.id, "webix_selected");
					if (selection || column){
						var col_ind = 0;
						for (var j = 0; j < cols.length; j++){
							var id = cols[j].id;
							if (row || column || selection[id]){
								if (callback)
									item[id] = callback(item[id], rows[i], id, row_ind, col_ind);
								else
									return {row:rows[i], column:id};
								col_ind++;
							}
						}
						//use separate row counter, to count only selected rows
						row_ind++;
					}
				}
			}
		}, 

		row : {
			_select_css:" webix_row_select",
			_select_key:function(data){ return data.row; },
			select:function(row_id, preserve){
				//when we are using id from mouse events
				if (row_id) row_id = row_id.toString();

				assert(this.data.exists(row_id), "Incorrect id in select command: "+row_id);
				this._select({ row:row_id }, preserve);
			},
			_post_select:function(data){
				this._add_item_select(data.row).$row = true;
				return data.row;
			},
			unselect:function(row_id){
				this._unselect({row : row_id});
			},
			_post_unselect:function(data){
				this.data.removeMark(data.row, "webix_selected", 0, true);
				return data.row;
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, false, true);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.row, b.row);
			},
			selectRange:function(row_id, end_row_id, preserve){
				if (isUndefined(preserve)) preserve = true;

				var row_start_ind = row_id ? this.getIndexById(row_id) : 0;
				var row_end_ind = end_row_id ? this.getIndexById(end_row_id) : this.data.order.length-1;

				if (row_start_ind>row_end_ind){
					var temp = row_start_ind;
					row_start_ind = row_end_ind;
					row_end_ind = temp;
				}
				
				this._silent_selection = true;
				for (let i=row_start_ind; i<=row_end_ind; i++){
					var id = this.getIdByIndex(i);
					if (!id){
						if (row_id)
							this.select(row_id);
						break;
					}
					this.select(id, preserve);
				}

				this._silent_selection = false;
				this._finalize_select();
			}
		},

		cell:{
			_select_key:function(data){
				if (!data.column) return null;
				return data.row+"_"+data.column; 
			},
			select:function(row_id, column_id, preserve){
				assert(this.data.exists(row_id), "Incorrect id in select command: "+row_id);
				this._select({row:row_id, column:column_id}, preserve);
			},
			_post_select:function(data){
				var sel = this._add_item_select(data.row);
				sel.$count++;
				sel[data.column]=true;
				return data.row;
			},
			unselect:function(row_id, column_id){
				this._unselect({row:row_id, column:column_id});
			},
			_post_unselect:function(data){
				var sel = this._add_item_select(data.row);
				sel.$count-- ;
				sel[data.column] = false;
				if (sel.$count<=0)
					this.data.removeMark(data.row, "webix_selected", 0, true);
				return data.row;
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, false, false);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.row, a.column, b.row, b.column);
			},

			selectRange:function(row_id, column_id, end_row_id, end_column_id, preserve){
				if (isUndefined(preserve)) preserve = true;

				var row_start_ind = row_id ? this.getIndexById(row_id) : 0;
				var row_end_ind = end_row_id ? this.getIndexById(end_row_id) : this.data.order.length-1;

				var col_start_ind = column_id ? this.getColumnIndex(column_id) : 0;
				var col_end_ind = end_column_id ? this.getColumnIndex(end_column_id) : this._columns.length-1;

				if (row_start_ind>row_end_ind){
					let temp = row_start_ind;
					row_start_ind = row_end_ind;
					row_end_ind = temp;
				}
				
				if (col_start_ind>col_end_ind){
					let temp = col_start_ind;
					col_start_ind = col_end_ind;
					col_end_ind = temp;
				}

				this._silent_selection = true;
				for (let i=row_start_ind; i<=row_end_ind; i++)
					for (let j=col_start_ind; j<=col_end_ind; j++)
						this.select(this.getIdByIndex(i), this.columnId(j), preserve);
				this._silent_selection = false;
				this._finalize_select();
			}
		},

		column:{
			_select_css:" webix_column_select",
			_select_key:function(data){ return data.column; },
			_id_to_string:function(){
				return this.column;
			},
			//returns box-like area, with ordered selection cells
			select:function(column_id, preserve){
				this._select({ column:column_id }, preserve);
			},
			_post_select:function(data){
				this._settings.columns[this.getColumnIndex(data.column)].$selected = true;
				if (!this._silent_selection)
					this._render_header_and_footer();
			},
			unselect:function(column_id){
				this._unselect({column : column_id});
			},
			_post_unselect:function(data){
				this._settings.columns[this.getColumnIndex(data.column)].$selected = null;
				this._render_header_and_footer();
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, true, false);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.column, b.column);
			},
			selectRange:function(column_id, end_column_id, preserve){
				if (isUndefined(preserve)) preserve = true;

				var column_start_ind = column_id ? this.getColumnIndex(column_id) : 0;
				var column_end_ind = end_column_id ? this.getColumnIndex(end_column_id) : this._columns.length-1;

				if (column_start_ind>column_end_ind){
					var temp = column_start_ind;
					column_start_ind = column_end_ind;
					column_end_ind = temp;
				}
				
				this._silent_selection = true;
				for (let i=column_start_ind; i<=column_end_ind; i++)
					this.select(this.columnId(i), preserve);

				this._silent_selection = false;

				this._render_header_and_footer();
				this._finalize_select();
			},
			_data_synced:function(){
				//do nothing, as columns are not changed
			}
		},
		area: {
			_select_key:function(data){
				return data.row+"_"+data.column;
			},
			getSelectedId: function(asArray){
				var area = this.getSelectArea();
				var result = [];
				if(area){
					if(asArray && ( area.start.row != area.end.row || area.start.column != area.end.column )){
						var row_start_ind = this.getIndexById(area.start.row);
						var row_end_ind = this.getIndexById(area.end.row);
						//filtering in process
						if(row_start_ind == -1 || row_end_ind == -1)
							return result;

						var col_start_ind = this.getColumnIndex(area.start.column);
						var col_end_ind = this.getColumnIndex(area.end.column);

						for (let i=row_start_ind; i<=row_end_ind; i++)
							for (var j=col_start_ind; j<=col_end_ind; j++)
								result.push({row:this.getIdByIndex(i), column:this.columnId(j)});
					}
					else{
						result.push(area.end);
					}
				}

				return asArray?result:result[0];
			},
			unselect:function(){
				this._unselect();
			},
			_unselect: function() {
				this.removeSelectArea();
				this.callEvent("onSelectChange", []);
			},
			mapSelection:function(callback){
				var select  = this.getSelectArea();
				if (select){
					var sind = this.getColumnIndex(select.start.column);
					var eind = this.getColumnIndex(select.end.column);
					var srow = this.getIndexById(select.start.row);
					var erow = this.getIndexById(select.end.row);

					for (let i = srow; i <= erow; i++) {
						var rid = this.data.order[i];
						var item = this.getItem(rid);
						for (var j = sind; j <= eind; j++) {
							var cid = this._columns[j].id;
							if (callback)
								item[cid] = callback(item[cid], rid, cid, i-srow, j-sind);
							else
								return { row:rid, column:cid };
						}
					}
				}
			},
			select:function(row_id, column_id, preserve){
				assert(this.data.exists(row_id), "Incorrect id in select command: "+row_id);
				this._select({row:row_id, column:column_id}, preserve);
			},
			_selectRange:function(id,last){
				this._extendAreaRange(id, last);
			},
			_select: function(cell){
				//ctrl-selection is not supported yet, so ignoring the preserve flag
				this.addSelectArea(cell,cell,false);
				return true;
			},
			_data_synced:function(){
				if(this._selected_areas.length)
					this.refreshSelectArea();
			}
		}
	}
};

export default Mixin;