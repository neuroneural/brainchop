import {addCss, removeCss} from "../webix/html";
import {protoUI, ui, $$} from "../ui/core";
import {$active} from "../webix/skin";
import {copy, extend, isArray, isUndefined} from "../webix/helpers";
import {_event} from "../webix/htmlevents";

import type from "../webix/type";
import env from "../webix/env";
import tree from "../views/tree";
import TreeAPI from "../core/treeapi";


const api = {
	name: "sidebar",
	defaults:{
		type: "sideBar",
		activeTitle: true,
		select: true,
		scroll: false,
		collapsed: false,
		collapsedWidth: 44,
		position: "left",
		width: 250,
		mouseEventDelay: 10
	},
	$skin: function(){
		this.defaults.titleHeight = $active.sidebarTitleHeight;
	},
	$init: function(config){
		this._fullWidth = isUndefined(config.width) ? this.defaults.width : config.width;
		this._settings.width = config.width = 
			config.collapsed
				? (config.collapsedWidth || this.defaults.collapsedWidth)
				: this._fullWidth;

		this.$view.className += " webix_sidebar";
		this.$ready.push(this._initSidebar);
		this.$ready.push(this._initContextMenu);

		this.data._scheme_init = function(obj){
			if (obj.data)
				obj.menu = copy(obj.data);
			else if (obj.item) //xml child records, can be {} or []
				obj.menu = copy(obj.item.length?obj.item:[obj.item]);
		};
		config.multiselect = false;
	},
	on_context:{},
	on_mouse_move:{},
	_initSidebar: function(){
		this.attachEvent("onBeforeOpen", function(id){
			if(!this.config.multipleOpen){
				var open = this.getOpenItems();
				for(var i=0; i<open.length; i++){
					if(this.getParentId(id) == this.getParentId(open[i]))
						this.close(open[i]);
				}
			}
			return !this.config.collapsed;
		});
		this.attachEvent("onItemClick", function(id, ev, node){
			const popup = this.getPopup();
			if(popup && !popup.config.hidden)
				ev.showpopup = popup.config.id;
			if(env.touch)
				this._showPopup(id, node);
		});
		this.attachEvent("onBeforeSelect", function(id){
			if(!this.getItem(id).$count){
				this.clearCss("webix_sidebar_selected");
				return true;
			}
			return false;
		});
		this.attachEvent("onAfterSelect", function(id){
			this._markMenu(this, id, !$active.sidebarMarkAll);
			this.getPopup()._onMasterSelect(id);
		});
		this.attachEvent("onAfterUnSelect", function(){
			this.clearCss("webix_sidebar_selected");
		});
		this.attachEvent("onMouseMove", function(id, ev, node){
			this._showPopup(id, node);
		});
		this.attachEvent("onMouseOut", function(){
			if (this.config.collapsed)
				this.getPopup().masterId = null;
		});
	},
	_showPopup: function(id, node){
		if (this.config.collapsed){
			var popup = this.getPopup();
			if (popup){
				this._updateTitle(id, popup);
				this._updateList(id, popup);

				popup.masterId = id;
				popup.show(node, {
					x: (this.config.position == "left"?this.config.collapsedWidth:-popup.config.width), 
					y: -1
				});
			}
		}
	},
	_updateTitle: function(id, popup){
		const title = popup.getBody().getChildViews()[0];
		if (!title || popup.masterId == id) return;

		title.parse(this.getItem(id));

		const selectedId = this.getSelectedId();
		if (selectedId == id){
			addCss(title.$view, "webix_selected", true);
		} else {
			removeCss(title.$view, "webix_selected");
		}
	},
	_updateList: function(id, popup){
		const list = popup.getBody().getChildViews()[1];
		if (!list || popup.masterId == id) return;

		if (this.exists(popup.masterId) && this.getItem(popup.masterId).menu)
			this.updateItem(popup.masterId, {menu:list.data.serialize()});

		list.clearCss("webix_sidebar_selected");
		list.unselectAll();

		const data = copy(this.getItem(id).menu || []);
		if (data.length){
			list.show();
			list.data.importData(data);

			const selectedId = this.getSelectedId();
			if (list.exists(selectedId))
				list.select(selectedId);
			else if (selectedId)
				this._markMenu(list, selectedId);
		} else {
			list.hide();
			list.data.clearAll();
		}
	},
	_initContextMenu: function(){
		var master = this,
			config = master.config,
			popup;

		if(config.popup){
			popup = $$(config.popup);
		}
		if(!popup){
			var dirClassName = (config.position=="left"?"webix_sidebar_popup_left":"webix_sidebar_popup_right");
			var subMenuPos = (config.position == "left"?"right":"left");
			var menuTemplate = function(obj) {
				var icon = "wxi-angle-"+(config.position == "left"?"right":"left");
				var arrow = obj.submenu||obj.data||obj.item ? "<div class=\"webix_icon "+ icon+"\"></div>" : "";
				return arrow+obj.value;
			};
			var css = config.css ? " "+config.css : "";

			var popupConfig = {
				view:"popup",
				css: "webix_sidebar_popup "+dirClassName+css,
				autofit: false,
				width: this._fullWidth - this.config.collapsedWidth,
				borderless: true,
				padding:0,
				body:{
					rows:[
						{
							view: "template", 	borderless: true, css: "webix_sidebar_popup_title",
							template: "#value#", height: this.config.titleHeight+2,
							onClick:{
								webix_template: function(){
									var id = this.getValues().id;
									if(!master.getItem(id).$count)
										master.select(id);
								}
							}
						},
						{ 
							view: "menu", 
							submenu:"data",
							layout: "y",
							subMenuPos:subMenuPos,
							select: true,
							borderless: true,
							autoheight: true,
							css: "webix_sidebar_popup_list "+dirClassName+css,
							template: menuTemplate,
							type:{ subsign:false },
							submenuConfig:{
								padding:0,
								subMenuPos:subMenuPos,
								template:menuTemplate,
								select:true,
								type:{ subsign:false },
								css:"webix_sidebar_popup_list "+dirClassName+css,
								on:{
									onShow:function(){
										this.clearCss("webix_sidebar_selected");
										this.unselectAll();
										var sel = master.getSelectedId();
										if(sel && this.exists(sel))
											this.select(sel);
										else if(sel)
											master._markMenu(this, sel);
									},
									onBeforeSelect:function(id){
										if(this.getSubMenu(id))
											return false;
									},
									onAfterSelect:function(id){
										var menu = master.getPopup().queryView({view:"menu"});
										var parent = master.getParentId(id);
										while(parent){
											var sub = menu.getMenu(parent);
											if(sub){
												sub.unselectAll();
												master._markMenu(sub, id);
											}	
											parent = master.getParentId(parent);
										}
										master._markMenu(this, id);
									}
								}
							},
							on:{
								onBeforeSelect:function(id){
									if(this.getSubMenu(id))
										return false;
								},
								onMenuItemClick: function(id){
									if(!this.getSubMenu(id))
										master.select(id);
								}
							}
						}
					]
				}
			};

			extend(popupConfig, config.popup||{}, true);
			popup = ui(popupConfig);
			popup._onMasterSelect = function(id){
				if(master.config.collapsed && master.getItem(id).$level == 1){
					let title = popup.getBody().getChildViews()[0];
					if (title)
						addCss(title.$view, "webix_selected", true);
				}
			};
			popup.queryView({view:"menu"})._show_child_on_click = true;
		}

		popup.attachEvent("onBeforeShow",function(){
			return config.collapsed;
		});

		this._destroy_with_me = [popup];
		config.popupId = popup.config.id;

		_event(document.body,"mousemove", function(e){
			var trg = e.target;
			if(!popup.config.hidden && !popup.$view.contains(trg) && !this.$view.firstChild.contains(trg) && !popup.queryView({view:"menu"})._open_sub_menu){
				popup.hide();
			}
		}, {bind:this});
	},
	_markMenu:function(view, sel, topOnly){
		var css = "webix_sidebar_selected";
		view.data.each(function(obj){
			if(this._isChild(sel, obj.id) && (!topOnly || this.getParentId(obj.id)=="0"))
				view.addCss(obj.id, css);
			else if(view.hasCss(obj.id, css))
				view.removeCss(obj.id, css);
		}, this);
	},
	_isChild:function(cid, pid){
		var parent = this.getParentId(cid);
		if(pid == parent) return true;
		if(parent)
			return this._isChild(parent, pid);
		return false;
	},
	getPopup: function(){
		return $$(this.config.popupId);
	},
	position_setter:function(value){
		var newPos = value;
		var oldPos = value=="left"?"right":"left";

		removeCss(this.$view, "webix_sidebar_"+oldPos);
		addCss(this.$view, "webix_sidebar_"+newPos, true);

		var popup = this.getPopup();
		if(popup){
			var popupEl = popup.$view;
			removeCss(popupEl, "webix_sidebar_popup_"+oldPos);
			addCss(popupEl, "webix_sidebar_popup_"+newPos, true);
		}
		return value;
	},
	select:function(id){
		//ignore multiple selection
		if(id){
			if (isArray(id)) id = id.pop();
			tree.api.select.call(this, id);
		}
	},
	selectAll:function(){},
	collapse: function(){
		this.define("collapsed", true);
	},
	expand: function(){
		this.define("collapsed", false);
	},
	toggle: function(){
		var collapsed = !this.config.collapsed;
		this.define("collapsed", collapsed);
	},
	collapsed_setter: function(value){
		let width;

		if(!value){
			width = this._fullWidth;
			this.type.collapsed = false;
			addCss(this.$view, "webix_sidebar_expanded", true);
		}
		else{
			width = this.config.collapsedWidth;
			this.closeAll();
			this.type.collapsed = true;
			removeCss(this.$view, "webix_sidebar_expanded");
		}

		if(!isUndefined(width) && width !== this.config.width){ //skip first rendering
			this.define("width", width);
			this.resize();
		}

		return value;
	},
	getState:function(){
		var state = { collapsed:this.config.collapsed };
		extend(state, TreeAPI.getState.call(this));
		return state;
	},
	setState:function(state){
		TreeAPI.setState.call(this, state);
		this.define("collapsed", state.collapsed);
	}
};

type(tree.view, {
	name:"sideBar",
	height: "auto",
	template: function(obj, common){
		if(common.collapsed)
			return common.icon(obj, common);
		return   common.arrow(obj, common)+common.icon(obj, common) +"<span>"+obj.value+"</span>";
	},
	arrow: function(obj) {
		var html = "";
		for (var i=1; i<=obj.$level; i++) {
			if (i==obj.$level && obj.$count) {
				var icon = "wxi-angle-"+(obj.open?"down":"left");
				var className = "webix_sidebar_dir_icon webix_icon "+ icon;
				html+="<span class='"+className+"'></span>";
			}
		}
		return html;
	},
	icon: function(obj) {
		var style = "";
		if (obj.$level > 2) {
			style = "style=\"padding-left:"+ (40 * (obj.$level - 2))+"px\"";
		}
		if (obj.icon)
			return "<span class='webix_icon webix_sidebar_icon "+obj.icon+"' " + style + "></span>";
		return "<span "+style+"></span>";
	}
});

const view = protoUI(api, tree.view);
export default {api, view};