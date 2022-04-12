import base from "../views/view";
import {protoUI, ui} from "../ui/core";
import state from "../core/state";


const api = {
	name:"proxy",
	body_setter:function(value){
		state._parent_cell = this;
		this._body_cell = ui._view(value);
		this._viewobj.appendChild(this._body_cell._viewobj);
		return value;
	},
	getChildViews:function(){
		return [this._body_cell];
	},
	$setSize:function(x,y){
		base.api.$setSize.call(this, x,y);
		this._body_cell.$setSize(this.$width, this.$height);
	},
	$getSize:function(dx,dy){
		var selfSize = base.api.$getSize.call(this, dx, dy);
		var size = this._body_cell.$getSize(dx, dy);

		size[0] = Math.max(selfSize[0], size[0]);
		size[1] = Math.min(selfSize[1], size[1]);
		size[2] = Math.max(selfSize[2], size[2]);
		size[3] = Math.min(selfSize[3], size[3]);
		size[4] = Math.max(selfSize[4], size[4]);

		return size;
	},
	_replace:function(n){
		this._body_cell.destructor();
		this._body_cell = n;
		this._viewobj.appendChild(n._viewobj);
		this.resize();
	}
};


const view = protoUI(api,  base.view);
export default {api, view};