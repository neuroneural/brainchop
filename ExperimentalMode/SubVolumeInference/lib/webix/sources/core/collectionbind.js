import {bind} from "../webix/helpers";

const CollectionBind={
	$init:function(){
		this._cursor = null;
		this.attachEvent("onSelectChange", function(){
			var sel = this.getSelectedId();
			this.setCursor(sel?(sel.id||sel):null);
		});
		this.attachEvent("onAfterCursorChange", this._update_binds);		
		this.attachEvent("onAfterDelete", function(id){
			if (id == this.getCursor())
				this.setCursor(null);
		});
		this.data.attachEvent("onStoreUpdated", bind(function(id, data, mode){
			//paint - ignored
			//delete - handled by onAfterDelete above
			if (id && id == this.getCursor() && mode != "paint" && mode != "delete")
				this._update_binds();
			
		},this));
		this.data.attachEvent("onClearAll", bind(function(){
			this._cursor = null;
		},this));
		this.data.attachEvent("onIdChange", bind(function(oldid, newid){
			if (this._cursor == oldid){
				this._cursor = newid;
				this._update_binds();
			}
		},this));
	},
	refreshCursor:function(){
		if (this._cursor)
			this.callEvent("onAfterCursorChange",[this._cursor]);
	},
	setCursor:function(id){
		if (id == this._cursor || (id !== null && !this.getItem(id))) return;
		
		this.callEvent("onBeforeCursorChange", [this._cursor]);
		this._cursor = id;
		this.callEvent("onAfterCursorChange",[id]);
	},
	getCursor:function(){
		return this._cursor;
	},
	_bind_update:function(target, rule, format){
		if (rule == "$level" && this.data.getBranch)
			return (target.data || target).importData(this.data.getBranch(this.getCursor()));

		var data = this.getItem(this.getCursor())|| this._settings.defaultData || null;
		if (rule == "$data"){
			if (typeof format === "function")
				format.call(target, data, this);
			else
				target.data.importData(data?data[format]:[]);
			target.callEvent("onBindApply", [data,rule,this]);
		} else {
			if (format)
				data = format(data);
			this._bind_update_common(target, rule, data);
		}
	}
};

export default CollectionBind;