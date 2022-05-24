import {isArray, copy as makeCopy, uid, _power_array} from "../webix/helpers";
import {assert} from "../webix/debug";
import DataMove from "../core/datamove";
import DragControl from "../core/dragcontrol";


/*
	Behavior:DataMove - allows to move and copy elements, heavily relays on DataStore.move
	@export
		copy
		move
*/
const TreeDataMove ={
	$init:function(){
		assert(this.data, "DataMove :: Component doesn't have DataStore");
	},
	//creates a copy of the item
	copy:function(sid,tindex,tobj,details){
		details = details || {};
		details.copy = true;
		return this.move(sid, tindex, tobj, details);
	},
	_next_move_index:function(nid, next, source){
		if (next && nid){
			var new_index = this.getBranchIndex(nid);
			// check parent only when moving locally (source == this)
			return new_index + ((source == this && this.getParentId(nid) == this.getParentId(next)
				&& source.getBranchIndex(next) < new_index) ? 0 : 1);
		}
	},
	_check_branch_child:function(parent, child){
		var t = this.data.branch[parent];
		if (t && t.length){
			for (var i=0; i < t.length; i++) {
				if (t[i] == child) return true;
				if (this._check_branch_child(t[i], child)) return true;
			}
		}
		return false;
	},
	_remove_childs(ids){
		for(var i = 0; i < ids.length; i++){
			var id = ids[i];
			while(this.getParentId(id)){
				id = this.getParentId(id);
				if(_power_array.find.call(ids, id) != -1){
					ids.splice(i,1);
					i--;
					continue;
				}
			}
		}
		return ids;
	},
	//move item to the new position
	move:function(sid,tindex,tobj, details){
		details = details || {};
		tindex = tindex || 0;
		var new_id = details.newId || sid;
		var target_parent = details.parent || 0;
		
		tobj = tobj||this;
		assert(tobj.data, "moving attempt to component without datastore");
		if (!tobj.data) return;

		if (isArray(sid)){
			this._remove_childs(sid);
			for (var i=0; i < sid.length; i++) {
				//increase index for each next item in the set, so order of insertion will be equal to order in the array
				var nid = this.move(sid[i], tindex, tobj, details);
				tindex = tobj._next_move_index(nid, sid[i+1], this);
			}
			return;
		}
		
		if (this != tobj || details.copy){
			new_id = tobj.data.add(tobj._externalData(this.getItem(sid),new_id), tindex, (target_parent || 0));
			if (this.data.branch[sid] && tobj.getBranchIndex){
				var temp = this.data._scheme_serialize;
				this.data._scheme_serialize = function(obj){
					var copy = makeCopy(obj);
					delete copy.$parent; delete copy.$level; delete copy.$child;
					if (tobj.data.pull[copy.id])
						copy.id = uid();
					return copy;
				};
				var copy_data = { data:this.serialize(sid, true), parent:new_id };
				this.data._scheme_serialize = temp;
				tobj.parse(copy_data);
			}
			if (!details.copy)
				this.data.remove(sid);
		} else {
			//move in self
			if (sid == target_parent || this._check_branch_child(sid,target_parent)) return;

			var source = this.getItem(sid);
			var tbranch = this.data.branch[target_parent];
			if (!tbranch) 
				tbranch = this.data.branch[target_parent] = [];
			var sbranch = this.data.branch[source.$parent];

			var sindex = _power_array.find.call(sbranch, sid);
			if (tindex < 0) tindex = tbranch.length;
			//in the same branch and same position
			if (sbranch === tbranch && tindex === sindex) return new_id; //return ID

			_power_array.removeAt.call(sbranch, sindex);
			_power_array.insertAt.call(tbranch, sid, Math.min(tbranch.length, tindex));

			if (!sbranch.length)
				delete this.data.branch[source.$parent];
			

			if(source.$parent && source.$parent != "0")
				this.getItem(source.$parent).$count--;

			if (target_parent && target_parent != "0"){
				var target = tobj.getItem(target_parent);
				target.$count++;
				this._set_level_rec(source, target.$level+1);
			} else 
				this._set_level_rec(source, 1);

			source.$parent = target_parent;
			tobj.data.callEvent("onDataMove", [sid, tindex, target_parent, tbranch[tindex+1]]);
		}

		this.refresh();
		return new_id;	//return ID of item after moving
	},
	_set_level_rec:function(item, value){
		item.$level = value;
		var branch = this.data.branch[item.id];
		if (branch)
			for (var i=0; i<branch.length; i++)
				this._set_level_rec(this.getItem(branch[i]), value+1);
	},
	//reaction on pause during dnd
	_drag_pause:function(id){
		if (id && !id.header && this.exists(id) && this._target_to_id(id) != DragControl._drag_context.start) //ignore drag other header
			this.open(id);
	},
	$dropAllow:function(context){
		if (context.from != context.to) return true;
		for (let i=0; i<context.source.length; i++)
			if (this._check_branch_child(context.source, context.target)) return false;

		return true;
	},
	/*
		this is a stub for future functionality
		currently it just makes a copy of data object, which is enough for current situation
	*/
	_externalData:function(data,id){
		var new_data = DataMove._externalData.call(this, data, id);
		delete new_data.open;
		return new_data;
	}
};

export default TreeDataMove;