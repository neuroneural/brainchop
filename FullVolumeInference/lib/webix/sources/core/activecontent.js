import state from "../core/state";
import env from "../webix/env";
import {bind, isUndefined} from "../webix/helpers";
import {ui, $$} from "../ui/core";
import {_event} from "../webix/htmlevents";


const ActiveContent = {
	$init:function(config){  
		if (config.activeContent){
			this.$ready.push(this._init_active_content_list);
			
			this._active_holders = {};
			this._active_holders_item = {};
			this._active_holders_values = {};
			this._active_references = {};
			
			for (var key in config.activeContent){
				this[key] = this._bind_active_content(key);
				if (config.activeContent[key].earlyInit){
					var temp = state._parent_cell; state._parent_cell = null;
					this[key].call(this,{},this, config.activeContent);
					state._parent_cell=temp;
				}
			}
		}
	},
	_destructActiveContent: function(){
		for(var key in this._active_references){
			var elem = this._active_references[key];
			if(elem.destructor)
				elem.destructor();
		}
	},
	_init_active_content_list:function(){
		this.attachEvent("onDestruct",bind(this._destructActiveContent,this));

		_event(this.$view, "blur", function(ev){
			var target = ev.target || ev.srcElement;

			// for inputs only
			if(target.tagName != "BUTTON"){
				var el = $$(ev);
				if (el && el !== this && el.getValue  && el.setValue){
					el.getNode(ev);

					var newvalue = el.getValue();
					if (newvalue != el._settings.value)
						el.setValue(newvalue);
				}
			}
		}, {bind:this, capture: true});

		if (this.filter){
			for (var key in this._settings.activeContent){
				this.type[key] = this[key];
				this[key] = this._locate_active_content_by_id(key);
			}
			//really bad!
			this.attachEvent("onBeforeRender", function(){
				this.type.masterUI = this;
			});
			this.type.masterUI = this;
		}
	},
	_locate_active_content_by_id:function(key){
		return function(id){
			var button = this._active_references[key];
			var button_id = button._settings.id;
			var html = this.getItemNode(id).getElementsByTagName("DIV");
			for (var i=0; i < html.length; i++) {
				if (html[i].getAttribute(/*@attr*/"view_id") == button_id){
					button._viewobj = button._dataobj = html[i];
					break;
				}
			}
			return button;
		};
	},
	_get_active_node:function(el, key, master){
		return function(e){
			if (e){
				var trg=e.target||e.srcElement;
				while (trg){
					if (trg.getAttribute && trg.getAttribute(/*@attr*/"view_id")){
						master._setActiveContentView(el,trg);
						if (master.locate){
							var id = master.locate(trg.parentNode);
							var value = master._active_holders_values[key][id];
							el._settings.value = value;
							el._settings.$masterId = id;
						}
						return trg;
					}
					trg = trg.parentNode;
				}				
			}
			return el._viewobj;
		};
	},
	_set_new_active_value:function(key, master){
		return function(value){
			var data = master.data;
			if (master.filter){
				var id = master.locate(this._viewobj.parentNode);
				data = master.getItem(id);
				//XMLSerializer - FF "feature"
				this.refresh();
				master._active_holders_item[key][id]=this._viewobj.outerHTML||(new XMLSerializer().serializeToString(this._viewobj));
				master._active_holders_values[key][id] = value;
			}
			if(data)
				data[key] = value;
		};
	},
	_bind_active_content:function(key){ 
		return function(obj, common, active){
			var object = common._active_holders?common:common.masterUI;

			if (!object._active_holders[key]){
				let d = document.createElement("DIV");
				
				active = active || object._settings.activeContent;
				let el = ui(active[key], d);

				if (env.isIE8){
					d.firstChild.setAttribute("onclick", "event.processed = true; event.srcElement.w_view = '"+el._settings.id+"';");
				} else {
					d.firstChild.setAttribute("onclick", "event.processed = true; ");
				}

				el.getNode = object._get_active_node(el, key, object);

				el.attachEvent("onChange", object._set_new_active_value(key, object));
				
				object._active_references[key] = el;
				object._active_holders[key] = d.innerHTML;
				object._active_holders_item[key] = {};
				object._active_holders_values[key] = {};
				el.$activeEl = el.$view;
			}
			if (object.filter && obj[key] != object._active_holders_values[key] && !isUndefined(obj[key])){
				let el = object._active_references[key];
				el.blockEvent();
				object._setActiveContentView(el,el.$activeEl);
				//in IE we can lost content of active element during parent repainting
				if (!el.$view.firstChild) el.refresh();
				el.setValue(obj[key]);
				el.refresh();
				el.unblockEvent();
				
				object._active_holders_values[key][obj.id] = obj[key];
				object._active_holders_item[key][obj.id] = el._viewobj.outerHTML||(new XMLSerializer().serializeToString(el._viewobj));
			}
			
			return object._active_holders_item[key][obj.id]||object._active_holders[key];
		};
	},
	_setActiveContentView: function(el,view){
		el._dataobj = el._viewobj = el.$view = view;
	}
};

export default ActiveContent;