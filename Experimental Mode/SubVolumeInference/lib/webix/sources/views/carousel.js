import {protoUI, ui, $$} from "../ui/core";
import {copy, extend, bind} from "../webix/helpers";
import {_each} from "../ui/helpers";
import animate from "../webix/animate";
import {assert} from "../webix/debug";
import {attachEvent, detachEvent} from "../webix/customevents";

import state from "../core/state";
import Touch from "../core/touch";

import base from "../views/view";
import baseview from "../views/baseview";

import EventSystem from "../core/eventsystem";
import NavigationButtons from "../core/navigationbuttons";


const api = {
	name:"carousel",
	defaults:{
		scrollSpeed:"300ms",
		type: "clean",
		navigation: {},
		animate:true
	},
	$init:function(){
		this._viewobj.className += " webix_carousel";
		this._layout = null;
		this._dataobj = null;
		this._active_cell = 0;
		this.$ready.unshift(this._initLayout);
		this.$ready.push(this._after_init_call);
	},
	addView: function(view, index){
		var t = this._layout.addView(view, index);
		this._fix_after_view_add();
		return t;
	},
	removeView: function(id){
		this._layout.removeView(id);
		this._fix_after_view_add();
	},
	_replace: function(new_view,target_id){
		this._layout._replace(new_view, target_id);
		this._fix_after_view_add();
	},
	_fix_after_view_add: function(){
		this._cells = this._layout._cells;
		this._renderPanel();
		this.setActiveIndex(Math.min(this._active_cell, this._cells.length-1));
	},
	_initLayout: function(){
		if(this._layout && this._layout.destructor)
			this._layout.destructor();

		var layout = "";

		if(this.config.cols){
			layout = "cols";
			this._vertical_orientation = 0;
		}
		else{
			layout = "rows";
			this._vertical_orientation = 1;
		}

		var config = {borderless: true, type: "clean"};
		config[layout] = copy(this._settings[layout]);
		var layoutProp = ["type", "margin", "marginX", "marginY", "padding", "paddingX", "paddingY"];
		var layoutConfig = {};
		for(var i=0; i< layoutProp.length; i++){
			if(this._settings[layoutProp[i]]){
				layoutConfig[layoutProp[i]] = this._settings[layoutProp[i]];
			}
		}
		extend(config,layoutConfig,true);

		state._parent_cell = this;
		this._layout = ui._view(config);

		this._viewobj.appendChild(this._layout._viewobj);
		this._cells = this._layout._cells;

		this._layout._show = bind(api._show,this);
		this._layout.adjustScroll = bind(api.adjustScroll,this);

		const e1 = attachEvent("onReconstruct",  view => {
			if(view == this._layout)
				this._setScroll();
		});
		this.attachEvent("onDestruct", function(){ detachEvent(e1); });

		this._contentobj = this._viewobj.firstChild;
	},
	_onKeyPress:function(code, e){
		if(this._settings.navigation.items && e.target.getAttribute("role") === "tab")
			this._moveActive(code, e);

		baseview.api._onKeyPress.call(this, code, e);
	},
	getChildViews:function(){
		return [this._layout];
	},
	getLayout:function(){
		return this._layout;
	},
	_after_init_call:function(){
		this._contentobj.setAttribute("touch_scroll", (this._vertical_orientation?"y":"x"));

		this._layout.attachEvent("onAfterScroll",bind(function(){
			this.callEvent("onShow",[this.getActiveId()]);
		},this));

		_each(this._layout, function(view){
			view._viewobj.setAttribute("role", "tabpanel");
		});
	},
	adjustScroll:function(matrix){
		var size =  (this._vertical_orientation?this._content_height:this._content_width);

		var correction;
		if (this._vertical_orientation) {
			correction = Math.round(matrix.f/size);
			matrix.f = correction*size;
		} else {
			correction = Math.round(matrix.e/size);
			matrix.e = correction*size;
		}
		
		this._active_cell = - correction;

		if(this._settings.navigation)
			this._renderNavItems();

		return true;
	},
	_show:function(obj){
		var i, layout, _nextCell, _size, x, y;
		_nextCell = -1;
		layout = this._layout;
		for (i=0; i < layout._cells.length; i++){
			if (layout._cells[i]==obj){
				_nextCell = i;
				break;
			}
		}

		if (_nextCell < 0 || _nextCell == this._active_cell)
			return;

		this._active_cell = _nextCell;
		_size =  (layout._vertical_orientation?this._content_height:this._content_width);

		x = -(layout._vertical_orientation?0:_nextCell*_size);
		y = -(layout._vertical_orientation?_nextCell*_size:0);

		this.scrollTo(x,y);
		this.callEvent("onShow",[layout._cells[this._active_cell]._settings.id]);
		if(this._settings.navigation)
			this._renderPanel();
	},
	scrollTo:function(x,y){
		if (Touch && animate.isSupported() && this._settings.animate)
			Touch._set_matrix(this._contentobj, x,y, this._settings.scrollSpeed||"100ms");
		else{
			this._contentobj.style.marginLeft = x+"px";
			this._contentobj.style.marginTop =  y+"px";
		}
	},
	navigation_setter:function(config){
		this._mergeSettings(config,{
			type: "corner",
			buttons: true,
			items: true
		});
		return config;
	},
	showNext:function(){
		if (this._active_cell < this._layout._cells.length - 1)
			this.setActiveIndex(this._active_cell+1);
	},
	showPrev:function(){
		if (this._active_cell > 0)
			this.setActiveIndex(this._active_cell-1);
	},
	setActiveIndex:function(value){
		assert(value < this._layout._cells.length, "Not existing index in collection");

		var id = this._layout._cells[value]._settings.id;
		$$(id).show();
	},
	getActiveIndex:function(){
		return this._active_cell;
	},
	$getSize:function(dx, dy){
		var layoutSizes = this._layout.$getSize(0, 0);
		var selfSizes   = base.api.$getSize.call(this, dx, dy);
		if(this._layout._vertical_orientation){
			selfSizes[0] = Math.max(selfSizes[0], layoutSizes[0]);
			selfSizes[1] = Math.min(selfSizes[1], layoutSizes[1]);

		} else{
			selfSizes[2] = Math.max(selfSizes[2], layoutSizes[2]);
			selfSizes[3] = Math.min(selfSizes[3], layoutSizes[3]);
		}
		return selfSizes;
	},
	$setSize:function(x,y){
		var layout = this._layout;
		var c = layout._cells.length;

		var changed = base.api.$setSize.call(this,x,y);
		var yc = this._content_height*(layout._vertical_orientation?c:1);
		var xc = this._content_width*(layout._vertical_orientation?1:c);

		if (changed){
			this._contentobj.style.height = yc+"px";
			this._contentobj.style.width = xc+"px";
			layout.$setSize(xc,yc);
			this._setScroll();
		} else
			layout.$setSize(xc,yc);
	},
	_setScroll: function(){
		var layout = this._layout;
		var activeCell = this._active_cell||0;
		var size =  (layout._vertical_orientation?this._content_height:this._content_width);

		var x = -(layout._vertical_orientation?0:activeCell*size);
		var y = -(layout._vertical_orientation?activeCell*size:0);


		this.scrollTo(x,y);

		if(this._settings.navigation)
			this._renderPanel();
	},
	getActiveId:function(){
		var cell = this._layout._cells[this._active_cell];
		return cell?cell._settings.id:null;
	},
	setActive:function(value){
		$$(value).show();
	}
};


const view = protoUI(api,  EventSystem,NavigationButtons, base.view);
export default {api, view};