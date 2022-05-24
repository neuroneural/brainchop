
import {protoUI} from "../ui/core";
import template from "../views/template";

protoUI({ name:"dashboard", defaults:{
	template:"GPL version doesn't support dashboard <br> You need Webix PRO"
}}, template.view);