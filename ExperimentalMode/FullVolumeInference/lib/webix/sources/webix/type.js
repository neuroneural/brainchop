import template from "./template";
import {clone} from "./helpers";

/*
	adds new template-type
	obj - object to which template will be added
	data - properties of template
*/
export default function type(obj, data){ 
	if (obj.$protoWait){
		if (!obj._webix_type_wait)
			obj._webix_type_wait = [];
		obj._webix_type_wait.push(data);
		return;
	}
		
	//auto switch to prototype, if name of class was provided
	if (typeof obj == "function")
		obj = obj.prototype;
	if (!obj.types){
		obj.types = { "default" : obj.type };
		obj.type.name = "default";
	}
	
	var name = data.name;
	var type = obj.type;
	if (name)
		type = obj.types[name] = clone(data.baseType?obj.types[data.baseType]:obj.type);
	
	for(var key in data){
		if (key.indexOf("template")===0)
			type[key] = template(data[key]);
		else
			type[key]=data[key];
	}

	return name;
}