import {addCss, removeCss} from "../webix/html";
import {protoUI} from "../ui/core";

import button from "./button";


const api = {
	name:"toggle",
	$allowsClear:true,
	$init:function(){
		this.attachEvent("onItemClick", function(){
			this.toggle("user");
		});
	},
	$renderInput:function(obj){
		return "<button type='button' "+(obj.popup?"aria-haspopup='true'":"")+" class='webix_button'>"+obj.label+"</button>";
	},
	$setValue:function(value){
		const input = this.getInputNode();
		const obj = this._settings;
		const isPressed = (value && value != "0");
		const text = (isPressed ? obj.onLabel : obj.offLabel) || obj.label;

		const children = input.children;

		//icon or image button
		if(this._types[obj.type]){
			const icon = children[0];

			if(icon.nodeName == "SPAN" && obj.onIcon && obj.offIcon && obj.onIcon != obj.offIcon)
				icon.className = icon.className.replace((isPressed?obj.offIcon:obj.onIcon), (isPressed?obj.onIcon:obj.offIcon));

			if(obj.type == "imageTop" || obj.type == "iconTop")
				children[1].innerHTML = text;
			else{
				input.innerHTML = text;
				input.insertBefore(icon, input.firstChild);
			}
		}
		else
			input.innerHTML = text;

		input.setAttribute("aria-pressed", isPressed?"true":"false");

		const changeCss = isPressed ? addCss : removeCss;
		changeCss(input.parentNode, "webix_pressed");
	},
	toggle:function(config){
		this.setValue(!this.getValue(), config);
	},
	getValue:function(){
		var value = this._settings.value;
		return  (!value||value=="0")?0:1;
	},
	defaults:{
		template:function(obj, common){
			var isPressed = (obj.value && obj.value != "0");
			var css = isPressed ? " webix_pressed" : "";

			obj.label = (isPressed ? obj.onLabel : obj.offLabel) || obj.label;
			obj.icon = (isPressed ? obj.onIcon : obj.offIcon) || obj.icon;

			var html =  "<div class='webix_el_box"+css+"' style='width:"+obj.awidth+"px; height:"+obj.aheight+"px'>"+common.$renderInput(obj, common)+"</div>";
			html = html.replace(/(button)\s*(?=\w)/, "$1"+(" aria-pressed='"+(isPressed?"true":"false")+"' "));
			if (obj.badge||obj.badge===0)
				html = html.replace(/<\/div>$/, "<span class='webix_badge'>"+obj.badge+"</span></div>");

			return html;
		}
	},
	_set_inner_size:false
};


const view = protoUI(api, button.view);
export default {api, view};