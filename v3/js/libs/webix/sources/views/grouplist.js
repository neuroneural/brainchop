import base from "../views/view";
import list from "../views/list";
import Group from "../core/group";
import TreeStore from "../core/treestore";
import RenderStack from "../core/renderstack";

import type from "../webix/type";

import {protoUI} from "../ui/core";
import {extend, bind, copy, _to_array, clone} from "../webix/helpers";
import promise from "../thirdparty/promiz";
import animate from "../webix/animate";
import template from "../webix/template";

const api = {
	name:"grouplist",
	defaults:{
		animate:{
		}
	},
	_listClassName : "webix_grouplist",
	$init:function(){
		extend(this.data, TreeStore, true);
		//needed for getRange
		this.data.count = function(){ return this.order.length; };
		this.data.provideApi(this,true);
		this.data.attachEvent("onClearAll", bind(this._onClear, this));
		this._onClear();
	},
	_onClear:function(){
		this._nested_cursor = [];
		this._nested_chain = [];
	},
	$setSize:function(){
		if (base.api.$setSize.apply(this, arguments)){
			//critical for animations in group list
			this._dataobj.style.width = this._content_width;
		}
	},	
	on_click:{
		webix_list_item:function(e,id){
			if (this._animation_promise) {
				return false;
			}

			for (var i=0; i < this._nested_chain.length; i++){
				if (this._nested_chain[i] == id){ //one level up
					for (var j=i; j < this._nested_chain.length; j++) {
						this.data.getItem(this._nested_chain[j]).$template="";
					}
					if (!i){ //top level
						this._nested_cursor = this.data.branch[0];
						this._nested_chain = [];
					} else {
						this._nested_cursor= this.data.branch[this._nested_chain[i-1]];
						this._nested_chain.splice(i);
					}
					this._is_level_down = false;
					return this.render();
				}
			}

			var obj = this.getItem(id);
			if (obj.$count){	//one level down
				this._is_level_down = true;
				this._nested_chain.push(id);
				obj.$template = "Back";
				this._nested_cursor = this.data.branch[obj.id];
				return this.render();
			} else {
				if (this._settings.select){
					this._no_animation = true;
					if (this._settings.select=="multiselect" || this._settings.multiselect)
						this.select(id, false, ((this._settings.multiselect == "touch") || e.ctrlKey || e.metaKey), e.shiftKey); 	//multiselection
					else
						this.select(id);
					this._no_animation = false;
				}		
			}
		}
	},
	getOpenState:function(){
		return {parents:this._nested_chain,branch:this._nested_cursor};
	},
	render:function(id,data,type){
		var i, lastChain;

		//start filtering processing=>
		this._nested_chain = copy(this._nested_chain);
		this._nested_cursor = copy(this._nested_cursor);

		if(this._nested_chain.length){
			for(i = 0;i<this._nested_chain.length;i++){
				if(!this.data.branch[this._nested_chain[i]]){
					this._nested_chain.splice(i,1);
					i--;
				}
			}
		}
		lastChain =  (this._nested_chain.length?this._nested_chain[this._nested_chain.length-1]:0);
		this._nested_cursor = copy(this.data.branch[lastChain]) ;

		if(!this._nested_cursor.length&&this._nested_chain.length){
			this._nested_cursor =  [lastChain];
			this._nested_chain.pop();
		}
		//<= end filtering processing

		if (this._animation_promise)
			return this._animation_promise.then(() => this.render.apply(this, arguments));

		for (i=0; i < this._nested_cursor.length; i++)
			this.data.getItem(this._nested_cursor[i]).$template = "";

		if (!this._nested_cursor.length)
			this._nested_cursor = this.data.branch[0];

		this.data.order = _to_array([].concat(this._nested_chain).concat(this._nested_cursor));

		if (this.callEvent("onBeforeRender",[this.data])){
			if (this._no_animation || !this._dataobj.innerHTML || !(animate.isSupported() && this._settings.animate) || (this._prev_nested_chain_length == this._nested_chain.length)) { // if dataobj is empty or animation is not supported
				// don't repaint invisible data
				if (id && type !== "delete" && this.data.getIndexById(id) === -1) return;

				RenderStack.render.apply(this, arguments);
			}
			else {
				//getRange - returns all elements
				if (this.callEvent("onBeforeRender",[this.data])){

					if(!this._back_scroll_states)
						this._back_scroll_states = [];

					var next_div = this._dataobj.cloneNode(false);
					next_div.innerHTML = this.data.getRange().map(this._toHTML,this).join("");

					var aniset = extend({}, this._settings.animate);
					aniset.direction = (this._is_level_down)?"left":"right";

					/*scroll position restore*/
					var animArr = [clone(aniset),clone(aniset)];
					var getScrollState;
					if (this._is_level_down)
						this._back_scroll_states.push(this.getScrollState());
					else
						getScrollState = this._back_scroll_states.pop();

					var line = animate.formLine(
						next_div,
						this._dataobj,
						aniset
					);

					aniset.master = this;
					aniset.callback = function(){
						this._dataobj = next_div;

						/*scroll position restore*/
						if (!this._is_level_down){
							if (getScrollState) 
								this.scrollTo(0,getScrollState.y);
						} else
							this.scrollTo(0,0);

						animate.breakLine(line);
						aniset.master = aniset.callback = null;
						this._htmlmap = this._animation_promise = null; //clear map, it will be filled at first getItemNode
						aniset.wait_animation.resolve();
						this.callEvent("onAfterRender",[]);
					};

					animate(line, animArr);
					this._animation_promise = aniset.wait_animation = promise.defer();
				}
			}
			this._prev_nested_chain_length = this._nested_chain.length;
		}
	},
	templateBack_setter:function(config){
		this.type.templateBack = template(config);
	},
	templateItem_setter:function(config){
		this.type.templateItem = template(config);
	},
	templateGroup_setter:function(config){
		this.type.templateGroup = template(config);
	},
	type:{
		template:function(obj, common){
			if (obj.$count)
				return common.templateGroup(obj, common);
			return common.templateItem(obj, common);
		},
		css:"group",
		classname:function(obj, common, marks){
			return "webix_list_item"+
				" webix_"+(obj.$count?"group":"item")+(obj.$template?"_back":"")+
				((marks&&marks.webix_selected)?" webix_selected":"")+
				(common.css?" "+common.css:"")+
				(obj.$css?" "+obj.$css:"");
		},
		templateStart:template("<div "+/*@attr*/"webix_l_id"+"=\"#id#\" class=\"{common.classname()}\" style=\"width:{common.widthSize()}; height:{common.heightSize()};  overflow:hidden;\" {common.aria()}>"),
		templateBack:template("#value#"),
		templateItem:template("#value#"),
		templateGroup:template("#value#"),
		templateEnd:function(obj){
			var html = "";
			if(obj.$count) html += "<div class='webix_arrow_icon'></div>";
			html += "</div>";
			return html;
		}
	},
	showItem:function(id){
		var obj, parent;
		if(id){
			obj = this.getItem(id);
			parent = obj.$parent;
			
			if (obj.$count)
				parent = obj.id;
		}
		this._nested_cursor = this.data.branch[parent||0];
		this._nested_chain=[];
				
		//build _nested_chain
		while(parent){
			this.getItem(parent).$template = "Back";
			this._nested_chain.unshift(parent);
			parent = this.getItem(parent).$parent;
		} 
		
		//render
		this._no_animation = true;
		this.render();
		this._no_animation = false;
		
		//scroll if necessary
		RenderStack.showItem.call(this,id);
	}
};


const view = protoUI(api,  Group, list.view );
export default {api, view};

//register default type for grouplist
type(view,{});