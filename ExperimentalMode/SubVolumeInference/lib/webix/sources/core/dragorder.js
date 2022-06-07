import {offset, pos, remove} from "../webix/html";
import {isArray} from "../webix/helpers";
import {define} from "../services";

import DragItem from "../core/dragitem";
import DragControl from "../core/dragcontrol";

const DragOrder ={
	$drag: function(s,e){
		let html = DragItem.$drag.apply(this, arguments);
		if (!html) return html;

		let context = DragControl._drag_context;

		if (this._close_branches)
			this._close_branches(context);

		if (this._inner_drag_only && this.getBranchIndex)
			this._drag_order_stored_left = this._drag_order_complex?((this.getItem(context.start).$level+1) * 20 + 8):0;

		if (isArray(context.source)){
			DragControl._setDragOffset(e);
			this._add_css(context.source, "webix_invisible");
		}
		return html;
	},
	$dragIn:function(s,t,e){
		let html = DragItem.$dragIn.apply(this, arguments);
		if (!html) return html;

		if (!DragControl._dropHTML)
			DragControl._dropHTML = this._init_drop_area();

		let context = DragControl._drag_context;
		let target = "$webix-last";
		if (context.target)
			target = this._target_to_id(context.target);

		if (target != "$webix-last" && target != "$webix-drop"){
			let settings = {direction:this._settings.layout||this._drag_direction||"y", x:"width", y:"height"};
			let ofs = offset(html);
			let direction = pos(e)[settings.direction] - ofs[settings.direction];
			if ( direction*2 > ofs[settings[settings.direction]] )
				target = this.getNextId(target) || "$webix-last";
		}

		if (target == this._marked_item_id || target == "$webix-drop")
			return html;

		this._marked_item_id = target;
		this._set_drop_area(target, t);

		return html;
	},
	$dragPos:function(pos){
		if (!this._inner_drag_only){
			let context = DragControl._drag_context;
			pos.y += context.y_offset;
			pos.x += context.x_offset;
			return;
		}

		let box = offset(this.$view);
		let xdrag = (this._settings.layout == "x");

		if (xdrag){
			box.x -= 12;
			pos.y = box.y - 8;
			pos.x = pos.x - 18;

			if (pos.x < box.x)
				pos.x = box.x;
			else {
				let max = box.x + box.width;
				if (pos.x > max)
					pos.x = max;
			}
		} else {
			box.y += (this._header_height||0) - 12;
			pos.x = box.x + 8 + (this._drag_order_stored_left||0);
			pos.y = pos.y - 18;

			if (pos.y < box.y)
				pos.y = box.y;
			else {
				let max = box.y + box.height - (this._header_height||0);
				if (pos.y > max)
					pos.y = max;
			}
		}
	},
	$dragOut:function(s,ot,nt){
		if (ot != nt){
			if (this._remove_drop_area) this._remove_drop_area();
			else remove(DragControl._dropHTML);
			this._marked_item_id = DragControl._dropHTML = null;
		}
		return DragItem.$dragOut.apply(this, arguments);
	},
	_define_index:function(s,t,context){
		var target = this._marked_item_id == "$webix-last" ? null : this._marked_item_id;

		if (this.getBranchIndex){
			if (target){
				context.parent = this.getParentId(target);
				context.index = this.getBranchIndex(target);
				if (s == t && this.getParentId(context.start) == context.parent && this.getBranchIndex(context.start) < context.index)
					context.index -= 1;
			} else context.index = -1;
		} else {
			context.index = target?this.getIndexById(target):this.count();
			context.index -= (s == t && this.getIndexById(context.start)<context.index?1:0);
		}
	},
	$dragDestroy: function(){
		let context = DragControl._drag_context;

		if (isArray(context.source))
			this._remove_css(context.source, "webix_invisible");

		remove(DragControl._html);
	},
	_init_drop_area: function(){
		let node = document.createElement("div");
		node.className = "webix_drop_area";
		node.style.width = this.type.width + "px";
		node.style.height = this.type.height + "px";
		node.innerHTML = this.$dropHTML();
		node.setAttribute(this._id, "$webix-drop");

		return [node];
	},
	$dragMark: function(){
		return false;
	}
};

define("DragOrder", DragOrder);

export default DragOrder;