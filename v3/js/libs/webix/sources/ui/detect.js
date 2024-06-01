import Touch from "../core/touch";
import env  from "../webix/env";
import ready from "../webix/ready";
import {set as setSkin} from "../webix/skin";
import {create, addStyle} from "../webix/html";
import {define} from "../services";


env.scrollSize = ((env.touch||env.$customScroll)?0:17);
ready(function(){
	var size = _detectScrollSize();
	env.scrollSize = env.touch ? 0 : size;
});


function _detectScrollSize(){
	var div = create("div");
	div.className = "webix_skin_mark";
	div.style.cssText="position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;min-height:100px;overflow-y:scroll;";

	document.body.appendChild(div);
	var width = div.offsetWidth-div.clientWidth;
	var name = { 200:"flat" , 210:"compact", 230: "contrast", 240:"material", 250:"mini" }[Math.floor(div.offsetHeight/10)*10];
	document.body.removeChild(div);

	if (name)
		setSkin(name);

	if (env.$customScroll) return 0;
	return width;
}


let fixed = false;
function _fixHeight(){
	if (fixed) return;

	addStyle("html, body{ height:100%; }");
	document.body.className+=" webix_full_screen";
	Touch.limit(false);
	fixed = true;
}

define("_fixHeight", _fixHeight);