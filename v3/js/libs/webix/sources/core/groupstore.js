import {_to_array, uid} from "../webix/helpers";
import {assert} from "../webix/debug";
import GroupMethods from "../core/groupmethods";


const GroupStore = {
	$init:function(){
		this.attachEvent("onClearAll", () => this._not_grouped_order = null);
		this.attachEvent("onSyncApply", () => this._not_grouped_order = null);
	},
	ungroup:function(target){
		if (this.getBranchIndex){
			if (!this._ungroupLevel(target)) return;
		} else {
			if (!this._not_grouped_order) return;

			this.order = this._not_grouped_order;
			this.pull = this._not_grouped_pull;
		}
		
		this.callEvent("onStoreUpdated",[]);
	},
	_ungroupLevel(target){
		const parent = target || 0;
		const level = parent == "0" ? 1 : this.getItem(parent).$level + 1;
		let changed = false;
		const top = this.branch[parent];
		let order = [];

		for (var i=0; i<top.length; i++){
			const id = top[i];
			if (this.pull[id].$group){
				changed = true;
				var group = this.branch[id];

				if (group)
					this.branch[id] = group.filter(a => {
						if (!this.pull[a].$footer)
							return a;
						this._unregisterItem(a);
					});
				order = order.concat(this.branch[id] || []);
				this._unregisterItem(id);
			} else
				order.push(id);
		}

		if (!changed) return false;
		this.branch[parent] = order;
		this._fix_group_levels(this.branch[parent], parent, level);

		if (typeof target === "undefined")
			this._ungroupLevel();

		return true;
	},
	_unregisterItem(id){
		delete this.pull[id];
		delete this.branch[id];
	},
	_group_processing:function(scheme){
		this.blockEvent();
		this.group(scheme);
		this.unblockEvent();
	},
	_group_prop_accessor:function(val){
		if (typeof val == "function")
			return val;
		const acc = function(obj){ return obj[val]; };
		acc.$name = val;
		return acc;
	},	
	group:function(config, target){
		assert(config, "Empty config");
		let input;

		if (typeof config === "string"){
			input = config;
			config = { by:this._group_prop_accessor(config), map:{} };
		} else if (typeof config === "function"){
			config = { by:config, map:{} };
		} else if (typeof config.by === "string"){
			input = config.by;
			config.by = this._group_prop_accessor(config.by);
		}
		config.map = config.map || {};
		if (input && !config.map[input])
			config.map[input] = [input];
		config.missing = (config.missing === undefined) ? true : config.missing;

		if (this.getBranchIndex)
			return this._group_tree(config, target);
		
		if (!this._not_grouped_order){
			this._not_grouped_order = this.order;
			this._not_grouped_pull = this.pull;
		}

		const groups = {};
		const labels = [];
		const missed = [];
		const misGroup = config.missing;
		this.each(function(data){
			let current = config.by(data);
			if (!current && current !== 0){
				if (misGroup === false) return;
				if (misGroup === true){
					missed.push(data);
					return;
				}
				current = misGroup;
			}

			if (!groups[current]){
				labels.push({ id:current, value:current, $group:true, $row:config.row });
				groups[current] = _to_array();
			}
			groups[current].push(data);
		});

		for (let i=0; i<labels.length; i++){
			let group = labels[i];
			this._map_group(config.map, group, groups[labels[i].id]);

			if (this.hasEvent("onGroupCreated"))
				this.callEvent("onGroupCreated", [group.id, group.value, groups[labels[i].id]]);
		}

		this.order = _to_array();
		this.pull = {};
		this._fill_pull(labels);
		this._fill_pull(missed);

		this.callEvent("onStoreUpdated",[]);
	},
	_fill_pull:function(arr){
		for (let i=0; i < arr.length; i++){
			let id = this.id(arr[i]);
			if (this.pull[id])
				id = arr[i].id = uid();

			this.pull[id] = arr[i];
			this.order.push(id);
			if (this._scheme_init)
				this._scheme_init(arr[i]);
		}
	},
	_map_group:function(map, group, data){
		for (let prop in map){
			let functor = (map[prop][1]||"any");
			let property = this._group_prop_accessor(map[prop][0]);
			if (typeof functor != "function"){
				assert(GroupMethods[functor], "Unknown grouping rule: "+functor);
				functor = GroupMethods[functor];
			}

			group[prop] = functor.call(this, property, data);
		}
	},
	_group_tree:function(config, parent){
		//prepare
		let level = 0;
		if (parent)
			level = this.getItem(parent).$level;
		else parent = 0;

		//run
		const topbranch = [];
		const labels = [];
		const missed = [];

		let order = this.branch[parent];
		let groups = {};
		for (let i=0; i<order.length; i++){
			const data = this.getItem(order[i]);
			let current = config.by(data);

			if (!current && current !== 0)
				if (config.missing === false) continue;
				else if (config.missing === true){
					missed.push(data.id);
					continue;
				} else current = config.missing;

			let ancestor = groups[current];
			if (!ancestor){
				let id = uid();
				let newitem = this.pull[id] = { id, value:current, $group:true, $row:config.row};
				if (this._scheme_init)
					this._scheme_init(newitem);

				labels.push(newitem);
				ancestor = groups[current] = this.branch[id] = [];
				ancestor._formath = [];
				topbranch.push(id);
			}
			ancestor.push(data.id);
			ancestor._formath.push(data);
		}

		this.branch[parent] = topbranch.concat(missed);
		for (let i=0; i<labels.length; i++){
			let group = labels[i];
			this._map_group(config.map, group, this.branch[labels[i].id]._formath);

			if (this.hasEvent("onGroupCreated"))
				this.callEvent("onGroupCreated", [group.id, group.value, this.branch[group.id]._formath]);

			if (config.footer){
				let id = "footer$"+group.id;
				let footer = this.pull[id] = { id:id, $footer:true, value: group.value, $level:level, $count:0, $parent:group.id, $row:config.footer.row};

				this._map_group(config.footer, footer, this.branch[labels[i].id]._formath);
				
				this.branch[group.id].push(footer.id);
				this.callEvent("onGroupFooter", [footer.id, footer.value, this.branch[group.id]._formath]);
			}
			delete this.branch[group.id]._formath;
		}

		this._fix_group_levels(this.branch[parent], parent, level+1);
		this.callEvent("onStoreUpdated",[]);
	},
	_fix_group_levels:function(branch, parent, level){
		if (parent)
			this.getItem(parent).$count = branch.length;

		for (let i = 0; i < branch.length; i++) {
			const item = this.pull[branch[i]];
			item.$level = level;
			item.$parent = parent;

			const next = this.branch[item.id];
			if (next)
				this._fix_group_levels(next, item.id, level+1);
		}
	}
};

export default GroupStore;