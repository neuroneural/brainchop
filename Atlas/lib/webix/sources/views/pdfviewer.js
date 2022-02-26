
import {protoUI} from "../ui/core";
import template from "../views/template";

protoUI({ name:"pdfviewer", defaults:{
	template:"GPL version doesn't support pdfviewer <br> You need Webix PRO"
}}, template.view);