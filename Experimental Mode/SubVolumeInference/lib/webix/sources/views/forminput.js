import fieldset from "../views/fieldset";
import {remove, create, getTextSize} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";

const api = {
	name:"forminput",
	defaults:{
		$cssName:"webix_forminput",
		labelWidth: 80,
		labelAlign : "left",
		// remove fieldset sizing
		paddingY:0, paddingX:0
	},
	setValue:function(value, config){
		if(this._body_view.setValue)
			this._body_view.setValue(value, config);
		else if (this._body_view.setValues)
			this._body_view.setValues(value, false, config);
	},
	focus:function(){
		if (this._body_view.focus){
			return this._body_view.focus();
		}
		return false;
	},
	getValue:function(){
		if(this._body_view.getValue)
			return this._body_view.getValue();
		else if (this._body_view.getValues)
			return this._body_view.getValues();
	},
	getBody:function(){
		return this._body_view;
	},
	$skin:function(){
		this._inputPadding = $active.inputPadding;
		this._inputSpacing = $active.inputSpacing;
		this._labelTopHeight = $active.labelTopHeight;
	},
	$init:function(){
		this.$ready.push(function(){
			let label = this._viewobj.firstChild.childNodes[0];
			let body = this._viewobj.firstChild.childNodes[1];

			const config = this._settings;

			if (config.labelPosition != "top"){
				config.labelWidth = config.label ? this._getLabelWidth(config.labelWidth, config.label) : 0;
				config.paddingX = config.labelWidth + this._inputSpacing;
			}
			else {
				config.paddingY = this._labelTopHeight;
				config.paddingX = this._inputSpacing;
			}

			if (!config.label || (!config.labelWidth && config.labelPosition != "top")){
				label.style.display = "none";
				body.style.padding = "0 " + this._inputSpacing/2 + "px";
				config.paddingX = this._inputSpacing;
				config.paddingY = 0;
				return;
			}

			if (config.labelPosition == "top"){
				label.style.lineHeight = this._labelTopHeight - this._inputPadding + "px";
				label.className += " "+this.defaults.$cssName+"_label_top";
				body.style.padding = "0 " + this._inputSpacing/2 + "px";
			}
			else label.style.width = config.paddingX - this._inputSpacing/2 + "px";

			label.style.textAlign = config.labelAlign;

			if(config.value) this.setValue(config.value, "auto");
		});
	},
	_getLabelWidth: function(width, label){
		if(width == "auto")
			width = getTextSize(label, "webix_inp_label").width;
		return width ? Math.max(width, $active.dataPadding) : 0;
	},
	setBottomText: function(text) {
		const config = this._settings;
		if (typeof text != "undefined"){
			if (config.bottomLabel == text) return;
			config.bottomLabel = text;
		}
		const message = (config.invalid ? config.invalidMessage : "") || config.bottomLabel;
		if(this._invalidMessage) {
			remove(this._invalidMessage);
		}
		if(message) {
			this.$view.style.position = "relative";
			this._invalidMessage = create("div", { "class":"webix_inp_bottom_label", role:config.invalid?"alert":"", "aria-relevant":"all", style:"position:absolute; bottom:0px; padding:2px 0; background: white; left:"+(this._inputSpacing/2+(config.label?config.labelWidth:0))+"px; " }, message);
			this._viewobj.appendChild(this._invalidMessage);
		}
	}
};


const view = protoUI(api,  fieldset.view);
export default {api, view};