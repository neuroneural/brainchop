import {addMeta, addStyle} from "../webix/html";
import env from "../webix/env";
import state from "../core/state";

import {isUndefined, delay} from "../webix/helpers";
import {resize} from "../ui/helpers";
import {event} from "../webix/htmlevents";
import {callEvent, attachEvent} from "../webix/customevents";

function orientation(){
	var new_orientation = !!(window.orientation%180);
	if (state.orientation === new_orientation) return;
	state.orientation = new_orientation;	
	callEvent("onRotate", [new_orientation]);
}

if(env.touch){
	state.orientation = !!((isUndefined(window.orientation)?90:window.orientation)%180);
	event(window, ("onorientationchange" in window ?"orientationchange":"resize"), orientation);
}

export default function fullScreen(){
	if (!env.touch) return;

	addMeta("apple-mobile-web-app-capable","yes");
	addMeta("viewport","initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no");
	if (!env.isMac)
		addStyle("body.webix_full_screen{ overflow-y: auto; }");

	var fix = function(){
		var x = window.innerWidth;
		var y = window.innerHeight;

		if (y){
			document.body.style.height = y+"px";
			document.body.style.width = x+"px";
		}

		state._freeze_resize = false;
		resize();
	};

	var onrotate = function(){ 
		state._freeze_resize = true;
		delay(fix,null, [], 500);
	};


	attachEvent("onRotate", onrotate);
	orientation();
	delay(onrotate);

}