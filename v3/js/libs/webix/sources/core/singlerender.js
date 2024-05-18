import AtomRender from "../core/atomrender";
import {proto} from "../ui/core";
import {clone} from "../webix/helpers";
import template from "../webix/template";

import type from "../webix/type";
/*
	REnders single item. 
	Can be used for elements without datastore, or with complex custom rendering logic
	
	@export
		render
*/

const SingleRender = proto({
	$init:function(){
		this.type = clone(this.type);
	},
	customize:function(obj){
		type(this,obj);
	},
	template_setter:function(value){
		this.type.template = template(value);
	},
	//convert item to the HTML text
	_toHTML:function(obj){
		var type = this.type;
		return (type.templateStart?type.templateStart(obj,type):"") + type.template(obj,type) + (type.templateEnd?type.templateEnd(obj,type):"");
	}
}, AtomRender);


export default SingleRender;