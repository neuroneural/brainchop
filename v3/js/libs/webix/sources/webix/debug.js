// debugger helpers
// assert and log calls are removed in min versions

import { use } from "../services";

//check some rule, show message as error if rule is not correct
export function assert(test, msg){
	if (!test){
		log("error",msg);
		let message = use("message");
		if (message && typeof msg == "string")
			message({ type:"debug", text:msg, expire:-1 });
			debugger; // eslint-disable-line
	}
}

//show log message
export function log(type,message,details){
	if (arguments.length == 1){
		message = type;
		type = "log";
	}
	if (window.console && window.console.log){
		type=type.toLowerCase();
		if (window.console[type])
			window.console[type](message||"unknown error");
		else
			window.console.log(type +": "+message);

		if (details) 
			window.console.log(details);
	}
}

export var debug_mode = {};

export function debug(mode){
	if (!mode)
		debug_mode = {};
	else if (typeof mode !== "object")
		debug_mode = { events: true };
	else 
		for (var key in mode) debug_mode[key] = mode[key];
}

let debug_size_indent = 0;
function debug_size_step(){
	var str = "";
	for (let i=0; i<debug_size_indent; i++)
		str+="|  ";
	return str;
}
export function debug_size_box_start(comp, get){
	if (!debug_mode.size) return;
	if (!debug_size_indent)
		log(get?"--- get sizes ---":"--- set sizes ---");
	log(debug_size_step()+comp.name+"@"+comp.config.id);
	debug_size_indent++;
}
export function debug_size_box_end(comp, sizes){
	if (!debug_mode.size) return;
	debug_size_indent--;
	log(debug_size_step()+sizes.join(","));
}

export function debug_size_box(comp, sizes, get){
	if (!debug_mode.size) return;
	if (!debug_size_indent)
		log(get?"--- get sizes ---":"--- set sizes ---");
	log(debug_size_step()+comp.name+"@"+comp.config.id+" "+sizes.join(","));
}