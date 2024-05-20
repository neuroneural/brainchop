import {assert} from "./debug";
import {event} from "./htmlevents";
import env from "./env.js";
import {isArray, delay} from "./helpers.js";

import {callEvent, attachEvent} from "./customevents.js";

function ready(code){
	if (_ready) code.call();
	else _ready_code.push(code);
}
let _ready = false;
let _ready_code = [];

//autodetect codebase folder
var temp = document.getElementsByTagName("SCRIPT");	//current script, most probably
assert(temp.length,"Can't locate codebase");
if (temp.length){
	//full path to script
	temp = (temp[temp.length-1].getAttribute("src")||"").split("/");
	//get folder name
	temp.splice(temp.length-1, 1);
	env.codebase = temp.slice(0, temp.length).join("/")+"/";
}

var handler = function(){
	if(env.isIE)
		document.body.className += " webix_ie";
	callEvent("onReady",[]);
};

var doit = function(){
	_ready = true;

	/* global webix_ready */ 
	if (window.webix_ready && isArray(webix_ready))
		_ready_code = webix_ready.concat(_ready_code);

	for (var i=0; i < _ready_code.length; i++)
		_ready_code[i].call();
	_ready_code=[];
};

attachEvent("onReady", function(force){
	if (force) 
		doit();
	else 
		delay(doit);
});

if (document.readyState == "complete") handler();
else event(window, "load", handler);

ready(function(){
	event(document.body,"click", function(e){
		callEvent("onClick",[e||window.event]);
	});
});


export default ready;