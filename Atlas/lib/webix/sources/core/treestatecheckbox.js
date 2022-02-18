

const TreeStateCheckbox = {
	_init_render_tree_state: function(){
		if (this._branch_render_supported){
			var old_render = this.render;
			this.render = function(id,data){
				var updated = old_render.apply(this,arguments);

				if(this._settings.threeState && updated && data != "checkbox")
					this._setThirdState.apply(this,arguments);
			};
			this._init_render_tree_state=function(){};
		}
	},
	threeState_setter:function(value){
		if (value)
			this._init_render_tree_state();
		return value;
	},
	_setThirdState:function(id){
		var i,leaves,parents,checkedParents,tree;
		parents = [];
		tree = this;

		/*if item was removed*/
		if(id&&!tree.data.pull[id]){
			id = 0;
		}
		/*sets checkbox states*/
		/*if branch or full reloading*/
		if(!id||tree.data.pull[id].$count){
			leaves = this._getAllLeaves(id);
			leaves.sort(function(a,b){
				return tree.data.pull[b].$level - tree.data.pull[a].$level;
			});
			for(i=0;i < leaves.length;i++){
				if(!i||tree.data.pull[leaves[i]].$parent!=tree.data.pull[leaves[i-1]].$parent)
					parents = parents.concat(tree._setParentThirdState(leaves[i]));
			}
		}
		else{
			/*an item is a leaf */
			parents = parents.concat(tree._setParentThirdState(id));
		}

		checkedParents = {};
		for(i=0;i<parents.length;i++){
			if(!checkedParents[parents[i]]){
				checkedParents[parents[i]] = 1;
				this._setCheckboxIndeterminate(parents[i]);
			}
		}

		tree = null;
	},
	_setCheckboxIndeterminate:function(id){
		var chElem, elem;
		elem = this.getItemNode(id);
		if(elem){
			this.render(id,"checkbox","update");
			/*needed to get the new input obj and to set indeterminate state*/
			if(this.getItem(id).indeterminate){
				elem = this.getItemNode(id);
				chElem = elem.getElementsByTagName("input")[0];
				if(chElem)
					chElem.indeterminate = this.getItem(id).indeterminate;
			}
		}
	},
	_setParentThirdState:function(itemId){
		//we need to use dynamic function creating
		//jshint -W083:true

		var checked, checkedCount,indeterminate, parentId,result,unsureCount,needrender;
		parentId = this.getParentId(itemId);
		result = [];
		while(parentId && parentId != "0"){
			unsureCount = 0;
			checkedCount = 0;
			this.data.eachChild(parentId,function(obj){
				if(obj.indeterminate){
					unsureCount++;
				}
				else if(obj.checked){
					checkedCount++;
				}
			});

			checked = indeterminate = needrender = false;
			
			var item = this.getItem(parentId);
			if(checkedCount==item.$count){
				checked = true;
			}
			else if(checkedCount>0||unsureCount>0){
				indeterminate = true;
			}
			
			//we need to reset indeterminate in any case :(
			if (indeterminate || indeterminate != item.indeterminate)
				needrender = true;
			item.indeterminate = indeterminate;
			if (checked || item.checked != checked)
				needrender = true;
			item.checked = checked;

			if (needrender){
				result.push(parentId);
				parentId = this.getParentId(parentId);
			} else
				parentId = 0;
		}

		return result;
	},
	/*get all checked items in tree*/
	getChecked:function(){
		var result=[];
		var tree = this;
		this.data.eachSubItem(0,function(obj){
			if (tree.isChecked(obj.id))
				result.push(obj.id);
		});
		return result;
	},
	_tree_check_uncheck_3:function(id, mode){
		var item = this.getItem(id);
		if(item){
			if (mode === "") 
				mode = !item.checked;
			if(item.checked != mode || item.indeterminate){
				item.checked = mode;
				this._correctThreeState(id);
				var parents = this._setParentThirdState(id);
				if (this._branch_render_supported && parents.length < 5){
					for (var i=0; i<parents.length; i++)
						this._setCheckboxIndeterminate(parents[i]);
				} else
					this.refresh();
				this.callEvent("onItemCheck", [id, mode]);
			}
		}
	},
	/*set checked state for item checkbox*/
	checkItem:function(id){
		this._tree_check_uncheck(id, true);
		this.updateItem(id);
	},
	/*uncheckes an item checkbox*/
	uncheckItem:function(id){
		this._tree_check_uncheck(id, false);
		this.updateItem(id);
	},
	_checkUncheckAll: function(id,mode,all){
		var method = mode?"checkItem":"uncheckItem";
		if(!id)
			id = 0;
		else
			this[method](id);
		if(this._settings.threeState){
			if(!id)
				this.data.eachChild(0,function(item){
					this[method](item.id);
				},this,all);
		}
		else
			this.data.each(function(item){
				this[method](item.id);
			},this,all,id);

	},
	/*checkes checkboxes of all items in a branch/tree*/
	checkAll: function(id, all){
		this._checkUncheckAll(id,true,all);

	},
	/*uncheckes checkboxes of all items in a branch/tree*/
	uncheckAll: function(id, all){
		this._checkUncheckAll(id,false,all);
	},
	_correctThreeState:function(id){
		var state;
		var item = this.getItem(id);

		item.indeterminate = false;
		state = item.checked;

		this.data.eachSubItem(id, function(child){
			child.indeterminate = false;
			child.checked = state;
		});
		
		if(this._branch_render_supported && this.isBranchOpen(item.$parent)){ //for tree-render only
			this.render(id,0,"branch");
		}
	},
	/*returns checked state of item checkbox*/
	isChecked:function(id){
		return this.getItem(id).checked;
	},
	/*gets all leaves in a certain branch (in the whole tree if id is not set)*/
	_getAllLeaves:function(parentId){
		var result = [];
		this.data.eachSubItem(parentId, function(obj, branch){
			if (!branch)
				result.push(obj.id);
		});
		return result;
	}	
};

export default TreeStateCheckbox;