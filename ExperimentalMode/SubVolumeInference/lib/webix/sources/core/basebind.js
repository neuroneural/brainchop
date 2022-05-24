import {extend, bind} from "../webix/helpers";

import {$$} from "../ui/core";

import BindSource from "./bindsource";
import EventSystem from "./eventsystem";

const BaseBind = {
	bind:function(target, rule, format){
		if (!this.attachEvent)
			extend(this, EventSystem);

		if (typeof target == "string")
			target = $$(target);
			
		if (target._initBindSource) target._initBindSource();
		if (this._initBindSource) this._initBindSource();
			
		if (!target.getBindData)
			extend(target, BindSource);

		this._bind_ready();

		target.addBind(this._settings.id, rule, format);
		this._bind_source = target._settings.id;
		this._bind_id = this._settings.id;

		//FIXME - check for touchable is not the best solution, to detect necessary event
		this._bind_refresh_handler = this.attachEvent(this.touchable?"onAfterRender":"onBindRequest", function(){
			return target.getBindData(this._bind_id);
		});

		if (this.refresh && this.isVisible(this._bind_id))
			this.refresh();
	},
	unbind:function(){
		if (this._bind_source){
			var target = $$(this._bind_source);
			if (target)
				target.removeBind(this._bind_id);
			this.detachEvent(this._bind_refresh_handler);
			this._bind_source = this._bind_refresh_handler = null;
		}
	},
	_bind_ready:function(){
		var config = this._settings;
		if (this.filter){
			var key = config.id;
			this.data._on_sync = bind(function(){
				$$(this._bind_source)._bind_updated[key] = false;
			}, this);
		}

		var old_render = this.render;
		this.render = function(){
			if (this._in_bind_processing) return;
			
			this._in_bind_processing = true;
			var result = this.callEvent("onBindRequest");
			this._in_bind_processing = false;
			
			return old_render.apply(this, ((result === false)?arguments:[]));
		};

		if (this.getValue||this.getValues)
			this.save = function(data){
				var source = $$(this._bind_source);
				if (data)
					source.setBindData(data);
				else {
					if (this.validate && !this.validate()) return false;
					var values = this.getValue?this.getValue:this.getValues();
					source.setBindData(values,this._settings.id);
					//reset form, so it will be counted as saved
					if (this.setDirty)
						this.setDirty(false);
				}
			};

		this._bind_ready = function(){};
	}
};

export default BaseBind;