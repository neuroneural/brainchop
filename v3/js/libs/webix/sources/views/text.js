import {protoUI, ui, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {isUndefined, isArray, extend, uid} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import {setSelectionRange, getTextSize} from "../webix/html";
import {assert} from "../webix/debug";
import template from "../webix/template";

import rules from "../webix/rules";
import button from "./button";
import base from "../views/view";

import TextPattern from "../core/textpattern";

const api = {
	name:"text",
	$allowsClear:true,
	_init_onchange:function(){
		if (this.$allowsClear){
			const c = this._settings;
			const node = this.getInputNode();
			//attach onChange handler only for controls which do not manage blur on their own
			//for example - combo
			if (!this._onBlur)
				_event(node, "change", this._applyChanges, {bind:this});
			if (c.suggest)
				$$(c.suggest).linkInput(this);
			if (c.clear && !this.addSection){
				this._clear_icon = this.$view.querySelector(".webix_input_icon:last-child");
				if (node.tagName == "INPUT" || node.tagName == "SELECT")
					_event(node, "input", (e) => this._toggleClearIcon(e.target.value));

				const text = this.getText ? this.getText() : c.text||c.value;
				this._toggleClearIcon(text);
			}
		}
	},
	_applyChanges: function(){
		const value = this.getValue();
		const res = this.setValue(value, "user");
		//controls with post formating, we need to repaint value
		if (this._custom_format && res === false )
			this.$setValue(value);
	},
	_toggleClearIcon:function(value){
		const c = this._settings;
		if (!c.clear || !this._clear_icon) return;

		if (c.clear === "hover" || c.clear === "replace"){
			const css = value ? "webix_clear_icon "+(c.clear==="hover"?c.icon:"wxi-close") : c.icon;
			this._clear_icon.className = "webix_input_icon " + css;
		} else {
			const state = value ? "" : "hidden";
			if (this._clear_icon.style.visibility !== state)
				this._clear_icon.style.visibility = state;
		}
	},
	$skin:function(){
		button.api.$skin.call(this);

		this.defaults.height = $active.inputHeight;
		this.defaults.inputPadding = $active.inputPadding;
		this._inputSpacing = $active.inputSpacing;
		this._labelTopHeight = $active.labelTopHeight;
	},
	$init:function(config){
		if (config.labelPosition == "top" && isUndefined(config.height) && this.defaults.height) // textarea
			config.height = this.defaults.height + (config.label?this._labelTopHeight:0);

		// used in clear_setter
		if (!isUndefined(config.icon))
			this._settings.icon = config.icon;

		if (this._onBlur)
			this.attachEvent("onBlur", function(){
				if (this._rendered_input) this._onBlur();
			});
		this.attachEvent("onAfterRender", this._init_onchange);
		this.attachEvent("onDestruct", function(){
			this._clear_icon = null;
		});
	},
	clear_setter:function(value){
		if (value){
			if (!this._settings.icon) value = true;

			if (value !== "hover" && value !== "replace")
				value = !!value;
		}
		return value;
	},
	$renderIcon:function(c){
		const height = c.aheight - 2*c.inputPadding;
		const padding = (height - 18)/2 -1;
		let right = this._inputSpacing/2 - 24;
		let html = "";

		if (c.icon){
			right += 24;
			html += "<span style='right:"+right+"px;height:"+(height-padding)+"px;padding-top:"+padding+"px;' class='webix_input_icon "+c.icon+"'></span>";
		}

		if (c.clear === true){
			right += 24;
			html += "<span style='right:"+right+"px;height:"+(height-padding)+"px;padding-top:"+padding+"px;' class='webix_input_icon webix_clear_icon webix_icon_transparent wxi-close'></span>";
		}
		return html;
	},
	relatedView_setter:function(value){
		this.attachEvent("onChange", function(){
			const value = this.getValue();
			const mode = this._settings.relatedAction;
			const viewid = this._settings.relatedView;
			let view = $$(viewid);
			if (!view){
				const top = this.getTopParentView();
				if (top && top.$$)
					view = top.$$(viewid);
			}

			assert(view, "Invalid relatedView: "+viewid);

			if (mode == "enable"){
				if (value) view.enable(); else view.disable();
			} else {
				if (value) view.show(); else view.hide();
			}
		});
		return value;
	},
	validateEvent_setter:function(value){
		if (value == "blur")
			this.attachEvent("onBlur", this.validate);

		if (value == "key")
			this.attachEvent("onTimedKeyPress", this.validate);

		return value;
	},
	validate:function(){
		let rule = this._settings.validate;
		if (!rule && this._settings.required)
			rule = rules.isNotEmpty;

		const form =this.getFormView();
		const name = this._settings.name;
		const value = this.getValue();
		const data = {}; data[name] = value;

		assert(form, "Validation works only for fields in the form");
		assert(name, "Validation works only for fields with name");

		if (rule && !form._validate(rule, value, data, name))
			return false;
		return true;
	},
	bottomLabel_setter: function(value){
		if(!this._settings.bottomPadding)
			this._settings.bottomPadding = 18;
		return value;
	},
	_getInvalidText: function(){
		const text = this._settings.invalidMessage;
		if(typeof text == "function"){
			text.call(this);
		}
		return text;
	},
	setBottomText: function(text, height){
		const config = this._settings;
		if (typeof text != "undefined"){
			if (config.bottomLabel == text) return;
			config.bottomLabel = text;
		}

		const message = (config.invalid ? config.invalidMessage : "" ) || config.bottomLabel;
		if (!message && !config.bottomPadding)
			config.inputHeight = 0;
		if (message && !config.bottomPadding){
			this._restorePadding = 1;
			config.bottomPadding = config.bottomPadding || height || 18;	
			this.render();
			this.adjust();
			this.resize();
		} else if (!message && this._restorePadding){
			config.bottomPadding = this._restorePadding = 0;
			//textarea
			if (!config.height)
				this.render();
			this.adjust();
			this.resize();
		} else
			this.render();
	},
	$getSize: function(){
		const sizes = base.api.$getSize.apply(this,arguments);
		const heightInc = this.config.bottomPadding;
		if(heightInc){
			sizes[2] += heightInc;
			sizes[3] += heightInc;
		}
		return sizes;
	},
	$setSize:function(x,y){
		const config = this._settings;

		if(base.api.$setSize.call(this,x,y)){
			if (!x || !y) return;

			if (config.labelPosition == "top"){
				config.labelWidth = 0;
				// textarea
				if (!config.inputHeight)
					this._inputHeight = this._content_height - (config.label?this._labelTopHeight:0) - (this.config.bottomPadding||0);
			} else {
				if(config.label)
					config.labelWidth = this._getLabelWidth(config.labelWidth, config.label);
				if (config.bottomPadding)
					config.inputHeight = this._content_height - this.config.bottomPadding;
			}
			this.render();
		}
	},
	_get_input_width: function(config){
		const width = (this._input_width||0) - (config.label?config.labelWidth:0) - this._inputSpacing - (config.iconWidth || 0);

		//prevent js error in IE
		return (width < 0)?0:width;
	},
	_render_div_block:function(obj, common){
		const id = "x"+uid();
		const width = common._get_input_width(obj);
		const inputAlign = obj.inputAlign || "left";
		const height = obj.aheight - 2*$active.inputPadding - 2*$active.borderWidth;
		const rightPadding = obj.clear === true ? "padding-right:51px;" : "";
		const text = (obj.text||obj.value||this._get_div_placeholder(obj));
		const html = "<div class='webix_inp_static' role='combobox' aria-label='"+template.escape(obj.label)+"' tabindex='0'"+(obj.readonly?" aria-readonly='true'":"")+(obj.invalid?"aria-invalid='true'":"")+" onclick='' style='line-height:"+height+"px;width:"+width+"px;text-align:"+inputAlign+";"+rightPadding+"'>"+text+"</div>";
		return common.$renderInput(obj, html, id);
	},
	_baseInputHTML:function(tag){
		let html = "<"+tag+(this._settings.placeholder?" placeholder='"+template.escape(this._settings.placeholder)+"' ":" ");
		if (this._settings.readonly)
			html += "readonly='true' aria-readonly=''";
		if(this._settings.required)
			html += "aria-required='true'";
		if(this._settings.invalid)
			html += "aria-invalid='true'";

		const attrs = this._settings.attributes;
		if (attrs)
			for(const prop in attrs)
				html += prop+"='"+attrs[prop]+"' ";
		return html;
	},
	$renderLabel: function(config, id){
		let label = "";

		if (config.label){
			let top = this._settings.labelPosition == "top";
			let style = `text-align:${config.labelAlign||"left"}; line-height:${this._getLabelHeight(top)}px; `;

			if (top)
				style += "display:block;";
			else
				style += config.labelWidth ? `width:${config.labelWidth}px;` : "display:none;";

			label = "<label style='"+style+"' onclick='' for='"+id+"' class='webix_inp_"+(top?"top_":"")+"label "+(config.required?"webix_required":"")+"'>" + (config.label||"") + "</label>";
		}
		return label;
	},
	_getLabelHeight:function(top){
		return top ? this._labelTopHeight-this._settings.inputPadding : (this._settings.aheight - 2*this._settings.inputPadding);
	},
	$renderInput: function(config, div_start, id) {
		const inputAlign = (config.inputAlign||"left");
		const top = (config.labelPosition == "top");
		const inputWidth = this._get_input_width(config);

		id = id||uid();

		const label = this.$renderLabel(config,id);
		let html = "";
		if(div_start){
			html += div_start;
		} else {
			const value =  template.escape(config.text || this._pattern(config.value));
			let rightPadding = (config.icon || config.clear ? 27 : 0) + (config.icon && config.clear === true ? 24 : 0);
			rightPadding = rightPadding && !this.addSection ? "padding-right:"+rightPadding+"px;" : "";

			html += this._baseInputHTML("input")+"id='"+id+"' type='"+(config.type||this.name)+"'"+(config.editable?" role='combobox'":"")+
				" value='"+value+"' style='width:"+inputWidth+"px;text-align:"+inputAlign+";"+rightPadding+"'";

			const attrs = config.attributes;
			if (attrs)
				for(let prop in attrs)
					html += " "+prop+"='"+attrs[prop]+"'";
			html += " />";
		}
		html += this.$renderIcon ? this.$renderIcon(config) : "";

		let result = "";
		//label position, top or left
		if (top)
			result = label+"<div class='webix_el_box' style='width:"+config.awidth+"px; height:"+config.aheight+"px'>"+html+"</div>";
		else
			result = "<div class='webix_el_box' style='width:"+config.awidth+"px; height:"+config.aheight+"px'>"+label+html+"</div>";


		//bottom message width
		const padding = config.awidth-inputWidth-$active.inputPadding*2;
		//bottom message text
		const message = (config.invalid ? config.invalidMessage : "") || config.bottomLabel;
		if (message)
			result +=  "<div class='webix_inp_bottom_label'"+(config.invalid?"role='alert' aria-relevant='all'":"")+" style='width:"+(inputWidth||config.awidth)+"px;margin-left:"+Math.max(padding,$active.inputPadding)+"px;'>"+message+"</div>";

		return result;
	},
	defaults:{
		template:function(obj, common){
			return common.$renderInput(obj);
		},
		label:"",
		labelWidth:80
	},
	_getLabelWidth: function(width, label){
		if(width == "auto")
			width = getTextSize(label, "webix_inp_label").width;
		return width ? Math.max(width, $active.dataPadding) : 0;
	},
	type_setter:function(value){ return value; },
	_set_inner_size:false,
	_set_default_css:function(){},
	_pattern:function(value){ return value; },
	$setValue:function(value){
		value = this._pattern(value);
		this.getInputNode().value = value;
		this._toggleClearIcon(value);
	},
	$getValue:function(){
		return this._pattern(this.getInputNode().value, false);
	},
	setValueHere:function(v, data, details){
		if (details && details.symbol){
			const s = details.symbol;
			let value = this.getValue();
			let last = value.substring(details.pos);

			value = value.substring(0, details.pos);
			value = value.substring(0, value.lastIndexOf(s)+s.length) + v;

			this.setValue(value + last, details.config);
			setSelectionRange(this.getInputNode(), value.length);
		} else
			this.setValue(v, details && details.config);
	},
	suggest_setter:function(value){
		if (value){
			assert(value !== true, "suggest options can't be set as true, data need to be provided instead");

			if (typeof value == "string"){
				const attempt = $$(value);
				if (attempt) 
					return $$(value)._settings.id;

				value = { body: { url:value , dataFeed:value }};
			} else if(value.getItem)
				value = { body: { data:value }};
			else if (isArray(value))
				value = { body: { data: this._check_options(value) }};
			else if (!value.body)
				value.body = { };

			extend(value, { view:"suggest" });

			const view = ui(value);
			this._destroy_with_me.push(view);
			return view._settings.id;
		}
		return false;
	}
};

const view = protoUI(api, TextPattern, button.view);
export default {api, view};