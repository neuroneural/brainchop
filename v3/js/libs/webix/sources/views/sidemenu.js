import env from "../webix/env";
import UIManager from "../core/uimanager";

import {removeCss, addCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {delay, bind} from "../webix/helpers";
import {zIndex} from "../ui/helpers";
import {event, eventRemove} from "../webix/htmlevents";
import {assert} from "../webix/debug";

import popup from "../views/popup";
import window from "../views/window";
import base from "../views/view";

import animate from "../webix/animate";
import state from "../core/state";


const api = {
	name:"sidemenu",
	defaults: {
		animate: true,
		position: "left",
		width: 200,
		borderless: true
	},
	$init:function(){
		this.$view.className += " webix_sidemenu";
	},
	$skin:function(){
		popup.api.$skin.call(this);

		this.defaults.padding = 0;
	},
	position_setter: function(value){
		var prevPosition = this._settings.position;
		if(prevPosition)
			removeCss(this.$view," webix_sidemenu_"+prevPosition);
		addCss(this.$view," webix_sidemenu_"+value);
		return value;
	},
	$getSize: function(){
		var sizes = window.api.$getSize.apply(this,arguments);
		this._desired_sizes = sizes;
		return sizes;
	},
	$setSize:function(x,y){
		base.api.$setSize.call(this,x,y);
		x = this._content_width-this._settings.padding*2;
		y = this._content_height-this._settings.padding*2;
		this._contentobj.style.padding = this._settings.padding+"px";
		this._headobj.style.display="none";
		this._bodyobj.style.height = y+"px";
		this._body_cell.$setSize(x,y);
	},
	show: function(){
		if(!this.callEvent("onBeforeShow",arguments))
			return false;

		this._settings.hidden = false;
		this._viewobj.style.zIndex = zIndex(this._settings.zIndex);
		if (this._settings.modal || this._modal){
			this._modal_set(true);
			this._modal = null; // hidden_setter handling
		}
		this._viewobj.style.display = "block";
		this._render_hidden_views();
		if (this._settings.position)
			this._setPosition();

		this._hide_timer = 1;
		delay(function(){ this._hide_timer = 0; }, this, [], (env.touch ? 400 : 100 ));

		if (this.config.autofocus){
			this._prev_focus = UIManager.getFocus();
			UIManager.setFocus(this);
		}

		if (-1 == state._popups.find(this))
			state._popups.push(this);

		this.callEvent("onShow",[]);
	},
	_setPosition: function(x){
		var width, height, maxWidth, maxHeight,
			position,
			left = 0, top = 0,
			state = { };


		this.$view.style.position = "fixed";

		maxWidth = (window.innerWidth||document.documentElement.offsetWidth);
		maxHeight = (window.innerHeight||document.documentElement.offsetHeight);

		width = this._desired_sizes[0] || maxWidth;
		height = this._desired_sizes[2] ||maxHeight;

		assert(width &&height, "Attempt to show not rendered window");

		position = this._settings.position;

		if(position == "top"){
			width = maxWidth;
		} else if(position == "right"){
			height = maxHeight;
			left = maxWidth - width;
		} else if(position == "bottom"){
			width = maxWidth;
			top = maxHeight - height;
		} else {
			height = maxHeight;
		}

		state = { left: left, top: top,
			width: width, height: height,
			maxWidth: maxWidth, maxHeight: maxHeight
		};

		if (typeof this._settings.state == "function")
			this._settings.state.call(this, state);

		this._state = state;

		this.$setSize(state.width, state.height);

		if (typeof x == "undefined" && this._isAnimationSupported()){
			removeCss(this.$view,"webix_animate",true);
			// set initial state
			this._animate[this._settings.position].beforeShow.call(this, state);
			// set apply animation css
			delay(function(){
				addCss(this.$view,"webix_animate",true);
			},this, null,1);
			// animate popup
			delay(function(){
				this._animate[this._settings.position].show.call(this, state);
			},this, null,10);

		}
		else{
			if(this._settings.position === "right")
				state.left = state.right?maxWidth - state.width - state.right:maxWidth - state.width;
			this.setPosition(state.left, state.top);
		}
	},
	_state:{},
	_isAnimationSupported: function(){
		return animate.isSupported() && this._settings.animate && !(env.isIE && navigator.appVersion.indexOf("MSIE 9")!=-1);
	},
	hidden_setter:function(value){
		if(value)
			this.hide();
		else
			this.show();
		return !!value;
	},
	_animate:{
		left: {
			beforeShow: function(state){
				this.$view.style.left = -state.width+"px";
				this.$view.style.top = state.top+"px";
			},
			show: function(state){
				this.$view.style.left = state.left?state.left+"px":"0px";
			},
			hide: function(state){
				this.$view.style.left = -state.width+"px";
			}
		},
		right: {
			beforeShow: function(state){
				this.$view.style.left = "auto";
				this.$view.style.right = -state.width+"px";
				this.$view.style.top = state.top+"px";
			},
			show: function(state){
				this.$view.style.right = state.right?state.right+"px":"0px";
			},
			hide: function(state){
				this.$view.style.right = -state.width+"px";
			}
		},
		top: {
			beforeShow: function(state){
				this.setPosition(state.left,state.top);
				this.$view.style.height ="0px";
				this._bodyobj.style.height ="0px";
			},
			show: function(state){
				this.$view.style.height = state.height +"px";
				this._bodyobj.style.height =state.height+"px";
			},
			hide: function(){
				this.$view.style.height = "0px";
				this._bodyobj.style.height = "0px";
			}
		},
		bottom: {
			beforeShow: function(state){
				this.$view.style.left = state.left + "px";
				this.$view.style.top = "auto";
				var bottom = (state.bottom != undefined?state.bottom:(state.maxHeight-state.top  -state.height));
				this.$view.style.bottom = bottom +"px";
				this.$view.style.height ="0px";
			},
			show: function(state){
				this.$view.style.height = state.height +"px";
			},
			hide: function(){
				this.$view.style.height = "0px";
			}
		}
	},
	_hiding_process:function(){
		const maxWidth = (window.innerWidth||document.documentElement.offsetWidth);
		const maxHeight = (window.innerHeight||document.documentElement.offsetHeight);

		if (this._isAnimationSupported() && maxWidth == this._state.maxWidth && maxHeight == this._state.maxHeight){
			// call 'hide' animation handler
			this._animate[this._settings.position].hide.call(this, this._state);
			// hide popup
			const tid = event(this.$view, env.transitionEnd, bind(function(){
				this._hide_callback();
				eventRemove(tid);
			},this));
		} else
			this._hide_callback();
	}

};


const view = protoUI(api,  popup.view);
export default {api, view};