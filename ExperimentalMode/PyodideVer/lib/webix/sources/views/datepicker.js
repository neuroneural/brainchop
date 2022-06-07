import {protoUI, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {isUndefined, isArray} from "../webix/helpers";

import i18n from "../webix/i18n";
import wDate from "../core/date";

import text from "./text";


const api = {
	name:"datepicker",
	_editable:true,
	$init:function(config){
		// value_setter handling
		if (config.multiselect) {
			this._settings.multiselect = config.multiselect;
		}
		if (config.type){
			this._settings.type = config.type;
		}

		this.$ready.push(this._init_popup);
	},
	defaults:{
		template:function(obj, common){
			if(common._settings.type == "time"){
				common._settings.icon = common._settings.timeIcon;
			}
			//temporary remove obj.type [[DIRTY]]
			const t = obj.type; obj.type = "";
			const res = obj.editable ? common.$renderInput(obj) : common._render_div_block(obj, common);
			obj.type = t;
			return res;
		},
		stringResult:false,
		timepicker:false,
		icon:"wxi-calendar",
		icons: true,
		timeIcon: "wxi-clock",
		separator:", "
	},
	_onBlur:function(){
		const text = this.getText();
		if (this._settings.text == text)
			return;

		const value = this._settings.editable ? this.getValue() : this.getPopup().getValue();
		this.setValue(value||"", "user");
	},
	$skin:function(){
		text.api.$skin.call(this);

		this.defaults.inputPadding = $active.inputPadding;
		this.defaults.point = !$active.popupNoPoint;
	},
	getPopup: function(){
		return $$(this._settings.popup);
	},
	_init_popup:function(){ 
		const obj = this._settings;
		if (obj.suggest)
			obj.popup = obj.suggest;
		else if (!obj.popup){
			const timepicker = this._settings.timepicker;
			obj.popup = obj.suggest = this.suggest_setter({
				type: "calendar",
				point: this._settings.point === false ? false : true,
				padding: 0,
				body: {
					height: 240 + (timepicker || this._settings.icons ? 30 : 0),
					width: 250,
					multiselect: this._settings.multiselect, 
					timepicker: timepicker,
					type: this._settings.type,
					icons: this._settings.icons,
					timeIcon: this._settings.timeIcon
				}
			});
		}

		this._init_once = function(){};
	},
	$render:function(obj){
		this.$setValue(obj.value);
	},
	$prepareValue:function(value){
		if (this._settings.multiselect){
			if (typeof value === "string")
				value = value.split(this._settings.separator);
			else if (value instanceof Date)
				value = [value];
			else if (!value)
				value = [];

			for (let i = 0; i < value.length; i++)
				value[i] = this._prepareSingleValue(value[i]);

			return value;
		}
		else
			return this._prepareSingleValue(value);
	},
	_prepareSingleValue: function(value) {
		const type = this._settings.type;
		const timeMode = type == "time";

		//setValue("1980-12-25")
		if (!isNaN(parseFloat(value)))
			value = ""+value;

		if (typeof value == "string" && value){
			let formatDate = null;
			if ((type == "month" || type == "year") && this._formatDate)
				formatDate = this._formatDate;
			else
				formatDate = (timeMode ? i18n.parseTimeFormatDate : i18n.parseFormatDate);
			value = formatDate(value);
		}

		if (value){
			//time mode
			if(timeMode){
				//setValue([16,24])
				if(isArray(value)){
					const time = new Date();
					time.setHours(value[0]);
					time.setMinutes(value[1]);
					value = time;
				}
			}
			//setValue(invalid date)
			if(isNaN(value.getTime()))
				value = "";
		}

		return value;
	},
	_get_visible_text:function(value){
		if (this._settings.multiselect)
			return []
				.concat(value)
				.map(a => this._get_visible_text_single(a))
				.join(this.config.separator);
		else
			return this._get_visible_text_single(value);
	},
	_get_visible_text_single:function(value){
		let formatStr = this._formatStr;
		if(!formatStr){
			if(this._settings.type == "time")
				formatStr = i18n.timeFormatStr;
			else if(this.config.timepicker)
				formatStr = i18n.fullDateFormatStr;
			else
				formatStr = i18n.dateFormatStr;
		}
		return formatStr(value);
	},
	_set_visible_text:function(){
		const node = this.getInputNode();
		if(isUndefined(node.value))
			node.innerHTML = this._settings.text || this._get_div_placeholder();
		else
			node.value = this._settings.text || "";
	},
	$compareValue:function(oldvalue, value){
		if(!oldvalue && !value) return true;
		return wDate.equal(oldvalue, value);
	},
	$setValue:function(value){
		this._settings.text = (value?this._get_visible_text(value):"");
		this._set_visible_text();
		this._toggleClearIcon(this._settings.text);
	},
	format_setter:function(value){
		if(value){
			if (typeof value === "function")
				this._formatStr = value;
			else {
				this._formatStr = wDate.dateToStr(value);
				this._formatDate = wDate.strToDate(value);
			}
		}
		else
			this._formatStr = this._formatDate = null;
		return value;
	},
	getInputNode: function(){
		return this._settings.editable ? this._dataobj.getElementsByTagName("input")[0] : this._dataobj.getElementsByTagName("DIV")[1];
	},
	getValue:function(){
		if (this._settings.multiselect){
			const value = this._settings.value;
			if (!value) return [];

			const result = []
				.concat(value)
				.map(a => this._get_value_single(a));

			if (this._settings.stringResult)
				return result.join(this._settings.separator);

			return result;
		}

		return this._get_value_single(this._settings.value);
	},
	_get_value_single:function(value){
		const type = this._settings.type;
		const timeMode = type == "time";

		//input was not rendered, we need to parse value from setValue method
		if (!this._rendered_input)
			value = this.$prepareValue(value) || null;
		//rendere and in edit mode
		else if (this._settings.editable){
			let formatDate = this._formatDate;
			if(!formatDate){
				if(timeMode)
					formatDate = i18n.timeFormatDate;
				else if(this.config.timepicker)
					formatDate = i18n.fullDateFormatDate;
				else
					formatDate = i18n.dateFormatDate;
			}

			const time = formatDate(this.getInputNode().value);

			if(timeMode && value != ""){
				value.setHours(time.getHours());
				value.setMinutes(time.getMinutes());
			}
			else
				value = time;
		}

		//return string from getValue
		if(this._settings.stringResult){
			let formatStr = i18n.parseFormatStr;
			if(timeMode)
				formatStr = i18n.parseTimeFormatStr;
			if(this._formatStr && (type == "month" || type == "year")){
				formatStr = this._formatStr;
			}

			if(this._settings.multiselect)
				return [].concat(value).map(a => a ? formatStr(a) : "");
			return (value?formatStr(value):"");
		}

		return value||null;
	},
	getText:function(){
		const node = this.getInputNode();
		if (!node) return "";
		if (isUndefined(node.value)){
			if (node.firstChild && node.firstChild.className === "webix_placeholder")
				return "";
			return node.innerHTML;
		}
		return node.value;
	}
};

const view = protoUI(api, text.view);
export default {api, view};