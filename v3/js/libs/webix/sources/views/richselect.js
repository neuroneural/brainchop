import {protoUI, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {isUndefined, bind} from "../webix/helpers";
import {assert} from "../webix/debug";
import {preventEvent} from "../webix/html";

import text from "./text";


const api = {
	name:"richselect",
	defaults:{
		template:function(obj,common){
			return common._render_div_block(obj, common);
		},
		popupWidth:200,
		icon: "wxi-menu-down"
	},
	_onBlur:function(){
		const text = this.getText();
		if (this._settings.text == text || (isUndefined(this._settings.text) && !text))
			return;

		const suggest = this.getPopup();
		//handle clicks on suggest items
		if (suggest.$view.contains(document.activeElement)) 
			return;

		const nodeValue = this.getInputNode().value;
		const value = suggest.getSuggestion(nodeValue);
		const oldvalue = this.getValue();

		//non-empty value that differs from old value and matches filtering rule
		if (value && value!=oldvalue && !(nodeValue==="" && suggest.getItemText(value)!==""))
			this.setValue(value, "user");
		else if (nodeValue === "")
			this.setValue("", "user");
		else if (this._revertValue)
			this._revertValue();
	},
	suggest_setter:function(value){
		return this.options_setter(value);
	},
	options_setter:function(value){
		value = this._suggest_config ? this._suggest_config(value) : value;
		var suggest = (this._settings.popup = this._settings.suggest = text.api.suggest_setter.call(this, value));
		var list = $$(suggest).getList();
		if (list)
			list.attachEvent("onAfterLoad", bind(this._reset_value, this));

		return suggest;
	},
	getList: function(){
		var suggest = $$(this._settings.suggest);
		assert(suggest, "Input doesn't have a list");
		return suggest.getList();
	},
	_reset_value:function(){
		// multiselect requires value as an array
		const value = this._settings.value||[];
		if (value.length && !this.getPopup().isVisible() && this.getInputNode() && !(this._settings.text || this.getText()))
			this.$setValue(value);
	},
	$skin:function(){
		text.api.$skin.call(this);

		this.defaults.inputPadding = $active.inputPadding;
	},
	$render:function(obj){
		this.$setValue(obj.value);
	},
	getInputNode: function(){
		return this._dataobj.getElementsByTagName("DIV")[1];
	},
	getPopup: function(){
		return $$(this._settings.popup);
	},
	getText:function(){
		var value = this._settings.value,
			node = this.getInputNode();
		if(!node)
			return value?this.getPopup().getItemText(value):"";
		if (isUndefined(node.value)){
			if (node.firstChild && node.firstChild.className === "webix_placeholder")
				return "";
			return node.innerHTML;
		}
		return node.value;
	},
	$prepareValue:function(value){
		if (value && value.id)
			return value;			//don't convert new items

		return text.api.$prepareValue.call(this, value);
	},
	$setValue:function(value){
		let text = value;

		const popup = this.getPopup();
		if (popup)
			text = popup.getItemText(value);

		if (value && value.id){ //add new value
			const list = popup.getList();
			const exists = list.exists(value.id);

			// add new item only when item with such id doesn't exists yet
			if (!exists) list.add(value);

			text = popup.getItemText(value.id);

			// in case of dynamic list, we can't add extra items
			// to not interfere with dynamic loading
			if (list._settings.dynamic && !exists)
				list.remove(value.id);

			this._settings.value = this.$prepareValue(value.id);
		}

		const node = this.getInputNode();
		if (isUndefined(node.value))
			node.innerHTML = text || this._get_div_placeholder();
		else 
			node.value = text = text.replace(/<[^>]*>/g,"");

		this._settings.text = text;
		this._toggleClearIcon(text);
	},
	getValue:function(){
		return this._settings.value||"";
	},
	_ignoreLabelClick:function(ev){
		this.focus();
		preventEvent(ev);
	}
};

const view = protoUI(api, text.view);
export default {api, view};