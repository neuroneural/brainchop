import { toNode } from "../../webix/helpers.js";
import xml from "./xml.js";

const html = {
	/*
		incoming data can be
		 - ID of parent container
		 - HTML text
	*/
	toObject:function(data){
		if (typeof data == "string"){
			var t=null;
			if (data.indexOf("<")==-1)	//if no tags inside - probably its an ID
				t = toNode(data);
			if (!t){
				t=document.createElement("DIV");
				t.innerHTML = data;
			}
		
			return t.firstChild;
		}
		return data;
	},
	//get array of records
	getRecords:function(node){
		return node.getElementsByTagName(this.tag);
	},
	//get hash of properties for single record
	getDetails:function(data){
		return xml.tagToObject(data);
	},
	getOptions:function(){ 
		return false;
	},
	//dyn loading is not supported by HTML data source
	getInfo:function(){
		return {
			size:0
		};
	},
	tag: "LI"
};

export default html;