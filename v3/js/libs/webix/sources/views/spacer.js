import {protoUI} from "../ui/core";

import base from "./view";

const api = {
	name:"spacer",
	defaults:{
		borderless:true
	},
	$init:function(){
		this._viewobj.className += " webix_spacer";
	}
};

const view = protoUI(api, base.view);
export default { api, view };