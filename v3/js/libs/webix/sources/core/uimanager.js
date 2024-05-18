import ready from "../webix/ready";

import {assert} from "../webix/debug";
import {event} from "../webix/htmlevents";
import {delay,uid,_power_array,isUndefined,isArray} from "../webix/helpers";
import {callEvent} from "../webix/customevents";
import {locate,preventEvent} from "../webix/html";
import {modalbox} from "../webix/message";
import fullscreen from "../webix/fullscreen";

import {$$} from "../ui/core";
import state from "../core/state";

import {define} from "../services";


const UIManager = {
	_view: null,
	_hotkeys: {},
	_focus_time:0,
	_tab_time:0,
	_mouse_time:0,
	_controls: {
		"esc": "escape",
		"up": "arrowup",
		"down": "arrowdown",
		"left": "arrowleft",
		"right": "arrowright",
		"pgdown": "pagedown",
		"pgup": "pageup",
		"space": " ",
		"multiply": "*",
		"add": "+",
		"subtract": "-",
		"decimal": ".",
		"divide": "/",
		"pausebreak":"pause",
		"5numlocked":"clear"
	},
	_inputs:{
		"input": 1,
		"button":1,
		"textarea":1,
		"select":1
	},
	_enable: function() {
		// attaching events here
		event(document, "keydown", this._keypress, { bind:this });
		event(document.body, "click", this._focus_click, { capture:true, bind:this });
		event(document.body, "mousedown", function(){
			this._mouse_time = new Date();
		}, { bind:this });
		event(document.body, "focus", this._focus_tab, { capture:true, bind:this });

		state.destructors.push({obj:this});
	},
	destructor:function(){
		UIManager._view = null;
	},
	getFocus: function() {
		return this._view;
	},
	_focus_action:function(view){
		this._focus_was_there = this._focus_was_there || view._settings.id;
	},
	setFocus: function(view, only_api, tab){
		//view can be empty
		view = $$(view);
		//unfocus if view is hidden
		if (view && !view.$view) view = null;

		//store last click time, it is necessary to prevent refocusing
		//for example when user moves focus from onclick handler somewher
		//and we want to prevent autofocusing, when event will reach document.body
		this._focus_time = state._focus_time = new Date();

		if (this._view === view) return true;
		if (this._view && this._view.callEvent)
			this._view.callEvent("onBlur", [this._view]);

		if (view && view.callEvent){
			view.callEvent("onFocus", [view, this._view]);
			if(tab) view.callEvent("onTabFocus", [view, this._view]);
		}
		callEvent("onFocusChange", [view, this._view]);

		if (this._view && this._view.blur && !only_api) this._view.blur();
		this._view = view;
		if (view && view.focus && !only_api) view.focus();
		return true;
	},
	applyChanges: function(element){
		var view = this.getFocus();
		if (view && view != element && view._applyChanges)
			view._applyChanges(element);
	},
	hasFocus: function(view) {
		return (view === this._view) ? true : false;
	},
	_focus: function(e){
		for(let i = 0; i < modalbox.order.length; i++){
			if(modalbox.pull[ modalbox.order[i] ]._box.contains(e.target))
				return;
		}

		var view = locate(e, /*@attr*/"view_id") || this._focus_was_there;

		//if html was repainted we can miss the view, so checking last processed one
		view = $$(view);
		this._focus_was_there = null;

		//set timer, to fix issue with Android input focusin
		state._focus_time = new Date();

		if (view == this._view) return true;

		if (view){
			if (this.canFocus(view)){
				// keep form focus
				if (this._view && this._view.getFormView() == view && this._view.focus)
					this._view.focus();
				else
					this.setFocus(view);
			}
			//remove focus from an unreachable view
			else if (view.$view.contains(e.target))
				e.target.blur();
		}
		else this.setFocus(null);

		return true;
	},
	_focus_click:function(e){
		// if it was onfocus/onclick less then 100ms behore then we ignore it
		if ((new Date())-this._focus_time < 100) {
			this._focus_was_there = null;
			return false;
		}
		return this._focus(e);
	},
	_focus_tab: function(e){
		if(!this._inputs[e.target.nodeName.toLowerCase()])
			return false;
		return this._focus(e);
	},
	_top_modal: function(view){
		const modality = state._modality;
		if (!modality.length) return true;

		const top = view.queryView(a => !a.getParentView(), "parent") || view;
		return (top.$view.style.zIndex||0) >= Math.max(...modality);
	},
	canFocus:function(view){
		if(document.body.modality || view.$view.modality || view.queryView(view => view.$view.modality, "parent")) //modalbox
			return false;
		return view.isVisible() && view.isEnabled() && !view.config.disabled && this._top_modal(view) && !view.queryView({disabled:true}, "parent");
	},

	_moveChildFocus: function(check_view){
		var focus = this.getFocus();
		//we have not focus inside of closing item
		if (check_view && !this._is_child_of(check_view, focus))
			return false;

		if (!this._focus_logic("getPrev", check_view))
			this._view = null;
	},
	_is_child_of: function(parent, child) {
		if (!parent) return false;
		if (!child) return false;
		while (child) {
			if (child === parent) return true;
			child = child.getParentView();
		}
		return false;
	},
	_keypress_timed:function(){
		if (this && this.callEvent)
			this.callEvent("onTimedKeyPress",[]);
	},
	_keypress: function(e) {
		let code = e.which || e.keyCode;
		// numpad keys
		if(code>95 && code< 106)
			code -= 48;

		const view = this.getFocus();
		if (view && view.callEvent) {
			if (view.callEvent("onKeyPress", [code, e]) === false)
				preventEvent(e);
			if (view.hasEvent("onTimedKeyPress")){
				clearTimeout(view._key_press_timeout);
				view._key_press_timeout = delay(this._keypress_timed, view, [], (view._settings.keyPressTimeout||250));
			}
		}

		if (this._check_keycode(e) === false) {
			preventEvent(e);
			return false;
		}
	},

	// dir - getNext or getPrev
	_focus_logic: function(dir, focus) {
		var next = focus||this.getFocus();
		if(next){
			dir = dir || "getNext";
			var start = next;
			var marker = uid();

			while (true) { // eslint-disable-line
				next = this[dir](next);
				// view with focus ability
				if (next && this.canFocus(next))
					return this.setFocus(next);

				// elements with focus ability not found
				if (next === start || next.$fmarker == marker){
					if(focus)
						document.activeElement.blur();
					return null;
				}

				//prevents infinity loop
				next.$fmarker = marker;
			}
		}
	},
	_tab_logic:function(view, e){
		var mode = !e.shiftKey;
		UIManager._tab_time = new Date();
		if (view && view._custom_tab_handler && !view._custom_tab_handler(mode, e))
			return false;

		if (view && view._in_edit_mode){
			if (view.editNext)
				return view.editNext(mode);
			else if (view.editStop){
				view.editStop();
				return true;
			}
		} else
			delay(function(){
				view = $$(document.activeElement);
				if(view && !UIManager.canFocus(view))
					return UIManager._focus_logic(mode ? "getNext" : "getPrev", view);
				UIManager.setFocus(view, true, true);
			});
	},
	getTop: function(id) {
		var next, view = $$(id);

		while (view && (next = view.getParentView()))
			view = next;
		return view;
	},

	getNext: function(view, _inner_call) {
		var cells = view.getChildViews();
		//tab to first children
		if (cells.length && !_inner_call)
			for (var i = 0; i < cells.length; i++)
				if(this.canFocus(cells[i]))
					return cells[i];

		//unique case - single view without child and parent
		var parent = view.getParentView();
		if (!parent)
			return view;

		var p_cells = parent.getChildViews();
		if (p_cells.length){
			var index = _power_array.find.call(p_cells, view)+1;
			while (index < p_cells.length) {
				//next visible child
				if (this.canFocus(p_cells[index])) 
					return p_cells[index];

				index++;
			}
		} 

		//sibling of parent
		return this.getNext(parent, true);
	},

	getPrev: function(view, _inner_call) {
		var cells = view.getChildViews();
		//last child of last child
		if (cells.length && _inner_call)
			for (var i = cells.length - 1; i >= 0; i--)
				if(this.canFocus(cells[i]))
					return this.getPrev(cells[i], true);

		if (_inner_call && this.canFocus(view)) return view;

		//fallback from top to bottom
		var parent = view.getParentView();
		if (!parent)
			return this.canFocus(view) ? this.getPrev(view, true) : view;

		var p_cells = parent.getChildViews();
		if (p_cells) {
			var index = _power_array.find.call(p_cells, view)-1;
			while (index >= 0) {
				if (this.canFocus(p_cells[index]))
					return this.getPrev(p_cells[index], true);
				index--;
			}
		}

		return this.getPrev(parent, true);
	},
	addHotKey: function(keys, handler, view) {
		assert(handler, "Hot key handler is not defined");
		const code = this._parse_keys(keys);

		if (!view) view = null;
		if (!this._hotkeys[code]) this._hotkeys[code] = [];
		this._hotkeys[code].push({ handler, view });

		return keys;
	},
	removeHotKey: function(keys, func, view){
		const code = this._parse_keys(keys);
		if (!func && !view)
			delete this._hotkeys[code];
		else {
			var t = this._hotkeys[code];
			if (t){
				for (var i = t.length - 1; i >= 0; i--) {
					if (view && t[i].view !== view) continue;
					if (func && t[i].handler !== func) continue;
					t.splice(i,1);
				}
				if (!t.length)
					delete this._hotkeys[code];
			}

		}
	},
	_keycode: function(key, ctrl, shift, alt, meta) {
		//key can be undefined (browser autofill)
		return (key||"").toLowerCase()+"_"+["", (ctrl ? "1" : "0"), (shift ? "1" : "0"), (alt ? "1" : "0"), (meta ? "1" : "0")].join("");
	},
	_check_keycode: function(e){
		const keyCode = e.which || e.keyCode;
		const is_any = !e.ctrlKey && !e.altKey && !e.metaKey && (keyCode!=9)&&(keyCode!=27)&&(keyCode!=13);
		const code = this._keycode(e.key, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);

		var focus = this.getFocus();
		if (this._hotkeys[code])
			return  this._process_calls(this._hotkeys[code], focus, e);
		else if (is_any && this._hotkeys["any_0000"])
			return  this._process_calls(this._hotkeys["any_0000"], focus, e);

		return true;
	},
	_process_calls:function(calls, focus, e){
		for (var i = 0; i < calls.length; i++) {
			var key = calls[i];
			if ((key.view !== null) &&		//common hot-key
				(focus !== key.view) &&		//hot-key for current view
				//hotkey for current type of view
				(typeof(key.view) !== "string" || !focus || focus.name !== key.view)) continue;

			var temp_result = key.handler(focus, e);
			if (!!temp_result === temp_result) return temp_result;
		}
		return true;
	},
	_parse_keys: function(keys) {
		var controls = this._controls;
		var parts = keys.toLowerCase().split(/[ +\-_]/);
		var ctrl, shift, alt, meta;
		ctrl = shift = alt = meta = 0;
		var letter = "";
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] === "ctrl") ctrl = 1;
			else if (parts[i] === "shift") shift = 1;
			else if (parts[i] === "alt") alt = 1;
			else if (parts[i] === "command") meta = 1;
			else {
				letter = controls[parts[i]] || parts[i];
			}
		}

		return this._keycode(letter, ctrl, shift, alt, meta);
	},
	getState:function(node, children) {
		children = (children||false);
		node = $$(node);
		var state = {
			id: node.config.id,
			width: node.config.width,
			height: node.config.height,
			gravity: node.config.gravity
		};
		if (!isUndefined(node.config.collapsed)) state.collapsed = node.config.collapsed;
		if (node.name === "tabs" || node.name === "tabbar") state.activeCell = node.getValue();
		
		if (children) {
			state = [state];
			if (node._cells) {
				for (var i = 0; i < node._cells.length; i++)
					state = state.concat(this.getState(node._cells[i], children));
			}
		}
		return state;
	},
	setState:function(states) {
		if (!isArray(states)) states = [states];
	
		for (var i = 0; i < states.length; i++) {
			var state = states[i];
			var node = $$(state.id);
			if (!node) continue;
	
			if (!isUndefined(state.collapsed)) node.define("collapsed", state.collapsed);
			if (!isUndefined(state.activeCell)) node.setValue(state.activeCell, "auto");
	
			node.define("width", state.width);
			node.define("height", state.height);
			node.define("gravity", state.gravity);
		}
		var top = $$(states[0].id);
		if (top) top.resize();
	}
};

ready(function() {
	UIManager._enable();

	UIManager.addHotKey("enter", function(view, ev){
		if (view && view.callEvent)
			view.callEvent("onEnter", [ev]);
		if (view && view.editStop && view._in_edit_mode){
			view.editStop();
			return true;
		} else if (view && view.touchable){
			var form = view.getFormView();
			if (form && !view._skipSubmit)
				form.callEvent("onSubmit",[view,ev]);
		}
	});
	UIManager.addHotKey("esc", function(view){
		if (view){
			if (view.editCancel && view._in_edit_mode){
				view.editCancel();
				return true;
			}
			var top = view.getTopParentView();
			if (top && top.setPosition){
				if(fullscreen._fullscreen == top)
					fullscreen.exit();
				top._hide();
			}
		}
	});
	UIManager.addHotKey("shift+tab", UIManager._tab_logic);
	UIManager.addHotKey("tab", UIManager._tab_logic);
});

define("UIManager", UIManager);

export default UIManager;