import {insertBefore, remove, create} from "../webix/html";
import {assert} from "../webix/debug";


const TreeRenderStack ={
	$init:function(){
		assert(this.render,"TreeRenderStack :: Object must use RenderStack first");
	},
	_toHTMLItem:function(obj){
		var mark = this.data._marks[obj.id];
		this.callEvent("onItemRender",[obj]);
		return this.type.templateStart(obj,this.type,mark)+(obj.$template?this.type["template"+obj.$template](obj,this.type,mark):this.type.template(obj,this.type,mark))+this.type.templateEnd();
	},
	_toHTMLItemObject:function(obj){
		this._html.innerHTML = this._toHTMLItem(obj);
		return this._html.firstChild;
	},
	//convert single item to HTML text (templating)
	_toHTML:function(obj){
		//check if related template exist
		assert((!obj.$template || this.type["template"+obj.$template]),"RenderStack :: Unknown template: "+obj.$template);
		var html="<div role='presentation' class='webix_tree_branch_"+obj.$level+"'>"+this._toHTMLItem(obj);

		if (obj.open)
			html+=this._toHTMLLevel(obj.id);

		html+="</div>";

		return html;
	},
	_toHTMLLevel:function(id){
		var html = "";
		var leaves = this.data.branch[id];
		if (leaves){
			html+="<div role='presentation' class='webix_tree_leaves'>";
			var last = leaves.length-1;
			for (var i=0; i <= last; i++){
				var obj = this.getItem(leaves[i]);
				var state = this.type._tree_branch_render_state;
				if (state !== 0) state[obj.$level] = (i == last);
				html+=this._toHTML(obj);
			}
			html+="</div>";
		}
		return html;
	},
	//return true when some actual rendering done
	render:function(id,data,type){
		TreeRenderStack._obj = this;	//can be used from complex render

		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;

		if (id){
			var cont, node;
			var item = this.getItem(id);
			if (type!="add"){
				cont = this.getItemNode(id);
				if (!cont) return;
			}
			
			switch(type){
				case "branch":
					var branch = cont.parentNode;
					node = this._toHTMLObject(item);
					
					insertBefore(node, branch); 
					remove(branch);
					this._htmlmap = null;
					break;
				case "paint":
				case "update":
					node = this._htmlmap[id] = this._toHTMLItemObject(item);
					insertBefore(node, cont); 
					remove(cont);
					break;
				case "delete":
					//deleting not item , but full branch
					remove(cont.parentNode);
					break;
				case "add":
					var parent;
					//we want process both empty value and 0 as string
					//jshint -W041:true
					if (item.$parent == 0){
						parent = this._dataobj.firstChild;
					} else if(this.getItem(item.$parent).open){
						parent  = this.getItemNode(item.$parent);
						if (parent){
							//when item created by the script, it will miss the container for child notes
							//create it on demand
							if (!parent.nextSibling){
								var leafs = create("DIV", { "class" : "webix_tree_leaves" },"");
								parent.parentNode.appendChild(leafs);
							}
							parent = parent.nextSibling;
						}
					}

					if (parent){
						var next = this.data.getNextSiblingId(id);
						next = this.getItemNode(next);
						if (next)
							next = next.parentNode;

						node = this._toHTMLObject(item);
						this._htmlmap[id] = node.firstChild;
						insertBefore(node, next, parent);
					}
					break;
				default:
					return false;
			}
			this.callEvent("onPartialRender", [id,data,type]);
		} else {
			//full reset
			if (this.callEvent("onBeforeRender",[this.data])){
				//will be used for lines management
				this.type._tree_branch_render_state = [];
				//getTopRange - returns all elements on top level
				this._dataobj.innerHTML = this._toHTMLLevel(0);
					
				this._htmlmap = null; //clear map, it will be filled at first getItemNode
				this.callEvent("onAfterRender",[]);
			}
		}

		//clear after usage
		this.type._tree_branch_render_state = 0;
		TreeRenderStack._obj = null;
		return true;
	},
	getItemNode:function(search_id){
		if (this._htmlmap)
			return this._htmlmap[search_id];
			
		//fill map if it doesn't created yet
		this._htmlmap={};
		
		var t = this._dataobj.getElementsByTagName("DIV");
		for (var i=0; i < t.length; i++){
			var id = t[i].getAttribute(this._id); //get item's
			if (id) 
				this._htmlmap[id]=t[i];
		}
		//call locator again, when map is filled
		return this.getItemNode(search_id);
	},
	_branch_render_supported:1
};

export default TreeRenderStack;