import EventSystem from "../core/eventsystem";
import BaseBind from "../core/basebind";
import {isUndefined, uid} from "../webix/helpers";
import {proto, ui} from "../ui/core";


const DataValue = proto({
	name:"DataValue",
	isVisible:function(){ return true; },
	$init:function(config){ 
		if (!config || isUndefined(config.value))
			this.data = config||"";

		var id = (config&&config.id)?config.id:uid();
		this._settings = { id:id };
		ui.views[id] = this;
	},
	setValue:function(value,config){
		this.data = value;
		this.callEvent("onChange", [value,config]);
	},
	getValue:function(){
		return this.data;
	},
	refresh:function(){ this.callEvent("onBindRequest"); }
}, EventSystem, BaseBind);


export default DataValue;