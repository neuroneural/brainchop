import datatable from "../views/datatable";
import TreeAPI from "../core/treeapi";
import TreeStateCheckbox from "../core/treestatecheckbox";
import TreeDataLoader from "../core/treedataloader";
import {protoUI} from "../ui/core";
import template from "../webix/template";
import {extend} from "../webix/helpers";
import TreeStore from "../core/treestore";
import TreeType from "../core/treetype";
import TreeDataMove from "../core/treedatamove";
import TreeClick from "../core/treeclick";
import DataState from "../core/datastate";
import TreeTablePaste from "../core/treetablepaste";
import TablePaste from "../core/tablepaste";


const api = {
	name:"treetable",
	$init:function(){
		extend(this.data, TreeStore, true);
		extend(this.type, TreeType);
		extend(this,  TreeDataMove, true);

		for (var key in TreeClick)
			if (!this.on_click[key])
				this.on_click[key] = this._unwrap_id(TreeClick[key]);
		
		this.type.treetable = template("{common.space()}{common.icon()} {common.folder()}");
		this.type.treecheckbox = function(obj){
			if (obj.indeterminate && !obj.nocheckbox)
				return "<div class='webix_tree_checkbox webix_indeterminate'></div>";
			else
				return TreeType.checkbox.apply(this, arguments);
		};
	
		this.data.provideApi(this,true);

		this._viewobj.setAttribute("role", "treegrid");

	},
	_drag_order_complex:false,
	_unwrap_id:function(original){
		return function (e,id){
			id = id.row;
			return original.call(this,e,id);
		};
	},
	_close_branches:function(context){
		let source = !this._settings.prerender ? [context.start] : context.source;
		for (let i=0; i<source.length; i++)
			this.close(source[i]);
	},
	getState:function(){
		var state = DataState.getState.call(this);
		extend(state, TreeAPI.getState.call(this));
		return state;
	},
	setState:function(state){
		if (TreeAPI.setState.call(this, state)){
			//run grid-state only when tree component was fully loaded 
			DataState.setState.call(this, state);	
		}
	},
	clipboard_setter: function(value) {
		extend(this._paste, TreeTablePaste);
		return TablePaste.clipboard_setter.call(this, value);
	},
	_run_load_next:function(conf, direction){
		for (var i=0; i<conf.start; i++){
			var id = this.data.order[i];
			if (id && this.getItem(id).$level != 1)
				conf.start--;
		}
		return datatable.api._run_load_next.call(this, conf, direction);
	},
};


const view = protoUI(api,  TreeAPI, TreeStateCheckbox, TreeDataLoader, datatable.view);
export default {api, view};