import {protoUI, ui} from "../ui/core";
import state from "../core/state";

import base from "./view";
import baseview from "./baseview";


const api = {
	name:"align",
	defaults:{
		borderless:true,
		left:0, top:0, right:0, bottom:0
	},
	$init:function(){
		this._viewobj.className	+= " webix_view_align";
	},
	_remove:function(){
		this.body_setter({ });
	},
	_replace:function(new_view){
		this._body_cell.destructor();
		this._body_cell = new_view;

		this._viewobj.appendChild(this._body_cell._viewobj);
		this.resize();
	},
	getChildViews:function(){
		return [this._body_cell];
	},
	body_setter:function(value){
		value._inner = { top:false, left:false, right:false, bottom:false};
		state._parent_cell = this;
		this._body_cell = ui._view(value);

		this._viewobj.appendChild(this._body_cell._viewobj);
		return value;
	},
	align_setter:function(value){
		if (typeof value === "string")
			value = value.split(",");

		this._x_align = this._y_align = this._p_align = "";
		for (var i=0; i<value.length; i++){
			var c = value[i];
			if (c === "center" || c === "left" || c === "right")
				this._x_align = c;
			if (c === "top" || c === "bottom" || c === "middle")
				this._y_align = c;
			if (c === "absolute")
				this._x_align = this._y_align = this._p_align = "precise";
		}

		return value;
	},
	getBody:function(){
		return this._body_cell;
	},
	$setSize:function(x,y){
		base.api.$setSize.call(this, x,y);

		var dx, dy;
		if (this._p_align){
			dx = x - this._settings.left - this._settings.right;
			dy = y - this._settings.top - this._settings.bottom;
		} else {
			dx = this._desired_size[0] || x;
			dy = this._desired_size[2] || y;
		}



		this._body_cell.$setSize(dx, dy);

		var box = this._body_cell._viewobj;

		if (this._x_align == "center")
			box.style.marginLeft = Math.ceil((x-dx)/2)+"px";
		else if (this._x_align == "right")
			box.style.marginLeft = (x-dx)+"px";
		else
			box.style.marginLeft = (this._p_align ? this._settings.left : 0) +"px";

		if (this._y_align == "middle") 
			box.style.marginTop = Math.ceil((y-dy)/2)+"px";
		else if (this._y_align == "bottom")
			box.style.marginTop = (y-dy)+"px";
		else
			box.style.marginTop = (this._p_align ? this._settings.top : 0) + "px";
	},
	$getSize:function(dx,dy){
		var size = this._desired_size = this._body_cell.$getSize(0,0);
		var self_size = baseview.api.$getSize.call(this, 0, 0);
	
		if (this._p_align){
			dx += this._settings.left + this._settings.right;
			dy += this._settings.top + this._settings.bottom;
		}

		if (!this._x_align || this._p_align){
			self_size[0] = size[0]+dx;
			self_size[1] = size[1]+dx;
		} else {
			self_size[0] = (self_size[0] || size[0] ) +dy;
			self_size[1] +=	dx;
		}

		if (!this._y_align || this._p_align){
			self_size[2] = size[2]+dy;
			self_size[3] = size[3]+dy;
		} else {
			self_size[2] = (self_size[2] || size[2] ) +dy;
			self_size[3] +=	dy;
		}

		return self_size;
	}
};

const view = protoUI(api, base.view);
export default {api, view};