import {protoUI} from "../ui/core";
import state from "../core/state";
import {$active} from "../webix/skin";

import {clone, extend} from "../webix/helpers";
import {debug_size_box_start, debug_size_box_end} from "../webix/debug";


import base from "./baselayout";
import baseview from "./baseview";
import viewA from "./view";

const api = {
	name:"layout",
	$init:function(){
		this._hiddencells = 0;
	},
	defaults:{
		type:"line"
	},
	_parse_cells:function(){
		if (this._parse_cells_ext)
			collection = this._parse_cells_ext(collection);

		if (!this._parse_once){
			this._viewobj.className += " webix_layout_"+(this._settings.type||"");
			this._parse_once = 1;
		}

		if (this._settings.margin !== undefined)
			this._margin = this._settings.margin;

		if (this._settings.padding !== undefined && typeof this._settings.padding !== "object" )
			this._padding.left = this._padding.right = this._padding.top = this._padding.bottom = this._settings.padding;
		if (this._settings.paddingX !== undefined)
			this._padding.left = this._padding.right = this._settings.paddingX;
		if (this._settings.paddingY !== undefined)
			this._padding.top = this._padding.bottom = this._settings.paddingY;
		if (typeof this._settings.padding === "object")
			extend(this._padding, this._settings.padding, true);

		if (this._padding.left || this._padding.right || this._padding.top || this._padding.bottom)
			this._padding.defined = true;

		//if layout has paddings we need to set the visible border 
		if (this._hasBorders() && !this._settings.borderless){
			this._contentobj.style.borderWidth="1px";
			//if layout has border - normal bordering rules are applied
			this._render_borders = true;
		}
	
		
		var collection = this._collection;
	
		if (this._settings.borderless)
			this._settings._inner = { top:true, left:true, right:true, bottom:true};

		this._beforeResetBorders(collection);
		base.api._parse_cells.call(this, collection);
		this._afterResetBorders(collection);
	},
	$getSize:function(dx, dy){
		dx=dx||0; dy=dy||0;

		var correction = this._margin*(this._cells.length-this._hiddencells-1);
		if (this._render_borders || this._hasBorders()){
			var _borders = this._settings._inner;
			if (_borders){
				dx += (_borders.left?0:1)+(_borders.right?0:1);
				dy += (_borders.top?0:1)+(_borders.bottom?0:1);
			}
		}

		if (!this._settings.height)
			dy += this._padding.top + this._padding.bottom + (this._vertical_orientation ? correction : 0);

		if (!this._settings.width)
			dx += this._padding.left + this._padding.right + (this._vertical_orientation ? 0 : correction);
				
		return base.api.$getSize.call(this, dx, dy);
	},
	$setSize:function(x,y){
		this._layout_sizes = [x,y];
		if (DEBUG) debug_size_box_start(this);

		if (this._hasBorders()||this._render_borders)
			viewA.api.$setSize.call(this,x,y);
		else	
			baseview.api.$setSize.call(this,x,y);

		//form with scroll
		y = this._content_height;
		x = this._content_width;

		var config = this._settings;
		if (config.scroll){
			y = Math.max(y, this._desired_size[1]);
			x = Math.max(x, this._desired_size[0]);
		}
		
		this._set_child_size(x, y);

		if (DEBUG) debug_size_box_end(this, [x,y]);
	},
	_set_child_size:function(x,y){
		var correction = this._margin*(this._cells.length-this._hiddencells-1);

		y -= this._padding.top + this._padding.bottom;
		x -= this._padding.left + this._padding.right;
		if (this._vertical_orientation)
			y-=correction;
		else x-=correction;

		return base.api._set_child_size.call(this, x, y);
	},
	resizeChildren:function(structure_changed){ 
		if (structure_changed){
			this._last_size = null; //forces children resize
			var config = [];
			for (var i = 0; i < this._cells.length; i++){
				var cell = this._cells[i];
				config[i] = cell._settings;
				var n = ((cell._layout_sizes && !cell._render_borders) || cell._settings.borderless)?"0px":"1px";

				cell._viewobj.style.borderTopWidth=cell._viewobj.style.borderBottomWidth=cell._viewobj.style.borderLeftWidth=cell._viewobj.style.borderRightWidth=n;
			}
			
			this._beforeResetBorders(config);
			for (let i=0; i<config.length; i++)
				if (config[i].borderless && this._cells[i]._set_inner)
					this._cells[i]._set_inner(config[i]);
			this._afterResetBorders(this._cells);
		}

		if (state._responsive_tinkery) return;
		base.api.resizeChildren.call(this);
	},
	_hasBorders:function(){
		return this._padding.defined && this._margin>0 && !this._cleanlayout;
	},
	_beforeResetBorders:function(collection){
		if (this._hasBorders() && (!this._settings.borderless || this._settings.type == "space")){
			for (let i=0; i < collection.length; i++){
				if (!collection[i]._inner || !collection[i].borderless)
					collection[i]._inner={ top:false, left:false, right:false, bottom:false};
			}
		} else {
			for (let i=0; i < collection.length; i++)
				collection[i]._inner=clone(this._settings._inner);
			var mode = false;
			if (this._cleanlayout)
				mode = true;
				
			var maxlength = collection.length;				
			if (this._vertical_orientation){
				for (let i=1; i < maxlength-1; i++)
					collection[i]._inner.top = collection[i]._inner.bottom = mode;
				if (maxlength>1){
					if (this._settings.type!="head")
						collection[0]._inner.bottom = mode;

					while (collection[maxlength-1].hidden && maxlength>1)
						maxlength--;
					if (maxlength>0)
						collection[maxlength-1]._inner.top = mode;
				}
			}
			else {
				for (let i=1; i < maxlength-1; i++)
					collection[i]._inner.left = collection[i]._inner.right= mode;
				if (maxlength>1){
					if (this._settings.type!="head")
						collection[0]._inner.right= mode;
					collection[maxlength-1]._inner.left = mode;

					while (maxlength>1 && collection[maxlength-1].hidden)
						maxlength--;
					if (maxlength>0)
						collection[maxlength-1]._inner.left = mode;
				}
			}

		}
	},
	_afterResetBorders:function(collection){
		var start = 0; 
		for (let i=0; i<collection.length; i++){
			var cell = this._cells[i];

			var s_inner = cell._settings._inner;
			if (cell._settings.hidden && this._cells[i+1]){
				var s_next = this._cells[i+1]._settings._inner;
				if (!s_inner.top)
					s_next.top = false;
				if (!s_inner.left)
					s_next.left = false;

				if (i==start) start++;
			}
			this._fix_container_borders(cell._viewobj.style, cell._settings._inner);
		}

		var style = this._vertical_orientation?"marginLeft":"marginTop";
		var contrstyle = this._vertical_orientation?"marginTop":"marginLeft";
		var padding = this._vertical_orientation?this._padding.left:this._padding.top;
		var contrpadding = this._vertical_orientation?this._padding.top:this._padding.left;

		//add top offset to all
		for (let i=0; i<collection.length; i++)
			this._cells[i]._viewobj.style[style] = padding + "px";

		//add left offset to first cell
		if (this._cells.length)
			this._cells[start]._viewobj.style[contrstyle] = contrpadding + "px";

		//add offset between cells
		for (var index=start+1; index<collection.length; index++)
			this._cells[index]._viewobj.style[contrstyle]=this._margin+"px";
		
	},
	type_setter:function(value){
		this._margin = (typeof this._margin_set[value] !== "undefined"? this._margin_set[value]: this._margin_set["line"]);
		this._padding.left = this._padding.right = this._padding.top = this._padding.bottom =
			(typeof this._margin_set[value] !== "undefined") ? this._padding_set[value] : this._padding_set["line"];
		this._cleanlayout = (value=="material" || value=="clean");
		if (value == "material")
			this._settings.borderless = true;

		return value;
	},
	$skin:function(){
		this._margin_set = $active.layoutMargin;
		this._padding_set = $active.layoutPadding;
	}
};

const view = protoUI(api, base.view);
export default { api, view };

//not necessary anymore
//preserving for backward compatibility
view.call(-1);