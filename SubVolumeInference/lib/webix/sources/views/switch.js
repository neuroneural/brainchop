import checkbox from "../views/checkbox";
import {addCss, removeCss, getTextSize} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {uid} from "../webix/helpers";


const api = {
	name:"switch",
	defaults:{
		template:function (config, common) {
			common._calck_switch_size();

			var id = config.name || "x"+uid();
			var rightlabel = "";
			if (config.labelRight){
				rightlabel = "<label class='webix_label_right'>"+config.labelRight+"</label>";
				if (config.labelWidth)
					config.label = config.label || "&nbsp;";
			}
			var checked = (config.checkValue == config.value);
			var aria = "aria-label=\""+(config.label||config.labelRight||"")+"\" role=\"checkbox\" tabindex=\"0\" aria-checked=\""+(checked?"true":"false")+"\" "+(config.readonly?"aria-readonly='true'":"")+"\"";
			var html = 
				"<div class=\"webix_switch_box "+(checked?" webix_switch_on":"")+"\" style=\"width:"+common._switchWidth+"px\">"+
					"<span class=\"webix_switch_text\">"+((checked?config.onLabel:config.offLabel)||"")+"</span>"+
					"<button class=\"webix_switch_handle\" "+aria+" style=\"left:"+(checked?common._switchWidth-common._switchHeight:0)+"px;\">"+
					"<input  id=\""+id+"\" class=\"webix_switch_toggle\" type=\"checkbox\" "+(checked?"checked":"")+"></button>"+
				"</div>"+rightlabel;

			return common.$renderInput(config, html, id);
		}
	},
	$skin:function(){
		checkbox.api.$skin.call(this);

		this._switchHeight = $active.switchHeight;
		this._switchWidth = $active.switchWidth;
	},
	$setValue:function(value){
		var config = this._settings;
		var checked = (value == config.checkValue);
		var box = this.$view.querySelector(".webix_switch_box");

		if(box){
			var handle = box.childNodes[1];
			var text = (checked?config.onLabel:config.offLabel)||"";
			if(checked)
				addCss(box, "webix_switch_on");
			else
				removeCss(box, "webix_switch_on");

			handle.style.left = (checked?this._switchWidth-this._switchHeight:0)+"px";
			handle.firstChild.checked = checked;
			handle.setAttribute("aria-checked", checked?"true":"false");

			if(text){
				box.childNodes[0].innerHTML = text;
			}
		}
	},
	_calck_switch_size:function(){
		var config = this._settings;
		if(config.onLabel || config.offLabel){
			var onWidth = config.onLabel ? getTextSize(config.onLabel, "webix_switch_text").width : 0;
			var offWidth = config.onLabel ? getTextSize(config.offLabel, "webix_switch_text").width : 0;
			this._switchWidth = Math.max(onWidth, offWidth)+this._switchHeight;
		}
	},
	on_click:{
		"webix_switch_box":function(){
			if(!this._settings.readonly)
				this.toggle("user");
		},
		"webix_label_right":function(){
			if(!this._settings.readonly)
				this.toggle("user");
		}
	}
};


const view = protoUI(api,  checkbox.view);
export default {api, view};