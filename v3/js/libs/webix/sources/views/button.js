import {triggerEvent, preventEvent, getTextSize, locate} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {isUndefined, isArray} from "../webix/helpers";
import {assert} from "../webix/debug";
import template from "../webix/template";

import baseview from "../views/baseview";
import base from "../views/view";

import AutoTooltip from "../core/autotooltip";
import UIManager from "../core/uimanager";
import EventSystem from "../core/eventsystem";
import AtomRender from "../core/atomrender";
import Settings from "../core/settings";


const api = {
	name:"button",
	touchable:true,
	$skin:function(){
		this.defaults.height = $active.buttonHeight||$active.inputHeight;
	},
	defaults:{
		template:function(obj, common){
			var text = common.$renderInput(obj, common);
			if (obj.badge||obj.badge===0) text = text.replace("</button>", "<span class='webix_badge'>"+obj.badge+"</span></button>");
			return "<div class='webix_el_box' style='width:"+obj.awidth+"px; height:"+obj.aheight+"px'>"+ text + "</div>";
		},
		label:"",
		value:"",
		borderless:true
	},
	$renderInput:function(obj){
		return "<button type='button' "+(obj.popup?"aria-haspopup='true'":"")+" class='webix_button'>"+(obj.label||obj.value)+"</button>";
	},
	$init:function(config){
		this._viewobj.className += " webix_control webix_el_"+(this.$cssName||this.name);

		this._destroy_with_me = [];
		this._set_default_css(config);

		this.data = this._settings;
		this._dataobj = this._viewobj;

		this.$ready.push(function(){ this._calc_size(this.config); });
	},
	hotkey_setter: function(key){
		var control = this;
		this._addElementHotKey(key, function(view,ev){
			if(control.isVisible()){
				var elem = control.$view.firstChild;
				triggerEvent(elem, "MouseEvents", "click");
				preventEvent(ev);
			}
		});
	},
	_set_default_css: function(config){
		if (!config.css || !this._get_class(config.css) || (this.defaults.css && !this._get_class(this.defaults.css))){
			this._viewobj.className += " webix_secondary";
		}
	},
	_get_class:function(css){
		if(typeof css == "string"){
			const classes = { webix_danger:1, webix_transparent:1, webix_primary:1 };
			for(let i in classes){
				if(css.indexOf(i)!==-1)
					return true;
			}
		}
		return false;
	},
	_addElementHotKey: function(key, func, view){
		var keyCode = UIManager.addHotKey(key, func, view);
		this.attachEvent("onDestruct", function(){
			UIManager.removeHotKey(keyCode, func, view);
		});
	},
	type_setter:function(value){
		if (this._types[value])
			this.$renderInput = template(this._types[value]);
		return value;
	},
	_set_inner_size:false,
	_types:{
		image:"<button type='button' class='webix_button webix_img_btn' style='line-height:#cheight#px;'><img class='webix_image' style='max-width:#cheight#px; max-height:#cheight#px;' src = '#image#'>#label#</button>",
		imageTop:"<button type='button' class='webix_button webix_img_btn_top'><img class='webix_image' style='max-width:#cheight#px; max-height:#cheight#px;' src = '#image#'><div class='webix_img_btn_text'>#label#</div></button>",

		icon:"<button type='button' class='webix_button webix_img_btn' style='line-height:#cheight#px;'><span class='webix_icon_btn #icon#' style='max-width:#cheight#px;'></span>#label#</button>",
		iconTop:"<button type='button' class='webix_button webix_img_btn_top' style='width:100%;text-align:center;'><span class='webix_icon #icon#'></span><div class='webix_img_btn_text'>#label#</div></button>",
	},
	_findAllInputs: function(){
		var result = [];
		var tagNames = ["input","select","textarea","button"];
		for(var i=0; i< tagNames.length; i++){
			var inputs = this.$view.getElementsByTagName(tagNames[i]);
			for(var j = 0; j< inputs.length; j++){
				result.push(inputs[j]);
			}
		}
		return result;
	},
	disable: function(){
		var i, node, elem = this._getBox();
		baseview.api.disable.apply(this, arguments);
		if(elem && elem.className.indexOf(" webix_disabled_box")== -1){
			elem.className += " webix_disabled_box";
			var inputs = this._findAllInputs();
			for(i=0; i< inputs.length; i++)
				inputs[i].setAttribute("disabled",true);

			// richselect and based on it
			node = this.getInputNode();
			if(node && node.tagName.toLowerCase() == "div"){
				this._disabledTabIndex = node.getAttribute("tabIndex");
				node.removeAttribute("tabIndex");
			}

			if(this._settings.labelPosition == "top"){
				var label = this._dataobj.firstChild;
				if(label)
					label.className += " webix_disabled_top_label";
			}
		}
	},
	enable: function(){
		baseview.api.enable.apply(this, arguments);
		var node,
			elem = this._getBox();
		if(elem){
			elem.className = elem.className.replace(" webix_disabled_box","");
			var inputs = this._findAllInputs();
			for(var i=0; i< inputs.length; i++)
				inputs[i].removeAttribute("disabled");

			node = this.getInputNode();
			if(node && !isUndefined(this._disabledTabIndex))
				node.setAttribute("tabIndex",this._disabledTabIndex);

			if(this._settings.labelPosition == "top"){
				var label = this._dataobj.firstChild;
				if(label)
					label.className = label.className.replace(" webix_disabled_top_label","");
			}
		}
	},
	$setSize:function(x,y){
		if(base.api.$setSize.call(this,x,y)){
			this.render();
		}
	},
	setValue:function(value, config){
		value = this.$prepareValue(value);
		const oldvalue = this._settings.value;

		if (this.$compareValue(oldvalue, value)){
			if (this._rendered_input && value != this.$getValue())
				this.$setValue(value);
			return;
		}

		this._settings.value = value;
		if (this._rendered_input)
			this.$setValue(value);

		this.callEvent("onChange", [value, oldvalue, config]);
	},
	$compareValue:function(oldvalue, value){ 
		if (typeof value === "number") value = value.toString();
		if (typeof oldvalue === "number") oldvalue = oldvalue.toString();
		return oldvalue == value;
	},
	$prepareValue:function(value){ return value === 0 ? "0" : (value || "").toString(); },
	value_setter:function(value){
		return this.$prepareValue(value);
	},
	//visual part of setValue
	$setValue:function(value){
		const node = this.getInputNode();
		if (node && !this._types[this._settings.type]){
			value = this._settings.label || value;
			if (node.tagName=="BUTTON") node.innerHTML = value;
			else node.value = value;
		}
	},
	getValue:function(){
		//if button was rendered - returning actual value
		//otherwise - returning last set value
		var value = this._rendered_input? this.$getValue() : this._settings.value;
		return (typeof value == "undefined") ? "" : value;
	},
	$getValue:function(){
		return this._settings.value||"";	
	},
	focus:function(){
		if(!UIManager.canFocus(this))
			return false;
		
		var input = this.getInputNode();
		if (input && input.focus) input.focus();
	},
	blur:function() {
		var input = this.getInputNode();
		if (input && input.blur) input.blur();
	},
	//get input element
	getInputNode: function() {
		return this._dataobj.getElementsByTagName("input")[0]||this._dataobj.getElementsByTagName("button")[0];
	},
	//get top-level sub-container
	_getBox:function(){
		for(var i=0;i< this._dataobj.childNodes.length;i++){
			if(this._dataobj.childNodes[i].className.indexOf("webix_el_box")>=0)
				return this._dataobj.childNodes[i];
		}
		return null;
	},
	_get_tooltip_data:function(t,e){
		let node = e.target;
		let box = this._getBox();

		const isTopLabel = this._settings.labelPosition == "top" && this._dataobj.firstChild.contains(node);

		if (isTopLabel || box && box.contains(node))
			return this._settings;
		return null;
	},
	_sqrt_2:Math.sqrt(2),
	_calc_size:function(config){
		config = config || this._settings;
		if (config.autowidth){
			let width = getTextSize((config.value||config.label || ""), "webixbutton").width +
				(config.badge||config.badge===0 ? getTextSize(config.badge, "webix_badge").width * 2 - 32 : 0) +
				(config.type === "icon" ? 24 : 0) +
				(config.type === "image" ? config.height-$active.inputPadding : 0);

			width = Math.max(config.minWidth || 0, width);
			config.width = Math.min(config.maxWidth || Infinity, width);
		}
	},
	_calck_input_size:function(){
		//use width for both width and inputWidth settings in clever way
		//in form, we can define width for some element smaller than for siblings
		//it will use inputWidth to render the desired view
		this._input_width = this._settings.inputWidth || 
			((this._content_width - this._settings.width > 2)?this._settings.width:0) || this._content_width;
		this._input_height = this._settings.inputHeight||this._inputHeight||0;
	},
	resize: function(){
		this._calc_size();
		return base.api.resize.apply(this,arguments);
	},
	render:function(){
		this._calck_input_size();
		this._settings.awidth  = this._input_width||this._content_width;
		this._settings.aheight = this._input_height||this._content_height;

		//image button - image width
		this._settings.bheight = this._settings.aheight+2;
		this._settings.cheight = this._settings.aheight- 2*$active.inputPadding;
		this._settings.dheight = this._settings.cheight - 2; // - borders

		if(AtomRender.render.call(this)){
			this._rendered_input = true;
			if (this._set_inner_size) this._set_inner_size();
			if (this._settings.align){
				var handle = this._dataobj.firstChild;
				if (this._settings.labelPosition == "top" && handle.nextSibling)
					handle = handle.nextSibling;

				switch(this._settings.align){
					case "right":
						handle.style.cssFloat = "right";
						break;
					case "center":
						handle.style.display = "inline-block";
						handle.parentNode.style.textAlign = "center";
						break;
					case "middle":
						handle.style.marginTop = Math.round((this._content_height-this._input_height)/2)+"px";
						break;
					case "bottom": 
						handle.style.marginTop = (this._content_height-this._input_height)+"px";
						break;
					case "left":
						handle.style.cssFloat = "left";
						break;
					default:
						assert(false, "Unknown align mode: "+this._settings.align);
						break;
				}
			}

			if (this.$render)
				this.$render(this.data);

			if (this._settings.disabled)
				this.disable();

			if (this._init_once){
				this._init_once(this.data);
				this._init_once = 0;
			}
		}
	},

	refresh:function(){ this.render(); },

	on_click:{
		_handle_tab_click: function(ev){
			const id = locate(ev, /*@attr*/"button_id");
			const opt = this.getOption(id);

			if (opt && !opt.disabled && this.callEvent("onBeforeTabClick", [id, ev])){
				this.setValue(id, "user");
				this.focus();
				this.callEvent("onAfterTabClick", [id, ev]);
			}
		},
		webix_all_segments:function(ev, button){
			this.on_click._handle_tab_click.call(this, ev, button);
		},
		webix_all_tabs:function(ev, button){
			this.on_click._handle_tab_click.call(this, ev, button);
		},
		webix_inp_counter_next:function(){
			if (!this._settings.readonly)
				this.next(this._settings.step, "user");
		},
		webix_inp_counter_prev:function(){
			if (!this._settings.readonly)
				this.prev(this._settings.step, "user");
		},
		webix_input_icon:function(){
			this.getInputNode().focus();
		},
		webix_clear_icon:function(){
			if (this.$allowsClear) this.setValue("", "user");
			return false;
		},
		webix_inp_checkbox_border: function(e) {
			if (!this._settings.disabled && e.target.tagName != "DIV" && !this._settings.readonly)
				this.toggle("user");
		},
		webix_inp_checkbox_label: function() {
			if (!this._settings.readonly)
				this.toggle("user");
		},
		webix_inp_radio_border: function(e) {
			const id = locate(e, /*@attr*/"radio_id");
			const opt = this.getOption(id);

			if (opt && !opt.disabled){
				this.setValue(id, "user");
				this.focus();
			}
		},
		webix_tab_more_icon: function(ev,obj,node){
			const popup = this.getPopup();
			if (!popup.isVisible()){
				popup.resize();
				popup.show(node, null, true);
			} else
				popup.hide();
		},
		webix_tab_close:function(e){
			const id = locate(e, /*@attr*/"button_id");
			const opt = this.getOption(id);

			if (opt && !opt.disabled && this.callEvent("onBeforeTabClose", [id, e]))
				this.removeOption(id);
			return false;
		}
	},

	//method do not used by button, but  used by other child-views
	_check_options:function(opts){
		assert(!!opts, this.name+": options not defined");
		assert(isArray(opts), this.name+": options must be an array");

		for(var i=0;i<opts.length;i++){
			// asserts need to be removed in final version			
			assert(!opts[i].text, "Please replace .text with .value in control config");
			assert(!opts[i].label, "Please replace .label with .value in control config");

			if(typeof opts[i]=="string"){
				opts[i] = {id:opts[i], value:opts[i]};
			}
			else {
				if(isUndefined(opts[i].id))
					opts[i].id = opts[i].value;

				if(isUndefined(opts[i].value))
					opts[i].value = opts[i].id;
			}
		}
		return opts;
	},
	_get_div_placeholder: function(obj){
		var placeholder = (obj?obj.placeholder:this._settings.placeholder);
		return (placeholder?"<span class='webix_placeholder'>"+placeholder+"</span>":"");
	}
};

const view = protoUI(api, base.view, AutoTooltip, AtomRender, Settings, EventSystem);
export default {api, view};