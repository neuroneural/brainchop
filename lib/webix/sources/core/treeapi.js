import {assert} from "../webix/debug";


const TreeAPI = {
	open: function(id, show) {
		if (!id) return;
		//ignore open for leaf items
		var item = this.getItem(id);
		assert(item,"Incorrect ID to open: "+id);

		if (!item.$count || item.open) return;

		if (this.callEvent("onBeforeOpen",[id])){
			item.open=true;
			this.data.callEvent("onStoreUpdated",[id, 0, "branch"]);
			this.callEvent("onAfterOpen",[id]);
		}

		if (show && id != "0")
			this.open(this.getParentId(id), show);
	},
	close: function(id) {
		if (!id) return;
		var item = this.getItem(id);
		if (!item.open) return;

		if (this.callEvent("onBeforeClose",[id])){
			item.open=false;
			this.data.callEvent("onStoreUpdated",[id, 0, "branch"]);
			this.callEvent("onAfterClose",[id]);
		}
	},
	openAll: function(id){
		this.data.eachSubItem((id||0), function(obj, branch){
			if (branch)
				obj.open = true;
		});
		this.data.refresh();
	},
	closeAll: function(id){
		this.data.eachSubItem((id||0), function(obj, branch){
			if (branch)
				obj.open = false;
		});
		this.data.refresh();
	},
	_tree_check_uncheck:function(id,mode,e){
		if(this._settings.threeState)
			return this._tree_check_uncheck_3(id,(mode !== null?mode:""));

		var value,
			item = this.getItem(id),
			trg = (e?e.target:null);

		//read actual value from HTML tag when possible
		//as it can be affected by dbl-clicks
		if(trg && trg.type == "checkbox")
			value = trg.checked?true:false;
		else
			value = (mode !== null?mode:!item.checked);

		item.checked = value;
		this.callEvent("onItemCheck", [id, item.checked, e]);
	},
	isBranchOpen:function(search_id){
		if (search_id == "0") return true;

		var item = this.getItem(search_id);
		if (item.open)
			return this.isBranchOpen(item.$parent);
		return false;
	},
	getOpenItems: function() {
		var open = [];
		for (var id in this.data.branch) {
			if (this.exists(id) && this.getItem(id).open)
				open.push(id);
		}
		return open;
	},
	getState: function(){
		return {
			open: this.getOpenItems(),
			select: this.getSelectedId(true)
		};
	},
	_repeat_set_state:function(tree, open){
		var event = this.data.attachEvent("onStoreLoad", function(){
			tree.setState.call(tree,open);
			tree.data.detachEvent(event);
			tree = null;
		});
	},
	setState: function(state){
		if (state.open){
			this.closeAll();	
			var open = state.open;
			for (let i = 0; i < open.length; i++){
				var item = this.getItem(open[i]);
				if (item && item.$count){
					item.open=true;
					//dynamic loading
					if (item.$count == -1){
						//call the same method after data loading
						this._repeat_set_state(this, state);
						this.refresh();
						return 0;
						//end processing
					}
				}
			}
			this.refresh();
		}


		if (state.select && this.select){			
			var select = state.select;
			this.unselect();
			for (let i = 0; i < select.length; i++)
				if (this.exists(select[i]))
					this.select(select[i], true);
		}

		return 1;
	}
};

export default TreeAPI;