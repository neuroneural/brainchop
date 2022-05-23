import base from "../views/view";
import SingleRender from "../core/singlerender";
import Settings from "../core/settings";
import EventSystem from "../core/eventsystem";
import {create, createCss, insertBefore} from "../webix/html";
import {protoUI} from "../ui/core";
import {extend} from "../webix/helpers";
import template from "../webix/template";


/*
	UI: Tooltip
	
	@export
		show
		hide
*/

// #include core/template.js
// #include core/single_render.js

const api = {
	name:"tooltip",
	defaults:{
		dy:0,
		dx:20
	},
	$init:function(config){
		if (typeof config == "string"){
			config = { template:config };
		}

		//create  container for future tooltip
		this.$view = this._viewobj = this._contentobj = this._dataobj = create("DIV", {role:"alert", "aria-atomic":"true"});
		this._viewobj.className = this._css_name;
		insertBefore(this._contentobj,document.body.firstChild,document.body);
	},
	adjust:function(){  },
	isVisible:function(){
		return this._visible;
	},
	_alt_render:function(text){
		if (this.callEvent("onBeforeRender",[text])){
			//it is critical to have this as two commands
			//its prevent destruction race in Chrome
			this._dataobj.innerHTML = "";
			this._dataobj.innerHTML = text;
			this.callEvent("onAfterRender",[]);
		}
	},
	_css_name:"webix_tooltip",
	css_setter:function(value){
		if (typeof value === "object")
			value = createCss(value);

		this._viewobj.className = this._css_name+" "+value;
		return value;
	},
	//show tooltip
	//pos - object, pos.x - left, pox.y - top
	show:function(data,pos){
		if (this._disabled) return;

		this._visible = true;
		if (typeof data === "string")
			this._alt_render(data);
		else {
			this.data = extend({}, data);
			this.render();
		}

		if (this._dataobj.firstChild){
			//show at specified position
			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
			var positionX = w - pos.x;
			var positionY = h - pos.y;

			this._contentobj.style.display = "block";
			
			if (positionX - this._settings.dx > this._contentobj.offsetWidth)
				positionX = pos.x;
			else {
				positionX = (pos.x - (this._settings.dx * 2)) - this._contentobj.offsetWidth;
				if (positionX < 0) positionX = 0;
			}

			if (positionY - this._settings.dy > this._contentobj.offsetHeight)
				positionY = pos.y;
			else {
				positionY = (pos.y - (this._settings.dy * 2)) - this._contentobj.offsetHeight;
				if (positionY < 0) positionY = 0;
			}
			this._contentobj.style.left = positionX+this._settings.dx+"px";
			this._contentobj.style.top = positionY+this._settings.dy+"px";
		} else this.hide();
	},
	//hide tooltip
	hide:function(){
		if (this._visible){
			this.data = null; //nulify, to be sure that on next show it will be fresh-rendered
			this._contentobj.style.display = "none";
			this._visible = false;
		}
	},
	disable:function(){
		this._disabled = true;
	},
	enable:function(){
		this._disabled = false;
	},
	type:{
		template:template("{obj.value}"),
		templateStart:template.empty,
		templateEnd:template.empty
	}

};


const view = protoUI(api,  SingleRender, Settings, EventSystem, base.view);
export default {api, view};