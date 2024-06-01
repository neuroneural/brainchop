import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {uid} from "../webix/helpers";
import template from "../webix/template";

import text from "./text";


const api = {
	name:"checkbox",
	defaults:{
		checkValue:1,
		uncheckValue:0,
		template:function(config, common) {
			var id = "x"+uid();
			var rightlabel = "";
			if (config.labelRight){
				rightlabel = "<label class='webix_label_right'>"+config.labelRight+"</label>";
				//user clearly attempts to hide the label, help him
				if (config.labelWidth)
					config.label = config.label || "&nbsp;";
			}
			var checked = (config.checkValue == config.value);
			var margin = Math.floor((common._settings.aheight-16)/2);
			var ch = common._baseInputHTML("input")+"style='margin-top:"+margin+"px;"+(config.customCheckbox?"display:none":"")+"' id='"+id+"' type='checkbox' "+(checked?"checked='1'":"")+(config.labelRight?" aria-label='"+template.escape(config.labelRight)+"'":"")+"/>";
			var className = "webix_inp_checkbox_border webix_el_group webix_checkbox_"+(checked?"1":"0");
			var customCheckbox = config.customCheckbox || "";
			if(customCheckbox){
				customCheckbox = customCheckbox.replace(/(aria-checked=')\w*(?=')/, "$1"+(config.value == config.checkValue?"true":"false"));
				customCheckbox = customCheckbox.replace(/(aria-label=')\w*(?=')/, "$1"+template.escape(config.labelRight || config.label));
				customCheckbox = customCheckbox.replace(/(aria-invalid=')\w*(?=')/, "$1"+(config.invalid?"true":"false"));
			}
			var html = "<div style='line-height:"+common._settings.cheight+"px' class='"+className+"'>"+ch+customCheckbox+rightlabel+"</div>";
			return common.$renderInput(config, html, id);
		}
	},
	customCheckbox_setter: function(value){
		if( value === true && $active.customCheckbox){
			value = "<a role='presentation' onclick='javascript:void(0)'><button role='checkbox' aria-checked='false' aria-label='' type='button' aria-invalid='' class='webix_custom_checkbox'></button></a>";
		}
		return value;
	},
	blur: function(){
		var input = this.getInputNode();
		if(input) input.blur();
	},
	$prepareValue: function(value){ return value; },
	_init_onchange: function(){},
	$setValue:function(value){
		var isChecked = (value == this._settings.checkValue);
		var input = this.$view.getElementsByTagName("input")[0];
		var parentNode = input?input.parentNode:null;

		if(parentNode && this._settings.customCheckbox){
			var button = parentNode.getElementsByTagName("BUTTON");
			if(button[0]) button[0].setAttribute("aria-checked", isChecked?"true":"false");
		}
		if(parentNode){
			parentNode.className = parentNode.className.replace(/(webix_checkbox_)\d/,"$1"+(isChecked?1:0));
		}
		input.checked = isChecked;
	},
	toggle:function(config){
		const c = this._settings;
		const value = (this.getValue() != c.checkValue) ? c.checkValue : c.uncheckValue;
		this.setValue(value, config);
	},
	getValue:function(){
		const c = this._settings;
		return (c.value == c.checkValue) ? c.checkValue : c.uncheckValue;
	},
	getInputNode: function() {
		return this.$view.getElementsByTagName(this._settings.customCheckbox?"button":"input")[0];
	},
	$skin:function(){
		text.api.$skin.call(this);

		this.defaults.customCheckbox = !!$active.customCheckbox;
	}
};

const view = protoUI(api, text.view);
export default {api, view};