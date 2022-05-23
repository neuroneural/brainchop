import {protoUI, $$} from "../ui/core";
import {uid, bind} from "../webix/helpers";

import text from "./text";
import DataCollection from "../core/datacollection";


const api = {
	name:"select",
	defaults:{
		template:function(obj,common){
			const id = "x"+uid();
			let html = common._baseInputHTML("select")+"id='"+id+"' style='width:"+common._get_input_width(obj)+"px;'>";

			const optview = $$(obj.options);
			if (optview && optview.data && optview.data.each){
				optview.data.each(function(option){
					html+="<option"+((option.id == obj.value)?" selected='true'":"")+" value='"+option.id+"'>"+option.value+"</option>";
				});
			} else {
				const options = common._check_options(obj.options);
				for (let i=0; i<options.length; i++)
					html+="<option"+((options[i].id == obj.value)?" selected='true'":"")+" value='"+options[i].id+"'>"+options[i].value+"</option>";
			}
			html += "</select>";
			return common.$renderInput(obj, html, id);
		}
	},
	options_setter:function(value){
		if (value){
			if (typeof value =="string"){
				const collection = new DataCollection({url:value});
				collection.data.attachEvent("onStoreLoad", bind(this.refresh, this));
				return collection;
			} else
				return value;
		}
	},
	$renderIcon:function(){
		return "";
	},
	//get input element
	getInputNode: function() {
		return this._dataobj.getElementsByTagName("select")[0];
	}
};

const view = protoUI(api, text.view);
export default {api, view};