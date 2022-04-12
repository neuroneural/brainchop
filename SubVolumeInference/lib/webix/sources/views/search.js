import {protoUI} from "../ui/core";

import text from "./text";


const api = {
	name:"search",
	on_click:{
		webix_clear_icon:function(){
			if (this.$allowsClear) this.setValue("", "user");
			return false;
		},
		"webix_input_icon":function(e){
			this.getInputNode().focus();
			if(this.config.clear !== "hover" && e.target && (e.target.className.indexOf(this.config.icon) !== -1))
				this.callEvent("onSearchIconClick", [e]);
		}
	},
	defaults:{
		type:"text",
		icon:"wxi-search"
	}
};

const view = protoUI(api, text.view);
export default {api, view};