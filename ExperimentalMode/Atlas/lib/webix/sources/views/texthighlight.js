import {protoUI} from "../ui/core";
import {uid, delay} from "../webix/helpers";
import {_event, event, eventRemove} from "../webix/htmlevents";
import env from "../webix/env";
import {$active} from "../webix/skin";
import template from "../webix/template";

import text from "./text";

const api = {
	name:"texthighlight",
	defaults:{
		template:function(obj, common){
			const name = obj.name || obj.id;
			const id = "x"+uid();
			const width = common._get_input_width(obj);

			let html = `<div class="webix_text_highlight" style="width:${width}px;"><div class="webix_text_highlight_value"`;

			// iOS adds 3px of (unremovable) padding to the left and right of a textarea
			if(obj.type == "textarea" && env.mobile && env.isSafari)
				html += ` style="margin-left:${$active.dataPadding + 3}px; margin-right:${$active.dataPadding + 3}px;"`;

			html += "></div></div>";

			if(obj.type == "textarea"){
				html += `${common._baseInputHTML("textarea")} style="width:${width}px;" id="${id}" name="${name}" class="webix_inp_textarea">${common._pattern(obj.value)}</textarea>`;
				return common.$renderInput(obj, html, id);
			}
			else
				return html+common.$renderInput(obj);
		},
		highlight: text => template.escape(text),
		type:"text"
	},
	$init:function(config){
		const type = config.type || this.defaults.type;
		this._viewobj.className += " webix_el_" + type;

		if(type == "textarea"){
			delete config.clear;
			config.height = config.height || 0;
			config.minHeight = config.minHeight || 60;
			this._skipSubmit = true;
		}
		else {
			//input hasn't scroll event
			this.scrollEv = event(document, "selectionchange", ()=> {
				if(this.$view.contains(document.getSelection().focusNode))
					this._syncText();
			});
			this.attachEvent("onDestruct", ()=> {
				eventRemove(this.scrollEv);
			});
		}

		//setValue
		this.attachEvent("onChange", ()=> this._syncText());

		this.attachEvent("onAfterRender", ()=> {
			this._updatePos();

			const evs = ["scroll", "focus", "blur", "paste", "cut", "keyup", "input"];
			evs.forEach((ev) => _event(this.getInputNode(), ev, ()=> this._syncText()));

			this._handleInput(true);
		});
	},
	$setSize:function(){
		text.api.$setSize.apply(this, arguments);
		this._updatePos();
	},
	$renderIcon:function(c){
		if (c.type == "text")
			return text.api.$renderIcon.apply(this, arguments);
		return "";
	},
	_getLabelHeight:function(top){
		if(this._settings.type == "textarea")
			return top ? this._labelTopHeight-this._settings.inputPadding : "";

		return text.api._getLabelHeight.apply(this, arguments);
	},
	getInputNode: function() {
		return this._dataobj.querySelector(this._settings.type == "text" ? "input" : "textarea");
	},
	_getHighlightNode: function(){
		return this._dataobj.querySelector(".webix_text_highlight");
	},
	_handleInput: function(init){
		const highlight = this._getHighlightNode().firstElementChild;
		let text = this.getValue();

		if(init || text != (this._lastText||"")){
			this._lastText = text;

			//add &nbsp; at the end because div ignores last empty line + it gives better positioning
			highlight.innerHTML = this._settings.highlight.apply(this, [text]) + "&nbsp;";
		}
	},
	_handleScroll: function(){
		let highlight = this._getHighlightNode();
		if(this._settings.type == "text")
			highlight = highlight.firstElementChild;

		const text = this.getInputNode();

		highlight.scrollTop = text.scrollTop;
		highlight.scrollLeft = text.scrollLeft;
	},
	_updatePos: function(){
		if(this._rendered_input && this.isVisible()){
			const input = this.getInputNode();
			const highlightStyles = this._getHighlightNode().style;

			highlightStyles.left = input.offsetLeft+"px";
			highlightStyles.top = input.offsetTop+"px";
			highlightStyles.height = input.getBoundingClientRect().height+"px";
		}
	},
	_syncText: function(){
		delay(function(){
			if (this.$destructed) return;

			this._handleInput();
			this._handleScroll();
		}, this);
	}
};

const view = protoUI(api, text.view);
export default {api, view};