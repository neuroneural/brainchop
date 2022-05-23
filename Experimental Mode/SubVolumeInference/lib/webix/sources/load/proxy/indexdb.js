import {bind, delay} from  "../../webix/helpers";
import promise from "../../thirdparty/promiz";

const indexdb = {
	$proxy:true,
	create:function(db, config, version, callback){
		this.source = db + "/";
		this._get_db(callback, version, function(e){
			var db = e.target.result;
			for (var key in config){
				var data = config[key];
				var store = db.createObjectStore(key, { keyPath: "id", autoIncrement:true });
				for (var i = 0; i < data.length; i++)
					store.put(data[i]);
			}
		});
	},
	_get_db:function(callback, version, upgrade){
		if (this.source.indexOf("/") != -1){
			var parts = this.source.split("/");
			this.source = parts[1];
			version = version || parts[2];

			var _index = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

			var db;
			if (version)
				db = _index.open(parts[0], version);
			else
				db = _index.open(parts[0]);

			if (upgrade)
				db.onupgradeneeded = upgrade;
			db.onerror = function(){ };
			db.onblocked = function(){ };
			db.onsuccess = bind(function(e){
				this.db =  e.target.result;
				if (callback)
					callback.call(this);
			},this);
		} else if (this.db)
			callback.call(this);
		else
			delay(this._get_db, this, [callback], 50);
	},

	load:function(){
		var waitData = promise.defer();
		
		this._get_db(function(){
			var store = this.db.transaction(this.source).objectStore(this.source);
			var data = [];
			var req = store.openCursor();

			req.onsuccess = function(e) {
				var result = e.target.result;
				if(result){
					data.push(result.value);
					result["continue"]();
				} else {
					waitData.resolve(data);
				}
			};
			req.onerror  = function(e) {
				waitData.reject(e);
			};
		});
		return waitData;
	},
	save:function(view, update){
		var waitData = promise.defer();

		this._get_db(function(){
			var mode = update.operation;
			var data = update.data;
			var id = update.id;

			var store = this.db.transaction([this.source], "readwrite").objectStore(this.source);

			var req;
			if (mode == "delete")
				req = store["delete"](id);
			else if (mode == "update")
				req = store.put(data);
			else if (mode == "insert"){
				delete data.id;
				req = store.add(data);
			}

			req.onsuccess = function(e) {
				var result = { status: mode, id:update.id };
				if (mode == "insert")
					result.newid = e.target.result;
				waitData.resolve(result);
			};
			req.onerror = function(e) {
				waitData.reject(e);
			};
		});
		return waitData;
	}
};

export default indexdb;