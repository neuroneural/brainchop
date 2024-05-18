import {addCss, removeCss} from "../webix/html";
import {_to_array, bind, isArray} from "../webix/helpers";
import {_event, event} from "../webix/htmlevents";
import {assert} from "../webix/debug";

import ready from "../webix/ready";
import state from "../core/state";


/*
	Behavior:SelectionModel - manage selection states
	@export
		select
		unselect
		selectAll
		unselectAll
		isSelected
		getSelectedId
*/
const SelectionModel ={
	$init:function(){
		//collection of selected IDs
		this._selected = _to_array();
		assert(this.data, "SelectionModel :: Component doesn't have DataStore");

		//remove selection from deleted items
		this.data.attachEvent("onStoreUpdated",bind(this._data_updated,this));
		this.data.attachEvent("onStoreLoad", bind(this._data_loaded,this));
		this.data.attachEvent("onAfterFilter", bind(this._data_filtered,this));
		this.data.attachEvent("onSyncApply", bind(this._select_check,this));
		this.data.attachEvent("onIdChange", bind(this._id_changed,this));
		this.$ready.push(this._set_noselect);
	},
	_set_noselect: function(){
		if (this._settings.select=="multiselect" || this._settings.multiselect || this._settings.select=="area")
			_event(this.$view,"mousedown", function(e){
				var shiftKey = (e||window.event).shiftKey;
				if(shiftKey){
					state._noselect_element = this;
					addCss(this,"webix_noselect",1);
				}
			});
	},
	_id_changed:function(oldid, newid){
		for (var i = this._selected.length - 1; i >= 0; i--)
			if (this._selected[i]==oldid)
				this._selected[i]=newid;
	},
	_data_filtered:function(){
		for (var i = this._selected.length - 1; i >= 0; i--){
			if (this.data.getIndexById(this._selected[i]) < 0) {
				var id = this._selected[i];
				this.removeCss(id, "webix_selected", true);
				this._selected.splice(i,1);
				this.callEvent("onSelectChange",[id]);
			}
		}
	},
	//helper - linked to onStoreUpdated
	_data_updated:function(id,obj,type){
		if (type == "delete"){				//remove selection from deleted items
			if (this.loadBranch){
				//hierarchy, need to check all
				this._select_check();
			} else
				this._selected.remove(id);
		}
		else if (!id && !this.data.count() && !this.data._filter_order && !this.data._filter_branch){	//remove selection for clearAll
			this._selected = _to_array();
		}
	},
	_data_loaded:function(){
		if (this._settings.select)
			this.data.each(function(obj){
				if (obj && obj.$selected) this.select(obj.id);
			}, this);
	},
	_select_check:function(){
		for (var i = this._selected.length - 1; i >= 0; i--)
			if (!this.exists(this._selected[i]))
				this._selected.splice(i,1);
	},
	//helper - changes state of selection for some item
	_select_mark:function(id,state,refresh,need_unselect){
		var sname = state ? "onBeforeSelect" : "onBeforeUnSelect";
		if (!this.callEvent(sname,[id,state])) return false;

		if (need_unselect){
			this._silent_selection = true;
			this.unselectAll();
			this._silent_selection = false;
		}
		
		if (state)
			this.addCss(id, "webix_selected", true);
		else
			this.removeCss(id, "webix_selected", true);

		if (refresh)
			refresh.push(id);				//if we in the mass-select mode - collect all changed IDs
		else{
			if (state)
				this._selected.push(id);		//then add to list of selected items
			else
				this._selected.remove(id);
			this._refresh_selection(id);	//othervise trigger repainting
		}

		var ename = state ? "onAfterSelect" : "onAfterUnSelect";
		this.callEvent(ename,[id]);

		return true;
	},
	//select some item
	select:function(id,preserve){
		var ctrlKey = arguments[2];
		var shiftKey = arguments[3];
		//if id not provide - works as selectAll
		if (!id) return this.selectAll();

		//allow an array of ids as parameter
		if (isArray(id)){
			for (var i=0; i < id.length; i++)
				this.select(id[i], (i?1:preserve), ctrlKey, shiftKey);
			return;
		}

		assert(this.data.exists(id), "Incorrect id in select command: "+id);
		
		//block selection mode
		if (shiftKey && this._selected.length)
			return this.selectAll(this._selected[this._selected.length-1],id);

		//single selection mode
		var need_unselect = false;
		if (!ctrlKey && !preserve && (this._selected.length!=1 || this._selected[0]!=id))
			need_unselect = true;

		if (!need_unselect && this.isSelected(id)){
			if (ctrlKey) this.unselect(id);	//ctrl-selection of already selected item
			return;
		}

		this._select_mark(id, true, null, need_unselect);
	},
	//unselect some item
	unselect:function(id){
		//if id is not provided  - unselect all items
		if (!id) return this.unselectAll();
		if (!this.isSelected(id)) return;
		
		this._select_mark(id,false);
	},
	//select all items, or all in defined range
	selectAll:function(from,to){
		var range;
		var refresh=[];
		
		if (from||to)
			range = this.data.getRange(from||null,to||null);	//get limited set if bounds defined
		else
			range = this.data.getRange();			//get all items in other case
		//in case of paging - it will be current page only
		range.each(function(obj){ 
			if (!this.data.getMark(obj.id, "webix_selected")){
				this._selected.push(obj.id);	
				this._select_mark(obj.id,true,refresh);
			}
		},this);
		//repaint self
		this._refresh_selection(refresh);
	},
	//remove selection from all items
	unselectAll:function(){
		var refresh=[];
		
		this._selected.each(function(id){
			this._select_mark(id,false,refresh);	//unmark selected only
		},this);
		
		this._selected=_to_array();
		this._refresh_selection(refresh);	//repaint self
	},
	//returns true if item is selected
	isSelected:function(id){
		return this._selected.find(id)!=-1;
	},
	/*
		returns ID of selected items or array of IDs
		to make result predictable - as_array can be used, 
			with such flag command will always return an array 
			empty array in case when no item was selected
	*/
	getSelectedId:function(as_array){	
		switch(this._selected.length){
			case 0: return as_array?[]:"";
			case 1: return as_array?[this._selected[0]]:this._selected[0];
			default: return ([].concat(this._selected)); //isolation
		}
	},
	getSelectedItem:function(as_array){
		var sel = this.getSelectedId(true);
		if (sel.length > 1 || as_array){
			for (var i = sel.length - 1; i >= 0; i--)
				sel[i] = this.getItem(sel[i]);
			return sel;
		} else if (sel.length)
			return this.getItem(sel[0]);
	},
	//detects which repainting mode need to be used
	_is_mass_selection:function(obj){
		// crappy heuristic, but will do the job
		return obj.length>100 || obj.length > this.data.count/2;
	},
	_refresh_selection:function(refresh){
		if (typeof refresh != "object") refresh = [refresh];
		if (!refresh.length) return;	//nothing to repaint
		
		if (this._is_mass_selection(refresh))	
			this.data.refresh();	//many items was selected - repaint whole view
		else
			for (var i=0; i < refresh.length; i++)	//repaint only selected
				this.render(refresh[i],this.data.getItem(refresh[i]),"update");
			
		if (!this._silent_selection)	
			this.callEvent("onSelectChange",[refresh]);
	}
};

ready(function(){
	event(document.body,"mouseup", function(){
		if(state._noselect_element){
			removeCss(state._noselect_element,"webix_noselect");
			state._noselect_element = null;
		}
	});
});

export default SelectionModel;