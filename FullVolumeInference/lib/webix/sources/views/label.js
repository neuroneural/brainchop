import {getTextSize} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";

import button from "../views/button";

const api = {
	name:"label",
	defaults:{
		template:"<div class='webix_el_box' style='width:#awidth#px;height:#aheight#px;line-height:#cheight#px'>#label#</div>"
	},
	$skin:function(){
		button.api.$skin.call(this);

		this.defaults.height = $active.inputHeight;
	},
	focus:function(){ return false; },
	_getBox:function(){
		return this._dataobj.firstChild;
	},
	setHTML:function(html){
		this._settings.label = html;
		this.refresh();
	},
	setValue: function(value){
		this._settings.label = value;
		button.api.setValue.apply(this,arguments);
	},
	$setValue:function(value){
		this._dataobj.firstChild.innerHTML = value;
	},
	$render:function(config){
		if (config.align === "right")
			this._dataobj.firstChild.style.textAlign = "right";
	},
	_set_inner_size:false,
	_set_default_css:function(){},
	_calc_size:function(config){
		const css = "webix_el_box webixlabel" + (this.queryView("toolbar", "parent") ? " webixtoolbarlabel" : "");
		config = config || this._settings;
		if (config.autowidth)
			config.width = getTextSize(config.label, css).width;
	}
};

const view = protoUI(api, button.view);
export default {api, view};