import {bind} from "../webix/helpers";
import template from "../webix/template";


const AtomRender={
	//convert item to the HTML text
	_toHTML:function(obj){
		if (obj.$empty )
			return "";
		return this._settings.template(obj, this);
	},
	//render self, by templating data object
	render:function(){
		var cfg = this._settings;
		if (this.isVisible(cfg.id)){
			if (!this.callEvent || this.callEvent("onBeforeRender",[this.data])){
				if (this.data && !cfg.content){
					//it is critical to have this as two commands
					//its prevent destruction race in Chrome
					this._dataobj.innerHTML = "";
					this._dataobj.innerHTML = this._toHTML(this.data);
				}
				if (this.callEvent) this.callEvent("onAfterRender",[]);
			}
			return true;
		}
		return false;
	},
	sync:function(source){
		this._backbone_sync = false;
		if (source.name != "DataStore"){
			if (source.data && source.data.name == "DataStore"){
				source = source.data;
			} else {
				this._backbone_sync = true;
			}
		}

		if (this._backbone_sync)
			source.bind("change", bind(function(data){
				if (data.id == this.data.id){
					this.data = data.attributes;
					this.refresh();
				}
			}, this));
		else
			source.attachEvent("onStoreUpdated", bind(function(id){
				if (!id || id == this.data.id){
					this.data = source.pull[id];
					this.refresh();
				}
			}, this));
	},
	template_setter:template
};

export default AtomRender;