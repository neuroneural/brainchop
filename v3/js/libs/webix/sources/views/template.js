import {protoUI} from "../ui/core";

import {extend,bind,toNode,delay} from "../webix/helpers";
import {ajax} from "../load/ajax";
import {create, getTextSize} from "../webix/html";
import {$active} from "../webix/skin";


import base from "./view";
import template from "../webix/template";

import AutoTooltip from "../core/autotooltip";
import AtomDataLoader from "../core/atomdataloader";
import AtomRender from "../core/atomrender";
import MouseEvents from "../core/mouseevents";
import EventSystem from "../core/eventsystem";
import Scrollable from "../core/scrollable";


const api = {
	name:"template",
	$init:function(config){
		const subtype = this._template_types[config.type];
		if (subtype){
			if (subtype.css && config.css)
				this._viewobj.className += " "+subtype.css;
			extend(config, subtype);

			//will reset borders for "section"
			if (config.borderless){
				delete config._inner;
				this._set_inner(config);
			}
		}

		if (this._dataobj == this._viewobj){
			this._dataobj = create("DIV");
			this._dataobj.className = " webix_template";
			this._viewobj.appendChild(this._dataobj);
		} else 
			this._dataobj.className += " webix_template";

		this.attachEvent("onAfterRender", this._correct_height);
	},
	setValues:function(obj, update){
		this.data = update?extend(this.data, obj, true):obj;
		this.render();
	},
	getValues:function(){
		return this.data;
	},
	$skin:function(){
		this._template_types.header.height = $active.barHeight - $active.borderWidth*2;
		this._template_types.section.height = $active.barHeight;
	},
	_template_types:{
		"header":{
			css:"webix_header"
		},
		"section":{
			css:"webix_section",
			borderless:true
		},
		"clean":{
			css:"webix_clean",
			borderless:true
		}
	},
	onClick_setter:function(value){
		this.on_click = extend((this.on_click || {}), value, true);

		if (!this._onClick)
			extend(this, MouseEvents);

		return value;
	},
	defaults:{
		template:template.empty
	},
	_render_me:function(){
		this._not_render_me = false;
		this._probably_render_me();
		this.resize();
	},
	_probably_render_me:function(){
		if (!this._not_render_me){
			this._not_render_me = true;
			this.render();
		}
	},
	src_setter:function(value){
		this._not_render_me = true;
		
		if(!this.callEvent("onBeforeLoad",[])) 
			return "";
		ajax(value, bind(function(text){
			this._settings.template = template(text);
			this._render_me();
			this.callEvent("onAfterLoad",[]);
		}, this));
		return value;
	},
	content_setter:function(config){
		if (config){
			this._not_render_me = true;
			this.render = function(){};
			this._dataobj.appendChild(toNode(config));
			this._correct_height();
		}
	},
	refresh:function(){
		this.render();
	},
	setHTML:function(html){
		this._settings.template = function(){ return html; };
		this.refresh();
	},
	setContent:function(content){
		this._dataobj.innerHTML = "";
		this.content_setter(content);
	},
	$setSize:function(x,y){
		if (base.api.$setSize.call(this,x,y)){
			this._probably_render_me();
			if (this._settings.autoheight){
				var top =this.getTopParentView();
				clearTimeout(top._template_resize_timer);
				top._template_resize_timer = delay(this.resize, this);
			}
			return true;
		}
	},
	$getSize:function(x,y){
		if (this._settings.autoheight && (!this._settings.type || this._settings.type == "clean"))
			this._settings.height = this._get_auto_height();

		return base.api.$getSize.call(this,x,y);
	},
	_correct_height:function(){
		//we need to force auto height calculation after content change
		//dropping the last_size flag will ensure that inner logic of $setSize will be processed
		if (this._settings.autoheight){
			this._last_size = null;
			this.resize();
		}
	},
	_get_auto_height:function(){
		var size;
		var padding = $active.layoutPadding.space;
		
		this._probably_render_me();

		if(!this.isVisible()){ //try getting height of a hidden template
			size = getTextSize(
				this._toHTML(this.data) || this._dataobj.innerHTML, //check for config.content 
				"webix_template",
				(this.$width || (this.getParentView() ? this.getParentView().$width :0))-padding
			).height;
		}
		else{ 
			this._dataobj.style.height = "auto";
			size = this._dataobj.scrollHeight;
			this._dataobj.style.height = "";
		}
		return size;
	},
	_one_time_scroll:true //scroll will appear only if set directly in config
};

const view = protoUI(api, Scrollable, AutoTooltip, AtomDataLoader, AtomRender, EventSystem, base.view);
export default { api, view };