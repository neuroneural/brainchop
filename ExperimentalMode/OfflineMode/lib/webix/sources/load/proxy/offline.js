import env from "../../webix/env";
import storage from "../../webix/storage";

import {callEvent} from "../../webix/customevents";
import {ajax} from "../ajax";
import promise from "../../thirdparty/promiz";


const proxy = {
	$proxy:true,

	storage: storage.local,
	cache:false,
	local:false,
	data:"",

	_is_offline : function(){
		if (!this.cache && !env.offline){
			callEvent("onOfflineMode",[]);
			env.offline = true;
		}
	},
	_is_online : function(){
		if (!this.cache && env.offline){
			env.offline = false;
			callEvent("onOnlineMode", []);
		}
	},
	_on_success:function(text){
		this._is_online();
		this.setCache(text);
	},
	_on_error:function(view){
		//assuming offline mode
		this._is_offline();
		
		var text = this.getCache() || this.data;
		view.parse(text);
	},
	load:function(view){
		//in cache mode - always load data from cache
		if (this.cache && this.getCache()){
			this._on_error(view);
		}
		//else try to load actual data first
		else {
			var result;
			if (this.source.$proxy)
				result =  this.source.load(view);
			else
				result = ajax().get(this.source);

			if(result && result.then){
				result.then((data) => {
					this._on_success(data.text());
				}, () => {
					this._on_error(view);
				});
			}
			return result;
		}
	},
	getCache:function(){
		return this.storage.get(this._data_name());
	},
	clearCache:function(){
		this.storage.remove(this._data_name());
	},
	setCache:function(text){
		this.storage.put(this._data_name(), text);
	},
	_data_name:function(){
		if (this.source.$proxy)
			return this.source.source + "_$proxy$_data";
		else 
			return this.source + "_$proxy$_data";
	},
	save:function(master, data, view){
		if (!env.offline && !this.cache){
			if (this.source.$proxy){
				return this.source.save(master, data, view);
			} else {
				return ajax().post(this.source, data.data);
			}
		}
	},
	saveAll:function(view, update){
		this.setCache(view.serialize());
		update = this.cache || env.offline ? update : [];
		for (var i = 0; i < update.length; i++){
			update[i] = { id: update[i].id, status: update[i].operation };
		}
		return promise.resolve(update);
	}
};

export default proxy;