import layout from "../views/layout";
import {protoUI} from "../ui/core";
import {extend} from "../webix/helpers";
import FlexLayout from "../core/flexlayout";


const api = {
	$init:function(){
		extend(this, FlexLayout, true);
	},
	name:"flexlayout"
};


const view = protoUI(api,  layout.view);
export default {api, view};