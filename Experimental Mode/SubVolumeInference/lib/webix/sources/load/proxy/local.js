import {extend} from "../../webix/helpers";
import offline from "./offline";

const proxy = {
	init:function(){
		extend(this, offline);
	},
	cache:true,
	local:true,
	data:[]
};

export default proxy;