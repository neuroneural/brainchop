import {preventEvent, addCss, removeCss, pos as getPos, remove} from "../webix/html";
import env from "../webix/env";
import Touch from "../core/touch";
import {zIndex} from "../ui/helpers";
import {_to_array, toNode} from "../webix/helpers";
import {_event, event, eventRemove} from "../webix/htmlevents";
import {attachEvent, callEvent} from "../webix/customevents";


/*
	Behavior:DND - low-level dnd handling
	@export
		getContext
		addDrop
		addDrag
		
	DND master can define next handlers
		onCreateDrag
		onDragIng
		onDragOut
		onDrag
		onDrop
	all are optional
*/

const DragControl ={
	//has of known dnd masters
	_drag_masters : _to_array(["dummy"]),
	/*
		register drop area
		@param node 			html node or ID
		@param ctrl 			options dnd master
		@param master_mode 		true if you have complex drag-area rules
	*/
	addDrop:function(node,ctrl,master_mode){
		node = toNode(node);
		node.webix_drop=this._getCtrl(ctrl);
		if (master_mode) node.webix_master=true;
	},
	//return index of master in collection
	//it done in such way to prevent dnd master duplication
	//probably useless, used only by addDrop and addDrag methods
	_getCtrl:function(ctrl){
		ctrl = ctrl||DragControl;
		var index = this._drag_masters.find(ctrl);
		if (index<0){
			index = this._drag_masters.length;
			this._drag_masters.push(ctrl);
			if (ctrl.attachEvent)
				ctrl.attachEvent("onDestruct", () => DragControl.unlink(ctrl));
		}
		return index;
	},
	unlink(ctrl){
		var index = this._drag_masters.find(ctrl);
		if (index > -1){
			// if active view was destroyed, stop dnd
			if (DragControl._active && DragControl._active.webix_drag == index)
				DragControl._stopDrag();
			// if last target was destroyed, reset it and continue dnd
			if (DragControl._last && DragControl._last.webix_drop == index)
				DragControl._last = null;

			this._drag_masters[index] = null;
		}
	},
	_createTouchDrag: function(e){
		const dragCtrl = DragControl;
		const master = this._getActiveDragMaster();
		// for data items only
		if (master && master.$longTouchLimit){
			if (!dragCtrl._html && !dragCtrl.createDrag(e)) return;
			e.longtouch_drag = true;

			const pos = { x:e.x, y:e.y };
			const customPos = dragCtrl.$dragPos(pos, e);

			const ctx = dragCtrl._drag_context;
			dragCtrl._html.style.top= pos.y+dragCtrl.top+(customPos||!ctx.y_offset?0:ctx.y_offset)+"px";
			dragCtrl._html.style.left= pos.x+dragCtrl.left+(customPos||!ctx.x_offset?0:ctx.x_offset)+"px";
		}
	},
	/*
		register drag area
		@param node 	html node or ID
		@param ctrl 	options dnd master
	*/
	addDrag:function(node,ctrl){
		node = toNode(node);
		node.webix_drag=this._getCtrl(ctrl);
		_event(node,env.mouse.down,this._preStart,{ bind:node });
		_event(node,"dragstart",preventEvent);
	},
	//logic of drag - start, we are not creating drag immediately, instead of that we hears mouse moving
	_preStart:function(e){
		if (DragControl._active){
			//if we have nested drag areas, use the top one and ignore the inner one
			if (DragControl._saved_event == e) return;
			DragControl._preStartFalse(e);
			DragControl.destroyDrag(e);
		}
		DragControl._active = this;

		const evobj = env.mouse.context(e);
		DragControl._start_pos = evobj;
		DragControl._saved_event = e;

		const passive = env.touch ? { passive:false } : null;
		DragControl._webix_drag_mm = event(document.body,env.mouse.move,DragControl._startDrag,passive);
		DragControl._webix_drag_mu = event(document,env.mouse.up,DragControl._preStartFalse);

		//need to run here, or will not work in IE
		addCss(document.body,"webix_noselect", 1);
	},
	//if mouse was released before moving - this is not a dnd, remove event handlers
	_preStartFalse:function(e){
		DragControl._clean_dom_after_drag();
		DragControl._touch_animation = !e.cancelable;
	},
	//mouse was moved without button released - dnd started, update event handlers
	_startDrag:function(e){
		// check touch scroll animation
		DragControl._touch_animation = !e.cancelable;
		if (env.touch && DragControl._touch_animation){
			DragControl._clean_dom_after_drag();
			return DragControl.destroyDrag(e);
		}

		//prevent unwanted dnd
		var pos = env.mouse.context(e);
		var master = DragControl._getActiveDragMaster();

		// only long-touched elements can be dragged
		var longTouchLimit = (env.touch && master && master.$longTouchLimit && !Touch._long_touched);
		if (longTouchLimit || Math.abs(pos.x-DragControl._start_pos.x)<5 && Math.abs(pos.y-DragControl._start_pos.y)<5)
			return;

		if (!DragControl._html && !DragControl.createDrag(DragControl._saved_event))
			return DragControl._clean_dom_after_drag();
		DragControl._clean_dom_after_drag(true);

		DragControl.sendSignal("start"); //useless for now

		const passive = env.touch ? { passive:false } : null;
		DragControl._webix_drag_mm = event(document.body,env.mouse.move,DragControl._moveDrag,passive);
		DragControl._webix_drag_mu = event(document,env.mouse.up,DragControl._stopDrag);
		DragControl._moveDrag(e);
	},
	//mouse was released while dnd is active - process target
	_stopDrag:function(e){
		DragControl._clean_dom_after_drag();
		DragControl._saved_event = null;

		if (DragControl._last && e){	//if some drop target was confirmed
			DragControl.$drop(DragControl._active, DragControl._last, e);
			DragControl.$dragOut(DragControl._active, DragControl._last, null, e);
		}
		DragControl.destroyDrag(e);
		DragControl.sendSignal("stop");	//useless for now
	},
	_clean_dom_after_drag:function(still_drag){
		this._webix_drag_mm = eventRemove(this._webix_drag_mm);
		this._webix_drag_mu = eventRemove(this._webix_drag_mu);
		if (!still_drag)
			removeCss(document.body,"webix_noselect");
	},
	//dnd is active and mouse position was changed
	_moveDrag:function(e){
		var dragCtrl = DragControl;
		var pos = getPos(e);

		//give possibility to customize drag position
		var customPos = dragCtrl.$dragPos(pos, e);
		//adjust drag marker position
		var ctx = dragCtrl._drag_context;
		dragCtrl._html.style.top=pos.y+dragCtrl.top+(customPos||!ctx.y_offset?0:ctx.y_offset) +"px";
		dragCtrl._html.style.left=pos.x+dragCtrl.left+(customPos||!ctx.x_offset?0:ctx.x_offset)+"px";

		var evobj = e;
		if (dragCtrl._skip)
			dragCtrl._skip=false;
		else {
			if (env.touch){
				var context = env.mouse.context(e);
				var target = document.elementFromPoint(context.x, context.y);
				evobj = new Proxy(e, {
					get: function(obj, prop){
						if (prop === "target"){
							return target;
						}

						var res = obj[prop];
						if (typeof res === "function"){
							return res.bind(e);
						}
						return res;
					}
				});
			}
			dragCtrl._checkLand((evobj.target), evobj);
		}
		
		return preventEvent(e);
	},
	//check if item under mouse can be used as drop landing
	_checkLand:function(node,e){
		while (node && node.tagName!="BODY"){
			if (node.webix_drop){	//if drop area registered
				if (this._last && (this._last!=node || node.webix_master))	//if this area with complex dnd master
					this.$dragOut(this._active,this._last,node,e);			//inform master about possible mouse-out
				if (!this._last || this._last!=node || node.webix_master){	//if this is new are or area with complex dnd master
					this._last=null;										//inform master about possible mouse-in
					this._landing=this.$dragIn(DragControl._active,node,e);
					if (this._landing)	//landing was rejected
						this._last=node;
					return;				
				} 
				return;
			}
			node=node.parentNode;
		}
		if (this._last)	//mouse was moved out of previous landing, and without finding new one 
			this._last = this._landing = this.$dragOut(this._active,this._last,null,e);
	},
	//mostly useless for now, can be used to add cross-frame dnd
	sendSignal:function(signal){
		DragControl.active=(signal=="start");
		callEvent("onDragMode", [signal]);
	},
	
	//return master for html area
	getMaster:function(t){
		return this._drag_masters[t.webix_drag||t.webix_drop];
	},
	//return dhd-context object
	getContext:function(){
		return this._drag_context;
	},
	getNode:function(){
		return this._html;
	},
	//called when dnd is initiated, must create drag representation
	createDrag:function(e){ 
		var dragCtl = DragControl;
		var a=dragCtl._active;

		dragCtl._drag_context = {};
		var master = this._drag_masters[a.webix_drag];
		var drag_container;

		//if custom method is defined - use it
		if (master.$dragCreate){
			drag_container=master.$dragCreate(a,e);
			if (!drag_container) return false;
			this._setDragOffset(e);
			drag_container.style.position = "absolute";
		} else {
		//overvise use default one
			var text = dragCtl.$drag(a,e);
			dragCtl._setDragOffset(e);

			if (!text) return false;
			drag_container = document.createElement("DIV");
			drag_container.innerHTML=text;
			drag_container.className="webix_drag_zone";
			document.body.appendChild(drag_container);

			var context = dragCtl._drag_context;
			if (context.html && env.pointerevents){
				context.x_offset = -Math.round(drag_container.offsetWidth  * 0.5);
				context.y_offset = -Math.round(drag_container.offsetHeight * 0.75);
			}
		}
		/*
			dragged item must have topmost z-index
			in some cases item already have z-index
			so we will preserve it if possible
		*/
		drag_container.style.zIndex = Math.max(drag_container.style.zIndex,zIndex());

		DragControl._skipDropH = event(drag_container,env.mouse.move,DragControl._skip_mark);

		if (!DragControl._drag_context.from)
			DragControl._drag_context = {source:a, from:a};
		
		DragControl._html=drag_container;
		return true;
	},
	//helper, prevents unwanted mouse-out events
	_skip_mark:function(){
		DragControl._skip=true;
	},
	//after dnd end, remove all traces and used html elements
	destroyDrag:function(e){
		var a=DragControl._active;
		var master = this._drag_masters[a.webix_drag];

		if (master && master.$dragDestroy){
			DragControl._skipDropH = eventRemove(DragControl._skipDropH);
			if(DragControl._html)
				master.$dragDestroy(a,DragControl._html,e);
		} else
			remove(DragControl._html);

		if (master && master._auto_scroll_delay)
			master._auto_scroll_delay = window.clearTimeout(master._auto_scroll_delay);

		if (DragControl._dropHTML)
			remove(DragControl._dropHTML);

		DragControl._landing=DragControl._active=DragControl._last=DragControl._html=DragControl._dropHTML=null;
		DragControl._drag_context = null;
	},
	_getActiveDragMaster: function(){
		return DragControl._drag_masters[DragControl._active.webix_drag];
	},
	top:0,	 //relative position of drag marker to mouse cursor
	left:0,
	_setDragOffset:function(e){
		var dragCtl = DragControl;
		var pos = dragCtl._start_pos;
		var ctx = dragCtl._drag_context;

		if(typeof ctx.x_offset != "undefined" && typeof ctx.y_offset != "undefined")
			return null;

		ctx.x_offset = ctx.y_offset = 0;
		if(env.pointerevents){
			var m=DragControl._getActiveDragMaster();

			if (m._getDragItemPos && m!==this){
				var itemPos = m._getDragItemPos(pos,e);

				if(itemPos){
					ctx.x_offset = itemPos.x - pos.x;
					ctx.y_offset = itemPos.y - pos.y;
				}

			}

		}
	},
	$dragPos:function(pos, e){
		var m=this._drag_masters[DragControl._active.webix_drag];
		if (m.$dragPos && m!=this){
			m.$dragPos(pos, e, DragControl._html);
			return true;
		}
	},
	//called when mouse was moved in drop area
	$dragIn:function(s,t,e){
		var m=this._drag_masters[t.webix_drop];
		if (m.$dragIn && m!=this) return m.$dragIn(s,t,e);
		t.className=t.className+" webix_drop_zone";
		return t;
	},
	//called when mouse was moved out drop area
	$dragOut:function(s,t,n,e){
		var m=this._drag_masters[t.webix_drop];
		if (m.$dragOut && m!=this) return m.$dragOut(s,t,n,e);
		t.className=t.className.replace("webix_drop_zone","");
		return null;
	},
	//called when mouse was released over drop area
	$drop:function(s,t,e){
		var m=this._drag_masters[t.webix_drop];
		DragControl._drag_context.from = DragControl.getMaster(s);
		if (m.$drop && m!=this) return m.$drop(s,t,e);
		t.appendChild(s);
	},
	//called when dnd just started
	$drag:function(s,e){
		var m=this._drag_masters[s.webix_drag];
		if (m.$drag && m!=this) return m.$drag(s,e);
		return "<div style='"+s.style.cssText+"'>"+s.innerHTML+"</div>";
	}	
};

//global touch-drag handler
attachEvent("onLongTouch", function(ev){
	if(DragControl._active && !DragControl._touch_animation)
		DragControl._createTouchDrag(ev);
});


export default DragControl;