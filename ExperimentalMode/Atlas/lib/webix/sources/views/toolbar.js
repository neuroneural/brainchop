import {protoUI} from "../ui/core";

import {_each} from "../ui/helpers";
import {extend} from "../webix/helpers";
import {debug_size_box} from "../webix/debug";

import layout from "../views/layout";

import Scrollable from "../core/scrollable";
import AtomDataLoader from "../core/atomdataloader";
import Values from "../core/values";
import ValidateData from "../core/validatedata";


const api = {
	name:"toolbar",
	defaults:{
		type:"toolbar"
	},
	_render_borders:true,
	_form_classname:"webix_toolbar",
	_form_vertical:false,
	$init:function(config){
		if (!config.borderless){
			this._contentobj.style.borderWidth="1px";
			this._settings._inner = {top:false, left:false, right:false, bottom:false };
		}

		this._contentobj.className+=" "+this._form_classname;
		this._viewobj.setAttribute("role", "toolbar");
	},
	_recollect_elements:function(){
		var form = this;
		form.elements = {};
		_each(this, function(view){
			if (view._settings.name && view.getValue && view.setValue){
				form.elements[view._settings.name] = view;
				if (view.mapEvent)
					view.mapEvent({
						onbeforetabclick:form,
						onaftertabclick:form,
						onitemclick:form,
						onchange:form
					});
			}

			if (view.setValues || view._fill_data) return false;
		});
		var old = this._values;
		this.setDirty(false);
		if (old) {
			//restore dirty state after form reconstructing
			var now = this._values;
			for (var key in form.elements) 
				if (old[key] && now[key] != old[key]){
					now[key] = old[key];
					this.setDirty(true);
				}
		}
	},
	_parse_cells_ext_end:function(){
		this._recollect_elements();
	},
	_parse_cells_ext:function(collection){
		var config = this._settings;
		if (config.elements && !collection){
			this._collection = collection = config.elements;
			this._vertical_orientation = this._form_vertical;
			delete config.elements;
		}

		if (this._settings.elementsConfig)
			this._rec_apply_settings(this._collection, config.elementsConfig);
		
		return collection;
	},
	_rec_apply_settings:function(col, settings){
		for (var i=0; i<col.length; i++){
			var element = col[i];
			extend( element, settings );
			var nextsettings = settings;

			if (element.elementsConfig)
				nextsettings = extend(extend({}, element.elementsConfig), settings);

			var sub;
			if (element.body)
				sub = [element.body];
			else
				sub = element.rows || element.cols || element.cells || element.body;

			if (sub)
				this._rec_apply_settings(sub, nextsettings);
		}
	},
	$getSize:function(dx, dy){
		var sizes = layout.api.$getSize.call(this, dx, dy);
		var parent = this.getParentView();
		var index = this._vertical_orientation?3:1;
		if (parent && this._vertical_orientation != parent._vertical_orientation)
			sizes[index]+=100000;
		
		if (DEBUG) debug_size_box(this, sizes, true);
		return sizes;
	},
	render:function(){
	},
	refresh:function(){
		this.render();
	}
};

const view = protoUI(api, Scrollable, AtomDataLoader, Values, layout.view, ValidateData);
export default {api, view};