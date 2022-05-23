import {create, remove, createCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {extend, bind, delay} from "../webix/helpers";

import template from "../webix/template";
import env from "../webix/env";

import base from "../views/view";
import proto from "../views/proto";

import DataMove from "../core/datamove";
import DragItem from "../core/dragitem";
import MouseEvents from "../core/mouseevents";
import KeysNavigation from "../core/keysnavigation";
import SelectionModel from "../core/selectionmodel";
import Scrollable from "../core/scrollable";
import CustomPrint from "../core/customprint";
import VirtualRenderStack from "../core/virtualrenderstack";


/*
	UI:DataView
*/

// #include ui/component.js
// #include core/mouse.js 	
// #include core/edit.js 
// #include core/selection.js 

// #include core/drag.js
// #include core/move.js
// #include core/virtual_render.js
// #include core/keynav.js
// #include core/print.js

const api = {
	name:"dataview",
	$init:function(config){
		if (config.sizeToContent)
			//method need to be called before data-loaders
			//so we are using unshift to place it at start
			this.$ready.unshift(this._after_init_call);
		
		var type = config.type || config.item;
		var prerender = config.prerender || this.defaults.prerender || (type && type.width =="auto") || config.drag == "move" || config.drag == "order";
		
		if (!prerender && !config.autoheight)
			extend(this, VirtualRenderStack, true);
		if (config.autoheight)
			config.scroll = false;

		if (type && type.type == "tiles"){
			this._tilesPadding = type.padding || this.type.padding;
			this._viewobj.firstChild.style.float = "left";
			this._viewobj.firstChild.style.padding = (this._tilesPadding/2) + "px";
		}

		this._contentobj.className += " webix_dataview";
		this._viewobj.setAttribute("role", "listbox");
	},
	_after_init_call:function(){
		const test = create("DIV",0,this.type.template({}));
		test.className = "webix_dataview_item";
		test.style.position = "absolute";
		document.body.appendChild(test);

		this.type.width = test.offsetWidth + this._tilesPadding;
		this.type.height = test.offsetHeight + this._tilesPadding;

		remove(test);
	},
	defaults:{
		scroll:true,
		datafetch:50,
		navigation:true
	},
	_id:/*@attr*/"webix_l_id",
	_itemClassName:"webix_dataview_item",
	_tilesPadding:0,
	_drag_direction:"x",
	on_click:{
		webix_dataview_item:function(e,id){
			if (this._settings.select){
				if (this._settings.select=="multiselect" || this._settings.multiselect)
					this.select(id, false, ((this._settings.multiselect == "touch") || e.ctrlKey || e.metaKey), e.shiftKey); 	//multiselection
				else
					this.select(id);
			}
		}
	},
	on_dblclick:{
	},
	on_mouse_move:{
	},
	type:{
		//normal state of item
		template:template("#value#"),
		//in case of dyn. loading - temporary spacer
		templateLoading:template("Loading..."),
		width:160,
		height:50,
		padding:8,
		classname:function(obj, common, marks){
			var css = "webix_dataview_item";

			if (common.css) css += " "+common.css;
			if (common.type) css += " "+common.type;
			if (obj.$css){
				if (typeof obj.$css == "object")
					obj.$css = createCss(obj.$css);
				css += " "+obj.$css;
			}
			if (marks && marks.$css) css += " "+marks.$css;
			
			return css;
		},
		aria:function(obj, common, marks){
			return "role=\"option\""+(marks && marks.webix_selected?" aria-selected=\"true\" tabindex=\"0\"":" tabindex=\"-1\"");
		},
		templateStart:function(obj, common, marks){
			let {width, height} = common;
			let padding = 0;

			if (common.type == "tiles"){
				width -= common.padding;
				height -= common.padding;
				padding = common.padding / 2;
			}
			return "<div "+/*@attr*/"webix_l_id=\""+obj.id+"\" class=\""+common.classname(obj,common,marks)+"\" "+
				common.aria(obj,common,marks)+" style=\"margin:"+padding+"px; width:"+width+"px; height:"+height+"px; float:left; overflow:hidden;\">";
		},
		templateEnd:template("</div>")
	},
	$dropHTML:function(){
		const p = this._tilesPadding;
		return `<div class="webix_drop_area_inner" style="width:${this.type.width-p}px; height:${this.type.height-p}px; margin:${p/2}px"></div>`;
	},
	_calck_autoheight:function(width){
		return (this._settings.height = this.type.height * Math.ceil( this.data.count() / Math.floor(width / this.type.width)));
	},
	autoheight_setter:function(mode){
		if (mode){
			this.data.attachEvent("onStoreLoad", bind(this.resize, this));
			this._contentobj.style.overflowY = "hidden";
		}
		return mode;
	},
	$getSize:function(dx, dy){
		if (this._settings.xCount && this.type.width != "auto" && !this._autowidth)
			this._settings.width = this.type.width*this._settings.xCount + this._tilesPadding + (this._scroll_y?env.scrollSize:0);
		if (this._settings.yCount && this.type.height != "auto" && !this._autoheight)
			this._settings.height = this.type.height*this._settings.yCount + this._tilesPadding;

		var width = this._settings.width || this._content_width;
		if (this._settings.autoheight && width){
			this._recalk_counts();
			this._calck_autoheight(width);
			this.scroll_setter(false);
		}
		return base.api.$getSize.call(this, dx, dy);
	},
	_recalk_counts:function(){
		if (this._settings.yCount && (this._autoheight || this.type.height == "auto")){
			this.type.height = Math.floor((this._content_height-this._tilesPadding)/this._settings.yCount);
			this._autoheight = this._settings.yCount;
		}
		if (this._settings.xCount && (this._autowidth || this.type.width == "auto")){
			this.type.width = Math.floor((this._content_width-this._tilesPadding)/this._settings.xCount);
			this._autowidth = this._settings.xCount;
		}

		return this._autoheight||this._autowidth;
	},
	$setSize:function(x,y){
		const c = this._settings;

		if (base.api.$setSize.call(this, x, y)){
			if (c.autoheight && this._calck_autoheight() != this._content_height)
				return delay(this.resize, this);

			if (this._recalk_counts() || this._render_visible_rows)
				this.render();

		} else if ((c.yCount && c.yCount != this._autoheight) || (c.xCount && c.xCount != this._autowidth)){
			if (this._recalk_counts())
				this.render();
		}
	}
};


const view = protoUI(api, DataMove, DragItem, MouseEvents, KeysNavigation, SelectionModel, Scrollable, CustomPrint, proto.view);
export default {api, view};