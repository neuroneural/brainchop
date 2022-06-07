import {extend, copy, _power_array} from "../webix/helpers";


const Undo = {
	$init:function(){
		this._undoHistory = extend([],_power_array,true);
		this._undoCursor = -1;
	},
	undo_setter: function(value){
		if(value){
			this._init_undo();
			this._init_undo = function(){};
		}
		return value;
	},
	_init_undo: function(){
		var view = this;

		// drag-n-drop
		this.attachEvent("onBeforeDrop", function(context){
			if(context.from == context.to){
				var item = view._draggedItem = copy(this.getItem(context.start));
				if(this.data.branch){
					item.$index = this.getBranchIndex(item.id);
				}
				else
					item.$index = this.getIndexById(item.id);
			}
		});
		this.data.attachEvent("onDataMove", function( sid ){
			if(view._draggedItem && view._draggedItem.id == sid){
				var data = view._draggedItem;
				view._draggedItem = null;
				view._addToHistory(sid, data, "move");
			}
		});

		// add, remove
		this.data.attachEvent("onBeforeDelete", function(id){
			if(this.getItem(id)){
				var item = view._deletedItem = copy(this.getItem(id));
				if(this.branch){
					item.$index = this.getBranchIndex(id);
					if(this.branch[id])
						item.$branch = copy(this.serialize(id));
				}
				else
					item.$index = this.getIndexById(id);
			}
		});
		this.data.attachEvent("onDataUpdate", function(id, data, old){
			view._addToHistory(id+"", old, "update");
		});
		this.data.attachEvent("onStoreUpdated", function(id, item, mode){
			var data = null;
			if(id){
				if(mode == "add"){
					data = copy(item);
				}
				else if( mode == "delete") {
					data = view._deletedItem;
				}

				if(data)
					view._addToHistory(id, data, mode);
			}
		});

		// id change
		this.data.attachEvent("onIdChange", function(oldId,newId){
			if(typeof oldId == "object")
				oldId = oldId.row;
			for(var i =0; i < view._undoHistory.length; i++){
				if(view._undoHistory[i].id == oldId){
					view._undoHistory[i].id = newId;
				}
			}
		});
	},
	_addToHistory: function(id, data, action){
		if(!this._skipHistory && this._settings.undo){
			this._undoHistory.push({id: id, action: action, data: data});
			if(this._undoHistory.length==20)
				this._undoHistory.splice(0,1);
			if(!this._skipCursorInc)
				this._undoCursor = this._undoHistory.length - 1;
		}
	},
	ignoreUndo: function(func, master){
		this._skipHistory = true;
		func.call(master||this);
		this._skipHistory = false;
	},
	removeUndo: function(id){
		for( var i = this._undoHistory.length-1; i >=0; i--){
			if(this._undoHistory[i].id == id){
				if(this._undoHistory[i].action == "id"){
					id = this._undoHistory[i].data;
				}
				this._undoHistory.removeAt(i);
			}
		}
		this._undoCursor = this._undoHistory.length - 1;
	},
	undo: function(id){
		if(id){
			this.ignoreUndo(function(){
				var data, i;
				for( i = this._undoHistory.length-1; !data && i >=0; i--){
					if(this._undoHistory[i].id == id)
						data = this._undoHistory[i];
				}

				if(data){
					/*if(data.action == "id")
						id = data.data;*/
					this._undoAction(data);
					this._undoHistory.removeAt(i+1);
					this._undoCursor = this._undoHistory.length - 1;
				}
			});
		}
		else{
			var data = this._undoHistory[this._undoCursor];
			if(data){
				this.ignoreUndo(function(){
					this._undoAction(data);
					this._undoHistory.removeAt(this._undoCursor);
				});
				this._undoCursor--;
				/*if(data.action == "id")
					this.undo();*/
			}
		}
	},
	_undoAction: function(obj){
		if(obj.action == "delete"){
			var branch = null,
				parentId = obj.data.$parent;

			if(obj.data.$branch){
				branch = {
					parent: obj.id,
					data: copy(obj.data.$branch)
				};
				delete obj.data.$branch;
				if(parentId && !this.data.pull[parentId])
					parentId = 0;
			}

			this.add(obj.data, obj.data.$index, parentId);
			if(branch){
				this.parse(branch);
			}
		}
		else if(obj.action == "add"){
			this.remove(obj.id);
		}
		else if(obj.action == "update"){
			this.updateItem(obj.id, obj.data);
		}
		else if(obj.action == "move"){
			if(obj.data.$parent){
				if(this.getItem(obj.data.$parent))
					this.move(obj.id, obj.data.$index, null, {parent: obj.data.$parent});
			}
			else
				this.move(obj.id, obj.data.$index);
		}
		/*else if(obj.action == "id"){
			this.data.changeId(obj.id, obj.data);
		}*/
	}
};

export default Undo;