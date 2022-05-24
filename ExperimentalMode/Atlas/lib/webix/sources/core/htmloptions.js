import {preventEvent} from "../webix/html";
import {_power_array} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import UIManager from "./uimanager";


/*aria-style handling for options of multiple-value controls (radio, segmented, tabbar)*/

const HTMLOptions = {
	$init: function(){
		this.$ready.push(()=>{
			if(!this.customRadio_setter || this.config.customRadio)
				_event( this.$view, "keydown", this._moveSelection, {bind:this});
		});
	},
	_focus: function(){
		if(!UIManager.canFocus(this))
			return false;

		const input = this._getInputNode();
		if (input)
			for (let i=0; i<input.length; i++)
				if (input[i].getAttribute("tabindex") == "0")
					return input[i].focus();
	},
	_blur: function(){
		const input = this._getInputNode();
		if (input)
			for (let i=0; i<input.length; i++)
				if (input[i].getAttribute("tabindex") == "0")
					return input[i].blur();
	},
	_moveSelection: function(e){
		const code = e.which || e.keyCode;

		if (code>34 && code <41){
			const inp = this._getInputNode();
			let index = false;

			if (!inp.length) return;
			preventEvent(e);

			const dir = (code === 37 || code === 38 || code === 35)?-1:1;
			if (code === 35) index = inp.length-1;
			else if (code === 36 ) index = 0;
			else {
				for (let i=0; i<inp.length; i++)
					if (inp[i].getAttribute("tabindex") == "0"){
						index = i + dir;
						break;
					}
			}
			if (index !== false){
				let i = index;
				do {
					if (i >= inp.length) i = 0;
					if (i < 0) i = inp.length-1;

					if (!inp[i].getAttribute("webix_disabled")){
						const id = inp[i].getAttribute(/*@attr*/"button_id");

						this.setValue(id, "user");
						inp[i].focus();
						i = "success";
					}
					else i += dir;

				} while(i !== "success" && i !== index);
			}
		}
	},
	_get_tooltip_data: function(t,e){
		let id,
			node = e.target;
		while (node && !node.webix_tooltip){
			id = node.getAttribute("webix_t_id");
			if (id)
				return this.getOption(id);
			node = node.parentNode;
		}
		return null;
	},
	optionIndex: function(id){
		const options = this._settings.options;
		for (let i=0; i<options.length; i++)
			if (options[i].id == id)
				return i;
		return -1;
	},
	getOption: function(id){
		const index = this.optionIndex(id);
		if (index !== -1)
			return this._settings.options[index];
		return null;
	},
	addOption: function(id, value, show, index){
		let obj = id;
		if (typeof id != "object"){
			value = value || id;
			obj = { id:id, value:value };
		} else {
			id = obj.id;
			index = show;
			show = value;
		}

		if (this.optionIndex(id) === -1){
			_power_array.insertAt.call(this._settings.options, obj, index);
			this.refresh();

			this.callEvent("onOptionAdd", [id, obj]);
		}

		if (show){
			if (this._settings.options.length === 1)
				this._settings.value = "";
			this.setValue(id, "auto");
		}
	},
	removeOption: function(id){
		const index = this.optionIndex(id);

		if (index !== -1){
			const options = this._settings.options;

			_power_array.removeAt.call(options, index);
			this.refresh();

			// if we remove a selected option
			if (this._settings.value == id)
				this._setNextVisible(options, index);

			this.callEvent("onOptionRemove", [id, this._settings.value]);
		}
	},
	_setNextVisible: function(options, index){
		const size = options.length;

		if (size && !this.customRadio_setter){
			index = Math.min(index, size-1);
			//forward search
			for (let i=index; i<size; i++)
				if (!options[i].hidden)
					return this.setValue(options[i].id,"auto");
			//backward search
			for (let i=index; i>=0; i--)
				if (!options[i].hidden)
					return this.setValue(options[i].id,"auto");
		}

		//nothing found		
		this.setValue("","auto");
	},
	_getFirstActive(first){
		const options = this._settings.options;

		if (options.length){
			for (let i=0; i<options.length; i++)
				if (!options[i].hidden && !options[i].disabled)
					return options[i].id;
			if (first)
				return options[0].id;
		}
		return "";
	},
	_filterOptions: function(options){
		const copy = [];
		for(let i=0; i<options.length; i++)
			if(!options[i].hidden)
				copy.push(options[i]);
		return copy;
	},
	_setOptionState: function(id, field, state){
		const options = this._settings.options;
		const index = this.optionIndex(id);

		if (options[index] && state != !!options[index][field]){				//new state differs from previous one
			options[index][field] = state;

			if (state && field === "hidden" && this._settings.value == id)		//switch to next visible one
				this._setNextVisible(options, index);
			this.refresh();
		}
	},
	hideOption: function(id){
		this._setOptionState(id, "hidden", true);
	},
	showOption: function(id){
		this._setOptionState(id, "hidden", false);
	},
	disableOption: function(id){
		this._setOptionState(id, "disabled", true);
	},
	enableOption: function(id){
		this._setOptionState(id, "disabled", false);
	}
};

export default HTMLOptions;