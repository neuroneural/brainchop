import {addCss, removeCss} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {once, uid} from "../webix/helpers";
import template from "../webix/template";
import {$name} from "../webix/skin";

import HTMLOptions from "../core/htmloptions";

import text from "./text";


const api = {
	name:"segmented",
	$allowsClear:false,
	$init:function(){
		this.attachEvent("onChange", function(value){
			if (this._settings.multiview)
				this._show_view(value);
		});
		this.attachEvent("onAfterRender", once(function(){
			if (this._settings.multiview && this._settings.value)
				this._show_view(this._settings.value);
		}));
	},
	_show_view:function(value){
		var top = this.getTopParentView();
		var view = null;

		//get from local isolate
		if (top && top.$$)
			view = top.$$(value);
		//or check globally
		if (!view)
			view = $$(value);

		if(view && view.show)
			view.show();
	},
	defaults:{
		template:function(obj, common){
			common._check_options(obj.options);

			const options = common._filterOptions(obj.options);
			const width = common._get_input_width(obj);
			const borders = $name == "contrast" ? 0 : options.length - 1;
			const optionWidth = obj.optionWidth || Math.floor((width-borders)/options.length);
			
			let html = "<div style='width:"+width+"px' class='webix_all_segments' role='tablist' aria-label='"+template.escape(obj.label)+"'>";
			let tooltip, isDisabled;

			if (!obj.value)
				obj.value = common._getFirstActive(true);

			for (var i=0; i<options.length; i++){
				isDisabled = !!options[i].disabled;
				tooltip = obj.tooltip ? " webix_t_id='"+options[i].id+"'" : "";
				html += "<button type='button' style='width:"+(options[i].width || optionWidth)+"px' role='tab' aria-selected='"+(obj.value==options[i].id?"true":"false")+
					"' tabindex='"+(!isDisabled && obj.value==options[i].id?"0":"-1")+"' class='"+"webix_segment_"+((i==options.length-1)?"N":(i>0?1:0))+((obj.value==options[i].id)?" webix_selected":"")+
					(isDisabled?" webix_disabled":"")+"' "+(isDisabled?"webix_disabled='true' ":"")+/*@attr*/"button_id='"+options[i].id+"'"+tooltip+">"+options[i].value+"</button>";
			}
			
			return common.$renderInput(obj, html+"</div>", uid());
		}
	},
	_getInputNode:function(){
		return this.$view.getElementsByTagName("BUTTON");
	},
	focus: function(){ return this._focus(); },
	blur: function(){ this._blur(); },
	$setValue:function(value){
		//refresh tabbar if the option is in the popup list
		const popup = this.config.tabbarPopup;
		if (popup && $$(popup) && $$(popup).getBody().exists(value))
			return this.refresh();

		const inputs = this._getInputNode();
		let id, option;

		for (let i=0; i<inputs.length; i++){
			id = inputs[i].getAttribute(/*@attr*/"button_id");
			option = this.getOption(id);

			inputs[i].setAttribute("aria-selected", (value==id?"true":"false"));
			inputs[i].setAttribute("tabindex", (option && !option.disabled && value==id?"0":"-1"));
			if (value == id)
				addCss(inputs[i], "webix_selected");
			else
				removeCss(inputs[i], "webix_selected");
		}
	},
	$getValue:function(){
		return this._settings.value||"";
	},
	getValue:function(){
		return this._settings.value;
	},
	getInputNode:function(){
		return null;
	},
	_set_inner_size:false
};

const view = protoUI(api, text.view, HTMLOptions);
export default {api, view};