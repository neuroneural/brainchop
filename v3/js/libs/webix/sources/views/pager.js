import {addCss, insertBefore, removeCss} from "../webix/html";
import {protoUI, ui} from "../ui/core";
import {delay, extend, bind} from "../webix/helpers";
import animate from "../webix/animate";

import MouseEvents from "../core/mouseevents";
import SingleRender from "../core/singlerender";
import EventSystem from "../core/eventsystem";

import base from "../views/view";
import template from "../webix/template";

import i18n from "../webix/i18n";


i18n.pager = {
	first: "<span class='webix_icon wxi-angle-double-left'></span>",
	last: "<span class='webix_icon wxi-angle-double-right'></span>",
	next: "<span class='webix_icon wxi-angle-right'></span>",
	prev: "<span class='webix_icon wxi-angle-left'></span>"
};


const api = {
	defaults:{
		size:10,	//items on page
		page: 0,	//current page
		group:5,
		template:"{common.pages()}",
		maxWidth:100000,
		height:30,
		borderless:true
	},
	name:"pager",
	on_click:{
		//on paging button click
		"webix_pager_item":function(e,id){
			this.select(id);
		}
	},
	$init:function(config){
		this.data = this._settings;
		this._dataobj = this._viewobj;
		this._viewobj.className += " webix_pager"+(config.autowidth?" webix_pager_auto":"");

		if(config.master===false||config.master === 0)
			this.$ready.push(this._remove_master);
	},
	_remove_master:function(){
		this.refresh();
		this.$master = { refresh:function(){}, select:function(){} };
	},
	select:function(id){
		if (this.$master && this.$master.name == "pager")
			return this.$master.select(id);

		//id - id of button, number for page buttons
		switch(id){
			case "next":
				id = this._settings.page+1;
				break;
			case "prev":
				id = this._settings.page-1;
				break;
			case "first":
				id = 0;
				break;
			case "last":
				id = this._settings.limit-1;
				break;
			default:
				//use incoming id
				break;
		}
		if (id<0) id=0;
		if (id>=this.data.limit) id=this.data.limit-1;

		var old = this.data.page;
		if (this.callEvent("onBeforePageChange",[id, old])){
			this.data.page = id*1; //must be int
			if (this.refresh()){
				if (!this._settings.animate || !this._animate(old, id*1, this._settings.animate))
					this.$master.refresh();
			}
			this.callEvent("onAfterPageChange",[id]);	
		}
	},
	_id:/*@attr*/"webix_p_id",
	template_setter:template,
	type:{
		template:function(a,b){ return a.template.call(this, a,b); },
		//list of page numbers
		pages:function(obj){
			var html="";
			//skip rendering if paging is not fully initialized
			if (obj.page == -1) return "";
			//current page taken as center of view, calculate bounds of group
			obj.$min = obj.page-Math.round((obj.group-1)/2);
			obj.$max = obj.$min + obj.group*1 - 1;
			if (obj.$min<0){
				obj.$max+=obj.$min*(-1);
				obj.$min=0;
			}
			if (obj.$max>=obj.limit){
				obj.$min -= Math.min(obj.$min,obj.$max-obj.limit+1);
				obj.$max = obj.limit-1;
			}
			//generate HTML code of buttons
			for (var i=(obj.$min||0); i<=obj.$max; i++)
				html+=this.button({id:i, index:(i+1), selected:(i == obj.page ?"_selected":""), label:i18n.aria.page+" "+(i+1)});
			return html;
		},
		page:function(obj){
			return obj.page+1;
		},
		//go-to-first page button
		first:function(){
			return this.button({ id:"first", index:i18n.pager.first, selected:"", label:i18n.aria.pages[0]});
		},
		//go-to-last page button
		last:function(){
			return this.button({ id:"last", index:i18n.pager.last, selected:"", label:i18n.aria.pages[3]});
		},
		//go-to-prev page button
		prev:function(){
			return this.button({ id:"prev", index:i18n.pager.prev, selected:"", label:i18n.aria.pages[1]});
		},
		//go-to-next page button
		next:function(){
			return this.button({ id:"next", index:i18n.pager.next, selected:"", label:i18n.aria.pages[2]});
		},
		button:template("<button type='button' "+/*@attr*/"webix_p_id"+"='{obj.id}' class='webix_pager_item{obj.selected}' aria-label='{obj.label}'>{obj.index}</button>")
	},
	clone:function(pager){
		if (!pager.$view){
			pager.view = "pager";
			pager = ui(pager);
		}

		this._clone = pager;
		pager.$master = this;
		this._refresh_clone();
	},
	refresh:function(){
		var s = this._settings;

		//max page number
		s.limit = Math.ceil(s.count/s.size) || 1;

		var newPage = Math.min(s.limit-1, s.page);

		if (newPage != s.page)
			return this.$master.setPage(newPage);

		s.page = newPage;
		if (newPage>=0 && (newPage!=s.old_page) || (s.limit != s.old_limit) || (s.old_count != s.count)){
			//refresh self only if current page or total limit was changed
			this.render();
			this._refresh_clone();
			s.old_limit = s.limit;	//save for onchange check in next iteration
			s.old_page = s.page;
			s.old_count = s.count;
			return true;
		}
	},
	apiOnly_setter:function(value){
		return (this.$apiOnly=value);
	},
	_refresh_clone:function(){
		if (this._clone){
			this._clone._settings.count = this._settings.count;
			this._clone._settings.page = this._settings.page;
			this._clone.refresh();
		}
	},
	_animate:function(old, id, config){
		if (old == id) return false;
		if (this._pgInAnimation){
			if(this._pgAnimateTimeout){
				window.clearTimeout(this._pgAnimateTimeout);
			}
			return (this._pgAnimateTimeout = delay(this._animate, this,[old, id, config],100));
		}
		var direction = id > old ? "left" : "right";
		if (config.direction == "top" || config.direction == "bottom")
			direction = id > old ? "top" : "bottom";
		if (config.flip)
			direction = "";

		//make copy of existing view
		var top = 0;
		var snode = this.$master._dataobj;
		var isDataTable = !!this.$master._body;

		if (isDataTable){
			snode = this.$master._body;
			top = snode.offsetTop;
			addCss(this.$master.$view, "webix_animation");
		}

		var onode = snode.cloneNode(true);
		onode.style.width = snode.style.width = "100%";
		
		//redraw page
		this.$master.refresh();
		//append copy next to original
		insertBefore(onode, snode.nextSibling, snode.parentNode);
		if(isDataTable)
			onode.childNodes[1].scrollLeft = snode.childNodes[1].scrollLeft;

		//animation config
		var line;
		var base = config !== true ? config : {};
		var aniset = extend({
			direction:direction,
			callback:bind(function(){
				aniset.callback = null;
				animate.breakLine(line);
				this._pgInAnimation = false;
				if (this.$master._body)
					removeCss(this.$master.$view, "webix_animation");
			},this),
			top:top, keepViews: isDataTable
		}, base);

		//run animation
		line = animate.formLine(snode, onode, aniset);
		animate([ snode, onode ], aniset );
		this._pgInAnimation = true;
	}
};


const view = protoUI(api,  MouseEvents, SingleRender, base.view, EventSystem);
export default {api, view};