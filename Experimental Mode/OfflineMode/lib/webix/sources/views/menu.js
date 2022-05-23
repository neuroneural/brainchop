import list from "../views/list";
import {triggerEvent, getTextSize} from "../webix/html";
import {protoUI, ui, $$} from "../ui/core";
import template from "../webix/template";
import {$active} from "../webix/skin";
import env from "../webix/env";
import {bind, extend} from "../webix/helpers";
import {assert} from "../webix/debug";


// #include ui/window.js
// #include ui/list.js
const api = {
	name:"menu",
	_listClassName:"webix_menu",
	$init:function(config){
		if (config.autowidth){
			this._autowidth_submenu = true;
			delete config.autowidth;
		}

		this._init_mouse_events();
		this.data.attachEvent("onStoreUpdated", bind(function(){
			this._hide_sub_menu();
		},this));
		this.attachEvent("onItemClick", function(id, e, trg){
			const item = this.getItem(id);
			if (item){
				if (item.$template) return;

				const parent = this.getTopMenu();

				if (!parent.callEvent("onMenuItemClick", [id, e, trg])){
					e.showpopup = parent._settings.id;
					return;
				}

				if (this != parent)
					parent._call_onclick(id,e,trg);

				//click on group - do not close submenus
				if (!this.type._submenu(item) && !parent._show_child_on_click){
					parent._hide_sub_menu(true);
					if (parent._hide_on_item_click)
						parent.hide();
				} else {
					if (env.touch || (this === parent && parent._settings.openAction == "click")){
						this._mouse_move_activation(id, trg);
					}

					//do not close popups when clicking on menu folder
					e.showpopup = parent._settings.id;
				}
			}
		});

		this.attachEvent("onKeyPress", function(code){
			if(code === 9) this.getTopMenu()._hide_sub_menu();
			else if(code === 13 || code === 32){
				var sel = this.getSelectedId(), node;
				if(sel)
					node = this.getItemNode(sel);
				if(node)
					triggerEvent(node, "MouseEvents", "click");
			}

		});

		this.data.attachEvent("onClearAll", function(){
			this._hidden_items = [];
		});
		this.data._hidden_items = [];

		this._viewobj.setAttribute("role", "menubar");

		//component can create new view
		this._destroy_with_me = [];
	},
	_init_mouse_events:function(){
		this.attachEvent("onMouseMove", function(id, e, target){
			if (!this._menu_was_activated())
				return;
			this._mouse_move_activation(id, target);
		});
		this.attachEvent("onMouseOut", function(e){
			if (this._menu_was_activated() && this._settings.openAction == "click") return;
			if (!this._child_menu_active && (!e.relatedTarget || !this.$view.contains(e.relatedTarget)))
				this._hide_sub_menu();
		});
	},
	sizeToContent:function(){
		if (this._settings.layout == "y"){
			var texts = [];
			var isSubmenu = false;
			this.data.each(function(obj){
				texts.push(this._toHTML(obj));
				if(obj.submenu)
					isSubmenu = true;
			}, this);
			// text width + padding + borders+ arrow
			this.config.width = getTextSize(texts, this.$view.className).width+8*2+2+(isSubmenu?15:0);
			this.resize();
		} else assert(false, "sizeToContent will work for vertical menu only");
	},
	getTopMenu:function(){
		var parent = this;
		while (parent._parent_menu)
			parent = $$(parent._parent_menu);
		return parent;
	},
	_auto_height_calc:function(count){
		if (this._settings.autoheight)
			count = this.count();
		
		var value = this.count(), height = 0;

		for (var i=0; i<count; i++){
			var item = this.data.pull[this.data.order[i]];
			if (item && item.$template == "Separator"){
				height+=4;
				if(!this._settings.autoheight)
					count++;
			}
			else
				height+=this.type.height;
		}

		this._onoff_scroll(count && count < value, "y");
		
		return height;
	},
	on_mouse_move:{},
	type:{
		_submenu:function(obj){
			return obj.submenu || obj.data || obj.item;
		},
		css:"menu",
		width:"auto",
		aria:function(obj, common, marks){
			return "role=\"menuitem\""+(marks && marks.webix_selected?" aria-selected=\"true\" tabindex=\"0\"":"tabindex=\"-1\"")+(common._submenu(obj)?"aria-haspopup=\"true\"":"")+
				(obj.disabled?" aria-disabled=\"true\"  webix_disabled=\"true\"":"");
		},
		templateStart:function(obj, common, mark){
			if (obj.$template === "Separator" || obj.$template === "Spacer"){
				return "<div "+/*@attr*/"webix_l_id"+"=\"#id#\" role=\"separator\" tabindex=\"-1\" class=\"webix_context_"+obj.$template.toLowerCase()+"\">";
			}
			var link = (obj.href?" href='"+obj.href+"' ":"")+(obj.target?" target='"+obj.target+"' ":"");
			return list.api.type.templateStart(obj,common,mark).replace(/^<div/,"<a "+link)+((common._submenu(obj) && common.subsign)?"<div class='webix_submenu_icon'></div>":"");
		},
		templateEnd: function(obj){
			return (obj.$template === "Separator" || obj.$template === "Spacer")?"</div>":"</a>";
		},
		templateSeparator:template("<div class='sep_line'></div>"),
		templateSpacer:template("<div></div>")
	},
	getMenu: function(id){
		if (!this.data.pull[id]){
			for (var subid in this.data.pull){
				var obj = this.getItem(subid);
				if (obj.submenu){
					var search = this._get_submenu(obj).getMenu(id);
					if (search) return search;
				}
			}
		} else return this;
	},
	getSubMenu:function(id){
		var menu = this.getMenu(id);
		var obj = menu.getItem(id);
		return (obj.submenu?menu._get_submenu(obj):null);
	},
	getMenuItem:function(id){
		return this.getMenu(id).getItem(id);
	},
	_get_submenu:function(data){
		var sub  = $$(data.submenu);
		if (!sub){
			data.submenu = this._create_sub_menu(data);
			sub = $$(data.submenu);
		}
		return sub;
	},
	_menu_was_activated:function(){
		if (env.touch) return false;
		var top = this.getTopMenu();
		if (top._settings.openAction == "click"){
			var sub = top._open_sub_menu;
			if (sub && $$(sub).isVisible())
				return true;
			return false;
		}
		return true;
	},
	_mouse_move_activation:function(id, target){
		var data = this.getItem(id);
		if (!data) return;
		
		//clear flag of submenu usage
		this._child_menu_active = null;

		//hide previously opened sub-menu
		if (this._open_sub_menu && data.submenu != this._open_sub_menu)
			this._hide_sub_menu(true);

		//show submenu
		if (this.type._submenu(data)&&!this.config.hidden){

			var sub  = this._get_submenu(data);
			if (!this.isItemEnabled(id)) return;

			sub.show(target,{ pos:this._settings.subMenuPos });
			sub._parent_menu = this._settings.id;

			this._open_sub_menu = data.submenu;
		}
	},
	disableItem:function(id){
		const menu = this.getMenu(id);
		if (menu) menu._set_item_disabled(id, true);
	},
	enableItem:function(id){
		const menu = this.getMenu(id);
		if (menu) menu._set_item_disabled(id, false);
	},
	isItemEnabled:function(id){
		const menu = this.getMenu(id);
		if (menu) return list.api.isItemEnabled.apply(menu, arguments);
	},
	_set_item_hidden:function(id, state){
		var menu = this.data;
		if (menu._hidden_items[id] != state){
			menu._hidden_items[id] = state;
			menu.filter(function(obj){
				return !menu._hidden_items[obj.id];
			});
			this.resize();		
		}
	},
	hideItem:function(id){
		var menu = this.getMenu(id);
		if (menu) menu._set_item_hidden(id, true);
	},
	showItem:function(id){
		var menu = this.getMenu(id);
		if (menu){
			menu._set_item_hidden(id, false);
			return list.api.showItem.call(menu, id);
		}
	},
	_hide_sub_menu : function(mode){
		if (this._open_sub_menu){
			//recursive sub-closing
			var sub = $$(this._open_sub_menu);
			if (sub._hide_sub_menu)	//custom context may not have submenu
				sub._hide_sub_menu(mode);
			if (mode || !sub._show_on_mouse_out){
				sub.hide();
				this._open_sub_menu = null;
			}
		}
	},
	_create_sub_menu : function(data){
		var listConfig = {
			view:"submenu",
			data:this.type._submenu(data)
		};

		var settings = this.getTopMenu()._settings.submenuConfig;
		if (settings)
			extend(listConfig, settings, true);

		var parentData = this.getMenuItem(data.id);
		if(parentData && parentData.config)
			extend(listConfig, parentData.config, true);

		var menu = ui(listConfig);
		this._destroy_with_me.push(menu);
		menu._parent_menu = this;
		return menu._settings.id;
	},
	_skip_item:function(id, prev, dir){
		const item = this.getItem(id);
		if (item.$template == "Separator" || item.$template == "Spacer" || !this.isItemEnabled(id)){
			id = this.getNextId(id, dir) || null;
			return (id && id != prev)? this._skip_item(id, prev, dir) : prev;
		}
		return id;
	},
	$skin:function(){
		list.api.$skin.call(this);

		this.type.height = $active.menuHeight;
	},
	defaults:{
		scroll:"",
		layout:"x",
		mouseEventDelay:100,
		subMenuPos:"bottom"
	}
};


const view = protoUI(api,  list.view);
export default {api, view};