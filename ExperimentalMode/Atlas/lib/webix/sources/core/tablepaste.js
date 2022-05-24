import template from "../webix/template";
import UIManager from "../core/uimanager";

import clipbuffer from "../webix/clipbuffer";
import csv from "../webix/csv";
import env from "../webix/env";

import {isUndefined, delay} from "../webix/helpers";


const TablePaste = {
	clipboard_setter:function(value){
		if (env.touch) return value;

		if (value === true || value === 1) value = "block";
		clipbuffer.init();
		this.attachEvent("onSelectChange",this._sel_to_clip);
		this.attachEvent("onAfterEditStop", function(v, ed){
			const sel = this.getSelectedId(true);
			if(sel.length == 1 && ed.row == sel[0].row)
				this._sel_to_clip();
		});
		// solution for clicks on selected items
		this.attachEvent("onItemClick",function(){
			if(document.activeElement && this.$view.contains(document.activeElement)){
				clipbuffer.focus();
				UIManager.setFocus(this);
			}
		});
		this.attachEvent("onPaste", this._clip_to_sel);

		return value;
	},
	templateCopy_setter: template,
	_sel_to_clip: function() {
		delay(() => { //wait until editor is closed
			if (!this.getEditor || !this.getEditor()){
				var data = this._get_sel_text();
				clipbuffer.set(data);
				UIManager.setFocus(this);
			}
		});
	},
	_get_sel_text: function() {
		var data = [];
		var filter = this._settings.templateCopy;
		this.mapSelection(function(value, row, col, row_ind) {
			if (!data[row_ind]) data[row_ind] = [];
			var newvalue = filter ? filter(value, row, col) : value;
			data[row_ind].push(newvalue);
			return value;
		});
		var value = data.length === 1 && data[0].length === 1 ? data[0][0] : csv.stringify(data, this._settings.delimiter);
		return value;
	},

	_clip_to_sel: function(text) {
		if (!isUndefined(this._paste[this._settings.clipboard])) {
			var data = csv.parse(text, this._settings.delimiter);
			this._paste[this._settings.clipboard].call(this, data);
		}
	},

	_paste: {
		block: function(data) {
			var leftTop = this.mapSelection(null);
			if (!leftTop) return;

			// filling cells with data
			this.mapCells(leftTop.row, leftTop.column, data.length, null, function(value, row, col, row_ind, col_ind) {
				if (data[row_ind] && data[row_ind].length>col_ind) {
					return data[row_ind][col_ind];
				}
				return value;
			});
			this.render();
		},

		selection: function(data) {
			this.mapSelection(function(value, row, col, row_ind, col_ind) {
				if (data[row_ind] && data[row_ind].length>col_ind)
					return data[row_ind][col_ind];
				return value;
			});
			this.render();
		},

		repeat: function(data) {
			this.mapSelection(function(value, row, col, row_ind, col_ind) {
				row = data[row_ind%data.length];
				value = row[col_ind%row.length];
				return value;
			});
			this.render();
		},

		custom: function() {}
	}
};

export default TablePaste;