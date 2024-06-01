import suggest from "../views/suggest";
import {getSelectionRange, setSelectionRange, preventEvent} from "../webix/html";
import {protoUI, $$} from "../ui/core";


const api = {
	name:"mentionsuggest",
	defaults:{
		symbol:"@",
		filter:function(data, value){
			const s = this._settings.symbol;
			value = value.substring(0, this._last_cursor_pos);
			if (value.indexOf(s) === -1) return false;
			else {
				value = value.substring(value.lastIndexOf(s)+s.length);
				if (value.length){
					const text = data.id ? this.getItemText(data.id) : (data.text||data.value);
					return text.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1;
				}
				return false;
			}
		}
	},
	$init:function(){
		this.attachEvent("onValueSuggest", this._before_filtering);
	},
	$enterKey:function(e){
		if (this.isVisible()){
			preventEvent(e);

			let master;
			if (this._settings.master)
				master = $$(this._settings.master);

			if (master && master.callEvent)
				master.callEvent("onEnter");
		}

		return suggest.api.$enterKey.apply(this, arguments);
	},
	_before_filtering:function(){
		if (this._last_input_target)
			this._last_cursor_pos = getSelectionRange(this._last_input_target).start;
	},
	_get_details:function(config){
		return { pos:this._last_cursor_pos, symbol:this._settings.symbol, config };
	},
	_preselectMasterOption:function(){},
	_set_input_value:function(text){
		const s = this._settings.symbol;
		let value = this._last_input_target.value;
		let last = value.substring(this._last_cursor_pos);

		value = value.substring(0, this._last_cursor_pos);
		value = value.substring(0, value.lastIndexOf(s)+s.length) + text;

		this._last_input_target.value = value + last;
		setSelectionRange(this._last_input_target, value.length);
	},
	_show_on_key_press:false
};


const view = protoUI(api,  suggest.view);
export default {api, view};