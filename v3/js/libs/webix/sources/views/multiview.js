import {remove} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {clone, extend, isUndefined} from "../webix/helpers";
import {_each} from "../ui/helpers";
import promise from "../thirdparty/promiz";
import {debug_size_box_start, debug_size_box_end} from "../webix/debug";
import {assert} from "../webix/debug";

import baselayout from "../views/baselayout";
import baseview from "../views/baseview";
import base from "../views/view";

import Settings from "../core/settings";
import animate from "../webix/animate";


// #include ui/view.js

const api = {
	name:"multiview",
	defaults:{
		animate:{
		}
	},
	setValue:function(val){
		$$(val).show();
	},
	getValue:function(){
		return this.getActiveId();
	},
	$init:function(){
		this._active_cell = 0;
		this._vertical_orientation = 1;
		this._viewobj.style.position = "relative";
		this._viewobj.className += " webix_multiview";
		this._back_queue = [];
	},
	_ask_render:function(cell_id, view_id){
		var cell = $$(cell_id);
		if (!cell._render_hash){
			cell._render_queue = [];
			cell._render_hash = {};			
		}
		if (!cell._render_hash[view_id]){
			cell._render_hash[view_id]=true;
			cell._render_queue.push(view_id);
		}
	},
	_render_activation:function(cell_id){ 
		var cell = $$(cell_id);
		if(this._settings.keepViews)
			cell._viewobj.style.display = "";
		/*back array*/
		if(this._back_queue[this._back_queue.length-2]!=cell_id){
			if(this._back_queue.length==10)
				this._back_queue.splice(0,1);
			this._back_queue.push(cell_id);
		}
		else 
			this._back_queue.splice(this._back_queue.length-1,1);	
		
		if (cell._render_hash){
			for (var i=0; i < cell._render_queue.length; i++){
				var subcell = $$(cell._render_queue[i]);
				//cell can be already destroyed
				if (subcell)
					subcell.render();
			}
				
			cell._render_queue = [];
			cell._render_hash = {};			
		}
	},
	addView:function(view, index){
		var inc = !isUndefined(index) && index <= this._active_cell ? 1 : 0;
		var id = baselayout.api.addView.apply(this, arguments);

		if(this._cells.length > 1){
			if(this._settings.keepViews)
				$$(id)._viewobj.style.display = "none";
			else
				remove($$(id)._viewobj);

			this._active_cell += inc;
		}

		return id;
	},
	_replace:function(view){
		if(!view._settings.borderless){
			const settings = clone(this._settings._inner);
			view._settings._inner = settings;
			let style = view._viewobj.style;
			style.borderTopWidth = style.borderBottomWidth = style.borderLeftWidth = style.borderRightWidth = "1px";
			this._fix_container_borders(style, settings);
		}
		baselayout.api._replace.apply(this, arguments);
	},
	_beforeRemoveView:function(index){
		//removing current view
		if (index == this._active_cell){
			var next = index ? index-1 : 1;
			if (this._cells[next]){
				this._animation_promise = null;
				this._show(this._cells[next], false);
			}
		}

		if (index < this._active_cell)
			this._active_cell--;
	},
	//necessary, as we want to ignore hide calls for elements in multiview
	_hide:function(){},
	_parse_cells:function(collection){
		collection = collection || this._collection; 

		for (let i=0; i < collection.length; i++)
			collection[i]._inner = this._settings.borderless?{top:1, left:1, right:1, bottom:1}:(this._settings._inner||{});

		baselayout.api._parse_cells.call(this, collection);

		for (let i=1; i < this._cells.length; i++){
			if(this._settings.keepViews)
				this._cells[i]._viewobj.style.display = "none";
			else
				remove(this._cells[i]._viewobj);
		}

		for (let i=0; i<collection.length; i++){
			var cell = this._cells[i];
			if (cell._cells && !cell._render_borders) continue;

			this._fix_container_borders(cell._viewobj.style, cell._settings._inner);

			cell._viewobj.setAttribute("role", "tabpanel");
		}
		this._render_activation(this.getActiveId());
	},
	cells_setter:function(value){
		assert(value && value.length,"Multiview must have at least one view in 'cells'");
		this._collection = value;
	},
	_getDirection:function(next, active){
		var dir = (this._settings.animate || {}).direction;
		var vx = (dir == "top" || dir == "bottom");
		return 	 next < active ? (vx?"bottom":"right"):(vx?"top":"left");
	},
	_show:function(obj, animation_options){
		const parent = this.getParentView();
		if (parent && parent.getTabbar){
			const tabBar = parent.getTabbar();
			tabBar.blockEvent();
			tabBar.setValue(obj._settings.$id || obj._settings.id);
			tabBar.unblockEvent();
		}

		if (this._animation_promise)
			return this._animation_promise.then(() => this._show.apply(this, arguments));

		var _next_cell = -1;
		for (var i=0; i < this._cells.length; i++)
			if (this._cells[i]==obj){
				_next_cell = i;
				break;
			}
		if (_next_cell < 0 || _next_cell == this._active_cell)
			return;


		var prev = this._cells[this._active_cell];
		var next = this._cells[ _next_cell ];
		prev.$getSize(0,0);

		//need to be moved in animate
		if((animation_options||typeof animation_options=="undefined")&&animate.isSupported() && this._settings.animate) {
			var aniset = extend({}, this._settings.animate);
			if(this._settings.keepViews)
				aniset.keepViews = true;
			aniset.direction = this._getDirection(_next_cell,this._active_cell);
			aniset = Settings._mergeSettings(animation_options||{}, aniset);

			var line = animate.formLine(
				next._viewobj,
				prev._viewobj,
				aniset);
			next.$getSize(0,0);
			next.$setSize(this._content_width,this._content_height);

			var callback_original = aniset.callback;
			aniset.callback = function(){
				animate.breakLine(line,this._settings.keepViews);
				this._animation_promise = null;
				aniset.wait_animation.resolve();
				if (callback_original) callback_original.call(this);
				callback_original = aniset.master = aniset.callback = null;
				this.resize();
			};
			aniset.master = this;

			this._active_cell = _next_cell;
			this._render_activation(this.getActiveId());

			animate(line, aniset);
			this._animation_promise = aniset.wait_animation = promise.defer();
		}
		else { // browsers which don't support transform and transition, or animate:false in config
			if(this._settings.keepViews){
				prev._viewobj.style.display = "none";
			}
			else{
				remove(prev._viewobj);
				this._viewobj.appendChild(this._cells[i]._viewobj);
			}

			this._active_cell = _next_cell;
			this.resizeChildren();
			this._render_activation(this.getActiveId());
		}

		if (next.callEvent){
			next.callEvent("onViewShow",[]);
			_each(next, this._signal_hidden_cells);
		}

		this.callEvent("onViewChange",[prev._settings.id, next._settings.id]);
		
	},
	$getSize:function(dx, dy){
		if (!this._cells.length) return baseview.api.$getSize.call(this, 0, 0);
		if (DEBUG) debug_size_box_start(this, true);
		var size = this._cells[this._active_cell].$getSize(0, 0);
		if (this._settings.fitBiggest){
			for (var i=0; i<this._cells.length; i++)
				if (i != this._active_cell){
					var other = this._cells[i].$getSize(0, 0);
					for (var j = 0; j < 4; j++)
						size[j] = Math.max(size[j], other[j]);
				}
		}


		//get layout sizes
		var self_size = baseview.api.$getSize.call(this, 0, 0);
		//use child settings if layout's one was not defined
		if (self_size[1] >= 100000) self_size[1]=0;
		if (self_size[3] >= 100000) self_size[3]=0;

		self_size[0] = (self_size[0] || size[0] ) +dx;
		self_size[1] = (self_size[1] || size[1] ) +dx;
		self_size[2] = (self_size[2] || size[2] ) +dy;
		self_size[3] = (self_size[3] || size[3] ) +dy;
		
		if (DEBUG) debug_size_box_end(this, self_size);
		
		return self_size;
	},
	$setSize:function(x,y){
		if (!this._cells.length) return;
		this._layout_sizes = [x,y];
		baseview.api.$setSize.call(this,x,y);
		this._cells[this._active_cell].$setSize(x,y);
	},
	isVisible:function(base_id, cell_id){
		if (cell_id && cell_id != this.getActiveId()){
			if (base_id)
				this._ask_render(cell_id, base_id);
			return false;
		}
		return base.api.isVisible.call(this, base_id, this._settings.id);
	},
	getActiveId:function(){
		return this._cells.length?this._cells[this._active_cell]._settings.id:null;
	},
	back:function(step){		
		step=step||1;
		if(this.callEvent("onBeforeBack",[this.getActiveId(), step])){
			if(this._back_queue.length>step){
				var viewId = this._back_queue[this._back_queue.length-step-1];
				$$(viewId).show();
				return viewId;
			}
			return null;
		}
		return null;

	},
	_insertBeforeView:function(view, before){
		if (this._settings.keepViews || (!before || before == this._cells[this._active_cell]))
			baselayout.api._insertBeforeView.call(this, view, before);
	}
};


const view = protoUI(api, baselayout.view);
export default {api, view};