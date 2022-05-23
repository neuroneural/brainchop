import {isArray, extend, uid} from "../webix/helpers";
import {assert} from "../webix/debug";


/*
	Behavior:DataMove - allows to move and copy elements, heavily relays on DataStore.move
	@export
		copy
		move
*/
const DataMove ={
	//creates a copy of the item
	copy:function(sid,tindex,tobj, details){
		details = details || {};
		var new_id = details.newId || sid;
		tobj = tobj||this;

		var data = this.getItem(sid);
		assert(data,"Incorrect ID in DataMove::copy");
		
		//make data conversion between objects
		if (tobj)
			data = tobj._externalData(data);
		
		//adds new element same as original
		return tobj.data.add(tobj._externalData(data,new_id),tindex,(details.parent || 0));
	},
	_next_move_index:function(nid, next, source){
		if (next && nid){
			var new_index = this.getIndexById(nid);
			return new_index + ((source == this && source.getIndexById(next) < new_index) ? 0 : 1);
		}
	},
	//move item to the new position
	move:function(sid,tindex,tobj, details){
		details = details || {};
		var new_id = details.newId || sid;

		tobj = tobj||this;
		assert(tobj.data, "moving attempt to component without datastore");
		if (!tobj.data) return;

		//can process an arrya - it allows to use it from onDrag 
		if (isArray(sid)){
			//block separate repaint operations
			if (sid.length > 3) //heuristic value, duplicated below
				this.$blockRender = tobj.$blockRender = true;

			for (var i=0; i < sid.length; i++) {
				//increase index for each next item in the set, so order of insertion will be equal to order in the array
				const nid = this.move(sid[i], tindex, tobj, details);
				tindex = tobj._next_move_index(nid, sid[i+1], this);
			}

			this.$blockRender = tobj.$blockRender = false;
			if (sid.length > 3){
				//repaint whole component
				this.refresh();
				if (tobj != this)
					tobj.refresh();
			}
			return;
		}
		
		let nid = sid; //id after moving

		var data = this.getItem(sid);
		assert(data,"Incorrect ID in DataMove::move");
		
		if (!tobj || tobj == this){
			if (tindex < 0) tindex = this.data.order.length - 1;
			this.data.move(this.getIndexById(sid),tindex);	//move inside the same object
			this.data.callEvent("onDataMove", [sid, tindex, null, this.data.order[tindex+1]]);
		} else {
			//copy to the new object
			nid = tobj.data.add(tobj._externalData(data,new_id),tindex, (details.parent || 0));
			this.data.remove(sid);//delete in old object
		}
		return nid;	//return ID of item after moving
	},
	//move item on one position up
	moveUp:function(id,step){
		const index = this.getIndexById(id)-(step||1);
		return this.move(id,(index<0)?0:index);
	},
	//move item on one position down
	moveDown:function(id,step){
		return this.moveUp(id, (step||1)*-1);
	},
	//move item to the first position
	moveTop:function(id){
		return this.move(id,0);
	},
	//move item to the last position
	moveBottom:function(id){
		return this.move(id,this.data.count()-1);
	},
	/*
		this is a stub for future functionality
		currently it just makes a copy of data object, which is enough for current situation
	*/
	_externalData:function(data,id){
		var newdata = extend({},data);
		newdata.id = (!id || this.data.pull[id])?uid():id;
		

		newdata.$template=null;

		if (this._settings.externalData)
			newdata = this._settings.externalData.call(this, newdata, id, data);
		return newdata;
	}
};

export default DataMove;