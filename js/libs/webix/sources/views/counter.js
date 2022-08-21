import {protoUI} from "../ui/core";
import {uid} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import template from "../webix/template";

import text from "./text";
import button from "./button";

import i18n from "../webix/i18n";


const api = {
	name:"counter",
	defaults:{
		template:function(config, common){
			const value = config.value;

			const id = "x"+uid();
			let html = "<div role='spinbutton' aria-label='"+template.escape(config.label)+"' aria-valuemin='"+config.min+"' aria-valuemax='"+config.max+"' aria-valuenow='"+config.value+"' class='webix_el_group' style='width:"+common._get_input_width(config)+"px'>";
			html +=  "<button type='button' class='webix_inp_counter_prev' tabindex='-1' aria-label='"+i18n.aria.decreaseValue+"'>-</button>";
			html += common._baseInputHTML("input")+" id='"+id+"' type='text' class='webix_inp_counter_value' aria-live='assertive'"+" value='"+value+"'></input>";
			html += "<button type='button' class='webix_inp_counter_next' tabindex='-1' aria-label='"+i18n.aria.increaseValue+"'>+</button></div>";
			return common.$renderInput(config, html, id);
		},
		min:0,
		max:Infinity,
		value:0,
		step:1
	},
	$init:function(){
		_event(this.$view, "keydown", this._keyshift, {bind:this});
	},
	_keyshift:function(e){
		if(this._settings.readonly)
			return;

		const code = e.which || e.keyCode, c = this._settings;
		let value = this.getValue();

		if(code>32 && code <41){
			if(code === 36) value = c.min;
			else if(code === 35) value = c.max === Infinity? 1000000 :c.max;
			else if(code === 33) this.next(c.step, "user");
			else if(code === 34) this.prev(c.step, "user");
			else value = value+(code === 37 || code ===40?-1:1);

			if(code>34 && value>=c.min && value<=c.max)
				this.setValue(value, "user");
		}
	},
	$setValue:function(value){
		this.getInputNode().value = value;
	},
	$prepareValue:function(value){
		value = parseFloat(value);

		const min = this._settings.min;
		const max = this._settings.max;

		if(isNaN(value))
			value = isFinite(min) ? min : 0;

		return Math.min(Math.max(value, min), max);
	},
	getInputNode:function(){
		return this._dataobj.getElementsByTagName("input")[0];
	},
	getValue:function(){
		return  button.api.getValue.apply(this,arguments)*1;
	},
	next:function(step,config){
		step = 1*( step || this._settings.step );
		this.shift(step,config);
	},
	prev:function(step,config){
		step = (-1)*( step || this._settings.step );
		this.shift(step,config);
	},
	shift:function(step,config){
		//round values to fix math precision issue in JS
		const new_value = Math.round((this.getValue() + step)*100000)/100000;
		this.setValue(new_value,config);
	}
};

const view = protoUI(api, text.view);
export default {api, view};