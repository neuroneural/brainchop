import UIManager from "../core/uimanager";
import {isUndefined, delay} from "../webix/helpers";
import template from "../webix/template";

import clipbuffer from "../webix/clipbuffer";
import csv from "../webix/csv";
import env from "../webix/env";

const CopyPaste = {
	clipboard_setter: function(value) {
		if (env.touch) return value;

		if (value === true || value === 1) value = "modify";
		this.attachEvent("onAfterSelect", this._sel_to_clip);
		this.attachEvent("onAfterEditStop", function(v, ed){
			const sel = this.getSelectedId(true);
			if(sel.length == 1 && ed.id == sel[0])
				this._sel_to_clip();
		});

		this.attachEvent("onPaste", function(text) {
			if (!isUndefined(this._paste[this._settings.clipboard])) {
				const data = csv.parse(text, this._settings.delimiter);
				this._paste[this._settings.clipboard].call(this, data);
			}
		});
		this.attachEvent("onFocus", function() {
			clipbuffer.focus();
		});
		// solution for clicks on selected items
		this.attachEvent("onItemClick",function(id){
			if(!this._selected || this._selected.find(id)!==-1){
				clipbuffer.focus();
				UIManager.setFocus(this);
			}
		});
		return value;
	},
	_sel_to_clip: function() {
		delay(() => { //wait until editor is closed
			if (!this.getEditor || !this.getEditor()){
				const sel = this.getSelectedId(true);
				const data = [];
				for(let i = 0; i < sel.length; i++){
					const id = sel[i];
					const item = this.getItem(id);
					data.push([this.type.templateCopy(item)]);
				}

				const text = data.length === 1 ? data[0][0] : csv.stringify(data, this._settings.delimiter);

				clipbuffer.set(text, this);
				clipbuffer.focus();
				UIManager.setFocus(this);
			}
		});
	},
	_paste: {
		// insert new item with pasted value
		insert: function(text) {
			text.forEach(value => this.add({ value }));
		},
		// change value of each selected item
		modify: function(text) {
			var sel = this.getSelectedId(true);
			for (var i = 0; i < sel.length; i++) {
				if(isUndefined(text[i]))
					return;
				this.getItem(sel[i]).value = text[i];
				this.refresh(sel[i]);
			}
		},
		// do nothing
		custom: function() {}
	},
	templateCopy_setter: function(value) {
		this.type.templateCopy = template(value);
	},
	type:{
		templateCopy: function(item) {
			return this.template(item);
		}
	}
};

export default CopyPaste;