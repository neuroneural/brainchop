import promise from "../thirdparty/promiz";
import proxy from "../load/proxy";
import DataDriver from "../load/drivers/index";


import {ajax} from "../load/ajax";

import {bind} from "../webix/helpers";
import {callEvent} from "../webix/customevents";

const silentErrorMarker = {};

const AtomDataLoader={
	$init:function(config){
		//prepare data store
		this.data = {};
		this.waitData = promise.defer();

		if (config)
			this._settings.datatype = config.datatype||"json";
		this.$ready.push(this._load_when_ready);
	},
	_load_when_ready:function(){
		this._ready_for_data = true;
		
		if (this._settings.url)
			this.url_setter(this._settings.url);
		if (this._settings.data)
			this.data_setter(this._settings.data);
	},
	url_setter:function(value){
		value = proxy.$parse(value);

		if (!this._ready_for_data) return value;
		this.load(value, this._settings.datatype);	
		return value;
	},
	data_setter:function(value){
		if (!this._ready_for_data) return value;
		this.parse(value, this._settings.datatype);
		return true;
	},
	//loads data from external URL
	load:function(url,call,details,clear){
		let type;
		if (typeof call == "string"){	//second parameter can be a loading type or callback
			//we are not using setDriver as data may be a non-datastore here
			type = call;
			call = arguments[2];
		}

		const d = this._fetch(url, type, details||null);
		if (d && d.then)
			return d.then(data => {
				this._onLoad(data, clear);
				if (call)
					ajax.$callback(this, call, "", data, -1);
				return data;
			}, x => this._onLoadError(x));
	},
	_fetch:function(url, type, details){
		var result;

		if (type || !this.data.driver)
			this.data.driver = DataDriver[type||"json"];

		if(!this.callEvent("onBeforeLoad",[]))
			return promise.reject();		

		//proxy	
		url = proxy.$parse(url);
		if (url.$proxy && url.load){
			result = url.load(this, details);
		}
		//promize
		else if (typeof url === "function"){
			result = url.call(this, details);
		}
		//normal url
		else {
			result = ajax().bind(this).get(url);
		}

		//we wrap plain data in promise to keep the same processing for it
		if(result && !result.then){
			result = promise.resolve(result);
		}

		const gen = this._data_generation;
		if(result && result.then){
			return result.then((data) => {
				// component destroyed, or clearAll was issued
				if (this.$destructed || (gen && this._data_generation !== gen))
					// by returning rejection we are preventing the further executing chain
					// if user have used list.load(data).then(do_something)
					// the do_something will not be executed
					// the error handler may be triggered though
					return promise.reject(silentErrorMarker);

				return data;
			});
		}
		return result;
	},
	//loads data from object
	parse:function(data,type,clear){
		if (data && typeof data.then == "function"){
			const generation = this._data_generation;
			// component destroyed, or clearAll was issued
			return data.then(bind(function(data){ 
				if (this.$destructed || (generation && this._data_generation !== generation))
					return promise.reject();
				this.parse(data, type, clear); 
			}, this));
		}

		//loading data from other component
		if (data && data.sync && this.sync)
			this._syncData(data);
		else if(!this.callEvent("onBeforeLoad",[]))
			return promise.reject();
		else {
			if(type || !this.data.driver)
				this.data.driver = DataDriver[type||"json"];
			this._onLoad(data, clear);
		}

		return promise.resolve();
	},
	_syncData: function(data){
		if(this.data && this.data.attachEvent)
			this.data.attachEvent("onSyncApply",bind(function(){
				if(this._call_onready)
					this._call_onready();
			},this));

		this.sync(data);
	},
	_parse:function(data){
		var parsed, record,
			driver = this.data.driver;

		record = driver.getRecords(data)[0];
		parsed = record?driver.getDetails(record):{};

		if (this.setValues)
			this.setValues(parsed, false, "auto");
		else
			this.data = parsed;
	},
	_onLoadContinue:function(data, clear){
		if (data){
			if (!this.$onLoad || !this.$onLoad(data, this.data.driver, clear)){
				if (this.data && this.data._parse) {
					if (clear) this.data.clearAll(true);
					this.data._parse(data); //datastore
				} else {
					if (clear) this.clearAll(true);
					this._parse(data);
				}
			}
		} else
			this._onLoadError(data);

		//data loaded, view rendered, call onready handler
		if(this._call_onready)
			this._call_onready();

		this.callEvent("onAfterLoad",[]);
		this.waitData.resolve();
	},
	//default after loading callback
	_onLoad:function(data, clear){
		// webix loading object or uploaded file structure
		if (data && typeof data.text === "function" && !data.name){
			data = data.text();
		}

		data = this.data.driver.toObject(data);
		if(data && data.then)
			data.then(data => this._onLoadContinue(data, clear));
		else
			this._onLoadContinue(data, clear);
	},
	_onLoadError:function(xhttp){
		if (xhttp !== silentErrorMarker){
			//ignore error for dead components
			if (!this.$destructed){
				this.callEvent("onAfterLoad",[]);
				this.callEvent("onLoadError",arguments);
			}

			callEvent("onLoadError", [xhttp, this]);
		}
		return promise.reject(xhttp);
	},
	_check_data_feed:function(data){
		if (!this._settings.dataFeed || this._ignore_feed || !data)
			return true;

		var url = this._settings.dataFeed;
		if (typeof url == "function")
			return url.call(this, (data.id||data), data);

		url = url+(url.indexOf("?")==-1?"?":"&")+"action=get&id="+encodeURIComponent(data.id||data);
		if(!this.callEvent("onBeforeLoad",[]))
			return false;

		ajax(url, function(text,xml,loader){
			this._ignore_feed = true;
			var driver = DataDriver.json;
			var data = driver.toObject(text, xml);
			if (data)
				this.setValues(driver.getDetails(driver.getRecords(data)[0]), false, "auto");
			else
				this._onLoadError(loader);
			this._ignore_feed = false;
			this.callEvent("onAfterLoad",[]);
		}, this);
		return false;
	}
};

export default AtomDataLoader;