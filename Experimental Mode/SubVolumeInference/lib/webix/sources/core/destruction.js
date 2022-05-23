import state from "./state";

import {_to_array} from "../webix/helpers";
import {event, _events_final_destructor} from "../webix/htmlevents";
import {callEvent} from "../webix/customevents";

import {ui} from "../ui/core";
import UIManager from "../core/uimanager";


const Destruction = {
	$init:function(){
		//wrap in object to simplify removing self-reference
		//submenu can trigger this handler two times, preserve a single destructor reference
		var t  = this._destructor_handler = this._destructor_handler || { obj: this};

		//register self in global list of destructors
		state.destructors.push(t);
	},
	//will be called automatically on unload, can be called manually
	//simplifies job of GC
	destructor:function(){
		var config = this._settings;

		if (this._last_editor)
			this.editCancel();

		if(this.callEvent)
			this.callEvent("onDestruct",[]);

		//destructor can be called only once
		this.destructor=function(){};
		//remove self reference from global destructions collection
		this._destructor_handler.obj = null;

		//destroy child and related cells
		if (this.getChildViews){
			var cells = this.getChildViews();
			if (cells)
				for (let i=0; i < cells.length; i++)
					cells[i].destructor();

			if (this._destroy_with_me)
				for (let i=0; i < this._destroy_with_me.length; i++)
					this._destroy_with_me[i].destructor();
		}

		delete ui.views[config.id];

		if (config.$id){
			var top = this.getTopParentView();
			if (top && top._destroy_child)
				top._destroy_child(config.$id);
		}

		//html collection
		this._htmlmap  = null;
		this._htmlrows = null;
		this._html = null;


		if (this._contentobj) {
			this._contentobj.innerHTML="";
			this._contentobj._htmlmap = null;
		}

		//removes view container
		if (this._viewobj&&this._viewobj.parentNode){
			this._viewobj.parentNode.removeChild(this._viewobj);
		}

		if (this.data && this.data.destructor)
			this.data.destructor();

		if (this.unbind)
			this.unbind();

		this.data = null;
		this._parent_cell = null;
		this._viewobj = this.$view = this._contentobj = this._dataobj = null;
		this._evs_events = this._evs_handlers = this._evs_map = {};

		//remove focus from destructed view
		if (UIManager._view == this)
			UIManager._view = null;

		var url = config.url;
		if (url && url.$proxy && url.release)
			url.release();

		this.$scope = null;
		// this flag is checked in delay method
		this.$destructed = true;
	}
};
//global list of destructors
event(window,"unload",function(){
	callEvent("unload", []);
	state._final_destruction = true;
	
	//call all registered destructors
	for (var i=0; i<state.destructors.length; i++){
		var obj = state.destructors[i].obj;
		if (obj)
			obj.destructor();
	}
	state.destructors = [];
	state._popups = _to_array();

	_events_final_destructor();
});

export default Destruction;