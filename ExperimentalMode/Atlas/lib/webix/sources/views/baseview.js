import {assert} from "../webix/debug";
import {debug_size_box} from "../webix/debug";

import {callEvent} from "../webix/customevents";
import {create, createCss, remove, addCss, removeCss, triggerEvent, preventEvent} from "../webix/html";
import {toNode, extend} from "../webix/helpers";
import env from "../webix/env";

import {$$,ui,protoUI} from "../ui/core";
import {_uid, _each} from "../ui/helpers";

import state from "../core/state";
import UIManager from "../core/uimanager";

import Settings from "../core/settings";
import Destruction from "../core/destruction";
import BaseBind from "../core/basebind";

const UIExtension = window.webix_view||{};

const api = {
	name:"baseview",
	//attribute , which will be used for ID storing
	$init:function(config){
		if (!config.id) 
			config.id = _uid(this.name);
		
		this._parent_cell = state._parent_cell;
		state._parent_cell = null;

		// if scope not provided directly, and there is no parent view
		// check if we have a global scope
		this.$scope = config.$scope || (this._parent_cell ? this._parent_cell.$scope : state._global_scope);
		
		if (!this._viewobj){
			this._contentobj = this._viewobj = create("DIV",{
				"class":"webix_view"
			});
			this.$view = this._viewobj;
		}
	},
	$skin:false,
	defaults:{
		width:0,
		height:0,
		gravity:1
	},
	getNode:function(){
		return this._viewobj;
	},
	// needed only to maintain the deprecated ActiveContent module
	// do not use it anywhere else
	$setNode:function(node){
		this._viewobj = this._dataobj = this.$view = node;
	},
	getParentView:function(){
		return this._parent_cell||null;	
	},
	getTopParentView:function(){
		var parent = this.getParentView();
		return parent ? parent.getTopParentView() :  this;
	},
	getFormView:function(){
		var parent = this.getParentView();
		return (!parent || parent._recollect_elements) ? parent : parent.getFormView();
	},
	getChildViews:function(){ return []; },
	queryView:function(search, all){
		var confirm;
		if (typeof search === "string")
			search = { view:search };
		if (typeof search === "object"){
			//IE8 compatibility
			confirm = function(test){
				var config = test.config;
				for (var key in search){
					if (config[key] != search[key])
						return false; 
				}
				return true;
			};
		} else
			confirm = search;

		if (all === "self" && confirm(this)) return this;
		var results = all === "all" ? [] : false;
		var direction = all === "parent" ? this._queryGoUp : this._queryGoDown;

		var found = this._queryView(confirm, direction, results);
		return all === "all" ? results : found;
	},
	_queryGoDown:function(node){
		return node.getChildViews();
	},
	_queryGoUp:function(node){
		var parent = node.getParentView();
		return parent ? [parent] : [];
	},
	_queryView:function(confirm, next, all){
		var kids = next(this);
		for (var i =0; i<kids.length; i++){
			if (confirm(kids[i])){
				if (all)
					all.push(kids[i]);
				else
					return kids[i];
			}

			var sub = kids[i]._queryView(confirm, next, all);
			if (sub && !all){
				return sub;
			} 
		}
		return null;
	},
	isVisible:function(base_id){
		if (this._settings.hidden){
			if(base_id){
				if (!this._hidden_render) {
					this._hidden_render = [];
					this._hidden_hash = {};
				}
				if (!this._hidden_hash[base_id]){
					this._hidden_hash[base_id] =  true;
					this._hidden_render.push(base_id);
				}
			}
			return false;
		}
		
		var parent = this.getParentView();
		if (parent) return parent.isVisible(base_id, this._settings.id);
		
		return true;
	},
	isEnabled:function(){
		if(this._disable_cover)
			return false;

		var parent= this.getParentView();
		if(parent)
			return parent.isEnabled();

		return true;
	},
	_fix_cover:function(){
		if (this._disable_cover && !this._disable_cover.parentNode)
			this._viewobj.appendChild(this._disable_cover);
	},
	disable:function(){
		remove(this._disable_cover);
		this._settings.disabled = true;

		this._disable_cover = create("div",{
			"class":"webix_disabled"
		});

		this._viewobj.appendChild(this._disable_cover);
		this._viewobj.setAttribute("aria-disabled", "true");
		addCss(this._viewobj,"webix_disabled_view",true);
		UIManager._moveChildFocus(this);
	},
	enable:function(){
		this._settings.disabled = false;

		if (this._disable_cover){
			remove(this._disable_cover);
			removeCss(this._viewobj,"webix_disabled_view");
			this._viewobj.removeAttribute("aria-disabled");
			this._disable_cover = null;
		}
	},
	disabled_setter:function(value){
		if (value)
			this.disable();
		else
			this.enable();
		return value;
	},
	container_setter:function(value){
		assert(toNode(value),"Invalid container");
		return true;
	},
	css_setter:function(value){
		if (typeof value == "object")
			value = createCss(value);

		this._viewobj.className += " "+value;
		return value;
	},
	id_setter:function(value){
		if (state._global_collection && (state._global_collection != this || this._prev_global_col)){
			var oldvalue = this.config.$id = value;
			(this._prev_global_col || state._global_collection)._elements[value] = this;
			value = _uid(this.name);
			(this._prev_global_col || state._global_collection)._translate_ids[value]=oldvalue;
		}
		assert(!ui.views[value], "Non unique view id: "+value);
		ui.views[value] = this;
		this._viewobj.setAttribute(/*@attr*/"view_id", value);
		return value;
	},
	$setSize:function(x,y){
		var last = this._last_size;
		if (last && last[0]==x && last[1]==y) {
			if (DEBUG) debug_size_box(this, [x,y,"not changed"]);
			return false;
		}

		if (DEBUG) debug_size_box(this, [x,y]);
		
		this._last_size = [x,y];
		this.$width  = this._content_width = x-(this._scroll_y?env.scrollSize:0);
		this.$height = this._content_height = y-(this._scroll_x?env.scrollSize:0);

		var config = this._settings;
		if (!config.flex){
			this._viewobj.style.width = x+"px";
			this._viewobj.style.height = y+"px";
		}

		return true;
	},
	$getSize:function(dx, dy){
		var s = this._settings;

		var size = [
			(s.width || s.minWidth || 0)*1,
			(s.width || s.maxWidth || 100000)*1,
			(s.height || s.minHeight || 0)*1,
			(s.height || s.maxHeight || 100000)*1,
			s.gravity
		];

		if (assert){
			var check = (isNaN(size[0]) || isNaN(size[1]) || isNaN(size[2]) || isNaN(size[3]));
			if (check){
				assert(false, "Size is not a number "+this._settings.id);
				s.width = s.height = s.maxWidth = s.maxHeight = s.minWidth = s.minHeight = 0;
				size = [0,0,100000,100000,1];
			}
		}

		size[0]+=dx; size[1]+=dx;
		size[2]+=dy; size[3]+=dy;
		return size;
	},
	show:function(force, animate_settings){
		var parent = this.getParentView();
		var show = !arguments[2];
		if (parent) {
			if(!animate_settings && animate_settings !== false && this._settings.animate)
				if (parent._settings.animate)
					animate_settings = extend((parent._settings.animate?extend({},parent._settings.animate):{}), this._settings.animate, true);

			if (show?parent._show:parent._hide)
				(show?parent._show:parent._hide).call(parent, this, animate_settings);
			if (show)
				this._render_hidden_views();

			//force show of parent view
			//stop further processing is view is a part of isolated scope
			if (force && show)  
				parent.show(parent.$$?false:force);
		}
		else{
			if (this._settings.hidden){
				if (show){
					var node = toNode(this._settings._container||document.body);
					node.appendChild(this._viewobj);
					this._settings.hidden = false;

					this.adjust();

					if (this.callEvent){
						this.callEvent("onViewShow", []);

						if (this._signal_hidden_cells)
							_each(this, this._signal_hidden_cells);
					}
					this._render_hidden_views();
				}
			} else {
				if (!show){
					this._settings.hidden = this._settings._hidden = true;
					if (this._viewobj){
						this._settings._container = this._viewobj.parentNode;
						remove(this._viewobj);
					}
				}
			}
		}
	},
	_render_hidden_views:function(){
		if (this._hidden_render){
			for (var i=0; i < this._hidden_render.length; i++){
				var ui_to_render = $$(this._hidden_render[i]);
				if (ui_to_render)
					ui_to_render.render();
			}
			this._hidden_render = [];
			this._hidden_hash = {};
		}
	},
	_onKeyPress:function(code, e){
		var target = e.target, role = target.getAttribute("role");

		if((code === 13 || code === 32) && (role == "button" || role == "tab") && !this._settings.disabled){
			triggerEvent(target, "MouseEvents", "click");
			preventEvent(e);
		}
	},
	hidden_setter:function(value){
		if (value) this.hide();
		return this._settings.hidden;
	},
	hide:function(){
		this.show(null, null, true);
		UIManager._moveChildFocus(this);
	},
	adjust:function(){
		if(!this._viewobj.parentNode)
			return false;

		var x = this._viewobj.parentNode.clientWidth||0;
		var y = this._viewobj.parentNode.clientHeight||0;

		var sizes=this.$getSize(0,0);
		var fullscreen = (this._viewobj.parentNode == document.body) && !this.setPosition;

		//minWidth
		if (sizes[0]>x) x = sizes[0];
		//minHeight
		if (sizes[2]>y) y = sizes[2];

		//maxWidth rule
		if ((!fullscreen || this._settings.width)  && x>sizes[1]) x = sizes[1];
		//maxHeight rule
		if ((!fullscreen || this._settings.height) && y>sizes[3]) y = sizes[3];

		this.$setSize(x,y);
		if (state._responsive_exception){
			state._responsive_exception = false;
			this.adjust();
		}
	},
	resize:function(){
		if (state._child_sizing_active || state._freeze_resize || state._responsive_tinkery ) return;

		var parent = this.getParentView();
		if (parent){
			if (parent.resizeChildren)
				parent.resizeChildren();
			else
				parent.resize();
		} else {
			this.adjust();
			callEvent("onResize",[]);
		}
	}
};

const view = protoUI(api, Settings, Destruction, BaseBind, UIExtension);
export default { api, view };