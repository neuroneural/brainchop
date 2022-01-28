import state from "../core/state";
import UIManager from "../core/uimanager";
import {bind, delay} from "../webix/helpers";
import {event} from "../webix/htmlevents";


const clipbuffer = {

	_area: null,
	_blur_id: null,
	_ctrl: 0,

	/*! create textarea or returns existing
	 **/
	init: function() {
		// returns existing textarea
		if (this._area !== null)
			return this._area;

		state.destructors.push({ obj: this });
		// creates new textarea
		this._area = document.createElement("textarea");
		this._area.className = "webix_clipbuffer";
		this._area.setAttribute(/*@attr*/"webixignore", 1);
		this._area.setAttribute("spellcheck", "false");
		this._area.setAttribute("autocapitalize", "off");
		this._area.setAttribute("autocorrect", "off");
		this._area.setAttribute("autocomplete", "off");
		document.body.appendChild(this._area);

		event(document.body, "keydown", bind(function(e){
			var key = e.keyCode;
			var ctrl = !!(e.ctrlKey || e.metaKey);
			if (key === 86 && ctrl){
				this._area.value = "";
				delay(this._paste, this, [e], 100);
			}
		}, this));

		return this._area;
	},
	destructor: function(){
		this._area = null;
	},
	/*! set text into buffer
	 **/
	set: function(text) {
		this.init();
		text = text === "" ? "\n" : text;
		this._area.value = text;
		this.focus();
	},
	/*! select text in textarea
	 **/
	focus: function() {
		// if there is native browser selection, skip focus
		if(!this._isSelectRange()){
			this.init();
			this._area.focus();
			this._area.select();
		}

	},
	/*! checks document selection
	 **/
	_isSelectRange: function() {
		var text = "";
		if (typeof window.getSelection != "undefined") {
			text = window.getSelection().toString();
		} else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
			text = document.selection.createRange().text;
		}
		return !!text;
	},
	/*! process ctrl+V pressing
	 **/
	_paste: function(e) {
		var trg = e.target;
		if (trg === this._area) {
			var text = this._area.value;
			var last_active = UIManager.getFocus();
			if (last_active && (!last_active.getEditor || !last_active.getEditor())){
				last_active.callEvent("onPaste", [text]);
				this._area.select();
			}
		}
	}
};

export default clipbuffer;