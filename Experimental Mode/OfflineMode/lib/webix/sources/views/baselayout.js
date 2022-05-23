import {assert} from "../webix/debug";
import {debug_size_box_start, debug_size_box_end} from "../webix/debug";

import {callEvent} from "../webix/customevents";
import {insertBefore, remove} from "../webix/html";
import {extend, _power_array, isUndefined, copy} from "../webix/helpers";
import {_each} from "../ui/helpers";

import {$$,ui,protoUI} from "../ui/core";

import state from "../core/state";
import IdSpace from "../core/idspace";
import EventSystem from "../core/eventsystem";

import base from "./baseview";

const api = {
	name:"baselayout",
	restore:function(state, factory, configOnly){
		var out = this._restore(copy(state), factory);
		if (configOnly)
			return out;
		else
			ui((out.cols || out.rows), this);
	},
	_restore:function(state, factory){
		if (state.$layout){
			var sub = state.cols || state.rows;
			for (var i = 0; i < sub.length; i++) {
				sub[i] = this._restore(sub[i], factory);
			}
		} else {
			return factory.call(this, state);
		}

		return state;
	},
	serialize:function(serializer){
		var out = [];
		var childs = this.getChildViews();

		for (var i=0; i<childs.length; i++){
			var sub = childs[i];
			if (sub.movePortlet){
				var child = sub.getChildViews();
				out.push(serializer.call(this, child[child.length-1]));
			} else if (sub.serialize){
				// some kind of layout
				out.push(sub.serialize(serializer, true));
			} else {
				// leaf view
				out.push(serializer.call(this, sub));
			}
		}

		var obj = { $layout: true, type: this.config.type };
		if (this.config.rows)
			obj.rows = out;
		else
			obj.cols = out;

		return obj;
	},
	$init:function(config){
		this.$ready.push(this._parse_cells);
		this._dataobj  = this._contentobj;
		this._layout_sizes = [];
		this._responsive = [];
		this._padding = { top:0, left:0, right:0, bottom:0 };

		if (config.$topView){
			config.borderless = true;
			config._inner = { top:true, left:true, bottom:true, right:true };
		}

		if (config.isolate)
			extend(this, IdSpace);
	},
	rows_setter:function(value){
		this._vertical_orientation = 1;
		this._collection = value;
		return true;
	},
	cols_setter:function(value){
		this._vertical_orientation = 0;
		this.$view.style.whiteSpace = "nowrap";
		this._collection = value;
		return true;
	},
	_remove:function(view){
		var index = _power_array.find.call(this._cells, view);
		if(this._beforeRemoveView)
			this._beforeRemoveView(index);
		_power_array.removeAt.call(this._cells, index);
		this._fix_hidden_cells(true);
	},
	_fix_hidden_cells(resize){
		this._hiddencells = 0;
		for (let i = 0; i < this._cells.length; i++){
			const cell = this._cells[i];
			if (cell._settings.hidden || cell.$nospace)
				this._hiddencells++;
		}

		if (resize)
			this.resizeChildren(true);
	},
	_replace:function(new_view,target_id){
		if (isUndefined(target_id)){
			for (var i=0; i < this._cells.length; i++)
				this._cells[i].destructor();
			this._collection = new_view;
			this._parse_cells();
		} else {
			var source;
			if (typeof target_id == "number"){
				if (target_id<0 || target_id > this._cells.length)
					target_id = this._cells.length;
				_power_array.insertAt.call(this._cells, new_view, target_id);
				if (!new_view._settings.hidden)
					this._insertBeforeView(new_view, this._cells[target_id]);
			} else {
				source = $$(target_id);
				target_id = _power_array.find.call(this._cells, source);
				assert(target_id!=-1, "Attempt to replace the non-existing view");
				if (!new_view._settings.hidden)
					this._insertBeforeView(new_view, source);
				source.destructor();	
				this._cells[target_id] = new_view;
			}

			if (!this._vertical_orientation)
				this._fix_vertical_layout(new_view);
		}
		this._fix_hidden_cells(true);

		var form = this.elements ? this : this.getFormView();
		if (form && !this._fill_data) form._recollect_elements();

		callEvent("onReconstruct",[this]);
	},
	_fix_vertical_layout:function(cell){
		cell._viewobj.style.display = "inline-block";
		cell._viewobj.style.verticalAlign = "top";
	},
	addView:function(view, index){
		if (isUndefined(index))
			index = this._cells.length;
		var top = this.$$ ? this : this.getTopParentView();
		
		state._parent_cell = this;
		var newui = (top && top.ui) ? top.ui(view, this, index) : ui(view, this, index);
		state._parent_cell = null;

		return newui._settings.id;
	},
	removeView:function(id){
		var view;
		if (typeof id != "object")
			view = $$(id) || (this.$$ ? this.$$(id) : null);
		else
			view = id;

		var target = _power_array.find.call(this._cells, view);
		if (target >= 0){
			if (this._beforeRemoveView)
				this._beforeRemoveView(target, view);

			var form = this.elements ? this : this.getFormView();

			this._cells.splice(target, 1);
			if (form)
				_each(view, function(sub){
					if (sub.name)
						delete form.getCleanValues()[sub.config.name];
				}, form, true);				

				
			view.destructor();
			this._fix_hidden_cells(true);
			
			if (form)
				form._recollect_elements();
		} else
			assert(false, "Attemp to remove not existing view: "+id);

		callEvent("onReconstruct",[this]);
	},
	reconstruct:function(){
		this._hiddencells = 0;
		this._replace(this._collection);
	},
	_hide:function(obj, settings, silent){
		if (obj._settings.hidden) return;
		obj._settings.hidden = true;
		remove(obj._viewobj);
		this._hiddencells++;
		if (!silent && !state._ui_creation)
			this.resizeChildren(true);	
	},
	_signal_hidden_cells:function(view){
		if (view.callEvent)
			view.callEvent("onViewShow",[]);
	},
	resizeChildren:function(){
		if (state._freeze_resize) return;

		if (this._layout_sizes){
			var parent = this.getParentView();
			if (parent){
				if (parent.resizeChildren)
					return parent.resizeChildren();
				else
					return parent.resize();
			}
				
			var sizes = this.$getSize(0,0);

			var x,y,nx,ny;
			nx = x = this._layout_sizes[0] || 0;
			ny = y = this._layout_sizes[1] || 0;

			//for auto-fill content, use adjust strategy
			if ((sizes[1]>=100000 || sizes[3] >= 100000) && this._viewobj.parentNode){
				//in hidden container adjust doesn't work, so fallback to last known size
				//also, ensure that min-size is not violated
				nx = x = Math.max(sizes[0], (this._settings.width || this._viewobj.parentNode.offsetWidth || x || 0));
				ny = y = Math.max(sizes[2], (this._settings.height || this._viewobj.parentNode.offsetHeight || y || 0));
			}
			
			if (!parent){
				//minWidth
				if (sizes[0]>x) nx = sizes[0];
				//minHeight
				if (sizes[2]>y) ny = sizes[2];

				var fullscreen = (this._viewobj.parentNode == document.body) && !this.setPosition;
				//maxWidth rule
				if (!fullscreen && x>sizes[1]) nx = sizes[1];
				//maxHeight rule
				if (!fullscreen && y>sizes[3]) ny = sizes[3];

				this.$setSize(nx,ny);
			} else
				this._set_child_size(x,y);

			if (state._responsive_exception){
				state._responsive_exception = false;
				this.resizeChildren();
			}

			callEvent("onResize",[]);
		}
	},
	getChildViews:function(){
		return this._cells;
	},
	index:function(obj){
		if (obj._settings)
			obj = obj._settings.id;
		for (var i=0; i < this._cells.length; i++)
			if (this._cells[i]._settings.id == obj)
				return i;
		return -1;
	},
	_insertBeforeView:function(view, before){
		if (before){
			if (before._settings.hidden || view === before){
				//index of sibling cell, next to which new item will appear
				var index = this.index(before)+1;
				//locate nearest visible cell
				while (this._cells[index] && this._cells[index]._settings.hidden) index++;
				before = this._cells[index] ? this._cells[index]._viewobj : null;
			} else {
				before = before._viewobj;
			}
		}
		insertBefore(view._viewobj, before, (this._dataobj||this._viewobj));
	},
	_show:function(obj, settings, silent){
		if (!obj._settings.hidden) return;
		this._insertBeforeView(obj, obj);
		obj._settings.hidden = false;

		this._hiddencells--;

		if (!silent){
			this.resizeChildren(true);
			if (obj.refresh)
				obj.refresh();
		}

		if (obj.callEvent){
			obj.callEvent("onViewShow", []);
			_each(obj, this._signal_hidden_cells);
		}
	},
	showBatch:function(name, mode){
		var preserve = typeof mode != "undefined";
		mode = mode !== false;

		if (!preserve){
			if (this._settings.visibleBatch == name ) return;
			this._settings.visibleBatch = name;
		} else 
			this._settings.visibleBatch = "";

		var show = [];
		for (let i=0; i < this._cells.length; i++){
			if (!this._cells[i]._settings.batch && !this._cells[i]._settings.hidden) 
				show.push(this._cells[i]);
			else if (this._cells[i]._settings.batch == name){
				if (mode)
					show.push(this._cells[i]);
				else
					this._hide(this._cells[i], null, true);
			} else if (!preserve)
				this._hide(this._cells[i], null, true);
		}

		for (let i=0; i < show.length; i++){
			this._show(show[i], null, true);
			show[i]._render_hidden_views();
		}
			
		this.resizeChildren(true);
	},
	_parse_cells:function(collection){
		this._cells=[];

		assert(collection,this.name+" was incorrectly defined. <br><br> You have missed rows|cols|cells|elements collection"); 
		for (var i=0; i<collection.length; i++){
			state._parent_cell = this;
			if (!collection[i]._inner)
				collection[i].borderless = true;

			this._cells[i]=ui._view(collection[i], this);
			if (!this._vertical_orientation)
				this._fix_vertical_layout(this._cells[i]);
			
			if (this._settings.visibleBatch && this._settings.visibleBatch != this._cells[i]._settings.batch && this._cells[i]._settings.batch){
				this._cells[i]._settings.hidden = true;
			}
			
			if (!this._cells[i]._settings.hidden){
				(this._dataobj||this._contentobj).appendChild(this._cells[i]._viewobj);
			}
		}

		this._fix_hidden_cells();
		if (this._parse_cells_ext_end)
			this._parse_cells_ext_end(collection);	
	},
	_fix_container_borders:function(style, inner){
		if (inner.top) 
			style.borderTopWidth="0px";
		if (inner.left) 
			style.borderLeftWidth="0px";
		if (inner.right) 
			style.borderRightWidth="0px";
		if (inner.bottom) 
			style.borderBottomWidth="0px";
	},
	_bubble_size:function(prop, size, vertical){
		if (this._vertical_orientation != vertical)
			for (var i=0; i<this._cells.length; i++){
				this._cells[i]._settings[prop] = size;
				if (this._cells[i]._bubble_size)
					this._cells[i]._bubble_size(prop, size, vertical);
			}
	},
	$getSize:function(dx, dy){
		if (DEBUG) debug_size_box_start(this, true);
		var minWidth = 0; 
		var maxWidth = 100000;
		var maxHeight = 100000;
		var minHeight = 0;
		if (this._vertical_orientation) maxHeight=0; else maxWidth = 0;
		
		var fixed = 0;
		var fixed_count = 0;
		var gravity = 0;
		this._sizes=[];

		for (var i=0; i < this._cells.length; i++) {
			//ignore hidden cells
			if (this._cells[i]._settings.hidden)
				continue;
			
			var sizes = this._sizes[i] = this._cells[i].$getSize(0,0);

			if (this._cells[i].$nospace){
				fixed_count++;
				continue;
			}

			if (this._vertical_orientation){
				//take max minSize value
				if (sizes[0]>minWidth) minWidth = sizes[0];
				//take min maxSize value
				if (sizes[1]<maxWidth) maxWidth = sizes[1];
				
				minHeight += sizes[2];
				maxHeight += sizes[3];

				if (sizes[2] == sizes[3] && sizes[2] != -1){ fixed+=sizes[2]; fixed_count++; }
				else gravity += sizes[4];
			} else {
				//take max minSize value
				if (sizes[2]>minHeight) minHeight = sizes[2];
				//take min maxSize value
				if (sizes[3]<maxHeight) maxHeight = sizes[3];
				
				minWidth += sizes[0];
				maxWidth += sizes[1];

				if (sizes[0] == sizes[1] && sizes[0] != -1){ fixed+=sizes[0]; fixed_count++; }
				else gravity += sizes[4];
			}
		}

		if (minHeight>maxHeight)
			maxHeight = minHeight;
		if (minWidth>maxWidth)
			maxWidth = minWidth;

		this._master_size = [fixed, this._cells.length - fixed_count, gravity];
		this._desired_size = [minWidth+dx, minHeight+dy];

		//get layout sizes
		var self_size = base.api.$getSize.call(this, 0, 0);
		//use child settings if layout's one was not defined
		if (self_size[1] >= 100000) self_size[1]=0;
		if (self_size[3] >= 100000) self_size[3]=0;

		self_size[0] = (self_size[0] || minWidth ) +dx;
		self_size[1] = Math.max(self_size[0], (self_size[1] || maxWidth ) +dx);
		self_size[2] = (self_size[2] || minHeight) +dy;
		self_size[3] = Math.max(self_size[2], (self_size[3] || maxHeight) +dy);

		if (DEBUG) debug_size_box_end(this, self_size);

		if (!this._vertical_orientation && this._settings.responsive)
			self_size[0] = 0;

		return self_size;
	},
	$setSize:function(x,y){
		this._layout_sizes = [x,y];
		if (DEBUG) debug_size_box_start(this);

		base.api.$setSize.call(this,x,y);
		this._set_child_size(x,y);

		if (DEBUG) debug_size_box_end(this, [x,y]);
	},
	_set_child_size_a:function(sizes, min, max){
		min = sizes[min]; max = sizes[max];
		var height = min;

		if (min != max){
			var ps = this._set_size_delta * sizes[4]/this._set_size_gravity;
			if (ps < min){
				height = min;
				this._set_size_gravity -= sizes[4]; 
				this._set_size_delta -= height;
			} else  if (ps > max){
				height = max;
				this._set_size_gravity -= sizes[4]; 
				this._set_size_delta -= height;
			} else {
				return -1;
			}
		}

		return height;
	},
	_responsive_hide:function(cell, mode){
		var target =  $$(mode);

		if (target === "hide" || !target){
			cell.hide();
			cell._responsive_marker = "hide";
		} else{
			//for SideBar in Webix 1.9
			if (!target)
				target = ui({ view:"popup", body:[{}]});

			cell._responsive_width = cell._settings.width;
			cell._responsive_height = cell._settings.height;
			cell._responsive_marker = target._settings.id;
			cell._settings.width = 0;
			if (!cell._settings.height)
				cell._settings.autoheight = true;

			ui(cell, target, this._responsive.length);
		}

		this._responsive.push(cell);
	},
	_responsive_show:function(cell){
		var target = cell._responsive_marker;
		cell._responsive_marker = 0;

		if (target === "hide" || !target){
			cell.show();
		} else {
			cell._settings.width = cell._responsive_width;
			cell._settings.height = cell._responsive_height;
			delete cell._settings.autoheight;

			var index = 0;
			while (this._cells[index] && this._cells[index]._settings.responsiveCell === false) index++;
			ui(cell, this, index);
		}
		this._responsive.pop();
	},
	_responsive_cells:function(x){
		state._responsive_tinkery = true;
		if (x + this._padding.left + this._padding.right + this._margin * (this._cells.length-1)< this._desired_size[0]){
			var max = this._cells.length - 1;
			for (var i = 0; i < max; i++){
				let cell = this._cells[i];
				if (!cell._responsive_marker){
					if (cell._settings.responsiveCell !== false){
						this._responsive_hide(cell, this._settings.responsive);
						callEvent("onResponsiveHide", [cell._settings.id]);
						state._responsive_exception = true;
						break;
					} else {
						max = this._cells.length;
					}
				}
			}
		} else  if (this._responsive.length){
			let cell = this._responsive[this._responsive.length-1];
			var dx = cell._responsive_marker == "hide" ? 0 : cell._responsive_width;
			var px = cell.$getSize(dx,0);
			if (px[0] + this._desired_size[0] + this._margin + 20 <= x ){
				this._responsive_show(cell);
				callEvent("onResponsiveShow", [cell._settings.id]);
				state._responsive_exception = true;
			}
		}

		state._responsive_tinkery = false;
	},
	_set_child_size:function(x,y){ 
		state._child_sizing_active = (state._child_sizing_active||0)+1;

		if (!this._vertical_orientation && this._settings.responsive)
			this._responsive_cells(x,y);


		this._set_size_delta = (this._vertical_orientation?y:x) - this._master_size[0];
		this._set_size_gravity = this._master_size[2];
		let width = x; let height = y;

		var auto = [];
		for (let i=0; i < this._cells.length; i++){
			//ignore hidden cells
			if (this._cells[i]._settings.hidden || !this._sizes[i])
				continue;

			let sizes = this._sizes[i];

			if (this._vertical_orientation){
				height = this._set_child_size_a(sizes,2,3);
				if (height < 0)	{ auto.push({oldIndex:i, view:this._cells[i]}); continue; }
			} else {
				width = this._set_child_size_a(sizes,0,1);
				if (width < 0)	{ auto.push({oldIndex:i, view:this._cells[i]}); continue; }
			}
			this._cells[i].$setSize(width,height);
		}

		for (let i = 0; i < auto.length; i++){
			var index = auto[i].oldIndex;
			let sizes = this._sizes[index];
			var dx = Math.round(this._set_size_delta * sizes[4]/this._set_size_gravity);
			this._set_size_delta -= dx; this._set_size_gravity -= sizes[4];
			if (this._vertical_orientation)
				height = dx;
			else {
				width = dx;
			}

			auto[i].view.$setSize(width,height);
		}

		state._child_sizing_active -= 1;
	},
	_next:function(obj, mode){
		var index = this.index(obj);
		if (index == -1) return null;
		return this._cells[index+mode];
	}, 
	_first:function(){
		return this._cells[0];
	}
};

const view = protoUI(api, EventSystem, base.view);
export default { api, view };