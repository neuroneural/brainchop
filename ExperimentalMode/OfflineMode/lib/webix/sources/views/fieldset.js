import base from "../views/view";
import {protoUI, ui} from "../ui/core";
import state from "../core/state";
import {debug_size_box_start, debug_size_box_end} from "../webix/debug";


const api = {
	name:"fieldset",
	defaults:{
		borderless:true,
		$cssName:"webix_fieldset",
		paddingX: 18,
		paddingY: 30
	},
	$init:function(obj){
		obj.body = obj.body || {};

		let css = this.defaults.$cssName;
		this._viewobj.className += " "+css;
		this._viewobj.innerHTML =  "<fieldset><legend class='"+css+"_label"+(obj.required?" webix_required":"")+
			"'></legend><div class='"+css+"_body'></div></fieldset>";
	},
	label_setter:function(value){
		this._viewobj.firstChild.childNodes[0].innerHTML = value;
		return value;
	},
	getChildViews:function(){
		return [this._body_view];
	},
	body_setter:function(config){
		state._parent_cell = this;
		this._body_view = ui(config, this._viewobj.firstChild.childNodes[1]);
		return config;
	},
	getBody:function(){
		return this._body_view;
	},
	resizeChildren:function(){
		if (!this._body_view) return;
		var x = this.$width - this._settings.paddingX;
		var y = this.$height - this._settings.paddingY;
		var sizes=this._body_view.$getSize(0,0);

		//minWidth
		if (sizes[0]>x) x = sizes[0];
		//minHeight
		if (sizes[2]>y) y = sizes[2];

		this._body_view.$setSize(x,y);
		this.resize();
	},
	$getSize:function(x, y){
		if (DEBUG) debug_size_box_start(this, true);

		x += this._settings.paddingX;
		y += this._settings.paddingY;
		
		var t = this._body_view.$getSize(x, y);
		var s = this._last_body_size = base.api.$getSize.call(this, x, y);

		//inner content minWidth > outer
		if (s[0] < t[0]) s[0] = t[0];
		if (s[2] < t[2]) s[2] = t[2];
		//inner content maxWidth < outer
		if (s[1] > t[1]) s[1] = t[1];
		if (s[3] > t[3]) s[3] = t[3];
		//make max size not less than min size
		if (s[1] < s[0]) s[1] = s[0];
		if (s[3] < s[2]) s[3] = s[2];

		if (DEBUG) debug_size_box_end(this, s);
		return s;
	},
	$setSize:function(x,y){
		if (base.api.$setSize.call(this, x,y)){
			x = Math.min(this._last_body_size[1], x);
			y = Math.min(this._last_body_size[3], y);
			this._body_view.$setSize(x - this._settings.paddingX, y - this._settings.paddingY);
		}
	}
};


const view = protoUI(api,  base.view);
export default {api, view};