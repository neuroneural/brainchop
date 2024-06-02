import env  from "../webix/env";
import state from "../core/state";

import {event} from "../webix/htmlevents";
import {isUndefined} from "../webix/helpers";
import {callEvent} from "../webix/customevents";

import {use} from "../services";

export function _uid(name){
	return "$"+name+(_namecount[name] = (_namecount[name]||0)+1);
}
const _namecount = {};

var _freeze_resize = false;
export function freeze(handler, trigger){
	_freeze_resize = true;
	var res = handler();
	if (res && res.then){
		res = res.then(function(any){
			_freeze_resize = false;
			if (trigger !== false)
				resize();
			return any;
		});
	} else {
		_freeze_resize = false;
		if (trigger !== false)
			resize();
	}
	return res;
}

export function resize(){
	use("UIManager").applyChanges();
	callEvent("onClick",[]);
	state._force_resize = true;
	if (!_freeze_resize)
		for (var i=state.top_views.length - 1; i>=0; i--){
			if (state.top_views[i].obj)
				state.top_views[i].obj.resize();
		}
	state._force_resize = false;
}

export function _each(parent, logic, master, include){
	if (parent){
		var children = include ? [parent] : parent.getChildViews();
		for (var i = 0; i < children.length; i++){
			if (logic.call((master), children[i]) !== false)
				_each(children[i], logic, master);
		}
	}
}

export function zIndex(index){
	if (!isUndefined(index)){
		env.zIndexBase = Math.max(env.zIndexBase, index+1);
		return index;
	}
	return env.zIndexBase++;
}

event(window, "resize", function() {
	// check for virtual keyboard
	if(env.touch && ( state._edit_open_time && (new Date())-state._edit_open_time < 1000 || state._focus_time && (new Date())-state._focus_time < 1000)){
		return;
	} else {
		resize();
	}
});