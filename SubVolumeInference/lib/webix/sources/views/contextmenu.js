import submenu from "../views/submenu";
import ContextHelper from "../core/contexthelper";
import {protoUI} from "../ui/core";
import {extend} from "../webix/helpers";


const api = {
	name:"contextmenu",
	_hide_on_item_click:true,
	$init: function(config){
		if(config.submenuConfig)
			extend(config,config.submenuConfig);
	}
};


const view = protoUI(api,  ContextHelper, submenu.view);
export default {api, view};