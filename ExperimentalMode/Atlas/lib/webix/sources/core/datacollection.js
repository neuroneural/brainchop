import {uid, bind} from "../webix/helpers";
import {proto, ui} from "../ui/core";

import EventSystem from "./eventsystem";
import Destruction from "./destruction";
import DataMove from "../core/datamove";
import DataLoader from "../core/dataloader";
import MapCollection from "../core/mapcollection";

import Settings from "../core/settings";

import ValidateCollection from "../core/validatecollection";

import BindSource from "../core/bindsource";
import BaseBind from "../core/basebind";
import CollectionBind from "../core/collectionbind";

import {define} from "../services";

const DataCollection = proto({
	name:"DataCollection",
	isVisible:function(){ 
		if (!this.data.order.length && !this.data._filter_order && !this._settings.dataFeed) return false;
		return true; 
	},
	$init:function(config){
		this.data.provideApi(this, true);
		var id = (config&&config.id)?config.id:uid();
		this._settings.id =id;
		ui.views[id] = this;
		this.data.attachEvent("onStoreLoad", bind(function(){
			this.callEvent("onBindRequest",[]);
		}, this));
	},
	refresh:function(){ this.callEvent("onBindRequest",[]); }
}, DataMove, CollectionBind, BindSource, ValidateCollection, DataLoader, MapCollection, EventSystem, BaseBind, Destruction, Settings);

define("DataCollection", DataCollection);

export default DataCollection;