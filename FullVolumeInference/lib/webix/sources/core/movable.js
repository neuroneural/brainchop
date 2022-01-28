import {offset, pos as getPos} from "../webix/html";
import {toNode, extend} from "../webix/helpers";
import DragControl from "../core/dragcontrol";

const Movable = {
	move_setter:function(value){
		if (value){
			extend(this, Move, true);
			DragControl.addDrag(this._headobj?this._headobj:this.$view, this);
			delete this.move_setter;	//prevent double initialization
		}
		return value;
	}
};

const Move = {
	$dragCreate:function(object, e){
		if(this.config.move){
			var elOffset = offset(object);
			var elPos = getPos(e);
			DragControl.top = elOffset.y - elPos.y;
			DragControl.left = elOffset.x - elPos.x;

			return toNode(this._viewobj);
		}
	},
	$dragDestroy:function(node, drag){
		var view = this;
		if (view._settings){
			view._settings.top = parseInt(drag.style.top,10);
			view._settings.left = parseInt(drag.style.left,10);
		}

		DragControl.top = DragControl.left = 0;
		this.callEvent("onViewMoveEnd", []);
		return;
	},
	$dragPos:function(pos, e){
		this.callEvent("onViewMove", [pos, e]);
	}
};

export default Movable;