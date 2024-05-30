import template from "../views/template";
import Values from "../core/values";
import {addCss, removeCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {toNode} from "../webix/helpers";


function _tagname(el) {
	if (!el.tagName) return null;
	return el.tagName.toLowerCase();
}
function _attribute(el, name) {
	if (!el.getAttribute) return null;
	var attr = el.getAttribute(name);
	return attr ? attr.toLowerCase() : null;
}
function _get_html_value() {
	var tagname = _tagname(this);
	if (_get_value[tagname])
		return _get_value[tagname](this);
	return _get_value.other(this);
}

var _get_value = {
	radio: function(el){
		for (var i = 0; i < el.length; i++)
			if (el[i].checked) return el[i].value;
		return "";
	},
	input: function(el) {
		var type = _attribute(el, "type");
		if (type === "checkbox")
			return el.checked;			
		return el.value;
	},
	textarea: function(el) {
		return el.value;
	},
	select: function(el) {
		var index = el.selectedIndex;
		return el.options[index].value;
	},
	other: function(el) {
		return el.innerHTML;
	}
};

function  _set_html_value(value) {
	var tagname = _tagname(this);
	if (_set_value[tagname])
		return _set_value[tagname]( this, value);
	return _set_value.other( this, value);
}

var _set_value = {
	radio:function(el, value){
		for (var i = 0; i < el.length; i++)
			el[i].checked = (el[i].value == value);
	},
	input: function(el, value) {
		var type = _attribute(el, "type");
		if (type === "checkbox")
			el.checked = (value) ? true : false;
		else
			el.value = value;
	},
	textarea: function(el, value) {
		el.value = value;
	},
	select: function(el, value) {
		el.value = value;
		//incorrect option applied, select first option
		if(el.selectedIndex === -1) el.value = el.firstElementChild.value;
	},
	other: function(el, value) {
		el.innerHTML = value;
	}
};


const api = {
	name:"htmlform",
	$init: function(config) {
		this.elements = {};
		this._default_values  = false;

		if (config.content && (config.container == config.content || !config.container && config.content == document.body))
			this._copy_inner_content = true;
	},
	content_setter:function(content){
		content = toNode(content);
		if (this._copy_inner_content){
			while (content.childNodes.length > 1)
				this._viewobj.childNodes[0].appendChild(content.childNodes[0]);
		} else {
			this._viewobj.childNodes[0].appendChild(content);
		}
		this._parse_inputs();
		return true;
	},
	render:function(){
		template.api.render.apply(this, arguments);
		this._parse_inputs();
	},
	_parse_inputs: function() {
		var inputs = this._viewobj.querySelectorAll("[name]");
		this.elements = {};


		for (var i=0; i<inputs.length; i++){
			var el = inputs[i];
			var name = _attribute(el, "name");
			if (name){
				var tag = _tagname(el) === "button";
				var type = _attribute(el, "type");

				var cant_clear = tag || type === "button" || type === "submit";

				if (type === "radio"){
					var stack = this.elements[name] || [];
					stack.tagName = "radio";
					stack.push(el);
					el = stack;
				}

				this.elements[name] = el;

				el.getValue =  _get_html_value;
				el.setValue =  _set_html_value;
				el.$allowsClear = !cant_clear;
			}
		}

		return this.elements;
	},
	_mark_invalid:function(id,obj){
		this._clear_invalid(id,obj);
		var el = this._viewobj.querySelector("[name=\"" + id + "\"]");
		if (el) addCss(el, "invalid");
	},
	_clear_invalid:function(id){
		var el = this._viewobj.querySelector("[name=\"" + id + "\"]");
		if (el) removeCss(el, "invalid");
	},
	focus:function(name){
		if (!name && this.$view.contains(document.activeElement)){
			// focus already inside of form, leaving
			return false;
		}
		Values.focus.apply(this, arguments);
	}
};


const view = protoUI(api,  template.view, Values);
export default {api, view};