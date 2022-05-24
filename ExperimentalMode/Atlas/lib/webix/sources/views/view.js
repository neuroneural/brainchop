import {isUndefined} from "../webix/helpers";
import {debug_size_box} from "../webix/debug";
import {protoUI} from "../ui/core";

import base from "./baseview";

const api = {
	name:"view",
	$init:function(config){
		this._set_inner(config);
	},

	//deside, will component use borders or not
	_set_inner:function(config){
		var border_not_set = isUndefined(config.borderless);
		if (border_not_set && !this.setPosition && config.$topView){
			config.borderless = true;
			border_not_set = false;
		}

		if ((border_not_set && this.defaults.borderless) || config.borderless){
			//button and custom borderless
			config._inner = { top:true, left:true, bottom:true, right:true };
		} else {
			//default borders
			if (!config._inner)
				config._inner = {};
			this._contentobj.style.borderWidth="1px";
		}
	},

	$getSize:function(dx, dy){

		var _borders = this._settings._inner;
		if (_borders){
			dx += (_borders.left?0:1)+(_borders.right?0:1);
			dy += (_borders.top?0:1)+(_borders.bottom?0:1);
		}
		
		var size = base.api.$getSize.call(this, dx, dy);
		
		if (DEBUG) debug_size_box(this, size, true);
		return size;
	},
	$setSize:function(x,y){
		if (DEBUG) debug_size_box(this, [x,y]);
			
		var _borders = this._settings._inner;
		if (_borders){
			x -= (_borders.left?0:1)+(_borders.right?0:1);
			y -= (_borders.top?0:1)+(_borders.bottom?0:1);
		}
			
		return base.api.$setSize.call(this,x,y);
	}
};

const view = protoUI(api, base.view);
export default { api, view };

//not necessary anymore
//preserving for backward compatibility
view.call(-1);
