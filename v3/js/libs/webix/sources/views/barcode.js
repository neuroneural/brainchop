
import {protoUI} from "../ui/core";
import template from "../views/template";

protoUI({ name:"barcode", defaults:{
	template:"GPL version doesn't support barcode <br> You need Webix PRO"
}}, template.view);