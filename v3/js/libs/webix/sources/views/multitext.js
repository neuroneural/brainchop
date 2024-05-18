import text from "../views/text";
import {protoUI, $$} from "../ui/core";
import {extend, _to_array} from "../webix/helpers";

import i18n from "../webix/i18n";

const api = {
	name:"multitext",
	$cssName:"text",
	defaults:{
		icon:"wxi-plus-circle",
		iconWidth:25,
		separator:", "
	},
	getValueHere:function(){
		return text.api.getValue.call(this);
	},
	setValueHere:function(value){
		return text.api.$setValue.call(this, value);
	},
	getValue:function(){
		if (this.config.mode == "extra") return this.getValueHere();

		if (this._full_value) 
			return this._full_value;

		var values = [ this.getValueHere(this) ];
		for (var i=0; i<this._subs.length; i++){
			var seg = $$(this._subs[i]).getValueHere();
			if (seg) values.push(seg);
		}
		return values.join(this.config.separator);
	},
	$setValue:function(value){
		value = value || "";

		if (this.config.mode == "extra") return this.setValueHere(value);

		this._full_value = value;
		var parts = value.split(this.config.separator);
		if (parts.length == this._subs.length+1){
			this.setValueHere(parts[0]);
			for (let i = 0; i < this._subs.length; i++)
				$$(this._subs[i]).setValueHere(parts[i+1]);

			this._full_value = "";
			return;
		}

		this.removeSection();
		this.setValueHere.call(this, parts[0]);
		for (let i = 1; i<parts.length; i++){
			this.addSection(parts[i]);
		}
		this._full_value = "";
	},
	$renderIcon:function(c){
		if (c.icon){
			const height = c.aheight - 2*c.inputPadding;
			const padding = (height - 18)/2 -1;
			const aria = "role='button' tabindex='0' aria-label='"+(i18n.aria["multitext"+(c.mode || "")+"Section"])+"'";
			return "<span style='right:0;height:"+(height-padding)+"px;padding-top:"+padding+"px;' class='webix_input_icon webix_multitext_icon "+c.icon+"' "+aria+"></span>";
		}
		return "";
	},
	_subOnChange:function(v, o, config){
		const parent = this.config.master ? $$(this.config.master) : this;
		const value = parent.getValue();
		const oldvalue = parent._settings.value;

		if (value != oldvalue){
			parent._settings.value = value;
			parent.callEvent("onChange", [value, oldvalue, config]);
		}
	},
	addSection:function(text){
		var config = this.config,
			newConfig = {
				labelWidth: config.labelWidth,
				inputWidth: config.inputWidth,
				width: config.width,
				label: config.label ? "&nbsp;" : "",
				view: this.name,
				mode: "extra",
				value: text || "",
				icon: "wxi-minus-circle",
				tooltip: config.tooltip,
				suggest: config.suggest || null,
				master: config.id
			};

		extend(newConfig, config.subConfig||{},true);

		var newone = this.getParentView().addView(newConfig);
		$$(newone).attachEvent("onChange", this._subOnChange);

		this._subs.push(newone);
		this.callEvent("onSectionAdd", [newone, this._subs.length]);
		return newone;
	},
	removeSection:function(id){
		var parent = this.config.master ? $$(this.config.master) : this;
		for (var i = parent._subs.length - 1; i >= 0; i--){
			var section = parent._subs[i];
			if (!id || section == id){
				parent._subs.removeAt(i);
				this.getParentView().removeView(section);
				parent.callEvent("onSectionRemove", [section, i+1]);
			}
		}
	},
	on_click:{
		"webix_input_icon":function(){
			if (this.config.mode == "extra"){
				const parent = this.getParentView();
				this.removeSection(this.config.id);

				const childs = parent.getChildViews();
				childs[childs.length - 1].focus();
				
				this._subOnChange(null,null,"user");
			} else
				$$(this.addSection()).focus();

			return false;
		}
	},
	$init:function(){
		this._subs = _to_array([]);
		this.attachEvent("onKeyPress", this._onKeyPress);
	},
	$render:function(obj){
		this.$setValue(obj.value);
	},
};


const view = protoUI(api,  text.view);
export default {api, view};