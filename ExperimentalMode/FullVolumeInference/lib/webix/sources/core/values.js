import {addCss, removeCss} from "../webix/html";
import {isUndefined, copy} from "../webix/helpers";
import {assert} from "../webix/debug";

import CodeParser from "../core/codeparser";


// #include core/parsing.js

const Values = {
	$init:function(){
		this.elements = {};
	},
	focus:function(name){
		if (name){
			assert(this.elements[name],"unknown input name: "+name);
			this._focus(this.elements[name]);
		} else{
			for(var n in this.elements){
				if(this._focus(this.elements[n]) !== false)
					return true;
			}
		}
		return false;
	},
	_focus: function(target){
		if (target && target.focus){
			return target.focus();
		}
		return false;
	},
	setValues:function(data, update, config){
		if (this._settings.complexData)
			data = CodeParser.collapseNames(data, "", {}, (v) => !this.elements[v]);
		this._inner_setValues(data, update, config);
	},
	_inner_setValues:function(data, update, config){
		this._is_form_dirty = update;
		//prevent onChange calls from separate controls
		this.blockEvent();

		if (!update || !this._values)
			this._values = {};

		for (let name in data)
			if (!this.elements[name])
				this._values[name] = data[name];

		for (let name in this.elements){
			const input = this.elements[name];
			if (input){
				if (!isUndefined(data[name]))
					input.setValue(data[name], config);
				else if (!update && input.$allowsClear)
					input.setValue("", config);
				this._values[name] = input.getValue();
			}
		}

		this.unblockEvent();
		this.callEvent("onValues",[]);
	},
	isDirty:function(){
		return !!this._is_form_dirty || this.getDirtyValues(true) === true;
	},
	setDirty:function(flag){
		this._is_form_dirty = flag;
		if (!flag)
			this._values = this._inner_getValues();
	},
	getDirtyValues:function(){
		const result = {};
		if (this._values){
			for (let name in this.elements){
				const view = this.elements[name];
				const value = view.getValue();
				const defaultValue = this._values[name];

				const isDirty = view.$compareValue ? !view.$compareValue(defaultValue, value) : defaultValue != value;
				if (isDirty){
					result[name] = value;
					if (arguments[0])
						return true;
				}
			}
		}
		return result;
	},
	getCleanValues:function(){
		return this._values;
	},
	getValues:function(filter){
		var data = this._inner_getValues(filter);
		if (this._settings.complexData)
			data = CodeParser.expandNames(data);

		return data;
	},
	_inner_getValues:function(filter){
		//get original data		
		var success,
			elem = null,
			data = (this._values?copy(this._values):{});

		//update properties from linked controls
		for (var name in this.elements){
			elem = this.elements[name];
			success = true;
			if(filter){
				if(typeof filter == "object"){
					if(filter.hidden === false)
						success = elem.isVisible();
					if(success && filter.disabled === false)
						success = elem.isEnabled();
				}
				else
					success = filter.call(this,elem);
			}
			if(success)
				data[name] = elem.getValue();
			else
				delete data[name]; //in case of this._values[name]
		}
		return data;
	},
	clear:function(config){
		this._is_form_dirty = false;
		var data = {};
		for (var name in this.elements)
			if (this.elements[name].$allowsClear)
				data[name] = "";
		
		this._inner_setValues(data, false, config);
	},
	markInvalid: function(name, state){
		// remove 'invalid' mark
		if(state === false){
			this._clear_invalid(name);
		}
		// add 'invalid' mark
		else{
			// set invalidMessage
			if(typeof state == "string"){
				var input = this.elements[name];
				if(input)
					input._settings.invalidMessage = state;
			}
			//add mark to current validation process
			if (this._validate_details)
				this._validate_details[name] = true;

			this._mark_invalid(name);
		}
	},
	_mark_invalid:function(id){
		var input = this.elements[id];
		if (id && input){
			this._clear_invalid(id,true);
			addCss(input._viewobj, "webix_invalid");
			input._settings.invalid = true;
			var message = input._settings.invalidMessage;
			if(typeof message === "string" && input.setBottomText)
				input.setBottomText();
		}
	},
	_clear_invalid:function(id,silent){
		var input = this.elements[id];
		if(id && input && input.$view && input._settings.invalid){
			removeCss(input._viewobj, "webix_invalid");
			input._settings.invalid = false;
			var message = input._settings.invalidMessage;
			if(typeof message === "string" && !silent && input.setBottomText)
				input.setBottomText();
		}
	}
};


export default Values;