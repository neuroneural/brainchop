import EventSystem from "../core/eventsystem";
import Settings from "../core/settings";
import {addCss, preventEvent} from "../webix/html";
import {protoUI} from "../ui/core";
import env from "../webix/env";
import Touch from "../core/touch";
import {toNode, isUndefined} from "../webix/helpers";
import {_event, event} from "../webix/htmlevents";
import {$active} from "../webix/skin";


const api = {
	name:"vscroll",
	$apiOnly:true,
	defaults:{
		scroll:"x",
		scrollPos:0,
		scrollSize:18,
		scrollVisible:1,
		zoom:1
	},
	$init:function(config){
		var dir = config.scroll||"x";
		var node = this._viewobj = toNode(config.container);
		node.className += " webix_vscroll_"+dir;
		node.innerHTML="<div class='webix_vscroll_body'></div>";
		_event(node,"scroll", this._onscroll,{bind:this});

		this._last_set_size = 0;
	},
	$skin:function(){
		this.defaults.scrollStep = $active.rowHeight;
	},
	reset:function(){
		this.config.scrollPos = 0;
		this._viewobj[this.config.scroll == "x"?"scrollLeft":"scrollTop"] = 0;
	},
	_check_quantum:function(value){
		if (value>1500000){
			this._settings.zoom = value/1000000;
			value = 1000000;
		} else {
			this._settings.zoom = 1;
		}
		return value;
	},	
	scrollWidth_setter:function(value){
		value = this._check_quantum(value);
		this._viewobj.firstChild.style.width = value+"px";
		return value;		
	},
	scrollHeight_setter:function(value){
		value = this._check_quantum(value);
		this._viewobj.firstChild.style.height = value+"px";
		return value;
	},
	sizeTo:function(value, top, bottom){
		value = value-(top||0)-(bottom||0);

		var width = this._settings.scrollSize;
		//IEFix
		//IE doesn't react on scroll-click if it has not at least 1 px of visible content
		if (env.isIE && width)
			width += 1;
		if (!width && this._settings.scrollVisible && !env.$customScroll){
			this._viewobj.style.pointerEvents="none";
			width = 14;
		}

		if (!width){
			this._viewobj.style.display = "none";
		} else {
			this._viewobj.style.display = "block";
			if (top)
				this._viewobj.style.marginTop = top+ "px";
			this._viewobj.style[this._settings.scroll == "x"?"width":"height"] =  Math.max(0,value)+"px";
			this._viewobj.style[this._settings.scroll == "x"?"height":"width"] = width+"px";
		}

		this._last_set_size = value;
	},
	getScroll:function(){
		return Math.round(this._settings.scrollPos*this._settings.zoom);
	},
	getSize:function(){
		return Math.round((this._settings.scrollWidth||this._settings.scrollHeight)*this._settings.zoom);
	},
	_fixSize(){
		const pos = this.getScroll();
		const max = Math.max(this.getSize() - this._last_set_size, 0);
		if (pos > max)
			this.scrollTo(max);
	},
	scrollTo:function(value){
		if (value<0)
			value = 0;
		var config = this._settings;

		value = value / config.zoom;
		//safety check for negative values
		if (value < 0) value = 0;

		//apply new position
		if (value != this._settings.scrollPos){
			this._viewobj[config.scroll == "x"?"scrollLeft":"scrollTop"] = value;
			this._onscroll_inner(value, true);
			return true;
		}
	},
	_onscroll:function(){	
		var x = this._viewobj[this._settings.scroll == "x"?"scrollLeft":"scrollTop"];
		if (Math.floor(x) != Math.floor(this._settings.scrollPos))
			this._onscroll_inner(x, false);
	},
	_onscroll_inner:function(value, api){
		//size of scroll area
		var height = (this._settings.scrollWidth||this._settings.scrollHeight);
		//if we scrolled to the end of the area
		if (value >= height - this._last_set_size/(api?this._settings.zoom:1)) {
			//set value so the last row is visible
			value = Math.max(0, height - this._last_set_size/this._settings.zoom);
		}
		
		this._settings.scrollPos = value || 0;
		this.callEvent("onScroll",[this.getScroll()]);
	},
	activeArea:function(area, x_mode){
		this._x_scroll_mode = x_mode;
		_event(area, "wheel", this._on_wheel,{bind:this, passive:false});
		this._add_touch_events(area);
	},

	_add_touch_events: function(area){
		if(!env.touch && window.navigator.pointerEnabled){
			addCss(area,"webix_scroll_touch_ie",true);
			_event(area, "pointerdown", function(e){
				if(e.pointerType == "touch" || e.pointerType == "pen"){
					this._start_context = Touch._get_context_m(e);
					this._start_scroll_pos = this.getScroll();
				}
			},{bind:this});

			event(document.body, "pointermove", function(e){
				var scroll;
				if(this._start_context){
					this._current_context = Touch._get_context_m(e);
					if(this._settings.scroll == "x" ){
						scroll = this._current_context.x - this._start_context.x;
					}
					else if(this._settings.scroll == "y"){
						scroll = this._current_context.y - this._start_context.y;
					}
					if(scroll && Math.abs(scroll) > 5){
						this.scrollTo(this._start_scroll_pos - scroll);
					}
				}
			},{bind:this});
			event(window, "pointerup", function(){
				if(this._start_context){
					this._start_context = this._current_context = null;
				}
			},{bind:this});
		}

	},
	_on_wheel:function(e){
		let dir = 0;
		const step = e.deltaMode === 0 ? 30 : 1;

		if (e.ctrlKey)
			return false;

		if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)){
			//x-scroll
			if (this._x_scroll_mode && this._settings.scrollVisible)
				dir = e.deltaX / step;
		} else {
			//y-scroll
			if (!this._x_scroll_mode && this._settings.scrollVisible){
				if (isUndefined(e.deltaY))
					dir = e.detail;
				else
					dir = e.deltaY / step;
			}
		}

		// Safari requires target preserving
		// (used in _check_rendered_cols of DataTable)
		if(env.isSafari)
			this._scroll_trg = e.target;

		if (dir)
			if (this.scrollTo(this.getScroll() + dir*this._settings.scrollStep))
				return preventEvent(e);

	}
};


const view = protoUI(api, EventSystem, Settings);
export default {api, view};