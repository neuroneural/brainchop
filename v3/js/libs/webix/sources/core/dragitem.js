import {pos, offset} from "../webix/html";
import {use} from "../services";
import env from "../webix/env";
import Touch from "../core/touch";
import {extend, delay, _power_array, isArray} from "../webix/helpers";
import {assert} from "../webix/debug";
import DragControl from "../core/dragcontrol";
import AutoScroll from "../core/autoscroll";


/*
	Behavior:DragItem - adds ability to move items by dnd
	
	dnd context can have next properties
		from - source object
		to - target object
		source - id of dragged item(s)
		target - id of drop target, null for drop on empty space
		start - id from which DND was started
*/

const DragItem ={
	//helper - defines component's container as active zone for dragging and for dropping
	_initHandlers:function(obj, source, target){
		if (!source) DragControl.addDrop(obj._contentobj,obj,true);
		if (!target) DragControl.addDrag(obj._contentobj,obj);
		this.attachEvent("onDragOut",function(a,b){ this.$dragMark(a,b); });
		this.attachEvent("onBeforeAutoScroll",function(){
			var context = DragControl.getContext();
			return !!(DragControl._active && context && (context.to === this || this._auto_scroll_force));
		});
	},
	drag_setter:function(value){
		if (value){
			extend(this, AutoScroll, true);
			if (value == "order" || value == "move")
				extend(this, use("DragOrder"), true);
			if (value == "inner" || value == "order")
				this._inner_drag_only = true;

			this._initHandlers(this, value == "source", value == "target");
			delete this.drag_setter;	//prevent double initialization
		}
		return value;
	},
	/*
		s - source html element
		t - target html element
		d - drop-on html element ( can be not equal to the target )
		e - native html event 
	*/
	//called when drag moved over possible target
	$dragIn:function(s,t,e){
		var id = this.locate(e) || null;
		var context = DragControl._drag_context;

		//in inner drag mode - ignore dnd from other components
		if ((this._inner_drag_only || context.from._inner_drag_only) && context.from !== this) return false;

		var to = DragControl.getMaster(t);
		//previous target
		var html = (this.getItemNode(id, e)||this._dataobj);
		//prevent double processing of same target
		if (html == DragControl._landing) return html;
		context.target = id;
		context.to = to;

		if (this._auto_scroll_delay)
			this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);

		const fragile = (this.addRowCss && env.touch && !this._settings.prerender);
		if (this._settings.dragscroll !== false  && !fragile)
			this._auto_scroll_delay = delay(function(pos,id){
				this._drag_pause(id);
				this._auto_scroll(pos,id);
			}, this, [pos(e), id], 250);

		if (!this.$dropAllow(context, e)  || !this.callEvent("onBeforeDragIn",[context, e])){
			context.to = context.target = null;
			if (this._auto_scroll_delay)
				this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);
			return null;
		}
		//mark target only when landing confirmed
		this.$dragMark(context,e);
		return html;
	},
	$dropAllow:function(){
		return true;
	},
	_drag_pause:function(){
		//may be reimplemented in some components
		// tree for example
	},
	_target_to_id:function(target){
		return target && typeof target === "object" ? target.toString() : target;
	},
	//called when drag moved out from possible target
	$dragOut:function(s,t,n,e){
		var id = (this._viewobj.contains(n) ? this.locate(e): null) || null;
		var context = DragControl._drag_context;

		//still over previous target
		if ((context.target||"").toString() == (id||"").toString()) return null;
		if (this._auto_scroll_delay)
			this._auto_scroll_delay = window.clearTimeout(this._auto_scroll_delay);

		//unmark previous target
		context.target = context.to = null;
		this.callEvent("onDragOut",[context,e]);
		return null;
	},
	//called when drag moved on target and button is released
	$drop:function(s,t,e){
		var context = DragControl._drag_context;
		//finalize context details
		context.to = this;
		this._define_index(s,t,context);

		//unmark last target
		this.$dragMark({}, e);

		if( context.from && context.from != context.to && context.from.callEvent ){
			if(!context.from.callEvent("onBeforeDropOut", [context,e]))
				return;
		}

		if (!this.callEvent("onBeforeDrop",[context,e])) return;
		//moving
		this._context_to_move(context,e);
		
		this.callEvent("onAfterDrop",[context,e]);
	},
	_define_index:function(s,t,context){
		var target = this._target_to_id(context.target);

		if (this.getBranchIndex){
			if (target){
				context.parent = this.getParentId(target);
				context.index = this.getBranchIndex(target);
			} else context.index = -1;
		} else
			context.index = target?this.getIndexById(target):this.count();
	},
	_context_to_move:function(context){
		assert(context.from, "Unsopported d-n-d combination");
		if (context.from && context.from.move){	//from different component with item dnd
			var details = { parent: context.parent, mode: context.pos };
			context.from.move(context.source,context.index,context.to, details);
		}
	},
	$longTouchLimit: true,
	_getDragItemPos: function(pos,e){
		if (this.getItemNode){
			var id = this.locate(e, true);
			//in some case, node may be outiside of dom ( spans in datatable for example )
			//so getItemNode can return null
			var node = id ? this.getItemNode(id) : null;
			return node ? offset(node) : node;
		}
	},
	//called when drag action started
	$drag:function(s,e){
		var id = this.locate(e, true);
		if (id){
			var list = [id];

			if (this.getSelectedId){ //has selection model
				//if dragged item is one of selected - drag all selected
				var selection = this.getSelectedId(true, true);	

				if (selection && selection.length > 1 && _power_array.find.call(selection,id)!=-1){
					var hash = {}; 
					list = [];
					for (let i=0;i<selection.length; i++)
						hash[selection[i]]=true;
					for (let i = 0; i<this.data.order.length; i++){
						var hash_id = this.data.order[i];
						if (hash[hash_id])
							list.push(hash_id);
					}
				}
			}
			//save initial dnd params
			var context = DragControl._drag_context= { source:list, start:id };
			context.from = this;

			if (this.callEvent("onBeforeDrag",[context,e])){
				if (env.touch && this._touch_scroll == "touch")
					delay(function(){ Touch._start_context = null; });

				//set drag representation
				return context.html||this.$dragHTML(this.getItem(id), e, context);
			}
		}
		return null;
	},
	$dragHTML:function(obj,e,context){
		let html = this._toHTML(obj);
		if ( isArray(context.source) && context.source.length > 1 )
			html = this._toMultipleHTML(html, context.source.length);
		return html;
	},
	_toMultipleHTML:function(html, len){
		html = "<div class='webix_drag_main'>"+html+"</div>";
		let multiple = "<div class='webix_drag_multiple'></div>";
		if ( len > 2 )
			multiple = "<div class='webix_drag_multiple_last'></div>" + multiple;
		return multiple+html+"<span class='webix_badge'>"+len+"</span>";
	},
	$dragMark:function(context){
		var target = null;
		if (context.target)
			target = this._target_to_id(context.target);

		//touch webkit will stop touchmove event if source node removed
		if (this._marked && this._marked != target){
			this._remove_css([this._marked], "webix_drag_over", true);
			this._marked = null;
		}

		if (!this._marked && target){
			this._marked = target;
			this._add_css([target], "webix_drag_over", true);
			return target;
		}
		
		return !!context.to;
	},
	_add_css:function(source, css){
		for (let i=0; i<source.length; i++)
			this.addCss(source[i], css);
	},
	_remove_css:function(source, css){
		for (let i=0; i<source.length; i++)
			this.removeCss(source[i], css);
	},

	// methods used in order/move modes
	$dropHTML: function(){
		return "";
	},
	_set_drop_area:function(target, t){
		const node = this.getItemNode(target);
		if (node){
			node.parentNode.insertBefore(DragControl._dropHTML[0], node);
		} else t.children[0].appendChild(DragControl._dropHTML[0]);
	}
};

export default DragItem;