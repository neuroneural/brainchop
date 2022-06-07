import layout from "../views/layout";
import IdSpace from "../core/idspace";
import UIManager from "../core/uimanager";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import i18n from "../webix/i18n";
import {_event} from "../webix/htmlevents";
import {getTextSize} from "../webix/html";

const api = {
	name: "richtext",
	defaults:{
		label:"",
		labelWidth:80,
		labelPosition:"left"
	},
	$init: function() {
		this._viewobj.className += " webix_richtext";
		this.$ready.unshift(this._setLayout);
	},
	$skin:function(){
		layout.api.$skin.call(this);

		this.defaults.paddingX = $active.inputSpacing/2;
		this.defaults.paddingY = $active.inputPadding;
	},
	getInputNode:function(){
		return this.$view.querySelector(".webix_richtext_editor"); 
	},
	_button:function(name){
		return {
			view: "toggle",
			type: "icon",
			icon: "wxi-"+name, name: name, id:name,
			label: i18n.richtext[name],
			autowidth: true, 
			action:name,
			click: this._add_data
		};
	},
	_setLayout: function() {
		const top = this;

		const editField = {
			view: "template",
			css: "webix_richtext_container",
			borderless: true,
			template: "<div class='webix_richtext_editor' contenteditable='true'>"+this.getValue()+"</div>",
			on: {
				onAfterRender: function() {
					top._rendered_input = true;
					top.refresh();
					_event(top.getInputNode(), "blur", function(){
						top._updateValue(this.innerHTML, "user");
					});
					_event(top.getInputNode(), "keyup", function(){
						top._getselection("auto");
					});
				}
			},
			onClick: {
				webix_richtext_editor: function() {
					top._getselection("auto");
				}
			}
		};

		const controls = [
			this._button("underline"),
			this._button("bold"),
			this._button("italic"),
			{ }
		];

		const editorToolbar = {
			view: "toolbar",
			id:"toolbar",
			elements: controls
		};

		const rows = [
			editorToolbar,
			editField
		];

		const config = this.config;

		if (config.labelPosition == "top"){
			editorToolbar.elements = controls.concat([
				{ view:"label", label: config.label, align:"right"},
				{ width:4 }
			]);
			this.rows_setter(rows);
		} 
		else{
			config.labelWidth = config.label ? this._getLabelWidth(config.labelWidth, config.label) : 0;
			if(config.labelWidth){
				config.margin = 0;
				this.cols_setter([{ 
					template: config.label,
					css: "webix_richtext_inp_label"+(config.required?" webix_required":""),
					borderless: true,
					width: config.labelWidth
				}, {
					rows
				}]);
			}
			else
				this.rows_setter(rows);
		}
	},
	_getLabelWidth: function(width, label){
		if(width == "auto")
			width = getTextSize(label, "webix_inp_label").width;
		return width ? Math.max(width, $active.dataPadding) : 0;
	},
	_getselection: function(config) {
		const top = this;
		const bar = top.$$("toolbar");
		let sel;

		bar.setValues({
			italic:false, underline:false, bold:false
		}, false, config);

		if(window.getSelection) {
			sel = window.getSelection();
		} else {
			sel = document.selection.createRange();
		}

		for (let i = 0; i < sel.rangeCount; ++i) {
			if (top.$view.contains(this.getInputNode())){
				if (document.queryCommandState("bold")) {
					top.$$("bold").setValue(true,config);
				} 
				if (document.queryCommandState("underline")) {
					top.$$("underline").setValue(true,config);
				}
				if (document.queryCommandState("italic")) {
					top.$$("italic").setValue(true,config);
				}
			}
		}
	},
	refresh: function() {
		if(this._rendered_input)
			this.getInputNode().innerHTML = this._settings.value;
	},
	_execCommandOnElement:function(commandName) {
		let sel, selText;

		if (window.getSelection) {
			sel = window.getSelection();
			selText = sel.toString().length;

			const input = this.getInputNode();
			if (!input.contains(sel.anchorNode) || !input.contains(sel.focusNode)) return;
		} else return; //ie8

		if(selText > 0) {
			for (let i = 0; i < sel.rangeCount; ++i) {
				const range = sel.getRangeAt(i);
				if (!sel.isCollapsed) {
					document.execCommand(commandName, false, "");
				} else {
					const textValue = sel.focusNode.textContent;
					const focusEl = sel.focusNode;
					const focustext = sel.anchorOffset;
					const wordBegining = textValue.substring(0, focustext).match(/[A-Za-z]*$/)[0];
					const wordEnd = textValue.substring(focustext).match(/^[A-Za-z]*/)[0];

					const startWord = focustext - wordBegining.length;
					const endWord = focustext + wordEnd.length;

					range.setStart(focusEl, startWord);
					range.setEnd(focusEl, endWord);
					sel.removeAllRanges();

					sel.addRange(range);
					document.execCommand(commandName, false, "");
				}
			}
		}
	},
	_add_data:function() {
		const top = this.getTopParentView();
		top._execCommandOnElement(this.config.action);
	},
	focus: function() {
		if(!UIManager.canFocus(this))
			return false;

		const editableElement = this.getInputNode();
		editableElement.focus();
	},
	_updateValue: function(value, config){
		value = this.$prepareValue(value);
		const oldvalue = this._settings.value;

		if (oldvalue != value){
			this._settings.value = value;
			this.callEvent("onChange", [value, oldvalue, config]);
		}
	},
	setValue: function(value, config) {
		this._updateValue(value, config);
		this.refresh();
	},
	$prepareValue:function(value){ return value === 0 ? "0" : (value || "").toString(); },
	value_setter:function(value){
		return this.$prepareValue(value);
	},
	getValue: function() {
		const input = this.getInputNode();
		if (input)
			return input.innerHTML;

		return this._settings.value;
	}
};


const view = protoUI(api,  IdSpace, layout.view);
export default {api, view};