import {protoUI} from "../ui/core";
import env from "../webix/env";

import layout from "../views/layout";
import toolbar from "../views/toolbar";


const api = {
	name:"form",
	defaults:{
		type:"form",
		autoheight:true
	},
	_default_height:-1,
	_form_classname:"webix_form",
	_form_vertical:true,
	$init:function(){
		this._viewobj.setAttribute("role", "form");
	},
	$getSize:function(dx, dy){
		if (this._scroll_y && !this._settings.width) dx += env.scrollSize;

		var sizes = layout.api.$getSize.call(this, dx, dy);

		if (this._settings.scroll || !this._settings.autoheight){
			sizes[2] =  this._settings.height || this._settings.minHeight || 0;
			sizes[3] = this._settings.height || 100000;
		}
		
		return sizes;
	}
};


const view = protoUI(api, toolbar.view);
export default {api, view};