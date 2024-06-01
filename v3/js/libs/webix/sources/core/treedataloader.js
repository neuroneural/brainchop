import {bind} from "../webix/helpers";
import DataLoader from "../core/dataloader";
import promise from "../thirdparty/promiz";


const TreeDataLoader = {
	$init:function(){
		this.data.attachEvent("onStoreUpdated", bind(this._sync_hierarchy, this), null, true);
		//redefine methods
		this._feed_common = this._feed_commonA;
	},
	_feed_commonA:function(from, count, callback, defer, details, clear){
		// branch loading
		details = (count === 0) ? {parent: encodeURIComponent(from)} : null;
		return DataLoader.prototype._feed_common.call(this, from, count, callback, defer, details, clear);
	},
	//load next set of data rows
	loadBranch:function(id, callback, url){
		id = id || 0;
		this.data.url = url || this.data.url;
		if (this.callEvent("onDataRequest", [id,callback,this.data.url]) && this.data.url)
			return this.data.feed.call(this, id, 0, callback);
		return promise.reject();
	},
	_sync_hierarchy:function(id, data, mode){
		if (!mode || mode == "add" || mode == "delete" || mode == "branch"){
			this.data._sync_to_order(this);
		}
	}
};

export default TreeDataLoader;