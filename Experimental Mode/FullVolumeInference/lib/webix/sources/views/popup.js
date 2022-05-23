import {remove, create} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";

import window from "../views/window";
import base from "../views/view";

import {attachEvent, detachEvent} from "../webix/customevents";


const api = {
	name:"popup",
	$init:function(){
		this._settings.head = false;
		this.$view.className += " webix_popup";
		const clickHandler = attachEvent("onClick", (e)=>this._hide(e));
		this.attachEvent("onDestruct", function(){ detachEvent(clickHandler); });
		this.attachEvent("onHide", this._hide_point);
	},
	$skin:function(){
		window.api.$skin.call(this);

		this.defaults.padding = $active.popupPadding;
		this.defaults.point = !$active.popupNoPoint;
		this.defaults.borderless = $active.borderlessPopup;
	},
	close:function(){
		remove(this._point_element);
		window.api.close.call(this);
	},
	$getSize:function(x,y){
		return window.api.$getSize.call(this, x+this._settings.padding*2,y+this._settings.padding*2);
	},
	$setSize:function(x,y){
		base.api.$setSize.call(this,x,y);
		x = this._content_width-this._settings.padding*2;
		y = this._content_height-this._settings.padding*2;
		this._contentobj.style.padding = this._settings.padding+"px";
		this._headobj.style.display="none";
		this._body_cell.$setSize(x,y);
	},
	//redefine to preserve inner borders
	//_inner_body_set:function(){}, //same as win?
	_inner_body_set:function(value){
		if (typeof value.borderless == "undefined")
			value.borderless = false;
	},
	head_setter:function(){
	},
	_set_point:function(mode, left, top, fixed){
		this._hide_point();
		document.body.appendChild(this._point_element = create("DIV",{ "class":"webix_point_"+mode },""));
		this._point_element.style.zIndex = this._viewobj.style.zIndex;
		this._point_element.style.position = fixed ? "fixed":"absolute";

		this._point_element.style.top = top+"px";
		this._point_element.style.left = left+"px";
	},
	_hide_point:function(){
		this._point_element = remove(this._point_element);
	}
};



const view = protoUI(api, window.view);
export default {api, view};