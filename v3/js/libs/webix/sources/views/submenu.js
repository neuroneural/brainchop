

import menu from "../views/menu";
import popup from "../views/popup";
import {protoUI, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {clone} from "../webix/helpers";


const api = {
	name:"submenu",
	$init:function(){
		this._body_cell = clone(this._dummy_cell_interface);
		this._body_cell._view = this;

		this.attachEvent("onBeforeShow", function(){
			if (this.getTopMenu()._autowidth_submenu && this.sizeToContent && !this.isVisible())
				this.sizeToContent();
		});

		this._dataobj.setAttribute("role", "menu");
	},
	$skin:function(){
		menu.api.$skin.call(this);
		popup.api.$skin.call(this);

		this.type.height = $active.menuHeight;
	},
	_init_mouse_events:function(){
		this.attachEvent("onMouseMove", function(id, e, target){
			if (!this._menu_was_activated())
				return;
			this._mouse_move_activation(id, target);
		});
		this.attachEvent("onMouseOut",function(e){
			if (this.getTopMenu()._settings.openAction == "click") 
				return;
			if (!this._child_menu_active && !this._show_on_mouse_out
				&& e.relatedTarget && !this.$view.contains(e.relatedTarget))
				this.hide();
		});
		//inform parent that focus is still in menu
		this.attachEvent("onMouseMoving",function(){
			if (this._parent_menu)
				$$(this._parent_menu)._child_menu_active = true;
		});
	},
	_dummy_cell_interface : {
		$getSize:function(dx, dy){
			//we saving height and width, as list can hardcode new values
			var h = this._view._settings.height*1;
			var w = this._view._settings.width*1;
			var size = menu.api.$getSize.call(this._view, dx, dy);
			//restoring
			this._view._settings.height = h;
			this._view._settings.width = w;
			return size;
		},
		$setSize:function(x,y){
			if (this._view._settings.scroll)
				this._view._bodyobj.style.height = y+"px";
		},
		destructor:function(){ this._view = null; }
	},
	//ignore body element
	body_setter:function(){
	},
	getChildViews:function(){ return []; },
	defaults:{
		width:150,
		subMenuPos:"right",
		layout:"y",
		autoheight:true
	},
	type:{
		height: $active.menuHeight,
		subsign:true
	}
};


const view = protoUI(api,  menu.view, popup.view);
export default {api, view};