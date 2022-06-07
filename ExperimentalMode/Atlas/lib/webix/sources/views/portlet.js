
import {protoUI} from "../ui/core";
import template from "../views/template";

protoUI({ name:"portlet", defaults:{
	template:"GPL version doesn't support portlet <br> You need Webix PRO"
}}, template.view);