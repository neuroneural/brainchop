import base from "../views/view";
import PagingAbility from "../core/pagingability";
import DataMarks from "../core/datamarks";
import AutoTooltip from "../core/autotooltip";
import ValidateCollection from "../core/validatecollection";
import RenderStack from "../core/renderstack";
import DataLoader from "../core/dataloader";
import EventSystem from "../core/eventsystem";
import Settings from "../core/settings";

import {protoUI} from "../ui/core";
import {bind} from "../webix/helpers";

const api = {
	name:"proto",
	$init:function(){
		this.data.provideApi(this, true);
		this._dataobj = this._dataobj || this._contentobj;
		
		//render self , each time when data is updated
		this.data.attachEvent("onStoreUpdated",bind(function(){
			this.render.apply(this,arguments);
		},this));
	},
	$setSize:function(){
		if (base.api.$setSize.apply(this, arguments))
			this.render();
	},
	_id:/*@attr*/"webix_item",
	on_mouse_move:{
	},
	type:{}
};


const view = protoUI(api, PagingAbility, DataMarks, AutoTooltip, ValidateCollection, RenderStack, DataLoader, base.view, EventSystem, Settings);
export default {api, view};