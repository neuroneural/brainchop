import {protoUI} from "../ui/core";
import {isUndefined} from "../webix/helpers";

import datepicker from "./datepicker";


const api = {
	name:"colorpicker",
	$init:function(){
		this.$ready.push(this._init_popup);
	},
	defaults:{
		icon:true
	},
	_init_popup:function(){
		const obj = this._settings;
		if (obj.suggest)
			obj.popup = obj.suggest;
		else if (!obj.popup)
			obj.popup = obj.suggest = this.suggest_setter({
				type:"colorboard"
			});
		this._init_once = function(){};
	},
	clear_setter:function(value){
		return !!value;
	},
	getValue:function(){
		if (this._rendered_input && this._settings.editable)
			return this.getInputNode().value;
		else
			return this._settings.value;
	},
	$prepareValue:function(value){
		value = value ? value.toString(16) : "";
		if (value && value.charAt(0) != "#" && /^[0-9a-fA-F]+$/.test(value))
			value = "#" + value;
		return value;
	},
	_getColorNode: function(){
		return this.$view.getElementsByTagName("DIV")[this._settings.editable?1:2];
	},
	_get_visible_text:function(value){
		return value;
	},
	$compareValue:function(oldvalue, value){
		return oldvalue == value;
	},
	$setValue:function(value){
		this._getColorNode().style.backgroundColor = value;
		this._settings.text = value;
		this._toggleClearIcon(value);

		const node = this.getInputNode();
		if(isUndefined(node.value))
			node.innerHTML = value;
		else
			node.value = value;
	},
	$renderIcon:function(c){
		let right = this._inputSpacing/2 + 5;
		let html = "<div class='webix_input_icon' style='top:"+(c.inputPadding+4)+"px;right:"+right+"px;background-color:"+c.value+";'></div>";

		if (c.clear){
			const height = c.aheight - 2*c.inputPadding;
			const padding = (height - 18)/2 -1;
			right += 24;
			html += "<span style='right:"+right+"px;height:"+(height-padding)+"px;padding-top:"+padding+"px;' class='webix_input_icon webix_clear_icon wxi-close'></span>";
		}
		return html;
	}
};

const view = protoUI(api, datepicker.view);
export default {api, view};