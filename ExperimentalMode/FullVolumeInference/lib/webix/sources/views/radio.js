import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {uid} from "../webix/helpers";

import template from "../webix/template";
import HTMLOptions from "../core/htmloptions";

import button from "../views/button";
import text from "../views/text";

const api = {
	name:"radio",
	defaults:{
		template: function(config,common) {
			common._check_options(config.options);

			const options = common._filterOptions(config.options);
			const active = common._getFirstActive();
			let id, eachid, isChecked, isDisabled, label, tooltip, customRadio, optlabel, rd, input, focusable;
			let html = [];

			for (let i=0; i < options.length; i++) {
				eachid = "x"+uid();
				id = id || eachid;

				if  (i && (options[i].newline || config.vertical))
					html.push("<div class='webix_line_break'></div>");

				isChecked = (options[i].id == config.value);
				focusable = isChecked || (!config.value && options[i].id === active);
				isDisabled = !!options[i].disabled;
				label = options[i].value || "";
				tooltip = config.tooltip ? " webix_t_id='"+options[i].id+"'" : "";
				
				customRadio = config.customRadio|| "";
				if (customRadio){
					optlabel = (i === 0 ? config.label+" " : "")+label;
					customRadio = customRadio.replace(/(aria-label=')\w*(?=')/, "$1"+template.escape(optlabel));
					customRadio = customRadio.replace(/(aria-checked=')\w*(?=')/, "$1"+(isChecked?"true":"false"));
					customRadio = customRadio.replace(/(tabindex=')\w*(?=')/, "$1"+(!isDisabled && focusable?"0":"-1"));
					customRadio = customRadio.replace(/(aria-invalid=')\w*(?=')/, "$1"+(config.invalid?"true":"false"));
					customRadio = customRadio.replace(/(button_id=')\w*(?=')/, "$1"+options[i].id);
					if (isDisabled)
						customRadio = customRadio.replace("role='radio'", "role='radio' webix_disabled='true'");
				}
				rd = common._baseInputHTML("input")+" name='"+(config.name || config.id)+"' type='radio' "+(isChecked?"checked='1'":"")+"tabindex="+(!isDisabled && focusable?"0":"-1")+
					" value='"+options[i].id+"' id='"+eachid+"'"+(isDisabled?" disabled='true'":"")+" style='"+(customRadio?"display:none":"")+"' />";
				input = "<div "+/*@attr*/"radio_id"+"='"+options[i].id+"' class='webix_inp_radio_border webix_radio_"+(isChecked?"1":"0")+"' role='presentation'>"+rd+customRadio+"</div>";

				if (label)
					label = "<label for='"+eachid+"' class='webix_label_right'>" + label + "</label>";

				html.push("<div class='webix_radio_option"+(isDisabled?" webix_disabled":"")+"' role='presentation'"+tooltip+">"+input+label+"</div>");
				
			}
			html = "<div class='webix_el_group' role='radiogroup' style='margin-left:"+(config.label?config.labelWidth:0)+"px;'>"+html.join("")+"</div>";
			
			return common.$renderInput(config, html, id);
		}
	},
	refresh:function(){
		this.render();
		if (this._last_size && this.$getSize(0,0)[2] != this._last_size[1])
			this.resize();
	},
	$getSize:function(dx, dy){
		var size = button.api.$getSize.call(this, dx, dy);
		var options = this._filterOptions(this._settings.options);
		if (options){
			var count = this._settings.vertical?0:1;
			for (var i=0; i < options.length; i++)
				if (this._settings.vertical || options[i].newline)
					count++;
			size[3] = size[2] = Math.max(size[2], (this._settings.optionHeight||25) * count+this._settings.inputPadding*2+ (this._settings.labelPosition == "top"?this._labelTopHeight:0));
		}
		var heightInc = this.config.bottomPadding;
		if(heightInc){
			size[2] += heightInc;
			size[3] += heightInc;
		}
		return size;
	},
	_getInputNode: function(){
		return this._dataobj.getElementsByTagName(this._settings.customRadio ? "button" : "input");
	},
	$setValue:function(value){
		const inp = this._dataobj.getElementsByTagName("input");
		const active = this._getFirstActive();
		let id, option, focusable, parentNode, button;

		for (let i=0; i < inp.length; i++){
			id = inp[i].parentNode.getAttribute(/*@attr*/"radio_id");
			option = this.getOption(id);

			inp[i].checked = (id == value);
			focusable = option && !option.disabled && (inp[i].checked || (!value && option.id == active));
			inp[i].setAttribute("tabindex", focusable?"0":"-1");

			parentNode = inp[i]?inp[i].parentNode:null;
			if (parentNode){
				parentNode.className = parentNode.className.replace(/(webix_radio_)\d/,"$1"+(inp[i].checked?1:0));
				if (this._settings.customRadio){
					button = parentNode.getElementsByTagName("BUTTON");
					if (button[0]){
						button[0].setAttribute("aria-checked", inp[i].checked?"true":"false");
						button[0].setAttribute("tabindex", focusable?"0":"-1");
					}
				}
			}
		}
	},
	getValue:function(){
		return this._settings.value;
	},
	focus: function(){ return this._focus(); },
	blur: function(){ this._blur(); },
	customRadio_setter: function(value){
		if(value === true && $active.customRadio)
			value = "<a role='presentation' onclick='javascript:void(0)'><button type='button' class='webix_custom_radio' "+/*@attr*/"button_id='' role='radio' aria-checked='false' aria-label='' aria-invalid='' tabindex=''></button></a>";
		return value;
	},
	$skin:function(){
		text.api.$skin.call(this);

		this.defaults.customRadio = !!$active.customRadio;
		if ($active.optionHeight)
			this.defaults.optionHeight = $active.optionHeight;
	}
};

const view = protoUI(api, text.view, HTMLOptions);
export default {api, view};