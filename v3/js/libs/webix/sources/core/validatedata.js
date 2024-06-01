import {assert} from "../webix/debug";
import CodeParser from "../core/codeparser";
import rules from "../webix/rules";



const ValidateData = {
	$init:function(){
		if(this._events)
			this.attachEvent("onChange",this.clearValidation);
	},
	clearValidation:function(){
		if(this.elements){
			for(var id in this.elements){
				this._clear_invalid(id);
			}
		}
	},
	validate:function(mode, obj) {
		assert(this.callEvent, "using validate for eventless object");
		
		this.callEvent("onBeforeValidate", []);

		var failed = this._validate_details = {};

		//optimistic by default :) 
		var result =true;
		var rules = this._settings.rules;
		
		var isHidden = this.isVisible && !this.isVisible();
		var validateHidden = mode && mode.hidden;
		var validateDisabled = mode && mode.disabled;

		//prevent validation of hidden elements
		var elements = {}, hidden = {};
		for(var i in this.elements){
			var name = this.elements[i].config.name;
			//we are ignoring hidden and disabled fields during validation
			//if mode doesn not instruct us otherwise
			//if form itself is hidden, we can't separate hidden fiels,
			//so we will vaidate all fields
			if((isHidden || this.elements[i].isVisible() || validateHidden) && (this.elements[i].isEnabled() || validateDisabled))
				elements[name] = this.elements[i];
			else{
				hidden[name]=true;
			}
		}
		if (rules || elements)
			if(!obj && this.getValues)
				obj = this.getValues();

		if (rules){
			//complex rule, which may chcek all properties of object
			if (rules.$obj)
				result = this._validate(rules.$obj, obj, obj, "") && result;
			
			//all - applied to all fields
			var all = rules.$all;
			var data = obj;

			if (this._settings.complexData)
				data = CodeParser.collapseNames(obj, "", {}, (v) => !rules[v]);

			if (all)
				for (let key in obj){
					if(hidden[key]) continue;
					let subresult = this._validate(all, data[key], obj, key);
					if (!subresult)
						failed[key] = true;
					result =  subresult && result;
				}


			//per-field rules
			for (let key in rules){
				if(hidden[key]) continue;
				if (key.indexOf("$")!==0 && !failed[key]){
					assert(rules[key], "Invalid rule for:"+key);
					let subresult = this._validate(rules[key], data[key], obj, key);
					if (!subresult)
						failed[key] = true;
					result = subresult && result;
				}
			}
		}

		//check personal validation rules
		if (elements){
			for (var key in elements){
				if (failed[key]) continue;

				var subview = elements[key];
				if (subview.validate){
					let subresult = subview.validate();
					result = subresult && result;
					if (!subresult)
						failed[key] = true;
				} else {
					var input = subview._settings;
					if (input){	//ignore non webix inputs
						var validator = input.validate;
						if (!validator && input.required)
							validator = rules.isNotEmpty;

						if (validator){
							let subresult = this._validate(validator, obj[key], obj, key);
							if (!subresult)
								failed[key] = true;
							result = subresult && result;
						}
					}
				}
			}
		}
	
		this.callEvent("onAfterValidation", [result, this._validate_details]);
		return result;
	},
	_validate:function(rule, data, obj, key){
		if (typeof rule == "string")
			rule = rules[rule];
		if (rule.call(this, data, obj, key)){
			if(this.callEvent("onValidationSuccess",[key, obj]) && this._clear_invalid)
				this._clear_invalid(key);
			return true;
		}
		else {
			if(this.callEvent("onValidationError",[key, obj]) && this._mark_invalid)
				this._mark_invalid(key);
		}
		return false;
	}
};

export default ValidateData;