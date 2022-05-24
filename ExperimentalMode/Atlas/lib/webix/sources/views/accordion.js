import {protoUI} from "../ui/core";
import {_each} from "../ui/helpers";
import {isUndefined} from "../webix/helpers";
import {$active} from "../webix/skin";
import base from "./layout";

const api = {
	name:"accordion",
	defaults:{
		panelClass:"accordionitem",
		multi:false,
		collapsed:false
	},
	$init:function(){
		this._viewobj.setAttribute("role", "tablist");
		this._viewobj.setAttribute("aria-multiselectable", "true");
	},
	_replace:function(newview){
		base.api._replace.apply(this, arguments);
		if (newview.collapsed_setter && newview.refresh){
			newview.refresh();
		}
	},
	_parse_cells:function(){
		var panel = this._settings.panelClass;
		var cells = this._collection;

		for (var i=0; i<cells.length; i++){
			if ((cells[i].body || cells[i].header)&& !cells[i].view && !cells[i].align)
				cells[i].view = panel;
			if (isUndefined(cells[i].collapsed))
				cells[i].collapsed = this._settings.collapsed;

		}

	
		this._skin_render_collapse = true;
		base.api._parse_cells.call(this);
		this._skin_render_collapse = false;

		for (let i=0; i < this._cells.length; i++){
			if (this._cells[i].name == panel) 
				this._cells[i].refresh();
			this._cells[i]._accLastChild = false;
		}
		var found = false;
		for (let i=this._cells.length-1; i>=0 &&!found; i--){
			if(!this._cells[i]._settings.hidden){
				this._cells[i]._accLastChild = true;
				found = true;
			}
		}

	},
	_afterOpen:function(view){
		if (this._settings.multi === false && this._skin_render_collapse !== true){
			for (var i=0; i < this._cells.length; i++) {
				if (view != this._cells[i] && !this._cells[i]._settings.collapsed && this._cells[i].collapse)
					this._cells[i].collapse();
			}
		}
		if (view.callEvent){
			view.callEvent("onViewShow",[]);
			_each(view, this._signal_hidden_cells);
		}
	},
	_canCollapse:function(view){
		if (this._settings.multi === true || this._skin_render_collapse) return true;
		//can collapse only if you have other item to open
		for (var i=0; i < this._cells.length; i++)
			if (view != this._cells[i] && !this._cells[i]._settings.collapsed && this._cells[i].isVisible() && !this._cells[i].$nospace)
				return true;
		return false;
	},
	$skin:function(){
		base.api.$skin.call(this);

		if($active.accordionType)
			this.defaults.type = $active.accordionType;
	}
};


const view = protoUI(api, base.view);
export default {api, view};