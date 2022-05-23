import {removeCss, addCss} from "../webix/html";
import {debug_size_box} from "../webix/debug";
import {protoUI, ui} from "../ui/core";
import {$active} from "../webix/skin";

import state from "../core/state";
import UIManager from "../core/uimanager";
import env from "../webix/env";
import MouseEvents from "../core/mouseevents";
import EventSystem from "../core/eventsystem";

import template from "../webix/template";

import base from "./view";
import baseview from "./baseview";
import animate from "../webix/animate";

const api = {
	name:"accordionitem",
	$init:function(config){
		this._viewobj.innerHTML = "<div tabindex='0' "+/*@attr*/"webix_ai_id"+"='"+config.id+"'  class='webix_accordionitem_header'><div class='webix_accordionitem_button' ></div><div class='webix_accordionitem_label' ></div></div><div class='webix_accordionitem_body'></div>";
		this._contentobj = this._viewobj;
		this._headobj = this._contentobj.childNodes[0];
		if(!config.header)
			this._headobj.style.display = "none";
		this._headlabel = this._contentobj.childNodes[0].childNodes[1];
		this._headbutton = this._contentobj.childNodes[0].childNodes[0];
		this._bodyobj = this._contentobj.childNodes[1];
		this._viewobj.className +=" webix_accordionitem";
		this._head_cell = this._body_cell = null;
		this._cells = true;

		this._bodyobj.setAttribute("role", "tabpanel");
		this._headobj.setAttribute("role", "tab");

		this.attachEvent("onKeyPress", this._onKeyPress);
	},
	_remove:function(){
		this.body_setter();
	},
	_replace:function(new_view){
		this._body_cell.destructor();
		this._body_cell = new_view;
		
		this._bodyobj.appendChild(this._body_cell._viewobj);
		this.resize();
	},
	_id:/*@attr*/"webix_ai_id",
	getChildViews:function(){
		return [this._body_cell];
	},
	body_setter:function(value){
		if (typeof value != "object")
			value = {template:value };

		value._inner = { top:true, left:true, right:true, bottom:true};
		state._parent_cell = this;
		this._body_cell = ui._view(value);

		this._bodyobj.appendChild(this._body_cell._viewobj);
		return value;
	},
	header_setter:function(value){
		if(value)
			value = template(value);
		return value;
	},
	headerAlt_setter:function(value){
		if(value)
			value = template(value);
		return value;
	},
	$getSize:function(dx, dy){
		var size =  this._body_cell.$getSize(0, 0);

		//apply external border to inner content sizes
		var _borders = this._settings._inner;
		if (_borders){
			dx += (_borders.left?0:1)+(_borders.right?0:1);
			dy += (_borders.top?0:1)+(_borders.bottom?0:1);
		}

		var header = 0;
		var self_size = baseview.api.$getSize.call(this, 0, 0);

		//use child settings if layout's one was not defined
		self_size[0] = (self_size[0] || size[0] ) +dx;
		if (self_size[1] >= 100000)
			self_size[1] = size[1];
		self_size[1] +=	dx;
		
		self_size[2] = (self_size[2] || size[2] ) +dy;
		var fixedHeight = (self_size[3]< 100000);
		if (!fixedHeight)
			self_size[3] = size[3];

		self_size[3] += dy;
		if(this.getParentView()._vertical_orientation){
			if (this._settings.collapsed){
				self_size[2] = self_size[3] = this._getHeaderSize()+dy;
			} else if(this._settings.header)
				header = this._settings.headerHeight;
		} else {
			if (this._settings.collapsed)
				self_size[0] = self_size[1] = this._getHeaderSize()+dx;
			if(this._settings.header)
				header = this._settings.headerHeight;
		}

		//include header in total height calculation
		if(!fixedHeight){
			self_size[2] += header;
			self_size[3] += header;
		}

		if (DEBUG) debug_size_box(this, self_size, true);
		return self_size;
	},
	on_click:{
		webix_accordionitem_header:function(e){
			this._toggle(e);
			return false;
		},
		webix_accordionitem_header_v:function(e){
			this._toggle(e);
			return false;
		}
	},
	_toggle:function(){
		this.define("collapsed", !this._settings.collapsed);
	},
	collapsed_setter:function(value){
		if (this._settings.header === false) return;
		//use last layout element if parent is not known yet
		var parent = this.getParentView();
		if(parent){
			if(!value)
				this._expand();
			else{
				if ( parent._canCollapse(this))
					this._collapse();
				else{
					var success = 0;
					if(parent._cells.length > 1)
						for (var i=0; i < parent._cells.length; i++){
							var sibl = parent._cells[i];
							if (this != sibl && sibl.isVisible() && sibl.expand){
								sibl.expand();
								this._collapse();
								success = 1;
								break;
							}
						}
					if (!success) return;
				}
			}

			this._settings.collapsed = value;
			if (!value) parent._afterOpen(this);

			this.refresh();
			if (!state._ui_creation)
				this.resize();

			parent.callEvent("onAfter"+(value?"Collapse":"Expand"), [this._settings.id]);

			this._settings.$noresize = value;
		}
		return value;
	},
	collapse:function(){
		this.define("collapsed", true);
		UIManager._moveChildFocus(this);
	},
	expand:function(){
		this.define("collapsed", false);
	},
	_show: function() {
		this.show();
	},
	_hide: function() {
		this.hide();
	},
	_expand:function(){
		this._bodyobj.style.display = "";
		removeCss(this.$view, "collapsed");
		removeCss(this._headobj, "collapsed");

		this._headobj.setAttribute("aria-expanded", "true");
	},
	_collapse:function(){
		if(this._settings.headerAlt)
			this._headlabel.innerHTML = this._settings.headerAlt();
		this._bodyobj.style.display = "none";
		addCss(this.$view, "collapsed");
		addCss(this._headobj, "collapsed");

		this._headobj.setAttribute("aria-expanded", "false");
	},
	refresh:function(){
		var template = this._settings[this._settings.collapsed?"headerAlt":"header"] ||this._settings.header;
		if (template){
			this._headlabel.innerHTML = template();
			this._headbutton.setAttribute("aria-label", template());
		}
			
		var css = (this.getParentView()._vertical_orientation?"vertical":"horizontal");
		if(this._viewobj.className.indexOf(" "+css) < 0 ){
			addCss(this._viewobj, css);
		}
		//fix collapsed columns in IE8
		if(!env.transform){
			addCss(this._viewobj,"webix_ie",true);
		}
	},
	_getHeaderSize:function(){
		return (this._settings.collapsed?this._settings.headerAltHeight:this._settings.headerHeight);
	},
	$setSize:function(x,y){
		if (base.api.$setSize.call(this,x,y) || this._getHeaderSize() != this._last_set_header_size){
			x = this._content_width;
			y = this._content_height;

			var headerSize = this._last_set_header_size = this._getHeaderSize();//-(this._settings._inner.top?0:1);
			if (this._settings.header){

				this._headobj.style.height=headerSize+"px";
				this._headobj.style.width="auto";
				this._headobj.style[env.transform]="";

				
				this._headobj.style.borderBottomWidth = (this._settings.collapsed?0:1)+"px";

				if(this.getParentView()._vertical_orientation||!this._settings.collapsed){
					y-=this._getHeaderSize();
				} else if (this._settings.collapsed){
					//-2 - borders
					if (animate.isSupported()){
						this._headobj.style.width = y + "px";
						this._headobj.style.height = x + 3 + "px";
						var d = Math.floor(y/2-x/2)+(x-this._settings.headerAltHeight)/2;
						this._headobj.style[env.transform]="rotate(90deg) translate("+d+"px, "+(d+1)+"px)";
					}
					else { //IE8 fix
						this._headobj.style.width = x + "px";
						this._headobj.style.height = y + 3 + "px";
					}

				}
			}
			if(!this._settings.collapsed){
				this._body_cell.$setSize(x,y);
				this._last_size_y = y;
			}
		} else if (!this._settings.collapsed){
			var body = this._body_cell;
			if (this._last_size_y)
				body.$setSize(this._content_width, this._last_size_y);
		}
	},
	$skin:function(){
		this.defaults.headerAltHeight = this.defaults.headerHeight = $active.barHeight - $active.borderWidth*2;
	},
	defaults:{
		header:false,
		headerAlt:false,
		body:""
	}
};


const view = protoUI(api, MouseEvents, EventSystem, base.view);
export default {api, view};