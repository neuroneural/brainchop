import {bind} from "../webix/helpers";
import ValidateData from "./validatedata";
import rules from "../webix/rules";

const ValidateCollection = {
	_validate_init_once:function(){
		this.data.attachEvent("onStoreUpdated",bind(function(id, data, mode){
			if (id && (mode == "add" || mode == "update" || mode =="save"))
				this.validate(id);
		}, this));
		this.data.attachEvent("onClearAll",bind(this.clearValidation, this));

		this._validate_init_once = function(){};
	},
	rules_setter:function(value){
		if (value){
			this._validate_init_once();
		}
		return value;
	},
	clearValidation:function(){
		this.data.clearMark("webix_invalid", true);
	},
	validate:function(id){
		var result = true;
		if (!id)
			for (var key in this.data.pull)
				result = this.validate(key) && result;
		else {
			this._validate_details = {};
			var obj = this.getItem(id);
			result = ValidateData.validate.call(this, null, obj);
			if (result){
				if (this.callEvent("onValidationSuccess",[id, obj]))
					this._clear_invalid(id);
			} else {
				if (this.callEvent("onValidationError",[id, obj, this._validate_details]))
					this._mark_invalid(id, this._validate_details);
			}
		}
		return result;
	},
	_validate:function(rule, data, obj, key){
		if (typeof rule == "string")
			rule = rules[rule];

		var res = rule.call(this, data, obj, key);
		if (!res){
			this._validate_details[key] = true;
		}
		return res;
	},
	_clear_invalid:function(id){
		this.data.removeMark(id, "webix_invalid", true);
	},
	_mark_invalid:function(id){
		this.data.addMark(id, "webix_invalid", true);
	}
};

export default ValidateCollection;