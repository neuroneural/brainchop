import popup from "../views/popup";
import UIManager from "../core/uimanager";

import {preventEvent} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {toFunctor, extend, copy, isUndefined, delay, bind, toNode} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import template from "../webix/template";


// #include ui/window.js

const api = {
	name:"suggest",
	defaults:{
		autofocus:false,
		type:"list",
		keyPressTimeout:1,
		body:{
			yCount:10,
			autoheight:true,
			body:true,
			select:true,
			borderless:true,
			navigation:true
		},
		filter:function(item,value){
			if (item.value.toString().toLowerCase().indexOf(value.toLowerCase())===0) return true;
			return false;
		}
	},
	template_setter:template,
	filter_setter:function(value){
		return toFunctor(value, this.$scope);
	},
	_show_on_key_press:true,
	$init:function(obj){
		var temp = {};
		extend(temp, copy(this.defaults.body));
		temp.view = obj.type || this.defaults.type;

		var etemp = this._get_extendable_cell(temp);
		if (obj.body)
			extend(etemp, obj.body, true);

		if (obj.data)
			etemp.data = obj.data;
		if (obj.url)
			etemp.url = obj.url;
		if (obj.datatype)
			etemp.datatype = obj.datatype;

		if (obj.id)
			temp.id = temp.id || (obj.id+"_"+temp.view);

		obj.body = temp;
		this.$ready.push(this._set_on_popup_click);

		this.attachEvent("onShow", function(){
			if (this._settings.master){
				const master = $$(this._settings.master);
				if (master){
					const node = master._getInputDiv ? master._getInputDiv() : master.getInputNode();
					node.setAttribute("aria-expanded", "true");
				}

				// execute only if there is a master view
				this._show_selection();
			}
		});
		this.attachEvent("onHide", function(){
			if (this._settings.master){
				const master = $$(this._settings.master);
				if (master){
					const node = master._getInputDiv ? master._getInputDiv() : master.getInputNode();
					node.setAttribute("aria-expanded", "false");
				}
			}
		});
		this._old_text = {};
	},
	_get_extendable_cell:function(obj){
		return obj;
	},
	_get_details:function(config){
		return isUndefined(config) ? null : { config };
	},
	_set_input_value:function(text){
		this._last_input_target.value = text;
	},
	_preselectMasterOption:function(data){
		const text = data.id ? this.getItemText(data.id) : (data.text||data.value);
		let node;

		if (this._settings.master){
			const master = $$(this._settings.master);
			node = master.getInputNode();

			if (node){
				// restore last text to allow 'master' view to save new value on blur
				const prev_text = master._settings.text;

				if (master.options_setter)
					master.$setValue(data.$empty?"":data.id);
				else if (master.$setValueHere)
					master.$setValueHere(text, data, this._get_details());
				else
					master.$setValue(text);

				master._settings.text = prev_text;
			}
		}
		else if (this._last_input_target)
			this._set_input_value(text);

		node = node || this._last_input_target;
		if (node)
			node.focus();
	},
	setMasterValue:function(data, refresh, config){
		const text = data.id ? this.getItemText(data.id) : (data.text||data.value);

		if (this._settings.master){
			const master = $$(this._settings.master);
			if (refresh && data.id)
				master.refresh();
			else if (master.options_setter)
				master.setValue(data.$empty?"":data.id, config);
			else if (master.setValueHere)
				master.setValueHere(text, data, this._get_details(config));
			else
				master.setValue(text, config);
		}
		else if (this._last_input_target)
			this._set_input_value(text);

		if (!refresh){
			this.hide();
			if (this._last_input_target)
				this._last_input_target.focus();
		}
		this.callEvent("onValueSuggest", [data, text]);
	},
	getMasterValue:function(){
		if (this._settings.master)
			return $$(this._settings.master).getValue();
		return null;
	},
	getItemId:function(text){
		var list = this.getList();
		for (var key in list.data.pull){
			var obj = list.getItem(key);
			if (this._settings.filter.call(this, obj, text))
				return obj.id;
		}
	},
	getItemText:function(id){
		var item = this.getList().getItem(id);

		if (!item)
			return this._old_text[id] || "";

		if (this._settings.template)
			return this._settings.template.call(this, item, this.type);

		if (this._settings.textValue)
			return ""+item[this._settings.textValue]+"";
		
		var type = this.getList().type;
		var text = type.template.call(type, item, type);

		return (this._old_text[id] = text);
	},
	getSuggestion:function(text){
		var id,
			list = this.getList(),
			order = list.data.order;

		if (list.getSelectedId)
			id = list.getSelectedId();

		if (text && order.length && (!id || order.find(id) <0) ){
			id = order[0];
			//ensure that option really does match client-side filtering rules
			if (!list.config.dataFeed && !this.config.filter.call(this, list.data.pull[id], text)) return null;
		}

		//complex id in datatable
		if (id){
			if (typeof id == "object") id = id+"";
			if (list.getItem(id).$empty) return null;
		}
		return id;
	},
	getList:function(){
		return this._body_cell;
	},
	_set_on_popup_click:function(){
		var list = this.getList();
		var type = this._settings.type;

		if (list.count){
			list.attachEvent("onItemClick", bind(function(item){
				this.setMasterValue(list.getItem(item), false, "user");
			}, this));
			list.data.attachEvent("onStoreUpdated",bind(function(id, obj, mode){
				if (mode == "delete" && id == this.getMasterValue())
					this.setMasterValue({ id:"", text:"" }, true, "auto");
				else if (mode == "update" && id == this.getMasterValue()){
					this.setMasterValue(obj, true, "auto");
				}
			}, this));
			list.data.attachEvent("onAfterFilter", bind(this._suggest_after_filter, this));
			list.data.attachEvent("onStoreLoad", bind(this._suggest_after_filter, this));
			
			if (isUndefined(this._settings.fitMaster))
				this._settings.fitMaster = true;
		} else if (type == "calendar"){
			list.attachEvent("onAfterDateSelect", function(){
				this.getParentView().setMasterValue({ value:list.getSelectedDate() }, list.config.multiselect, "user");
			});
			list.attachEvent("onTodaySet", function(date){
				this.getParentView().setMasterValue({ value: date }, false, "user");
			});
			list.attachEvent("onDateClear", function(date){
				this.getParentView().setMasterValue({ value: date }, false, "user");
			});
		} else if (type == "colorboard"){
			list.attachEvent("onItemClick", function(value){
				this.getParentView().setMasterValue({ value: value }, false, "user");
			});
		} else if (type == "timeboard"){
			list.attachEvent("onTimeSelect", function(value){
				this.getParentView().setMasterValue({ value: value }, false, "user");
			});
		} else if (type == "colorselect"){
			list.attachEvent("onColorSelect", function(value){
				this.getParentView().setMasterValue({ value:value }, false, "user");
			});
		}
	},
	input_setter: function(value) {
		this.linkInput(value);
		return 0;
	},
	linkInput: function(input){
		var node;
		if (input.getInputNode){
			node = input.getInputNode();
			node.webix_master_id = input._settings.id;
		} else
			node = toNode(input);

		_event(node,"keydown",function(e){
			if ((node != document.body || this.isVisible()) && (input.config ? (!input.config.readonly) : (!node.getAttribute("readonly"))))
				this._suggestions(e);
		}, {bind:this});
		
		if(input._getInputDiv)
			node = input._getInputDiv();
		
		node.setAttribute("aria-autocomplete", "list");
		node.setAttribute("aria-expanded", "false");

		if(node.tagName === "DIV"){
			node.setAttribute("aria-live", "assertive");
			node.setAttribute("aria-atomic", "true");
		}

		this._non_ui_mode = true;
	},
	_suggestions: function(e){
		//should be before tab and arrows handlers: IME can call keydown twice
		if (this._last_delay)
			this._last_delay = clearTimeout(this._last_delay);

		e = (e||event);
		var list = this.getList();
		var trg = e.target;
		if((trg == document.body && !this.isVisible()) || trg.className =="webix_clipbuffer")
			return;

		this._last_input_target = trg;
		this._settings.master = trg.webix_master_id;

		var code = e.keyCode;
		//shift and ctrl
		if (code == 16 || code == 17) return;

		// tab - hide popup and do nothing
		if (code == 9)
			return this._tab_key(e,list);

		// escape - hide popup
		if (code == 27)
			return this._escape_key(e,list);

		// enter
		if (code == 13)
			return this.$enterKey(e,list);

		// up/down/right/left are used for navigation
		if (this._navigate(e) && this.isVisible()){
			preventEvent(e);
			return false;
		}

		const contentEditable = trg.getAttribute("contentEditable") == "true" || trg.getAttribute("contentEditable") == "";
		if (isUndefined(trg.value) && !contentEditable) return;

		this._last_delay = delay(function(){
			//focus moved to the different control, suggest is not necessary
			if (!this._non_ui_mode &&
					UIManager.getFocus() != $$(this._settings.master)) return;

			this._resolve_popup = true;
			//spreadsheet use contentEditable div for cell highlighting
			const val = contentEditable ? trg.innerText : trg.value;

			if (this._before_filtering)
				this._before_filtering();

			// used to prevent showing popup when it was initialized
			if (list.config.dataFeed)
				list.filter("value", val);
			else if (list.filter){
				list.filter(bind(function(item){
					return this._settings.filter.call(this,item,val);
				}, this));
			}
		}, this, [], this._settings.keyPressTimeout);
	},
	_suggest_after_filter:function(){
		if (!this._resolve_popup) return true;
		this._resolve_popup = false;

		var list = this.getList();

		// filtering is complete
		// if there are as min 1 variant it must be shown, hidden otherwise
		if (list.count() >0){
			this.adjust();
			if(!this.isVisible())
				this._dont_unfilter = true;
			this.show(this._last_input_target,null,true);
			this._dont_unfilter = false;
		} else {
			this.hide();
			this._last_input_target = null;
		}
	},

	show:function(node){
		const input = (node && (node.tagName == "INPUT" || node.tagName == "TEXTAREA")) ? node : null;

		if (!this.isVisible() || (input && input != this._last_input_target)){
			var list = this.getList();
			if (list.filter && !this._dont_unfilter){
				list.filter("");
			}

			if (this.$customWidth){
				this.$customWidth(node);
			}
			else if (node && node.tagName && this._settings.fitMaster){
				this._settings.width = node.offsetWidth -2 ; //2 - borders
			}

			if (list._zoom_level)
				list.render();

			this.adjust();

			// needed to return focus
			if (input)
				this._last_input_target = input;
		}
		popup.api.show.apply(this, arguments);
	},
	_show_selection:function(){
		const list = this.getList();
		let value = this.getMasterValue();

		if (list.select && list.showItem){
			if (value && list.exists && list.exists(value)){
				list.select(value);
				list.showItem(value);
			} else {
				list.unselect();
				list.showItem(list.getFirstId());
			}
		}
		else if (list.setValue){
			if (this._settings.master)
				value = $$(this._settings.master).$prepareValue(value);
			list.setValue(value, "auto");
		}
	},
	$enterKey:function(e, list){
		const visible = this.isVisible();
		let value;
		let master;

		if (this._settings.master)
			master = $$(this._settings.master);

		if (master && master._editable && master._settings.editable)
			master._applyChanges();
		else if (visible){
			if (list.count){
				value = list.getSelectedId(false, true);
				if (list.count() == 1 && list.getFirstId() != value)
					value = list.getFirstId();

				if (value) value = list.getItem(value);
			} else {
				if (list.getSelectedDate) value = list.getSelectedDate();
				else if (list.getValue) value = list.getValue();

				if (value) value = { value: value };
			}
			
			if (value)
				this.setMasterValue(value, false, "user");
		}

		if (visible)
			this.hide();
		else if (this._show_on_key_press)
			this.show(this._last_input_target);
	},
	_escape_key:function(){
		return this.hide();
	},
	_tab_key:function(){
		return this.hide();
	},
	/*! suggestions navigation: up/down buttons move selection
	 *	@param e
	 *		event object
	 **/
	_navigate: function(e) {
		var list = this.getList();
		var code = e.keyCode;
		var data;

		if( list.moveSelection && code < 41 && code > 32 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
			// down and up arrows
			if (code === 40 || code === 38) {
				if (this._show_on_key_press && !this.isVisible())
					this.show(this._last_input_target);

				let dir = (code === 38) ? "up" : "down";
				list.moveSelection(dir, false, false);
			}// other arrows
			else {
				if(list.count || (!list.count && !list.isVisible()))
					return false;

				let dir;
				if(code == 33) dir = "pgup";
				if(code == 34) dir = "pgdown";
				if(code == 35) dir = "bottom";
				if(code == 36) dir = "top";
				if(code == 37) dir = "left";
				if(code == 39) dir = "right";

				list.moveSelection(dir, false, false);
			}

			if (list.count)
				data = list.getSelectedItem(false);
			else {
				if (list.getSelectedDate) data = list.getSelectedDate();
				else if (list.getValue) data = list.getValue();

				if (data) data = { value: data };
			}

			if (data && this.isVisible())
				this._preselectMasterOption(data);
			return true;
		}

		return false;
	},
	getValue:function(){
		var list = this.getList();
		var  value = (list.getValue ? list.getValue() : list.getSelectedId()) || "";
		value = value.id || value;

		// check empty
		if(list.getItem){
			var item = list.getItem(value);
			if(item && item.$empty)
				return "";
		}
		return value;
	},
	setValue:function(value){
		const list = this.getList();
		if (value){
			if (list.exists(value)){
				list.select(value);
				list.showItem(value);
			}
		} else {
			list.unselect();
			list.showItem(list.getFirstId());
		}
	}
};


const view = protoUI(api,  popup.view);
export default {api, view};