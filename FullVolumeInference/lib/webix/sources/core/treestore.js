import {bind, extend, _to_array, copy, clone, isArray, uid, _power_array} from "../webix/helpers";
import {assert} from "../webix/debug";
import DataStore from "../core/datastore";
import DataDriver from "../load/drivers/index";


// #include core/datastore.js
// #include core/bind.js
// #include core/treemove.js

const TreeStore = {
	name:"TreeStore",
	$init:function() {
		this._filterMode={
			//level:1,
			showSubItems:true
		};
		this.branch = { 0:[] };
		this.attachEvent("onParse", function(driver){
			this._set_child_scheme(driver.child);
		});
		this.attachEvent("onClearAll", bind(function(){
			this._filter_branch = null;
		},this));
	},
	filterMode_setter:function(mode){
		return extend(this._filterMode, mode, true);
	},
	_filter_reset:function(preserve){
		//remove previous filtering , if any
		if (this._filter_branch && !preserve){
			this.branch = this._filter_branch;
			this.order = _to_array(copy(this.branch[0]));
			for (var key in this.branch)
				if (key != "0")	//exclude 0 - virtual root
					this.getItem(key).$count = this.branch[key].length;
			delete this._filter_branch;
		}
	},
	_filter_core:function(filter, value, preserve, filterMode){
		//for tree we have few filtering options
		//- filter leafs only
		//- filter data on specific level
		//- filter data on all levels
		//- in all cases we can show or hide empty folder
		//- in all cases we can show or hide childs for matched item
		
		//set new order of items, store original
		if (!preserve ||  !this._filter_branch){
			this._filter_branch = this.branch;
			this.branch  = clone(this.branch);
		}

		this.branch[0] = this._filter_branch_rec(filter, value, this.branch[0], 1, (filterMode||{}));
	},
	_filter_branch_rec:function(filter, value, branch, level, config){
		//jshint -W041
		var neworder = [];
		
		var allow = (config.level && config.level != level);

		for (var i=0; i < branch.length; i++){
			var id = branch[i];
			var item = this.getItem(id);
			var child_run = false;
			var sub = this.branch[id];

			if (allow){
				child_run = true;
			} else if (filter(this.getItem(id),value)){
				neworder.push(id);
				// open all parents of the found item
				if (config.openParents !== false){
					var parentId = this.getParentId(id);
					while(parentId && parentId != "0"){
						this.getItem(parentId).open = 1;
						parentId = this.getParentId(parentId);
					}
				}
				//in case of of fixed level filtering - do not change child-items
				if (config.level || config.showSubItems)
					continue;
			} else {
				//filtering level, not match
				child_run = true;
			}	

			//if "filter by all levels" - filter childs
			if (allow || !config.level){ 
				if (sub){
					var newsub = this.branch[id] = this._filter_branch_rec(filter, value, sub, level+1, config);
					item.$count = newsub.length;
					if (child_run && newsub.length)
						neworder.push(id);
				}
			}
		}
		return neworder;
	},
	count:function(){
		if (this.order.length)
			return this.order.length;

		//we must return some non-zero value, or logic of selection will think that we have not data at all
		var count=0;
		this.eachOpen(function(){ count++; });
		return count;
	},
	_change_branch_id:function(branches, parent, old, newid){
		if (branches[old]){
			var branch = branches[newid] = branches[old];
			for (var i = 0; i < branch.length; i++)
				this.getItem(branch[i]).$parent = newid;
			delete branches[old];
		}
		if (branches[parent]){
			var index = _power_array.find.call(branches[parent], old);
			if (index >= 0)
				branches[parent][index] = newid;
		}
	},
	changeId:function(old, newid){
		if(old == newid) return;
		
		var parent = this.getItem(old).$parent;
		this._change_branch_id(this.branch, parent, old, newid);

		//in case of filter applied, update id in filtered state as well
		if (this._filter_branch)
			this._change_branch_id(this._filter_branch, parent, old, newid);

		return DataStore.prototype.changeId.call(this, old, newid);
	},
	clearAll:function(soft){
		this.branch = { 0:[] };
		DataStore.prototype.clearAll.call(this, soft);	
	},
	getPrevSiblingId:function(id){
		var order = this.branch[this.getItem(id).$parent];
		var pos = _power_array.find.call(order, id)-1;
		if (pos>=0)
			return order[pos];
		return null;
	},
	getNextSiblingId:function(id){
		var order = this.branch[this.getItem(id).$parent];
		var pos = _power_array.find.call(order, id)+1;
		if (pos<order.length)
			return order[pos];
		return null;
	},
	getParentId:function(id){
		return this.getItem(id).$parent;
	},
	getFirstChildId:function(id){
		var order = this.branch[id];
		if (order && order.length)
			return order[0];
		return null;
	},
	isBranch:function(parent){
		return !!this.branch[parent];
	},
	getBranchIndex:function(child){
		var t = this.branch[this.pull[child].$parent];
		return _power_array.find.call(t, child);
	},
	_set_child_scheme:function(parse_name){

		if (typeof parse_name == "string")
			this._datadriver_child = function(obj){
				var t = obj[parse_name];
				if (t)
					delete obj[parse_name];
				return t;
			};
		else 
			this._datadriver_child = parse_name;
	},
	_inner_parse:function(info, recs){ 
		var parent  = info.parent || 0;
		
		for (var i=0; i<recs.length; i++){
			//get hash of details for each record
			var temp = this.driver.getDetails(recs[i]);
			var id = this.id(temp); 	//generate ID for the record
			var update = !!this.pull[id]; //update mode

			if (update){
				temp = extend(this.pull[id], temp, true);
				if (this._scheme_update)
					this._scheme_update(temp);
			} else {
				if (this._scheme_init)
					this._scheme_init(temp);
				this.pull[id]=temp;
			}

			this._extraParser(temp, parent, 0, update, info.from ? info.from*1+i : 0);
		}

		//fix state of top item after data loading
		var pItem = this.pull[parent] || {};
		var pBranch = this.branch[parent] || [];
		pItem.$count = pBranch.length;
		delete pItem.webix_kids;

		if (info.size && info.size != pBranch.length)
			pBranch[info.size-1] = undefined;
	},
	_extraParser:function(obj, parent, level, update, from){
		//processing top item
		obj.$count = 0;
		//using soft check, as parent can be a both 0 and "0" ( second one in case of loading from server side ) 
		obj.$parent = parent!="0"?parent:0;
		obj.$level = level||(parent!="0"?this.pull[parent].$level+1:1);
		
		var parent_branch = this.branch[obj.$parent];
		if (!parent_branch)
			parent_branch = this.branch[obj.$parent] = [];
		if (this._filter_branch)
			this._filter_branch[obj.$parent] = parent_branch;

		if (!update){
			var pos = from || parent_branch.length;
			parent_branch[pos] = obj.id;
		}

		var child = this._datadriver_child(obj);

		if (obj.webix_kids){
			return (obj.$count = -1);
		}

		if (!child) //ignore childless
			return (obj.$count = 0);	

		//when loading from xml we can have a single item instead of an array
		if (!isArray(child))
			child = [child];
		

		for (var i=0; i < child.length; i++) {
			//extra processing to convert strings to objects
			var item = DataDriver.json.getDetails(child[i]);
			var itemid = this.id(item);
			update = !!this.pull[itemid];
			
			if (update){
				item = extend(this.pull[itemid], item, true);
				if (this._scheme_update)
					this._scheme_update(item);
			} else {
				if (this._scheme_init)
					this._scheme_init(item);
				this.pull[itemid]=item;
			}
			this._extraParser(item, obj.id, obj.$level+1, update);
		}

		//processing childrens
		var branch = this.branch[obj.id];
		if (branch)
			obj.$count = branch.length;
	}, 
	_sync_to_order:function(master){
		this.order = _to_array();

		// send current order to prevent simultaneous use in synс mode
		this._sync_each_child(this.order, 0, master);
	},
	_sync_each_child:function(order, start, master){
		var branch = this.branch[start];
		for (var i=0; i<branch.length; i++){
			var id = branch[i];
			order.push(id);
			var item = this.pull[id];
			if (item && item.open){
				if (item.$count == -1)
					master.loadBranch(id);
				else if (item.$count)
					this._sync_each_child(order, id, master);
			}
		}
	},
	provideApi:function(target,eventable){
		var list = ["getPrevSiblingId","getNextSiblingId","getParentId","getFirstChildId","isBranch","getBranchIndex","filterMode_setter"];
		for (var i=0; i < list.length; i++)
			target[list[i]]=this._methodPush(this,list[i]);

		if (!target.getIndexById)
			DataStore.prototype.provideApi.call(this, target, eventable);
	},
	getTopRange:function(){
		return _to_array([].concat(this.branch[0])).map(function(id){
			return this.getItem(id);
		}, this);
	},
	eachChild:function(id, functor, master, all){
		var branch = this.branch;
		if (all && this._filter_branch)
			branch = this._filter_branch;

		var stack = branch[id];
		if (stack)
			for (var i=0; i<stack.length; i++){
				if(stack[i])
					functor.call((master||this), this.getItem(stack[i]));
			}
	},
	each:function(method,master, all, id){
		this.eachChild((id||0), function(item){
			var branch = this.branch;

			method.call((master||this), item);

			if (all && this._filter_branch)
				branch = this._filter_branch;

			if (item && branch[item.id])
				this.each(method, master, all, item.id);
		}, this, all);
	},	
	eachOpen:function(method,master, id){
		this.eachChild((id||0), function(item){
			method.call((master||this), item);
			if (this.branch[item.id] && item.open)
				this.eachOpen(method, master, item.id);
		});
	},
	eachSubItem:function(id, functor){
		var top = this.branch[id||0];
		if (top)
			for (var i=0; i<top.length; i++){
				var key = top[i];
				if (this.branch[key]){
					functor.call(this, this.getItem(key),true);
					this.eachSubItem(key, functor);
				} else
					functor.call(this, this.getItem(key), false);
			}
	},
	eachLeaf:function(id, functor){
		var top = this.branch[id||0];
		if (top)
			for (var i=0; i<top.length; i++){
				var key = top[i];
				if (this.branch[key]){
					this.eachLeaf(key, functor);
				} else
					functor.call(this, this.getItem(key), false);
			}
	},
	_sort_core:function(sorter, order){
		for (var key in this.branch){
			var bset =  this.branch[key];
			var data = [];

			for (let i=0; i<bset.length; i++)
				data.push(this.pull[bset[i]]);

			data.sort(sorter);

			for (let i=0; i<bset.length; i++)
				data[i] = data[i].id;

			this.branch[key] = data;
		}
		return order;
	},
	add:function(obj, index, pid){
		var refresh_parent = false;

		var parent = this.getItem(pid||0);
		if(parent){
			//when adding items to leaf item - it need to be repainted
			if (!this.branch[parent.id])
				refresh_parent = true;

			parent.$count++;
			//fix for the adding into dynamic loading branch
			//dynamic branch has $count as -1
			if (!parent.$count) parent.$count = 1;
		}

		this.branch[pid||0] = this.order = _to_array(this.branch[pid||0]);

		obj.$count = obj.webix_kids ? -1 : 0; 
		obj.$level= (parent?parent.$level+1:1); 
		obj.$parent = (parent?parent.id:0);

		if (this._filter_branch){	//adding during filtering
			var origin = this._filter_branch[pid||0];
			//newly created branch
			if (!origin) origin = this._filter_branch[pid] = this.order;

			//branch can be shared bettwen collections, ignore such cases
			if (this.order !== origin){
				//we can't know the location of new item in full dataset, making suggestion
				//put at end by default
				var original_index = origin.length;
				//put at start only if adding to the start and some data exists
				if (!index && this.branch[pid||0].length)
					original_index = 0;

				origin = _to_array(origin);
				obj.id = obj.id || uid();
				origin.insertAt(obj.id,original_index);
			}
		}

		//call original adding logic
		var result = DataStore.prototype.add.call(this, obj, index);


		if (refresh_parent)
			this.refresh(pid);

		return result;
	},
	_rec_remove:function(id){
		var obj = this.pull[id];
		if(this.branch[obj.id] && this.branch[obj.id].length > 0){
			var branch = this.branch[id];
			for(var i=0;i<branch.length;i++)
				this._rec_remove(branch[i], true);
		}
		delete this.branch[id];
		if(this._filter_branch)
			delete this._filter_branch[id];
		delete this.pull[id];
		if (this._marks[id])
			delete this._marks[id];
	},
	_filter_removed:function(pull, parentId, id){
		var branch = pull[parentId];
		if (branch.length == 1 && branch[0] == id && parentId){
			delete pull[parentId];
		} else
			_to_array(branch).remove(id);
	},
	remove:function(id){
		//id can be an array of IDs - result of getSelect, for example
		if (isArray(id)){
			for (var i=0; i < id.length; i++)
				this.remove(id[i]);
			return;
		}

		assert(this.exists(id), "Not existing ID in remove command"+id);
		var obj = this.pull[id];
		var parentId = (obj.$parent||0);

		if (this.callEvent("onBeforeDelete",[id]) === false) return false;
		this._rec_remove(id);
		this.callEvent("onAfterDelete",[id]);

		var parent = this.pull[parentId];
		this._filter_removed(this.branch, parentId, id);
		if (this._filter_branch)
			this._filter_removed(this._filter_branch, parentId, id);

		var refresh_parent = 0;
		if (parent){
			parent.$count--;
			if (parent.$count<=0){
				parent.$count=0;
				parent.open = 0;
				refresh_parent = 1;
			}
		}

		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"delete"]);
		if (refresh_parent)
			this.refresh(parent.id);
	},
	/*
		serializes data to a json object
	*/
	getBranch:function(id){
		var out = [];
		var items = (this._filter_branch || this.branch)[id];
		if (items)
			for (var i = 0; i < items.length; i++) out[i] = this.pull[items[i]];

		return out;
	},
	serialize: function(id, all){
		var coll = this.branch;
		//use original collection of branches
		if (all && this._filter_branch) coll = this._filter_branch;

		var ids = coll[id||0];
		var result = [];
		for(var i=0; i< ids.length;i++) {
			var obj = this.pull[ids[i]];
			var rel;

			if (this._scheme_serialize){
				rel = this._scheme_serialize(obj);
				if (rel===false) continue;
			} else 
				rel = copy(obj);
				
			if (coll[obj.id])
				rel.data = this.serialize(obj.id, all);

			result.push(rel);
		}
		return result;
	}
};

export default TreeStore;