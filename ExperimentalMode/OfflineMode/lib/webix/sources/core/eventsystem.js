import {extend, toFunctor, bind, uid, _to_array} from "../webix/helpers.js";
import {assert, log, debug_mode} from "../webix/debug.js";

//event system
const EventSystem={
	$init:function(){
		if (!this._evs_events){
			this._evs_events = {};		//hash of event handlers, name => handler
			this._evs_handlers = {};	//hash of event handlers, ID => handler
			this._evs_map = {};
		}
	},
	//temporary block event triggering
	blockEvent : function(){
		this._evs_events._block = true;
	},
	//re-enable event triggering
	unblockEvent : function(){
		this._evs_events._block = false;
	},
	mapEvent:function(map){
		extend(this._evs_map, map, true);
	},
	on_setter:function(config){
		if(config){
			for(var i in config){
				var method = toFunctor(config[i], this.$scope);
				var sub = i.indexOf("->");
				if (sub !== -1){
					this[i.substr(0,sub)].attachEvent(i.substr(sub+2), bind(method, this));
				} else
					this.attachEvent(i, method);
			}
		}
	},
	//trigger event
	callEvent:function(type,params){
		const master = this._event_master || this;
		if (this._evs_events._block) return true;
		
		type = type.toLowerCase();
		var event_stack =this._evs_events[type.toLowerCase()];	//all events for provided name
		var return_value = true;

		if (DEBUG)
			if ((debug_mode.events || this.debug) && type !== "onmousemoving" )	//can slowdown a lot
				log("info","["+this.name+"@"+((this._settings||{}).id)+"] event:"+type,params);
		
		if (event_stack)
			for(var i=0; i<event_stack.length; i++){
				/*
					Call events one by one
					If any event return false - result of whole event will be false
					Handlers which are not returning anything - counted as positive
				*/
				if (event_stack[i].apply(master, (params||[]))===false) return_value=false;
			}
		if (this._evs_map[type]){
			var target = this._evs_map[type];
			target.$eventSource = this;
			if (!target.callEvent(type,params))
				return_value =	false;
			target.$eventSource = null;
		}

		return return_value;
	},
	//assign handler for some named event
	attachEvent:function(type,functor,id){
		assert(functor, "Invalid event handler for "+type);

		type=type.toLowerCase();
		
		id=id||uid(); //ID can be used for detachEvent
		functor = toFunctor(functor, this.$scope);	//functor can be a name of method

		var event_stack=this._evs_events[type]||_to_array();
		//save new event handler
		if (arguments[3])
			event_stack.unshift(functor);
		else
			event_stack.push(functor);
		this._evs_events[type]=event_stack;
		this._evs_handlers[id]={ f:functor,t:type };
		
		return id;
	},
	//remove event handler
	detachEvent:function(id){
		if(!this._evs_handlers[id]){
			var name = (id+"").toLowerCase();
			if (this._evs_events[name]){
				this._evs_events[name] = _to_array();
			}
			return;
		}
		var type=this._evs_handlers[id].t;
		var functor=this._evs_handlers[id].f;
		
		//remove from all collections
		var event_stack=this._evs_events[type];
		event_stack.remove(functor);
		delete this._evs_handlers[id];
	},
	hasEvent:function(type){
		type=type.toLowerCase();
		var stack = this._evs_events[type];
		if (stack && stack.length) return true;

		var parent = this._evs_map[type];
		if (parent)
			return parent.hasEvent(type);
		return false;
	}
};

export default EventSystem;