import {protoUI} from "../ui/core";
import {uid} from "../webix/helpers";

import text from "./text";


const api = {
	name:"textarea",
	defaults:{
		template:function(obj, common){ 
			var name = obj.name || obj.id;
			var id = "x"+uid();

			var html = common._baseInputHTML("textarea")+"style='width:"+common._get_input_width(obj)+"px;'";
			html +=" id='"+id+"' name='"+name+"' class='webix_inp_textarea'>"+common._pattern(obj.value)+"</textarea>";

			return common.$renderInput(obj, html, id);
		},
		minHeight:60
	},
	$skin:function(){
		text.api.$skin.call(this);

		this.defaults.height = 0;
	},
	_skipSubmit: true,
	_getLabelHeight:function(top){
		return top ? this._labelTopHeight-this._settings.inputPadding : "";
	},
	$renderIcon:function(){
		return "";
	},
	//get input element
	getInputNode: function() {
		return this._dataobj.getElementsByTagName("textarea")[0];
	}
};

const view = protoUI(api, text.view);
export default {api, view};