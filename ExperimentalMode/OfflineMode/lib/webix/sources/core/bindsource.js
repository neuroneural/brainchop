import {extend, clone} from "../webix/helpers";

import {$$} from "../ui/core";

import CollectionBind from "./collectionbind";
import ValueBind from "./valuebind";
import RecordBind from "./recordbind";

const BindSource = {
	$init:function(){
		this._bind_hash = {};		//rules per target
		this._bind_updated = {};	//update flags
		this._ignore_binds = {};
		
		//apply specific bind extension
		this._bind_specific_rules(this);
	},
	saveBatch:function(code){
		this._do_not_update_binds = true;
		code.call(this);
		this._do_not_update_binds = false;
		this._update_binds();
	},
	setBindData:function(data, key){
		//save called, updating master data
		if (key)
			this._ignore_binds[key] = true;

		if (this.setValue)
			this.setValue(data, "auto");
		else if (this.setValues)
			this.setValues(data, false, "auto");
		else {
			var id = this.getCursor();
			if (id)
				this.updateItem(id, data);
			else
				this.add(data);
		}
		this.callEvent("onBindUpdate", [data, key]);		
		if (this.save)
			this.save();
		
		if (key)
			this._ignore_binds[key] = false;
	},
	//fill target with data
	getBindData:function(key, update){
		//fire only if we have data updates from the last time
		if (this._bind_updated[key]) return false;
		var target = $$(key);
		//fill target only when it visible
		if (target.isVisible(target._settings.id)){
			this._bind_updated[key] = true;
			this._bind_update(target, this._bind_hash[key][0], this._bind_hash[key][1]); //trigger component specific updating logic
			if (update && target.filter)
				target.refresh();
		}
	},
	//add one more bind target
	addBind:function(source, rule, format){
		this._bind_hash[source] = [rule, format];
	},
	removeBind:function(source){
		delete this._bind_hash[source];
		delete this._bind_updated[source];
		delete this._ignore_binds[source];
	},
	//returns true if object belong to "collection" type
	_bind_specific_rules:function(obj){
		if (obj.filter)
			extend(this, CollectionBind);
		else if (obj.setValue)
			extend(this, ValueBind);
		else
			extend(this, RecordBind);
	},
	//inform all binded objects, that source data was updated
	_update_binds:function(){
		if (!this._do_not_update_binds)
			for (var key in this._bind_hash){
				if (this._ignore_binds[key]) continue;
				this._bind_updated[key] = false;
				this.getBindData(key, true);
			}
	},
	//copy data from source to the target
	_bind_update_common:function(target, rule, data){
		if (target.setValue)
			target.setValue((data&&rule)?data[rule]:data,"auto");
		else if (!target.filter){
			if (!data && target.clear)
				target.clear("auto");
			else {
				if (target._check_data_feed(data))
					target.setValues(clone(data), false, "auto");
			}
		} else {
			target.data.silent(function(){
				this.filter(rule,data);
			});
		}
		target.callEvent("onBindApply", [data,rule,this]);
	}
};

export default BindSource;