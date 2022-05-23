import {_getClassName, locate} from "../webix/html";
import UIManager from "../core/uimanager";
import {extend, delay, toFunctor} from "../webix/helpers";
import env from "../webix/env";
import {_event} from "../webix/htmlevents";


const MouseEvents={
	$init: function(config){
		config = config || {};

		this._clickstamp = 0;
		this._dbl_sensetive = 300;
		this._item_clicked = null;

		this._mouse_action_extend(config.onClick, "on_click");
		this._mouse_action_extend(config.onContext, "on_context");
		this._mouse_action_extend(config.onDblClick, "on_dblclick");
		this._mouse_action_extend(config.onMouseMove, "on_mouse_move");

		//attach dom events if related collection is defined
		if (this.on_click){
			_event(this._contentobj,"click",this._onClick,{bind:this});
			if (env.isIE8 && this.on_dblclick)
				_event(this._contentobj, "dblclick", this._onDblClick, {bind:this});
		}
		if (this.on_context)
			_event(this._contentobj,"contextmenu",this._onContext,{bind:this});

		if (this.on_mouse_move)
			this._enable_mouse_move();
	},

	_enable_mouse_move:function(){
		if (!this._mouse_move_enabled){
			this.on_mouse_move = this.on_mouse_move || {};
			_event(this._contentobj,"mousemove",this._onMouse,{bind:this});
			_event(this._contentobj,(env.isIE?"mouseleave":"mouseout"),this._onMouse,{bind:this});
			this._mouse_move_enabled = 1;
			this.attachEvent("onDestruct", function(){
				if (this._mouse_move_timer)
					window.clearTimeout(this._mouse_move_timer);
			});
		}

	},

	_mouse_action_extend:function(config, key){
		if (config){
			var now = this[key];
			var step = now ? extend({}, now) : {};
			this[key] = extend(step, config);
		}
	},

	//inner onclick object handler
	_onClick: function(e){
		if(!this.isEnabled())
			return false;

		UIManager._focus_action(this);

		if(this.on_dblclick){
			// emulates double click
			var stamp = (new Date()).valueOf();

			if (stamp - this._clickstamp <= this._dbl_sensetive && this.locate){
				var item = this.locate(e);
				if (""+item == ""+this._item_clicked) {
					this._clickstamp = 0;
					return this._onDblClick(e);
				}
			}
			this._clickstamp = stamp;
		}

		var result = this._mouseEvent(e,this.on_click,"ItemClick");
		return result;
	},
	//inner ondblclick object handler
	_onDblClick: function(e) {
		return this._mouseEvent(e,this.on_dblclick,"ItemDblClick");
	},
	//process oncontextmenu events
	_onContext: function(e) {
		this._mouseEvent(e, this.on_context, "BeforeContextMenu", "AfterContextMenu");
	},
	/*
		event throttler - ignore events which occurs too fast
		during mouse moving there are a lot of event firing - we need no so much
		also, mouseout can fire when moving inside the same html container - we need to ignore such fake calls
	*/
	_onMouse:function(e){
		if (this.$destructed) return;
		if (document.createEventObject)	//make a copy of event, will be used in timed call
			e = document.createEventObject(event);

		if (this._mouse_move_timer)	//clear old event timer
			window.clearTimeout(this._mouse_move_timer);

		//this event just inform about moving operation, we don't care about details
		this.callEvent("onMouseMoving",[e]);
		//set new event timer
		this._mouse_move_timer = delay(function(e){
			//called only when we have at least 100ms after previous event
			if (e.type == "mousemove")
				this._onMouseMove(e);
			else
				this._onMouseOut(e);
		}, this, [e], (this._settings.mouseEventDelay||500));
	},

	//inner mousemove object handler
	_onMouseMove: function(e) {
		if (!this._mouseEvent(e,this.on_mouse_move,"MouseMove"))
			this._onMouseOut(e);
	},
	//inner mouseout object handler
	_onMouseOut: function(e) {
		this.callEvent("onMouseOut",[e||event]);
	},
	//common logic for click and dbl-click processing
	_mouseEvent:function(e,hash,name, pair){
		e=e||event;

		if (e.processed || !this._viewobj) return;
		e.processed = true;

		var trg=e.target;

		//IE8 can't modify event object
		//so we need to stop event bubbling to prevent double processing
		if (env.isIE8){
			var vid = this._settings.id;
			var wid = trg.w_view;

			if (!wid) trg.w_view = vid; else if (wid !== vid) return;
		}

		var css = "";
		var id = null;
		var found = false;
		//loop through all parents
		//we need to check for this._viewobj as some handler can destroy the view
		while (trg && trg.parentNode && this._viewobj && trg != this._viewobj.parentNode){
			if (!found && trg.getAttribute){													//if element with ID mark is not detected yet
				id = trg.getAttribute(this._id);							//check id of current one
				if (id){
					// prevent clicking on disabled items
					if (trg.getAttribute("webix_disabled")){
						this._item_clicked = null;
						return;
					}

					this._item_clicked = id;
					if (this.callEvent){
						//it will be triggered only for first detected ID, in case of nested elements
						if (!this.callEvent("on"+name,[id,e,trg])) return;
						if (pair) this.callEvent("on"+pair,[id,e,trg]);
					}
					//set found flag
					found = true;
				}
			}
			css=_getClassName(trg);
			if (css){		//check if pre-defined reaction for element's css name exists
				css = css.toString().split(" ");
				for (var i=0; i<css.length; i++){
					if (hash[css[i]]){
						var functor = toFunctor(hash[css[i]], this.$scope);
						var res =  functor.call(this,e,id||locate(e, this._id),trg);
						if(res === false)
							return found;
					}
				}
			}
			trg=trg.parentNode;
		}
			
		return found;	//returns true if item was located and event was triggered
	}
};

export default MouseEvents;