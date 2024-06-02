import suggest from "../views/suggest";
import {protoUI, $$} from "../ui/core";
import {copy, bind} from "../webix/helpers";


const api = {
	name:"daterangesuggest",
	defaults:{
		type:"daterange",
		body: {
			view:"daterange", icons:true, button:true, borderless:true
		}
	},
	getValue:function(){
		return this.getRange().getValue();
	},
	setValue:function(value, config){
		this.getRange().setValue(copy(value), config);
	},
	getRange:function(){
		return this.getBody();
	},
	getButton:function(){
		return this.getBody().getChildViews()[1].getChildViews()[1];
	},
	_setValue:function(value){
		const master = $$(this._settings.master);
		if (master)
			master.setValue(value, "user");
	},
	_set_on_popup_click:function(){
		var range  = this.getRange();
		range.attachEvent("onAfterDateSelect", bind(function(value) {this._setValue(value);}, this));
		range.attachEvent("onDateClear", bind(function(value) {this._setValue(value);}, this));
		range.attachEvent("onTodaySet", bind(function(value) {this._setValue(value);}, this));
	}
};


const view = protoUI(api,  suggest.view);
export default {api, view};