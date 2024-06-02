import base from "../views/view";
import EventSystem from "../core/eventsystem";
import {protoUI} from "../ui/core";


const api = {
	name:"iframe",
	$init:function(){
		this._dataobj = this._contentobj;
		this._contentobj.innerHTML = "<iframe style='width:100%; height:100%' frameborder='0' onload='var t = $$(this.parentNode.getAttribute(\"view_id\")); if (t) t.callEvent(\"onAfterLoad\",[]);' src='about:blank'></iframe>";
	},
	load:function(value){
		this.src_setter(value);
	},
	src_setter:function(value){
		if(!this.callEvent("onBeforeLoad",[])) 
			return "";
		this.getIframe().src = value;
		return value;
	},
	getIframe:function(){
		return this._contentobj.getElementsByTagName("iframe")[0];
	},
	getWindow:function(){
		return this.getIframe().contentWindow;
	}
};


const view = protoUI(api,  base.view, EventSystem);
export default {api, view};