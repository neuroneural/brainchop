import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";

import button from "./button";


const api = {
	name:"icon",
	$skin:function(){
		button.api.$skin.call(this);

		this.defaults.height = $active.inputHeight;
		this.defaults.width = $active.inputHeight;
	},
	defaults:{
		template:function(obj, view){
			const min = Math.min(obj.awidth, obj.aheight);
			const top = Math.round((view._content_height-obj.aheight)/2);
			const inner = "<button type='button' style='height:"+min+"px;width:"+min+"px;' class='webix_icon_button'>"+
				"<span class='webix_icon "+obj.icon+"'></span></button>";

			const lineHeight = obj.aheight != min ? obj.aheight : 0;
			return "<div class='webix_el_box' style='width:"+obj.awidth+"px;height:"+obj.aheight+"px;line-height:"+lineHeight+
				"px;margin-top:"+top+"px'>"+inner+(obj.badge||obj.badge===0 ? "<span class='webix_badge'>"+obj.badge+"</span>":"")+
				"</div>";
		}
	},
	_set_inner_size:false,
	_set_default_css:function(){},
	$setValue:function(){}
};

const view = protoUI(api, button.view);
export default {api, view};