import {locate, insertBefore, remove} from "../webix/html";
import {bind, clone, extend, toFunctor} from "../webix/helpers";
import {assert} from "../webix/debug";
import template from "../webix/template";

import type from "../webix/type";

const RenderStack ={
	$init:function(){
		assert(this.data,"RenderStack :: Component doesn't have DataStore");
		assert(template,"template :: template is not accessible");

		//used for temporary HTML elements
		//automatically nulified during destruction
		this._html = document.createElement("DIV");
				
		this.data.attachEvent("onIdChange", bind(this._render_change_id, this));
		this.attachEvent("onItemClick", this._call_onclick);
		
		//create copy of default type, and set it as active one
		if (!this.types){ 
			this.types = { "default" : this.type };
			this.type.name = "default";
		}

		this.type = clone(this.type);
	},
	
	customize:function(obj){ 
		type(this,obj);
	},
	item_setter:function(value){
		return this.type_setter(value);
	},
	type_setter:function(value){
		if(!this.types[value])
			this.customize(value);
		else {
			this.type = clone(this.types[value]);
			if (this.type.css) 
				this._contentobj.className+=" "+this.type.css;
		}
		if (this.type.on_click)
			extend(this.on_click, this.type.on_click);

		return value;
	},
	
	template_setter:function(value){
		this.type.template=template(value);
	},
	//convert single item to HTML text (templating)
	_toHTML:function(obj){
		var mark = this.data._marks[obj.id];
		//check if related template exist
		assert((!obj.$template || this.type["template"+obj.$template]),"RenderStack :: Unknown template: "+obj.$template);
		this.callEvent("onItemRender",[obj]);
		return this.type.templateStart(obj,this.type, mark)+(obj.$template?this.type["template"+obj.$template]:this.type.template)(obj,this.type,mark)+this.type.templateEnd(obj, this.type,mark);
	},
	//convert item to HTML object (templating)
	_toHTMLObject:function(obj){
		this._html.innerHTML = this._toHTML(obj);
		return this._html.firstChild;
	},
	_render_change_id:function(old, newid){
		var obj = this.getItemNode(old);
		if (obj) {
			obj.setAttribute(this._id, newid);
			this._htmlmap[newid] = this._htmlmap[old];
			delete this._htmlmap[old];
		}
	},
	//calls function that is set in onclick property
	_call_onclick:function(){
		if (this._settings.click){
			var code = toFunctor(this._settings.click, this.$scope);
			if (code && code.call) code.apply(this,arguments);
		}
	},
	//return html container by its ID
	//can return undefined if container doesn't exists
	getItemNode:function(search_id){
		if (this._htmlmap)
			return this._htmlmap[search_id];
			
		//fill map if it doesn't created yet
		this._htmlmap={};
		
		var t = this._dataobj.childNodes;
		for (var i=0; i < t.length; i++){
			var id = t[i].getAttribute(this._id); //get item's
			if (id)
				this._htmlmap[id]=t[i];
		}
		//call locator again, when map is filled
		return this.getItemNode(search_id);
	},
	//return id of item from html event
	locate:function(e){ return locate(e,this._id); },
	/*change scrolling state of top level container, so related item will be in visible part*/
	showItem:function(id){

		var html = this.getItemNode(id);
		if (html&&this.scrollTo){
			var txmin = html.offsetLeft;
			var txmax = txmin + html.offsetWidth;
			var tymin = html.offsetTop;

			var tymax = tymin + html.offsetHeight;
			var state = this.getScrollState();

			var x = state.x;
			if (x > txmin || x + this._content_width < txmax )
				x = txmin;
			var y = state.y;
			if (y > tymin || y + this._content_height < tymax )
				y = tymin;

			this.scrollTo(x,y);
			if(this._setItemActive)
				this._setItemActive(id);
		}
	},
	//update view after data update
	//method calls low-level rendering for related items
	//when called without parameters - all view refreshed
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;
		
		if (id){
			var cont = this.getItemNode(id); //get html element of updated item
			switch(type){
				case "paint":
				case "update":
					//in case of update - replace existing html with updated one
					if (!cont) return;
					var t1 = this._htmlmap[id] = this._toHTMLObject(data);
					insertBefore(t1, cont); 
					remove(cont);
					break;
				case "delete":
					//in case of delete - remove related html
					if (!cont) return;
					remove(cont);
					delete this._htmlmap[id];
					break;
				case "add":
					//in case of add - put new html at necessary position
					var t2 = this._htmlmap[id] = this._toHTMLObject(data);
					insertBefore(t2, this.getItemNode(this.data.getNextId(id)), this._dataobj);
					break;
				case "move":
					//moving without repainting the item
					insertBefore(this.getItemNode(id), this.getItemNode(this.data.getNextId(id)), this._dataobj);
					break;
				default:
					assert(0, "Unknown render command: "+type);
					break;
			}
		} else {
			//full reset
			if (this.callEvent("onBeforeRender",[this.data])){
				//getRange - returns all elements
				(this._renderobj||this._dataobj).innerHTML = this.data.getRange().map(this._toHTML,this).join("");
				this._htmlmap = null; //clear map, it will be filled at first getItemNode
				this.callEvent("onAfterRender",[]);
			}
		}
	}
};

export default RenderStack;