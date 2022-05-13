import {protoUI} from "../ui/core";
import {isUndefined} from "../webix/helpers";

import richselect from "./richselect";


const api = {
	name:"combo",
	getInputNode:function(){
		return this._dataobj.getElementsByTagName("input")[0];
	},
	_revertValue:function(){
		var value = this.getValue();
		this.$setValue(isUndefined(value)?"":value);
	},
	_applyChanges:function(){
		var input = this.getInputNode(),
			value = "",
			suggest =  this.getPopup();

		if (input.value){
			value = this._settings.value;
			if(suggest.getItemText(value) != this.getText())
				value = suggest.getSuggestion()||value;
		}
		if (value != this._settings.value)
			this.setValue(value, "user");
		else
			this.$setValue(value);
	},
	defaults:{
		template:function(config, common){
			return common.$renderInput(config).replace(/(<input)\s*(?=\w)/, "$1"+" role='combobox'");
		},
		icon: "wxi-menu-down"
	},
	on_click:{
		webix_clear_icon:function(){
			if (this.$allowsClear) this.setValue("", "user");
			return false;
		},
		"webix_inp_label": function(e){this._ignoreLabelClick(e);},
		"webix_inp_top_label": function(e){this._ignoreLabelClick(e);}
	}
};

const view = protoUI(api, richselect.view);
export default {api, view};