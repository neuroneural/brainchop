import {protoUI} from "../ui/core";
import {bind, extend} from "../webix/helpers";
import {freeze} from "../ui/helpers";

import UIManager from "../core/uimanager";
import i18n from "../webix/i18n";

import layout from "../views/layout";

import AtomDataLoader from "../core/atomdataloader";
import IdSpace from "../core/idspace";

i18n.dbllist = {
	selectAll : "<span class='webix_icon wxi-angle-double-right'></span>",
	selectOne : "<span class='webix_icon wxi-angle-right'></span>",
	deselectAll : "<span class='webix_icon wxi-angle-double-left'></span>",
	deselectOne : "<span class='webix_icon wxi-angle-left'></span>"
};

const api = {
	name: "dbllist",
	defaults:{
		borderless:true
	},
	$init: function() {
		this._moved = {};
		this._inRight = bind(function(obj){ return this._moved[obj.id]; }, this);
		this._inLeft = bind(function(obj){ return !this._moved[obj.id]; }, this);
	
		this.$view.className += " webix_dbllist";
		this.$ready.unshift(this._setLayout);
	},
	$onLoad:function(data, driver){
		const left = this.$$("left");
		const right = this.$$("right");

		this._updateAndResize(function(){
			left.data.driver = driver;
			left.parse(data);
			right.data.driver = driver;
			right.parse(data);
		});

		this._data_ready = true;
		this._refresh();
		return true;
	},
	_getButtons:function(){
		if (this._settings.buttons === false)
			return { width: 10 };

		var locale = i18n.dbllist;
		var buttons = [
			this._getButton("deselect_all", locale.deselectAll),
			this._getButton("select_all", locale.selectAll),
			this._getButton("deselect_one", locale.deselectOne),
			this._getButton("select_one", locale.selectOne)
		];


		buttons = { width:120, template:buttons.join(""), onClick:{
			dbllist_button:function(e, id, trg){
				this.getTopParentView()._update_list(trg.getAttribute("action"));
			}
		}};
		if (this._settings.buttons)
			buttons.template = this._settings.buttons;

		return buttons;
	},
	_getButton: function(action, label){
		return "<button class='dbllist_button' action='"+action+"'>"+label+"</button>";
	},
	_getList: function(id, action, label, bottom){
		var list = {
			view: "list",
			select: "multiselect",
			multiselect: "touch",
			id: id,
			action: action,
			drag: true,
			type:{
				margin:3,
				id:id
			},
			on: {
				onBeforeDrop: function(context) {
					var source = context.from;
					var target = context.to;
					var top = source.getTopParentView();

					if (top === this.getTopParentView()) {
						var mode = (target._settings.action != "select_one");
						top.select(context.source, mode);
					}
					return false;
				},
				onItemDblClick: function(){
					return this.getTopParentView()._update_list(this.config.action);
				}
			}
		};

		if (this._settings.list)
			extend(list, this._settings.list, true);

		if (label)
			list = { rows:[{ view:"label", label:label, css:"webix_inp_top_label" }, list] };
		if (bottom)
			return { rows:[list, { view:"label", height:20, label:bottom, css:"bottom_label" }] };
		return list;
	},
	_setLayout: function() {
		var cols = [{
			margin: 10, type:"clean",
			cols: [
				this._getList("left", "select_one", this._settings.labelLeft, this._settings.labelBottomLeft),
				this._getButtons(),
				this._getList("right", "deselect_one", this._settings.labelRight, this._settings.labelBottomRight)
			]
		}];

		this.cols_setter(cols);
	},
	_update_list: function(action) {
		var top = this;
		var id = null;
		var mode = false;

		if (action === "select_all"){
			id = top.$$("left").data.order;
			mode = true;
		} else if (action === "select_one"){
			id = top.$$("left").getSelectedId(true);
			mode = true;
		} else if (action === "deselect_all"){
			id = top.$$("right").data.order;
			mode = false;
		} else if (action === "deselect_one"){
			id = top.$$("right").getSelectedId(true);
			mode = false;
		}

		top.select(id, mode);
	},
	select:function(id, mode){
		var i;
		if (typeof id !== "object") id = [id];

		if (mode){
			for (i = 0; i < id.length; i++)
				this._moved[id[i]] = true;
		} else {
			for (i = 0; i < id.length; i++)
				delete this._moved[id[i]];
		}
		this._refresh();
		this.callEvent("onChange", []);
	},
	_updateAndResize:function(handler, size){
		freeze(bind(handler, this), false);
		if (size && (this.$$("left")._settings.autoheight || this.$$("right")._settings.autoheight))
			this.resize();
	},
	_refresh: function() {
		var left = this.$$("left");
		var right = this.$$("right");

		if (left)
			this._updateAndResize(function(){
				left.filter(this._inLeft);
				right.filter(this._inRight);
			}, true);
	},
	focus:function(){
		if(!UIManager.canFocus(this))
			return false;
		UIManager.setFocus(this);
	},
	value_setter:function(val){
		this.setValue(val);
	},
	setValue: function(value) {
		this._moved = {};
		if (value){
			if (typeof value !== "object")
				value = value.toString().split(",");

			for (let i=0; i<value.length; i++)
				this._moved[value[i]] = true;
		}
		this._refresh();
	},
	getValue: function() {
		const value = [];
		const list = this.$$("left");

		for (let key in this._moved){
			if (!this._data_ready || list.data.pull[key])
				value.push(key);
		}
		return value.join(",");
	}
};


const view = protoUI(api,  AtomDataLoader, IdSpace, layout.view);
export default {api, view};