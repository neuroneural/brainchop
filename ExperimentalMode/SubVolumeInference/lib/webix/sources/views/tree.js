import proto from "../views/proto";
import Group from "../core/group";
import TreeAPI from "../core/treeapi";
import DragItem from "../core/dragitem";
import TreeDataMove from "../core/treedatamove";
import SelectionModel from "../core/selectionmodel";
import KeysNavigation from "../core/keysnavigation";
import MouseEvents from "../core/mouseevents";
import Scrollable from "../core/scrollable";
import TreeDataLoader from "../core/treedataloader";
import TreeRenderStack from "../core/treerenderstack";
import CopyPaste from "../core/copypaste";
import EventSystem from "../core/eventsystem";
import type from "../webix/type";
import template from "../webix/template";
import TreeStore from "../core/treestore";
import TreeClick from "../core/treeclick";
import TreeType from "../core/treetype";
import TreeStateCheckbox from "../core/treestatecheckbox";

import {createCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {extend, isArray} from "../webix/helpers";
import DragControl from "../core/dragcontrol";


const api = {
	name:"tree",
	defaults:{
		scroll:"auto",
		navigation:true
	},
	$init:function(){
		this._viewobj.className += " webix_tree";

		//map API of DataStore on self
		extend(this.data, TreeStore, true);
		extend(this.on_click, TreeClick);
		this.data.provideApi(this,true);
		this._viewobj.setAttribute("role", "tree");
	},
	//attribute , which will be used for ID storing
	_id:/*@attr*/"webix_tm_id",
	//supports custom context menu
	on_context:{},
	on_dblclick:{
		webix_tree_checkbox:function(){
			if(this.on_click.webix_tree_checkbox)
				return this.on_click.webix_tree_checkbox.apply(this,arguments);
		}
	},
	$fixEditor: function(editor) {
		var item = this.getItemNode(editor.id).querySelector("span");
		if (item){
			if (item.innerHTML === "") item.innerHTML ="&nbsp;";
			var padding = 10;
			var pos = item.offsetLeft;
			editor.node.style.width = this.$view.scrollWidth - pos - padding + "px";
			editor.node.style.marginLeft = pos + "px";
			editor.node.style.left = "0px";
		}
	},
	//css class to action map, for onclick event
	on_click:{
		webix_tree_item:function(e, id){
			if(this._settings.activeTitle){
				var item = this.getItem(id);
				if(item.open)
					this.close(id);
				else
					this.open(id);
			}
			if (this._settings.select){
				if (this._settings.select=="multiselect" || this._settings.multiselect){
					var multimode = (e.ctrlKey || e.metaKey || (this._settings.multiselect == "touch"));
					if (this._settings.multiselect == "level" && (multimode || e.shiftKey)){
						//allow only selection on the same level
						var select = this.getSelectedId(true)[0];
						if (select && this.getParentId(id) != this.getParentId(select)) 
							return;
					}
					this.select(id, false, multimode, e.shiftKey); 	//multiselection
				} else
					this.select(id);
			}
		}
	},
	_paste: {
		// insert new item with pasted value
		insert: function(text) {
			var parent = this.getSelectedId() ||"0" ;
			this.add({ value: text }, null, parent);
		},
		// change value of each selected item
		modify: function(text) {
			var sel = this.getSelectedId(true);
			for (var i = 0; i < sel.length; i++) {
				this.getItem(sel[i]).value = text;
				this.refresh(sel[i]);
			}
		},
		// do nothing
		custom: function() {}
	},
	_drag_order_complex:true,
	$dragHTML:function(obj,e,context){
		let html = "<div class='webix_tree_item'>"+this.type.template(obj, this.type)+"</div>";
		if ( isArray(context.source) && context.source.length > 1 )
			html = this._toMultipleHTML(html, context.source.length);
		return html;
	},
	_close_branches:function(context){
		let source = context.source;
		for (let i=0; i<source.length; i++)
			this.close(source[i]);
	},
	_set_drop_area:function(target, t){
		let node = this.getItemNode(target);
		if (node){
			node.parentNode.insertBefore(DragControl._dropHTML[0], node);
		} else t.children[0].children[0].appendChild(DragControl._dropHTML[0]);
	},
	
	//css class to action map, for dblclick event
	type:extend({
		//normal state of item
		template:function(obj,common){
			var template = common["template"+obj.level]||common.templateCommon;
			return template.apply(this, arguments);
		},
		classname:function(obj, common, marks){
			var css = "webix_tree_item";

			if (obj.$css){
				if (typeof obj.$css == "object")
					obj.$css = createCss(obj.$css);
				css += " "+obj.$css;
			}
			if (marks && marks.$css)
				css += " "+marks.$css;
			if (common.css)
				css += " "+common.css;

			return css;
		},
		aria:function(obj, common, marks){
			return "role=\"treeitem\""+(marks && marks.webix_selected?" aria-selected=\"true\" tabindex=\"0\"":" tabindex=\"-1\"")+
				(obj.$count?("aria-expanded=\""+(obj.open?"true":"false")+"\""):"")+"aria-level=\""+obj.$level+"\"";
		},
		templateCommon:template("{common.icon()} {common.folder()} <span>#value#</span>"),
		templateStart:template("<div "+/*@attr*/"webix_tm_id"+"=\"#id#\" class=\"{common.classname()}\" {common.aria()}>"),
		templateEnd:template("</div>"),
		templateCopy: template("#value#")
	}, TreeType)
};


const view = protoUI(api, TreeStateCheckbox, Group, TreeAPI, DragItem, TreeDataMove, SelectionModel, KeysNavigation, MouseEvents, Scrollable, TreeDataLoader, proto.view, TreeRenderStack, CopyPaste, EventSystem);
export default {api, view};

type(view, {
	name:"lineTree",
	css:"webixLineTree",
	icon:function(obj, common){
		var html = "";
		var open = "";
		for (var i=1; i<=obj.$level; i++){
			if (i==obj.$level)
				open = (obj.$count?(obj.open?"webix_tree_open ":"webix_tree_close "):"webix_tree_none ");

			var icon = common._icon_src(obj, common, i);
			if (icon)
				html+="<div class='"+open+"webix_tree_img webix_tree_"+icon+"'></div>";
		}
		return html;
	},
	_icon_src:function(obj, common, level){
		var lines = common._tree_branch_render_state; 
		var tree = TreeRenderStack._obj;

		if (lines === 0 && tree){
			//we are in standalone rendering 
			//need to reconstruct rendering state
			var lines_level = obj.$level;
			var branch_id = obj.id;

			lines = [];
			while (lines_level){
				var parent_id = tree.getParentId(branch_id);
				var pbranch = tree.data.branch[parent_id];
				if (pbranch[pbranch.length-1] == branch_id)
					lines[lines_level] = true;	

				branch_id = parent_id;
				lines_level--;
			}

			//store for next round
			common._tree_branch_render_state = lines;
		}
		if (!lines)
			return 0;
		//need to be replaced with image urls
		if (level == obj.$level){
			var mode = 3; //3-way line
			if (!obj.$parent){ //top level
				if (obj.$index === 0)
					mode = 4; //firts top item
			}

			if (lines[obj.$level])
				mode = 2;

			if (obj.$count){
				if (obj.open)
					return "minus"+mode;
				else
					return "plus"+mode;
			} else
				return "line"+mode;
		} else {
			if (!lines[level])
				return "line1";
			return "blank";
		}
	}
});