import {protoUI, ui, $$} from "../ui/core";
import UIManager from "../core/uimanager";
import {$active} from "../webix/skin";
import {extend} from "../webix/helpers";
import i18n from "../webix/i18n";
import template from "../webix/template";

import segmented from "../views/segmented";

const api = {
	name:"tabbar",
	$init:function(){
		this.attachEvent("onKeyPress", this._onKeyPress);
	},
	$skin:function(){
		var skin = $active;
		var defaults = this.defaults;

		defaults.topOffset = skin.tabTopOffset||0;
		defaults.tabOffset = (typeof skin.tabOffset != "undefined"?skin.tabOffset:10);
		defaults.bottomOffset = skin.tabBottomOffset||0;
		defaults.height = skin.tabbarHeight;

		defaults.tabMargin = skin.tabMargin;
		defaults.inputPadding = skin.inputPadding;
		defaults.tabMinWidth = skin.tabMinWidth||100;
		defaults.tabMoreWidth = skin.tabMoreWidth||40;
		defaults.borderless = !skin.tabBorder;
	},
	_getTabbarSizes: function(){

		var config = this._settings,
			i, len,
			tabs = this._filterOptions(config.options),
			totalWidth = this._input_width - config.tabOffset*2,
			limitWidth = config.optionWidth||config.tabMinWidth;

		len = tabs.length;

		if(config.tabMinWidth && totalWidth/len < limitWidth){
			return { max: (parseInt(totalWidth/limitWidth,10)||1)};
		}


		if(!config.optionWidth){
			for(i=0;i< len; i++){
				if(tabs[i].width){
					totalWidth -= tabs[i].width+(!i&&!config .type?config.tabMargin:0);
					len--;
				}
			}
		}

		return {width: (len?totalWidth/len:config.tabMinWidth)};
	},
	_init_popup: function () {
		const obj = this._settings;

		// if tabbar popup is set as plain object with config
		if (!obj.tabbarPopup || !$$(obj.tabbarPopup)) {
			const popupConfig = extend(
				{
					view: "popup",
					autofocus: false,
					width: 200,
				},
				obj.tabbarPopup || {}
			);

			const body = extend(
				{
					view: "list",
					borderless: true,
					select: true,
					autoheight: true,
					yCount: 7,
					template: template("#value#"),
				},
				obj.tabbarPopup ? obj.tabbarPopup.body || {} : {},
				true
			);
			body.css = `webix_tab_list ${body.css || ""}`;
			popupConfig.body = body;

			const view = ui(popupConfig);
			const list = view.getBody();

			view.attachEvent("onShow", () => {
				list.unselect();
				UIManager.setFocus(list);

				const node = list.getItemNode(list.getFirstId());
				if (node) node.focus();
			});
			list.attachEvent("onItemClick", id => this._popupInnerClick(id));
			list.attachEvent("onEnter", () => this._popupInnerClick());

			obj.tabbarPopup = view._settings.id;
			this._destroy_with_me.push(view);
		}

		this._init_popup = function () {};
	},
	_popupInnerClick(id){
		const popup = $$(this._settings.tabbarPopup);
		id = id || popup.getBody().getSelectedId();

		if (id && this.callEvent("onBeforeTabClick", [id])){
			this.setValue(id, "user");
			popup.hide();
			this.callEvent("onAfterTabClick", [id]);
			this.refresh();
			this.focus();
		}
		return false;
	},
	getPopup: function(){
		this._init_popup();
		return $$(this._settings.tabbarPopup);
	},
	moreTemplate_setter: template,
	defaults:{
		moreTemplate: "<span class=\"webix_icon wxi-dots\"></span>",
		template:function(obj,common) {
			common._check_options(obj.options);

			let tabs = common._filterOptions(obj.options);
			let contentWidth, html, leafWidth, resultHTML, style, sum, verticalOffset, width;

			if (!tabs.length){
				html = "<div class='webix_tab_filler' style='width:"+common._input_width+"px; border-right:0px;'></div>";
			} else {
				if (!obj.value)
					obj.value = common._getFirstActive(true);

				html = "";
				if (obj.tabOffset)
					html += "<div class='webix_tab_filler' style='width:"+obj.tabOffset+"px;'>&nbsp;</div>";
				contentWidth = common._input_width - obj.tabOffset*2-(!obj.type?(obj.tabMargin)*(tabs.length-1):0);
				verticalOffset = obj.topOffset+obj.bottomOffset;

				var sizes = common._getTabbarSizes();

				if (sizes.max && sizes.max < tabs.length){
					//we need popup
					const popup = common.getPopup();
					popup.hide();

					const body = (popup.getBody()||null);
					if(body){
						if (sizes.max){
							for (let i=0, found=false; i < tabs.length && !found; i++)
								if(tabs[i].id== obj.value){
									found = true;
									if((i+1) > sizes.max){
										let selectedTab =  tabs.splice(i, 1);
										let displayTabs = tabs.splice(0, sizes.max-1).concat(selectedTab);
										tabs = displayTabs.concat(tabs);
									}
								}
							body.clearAll();
							body.parse(tabs.slice(sizes.max));
						}
						else {
							body.clearAll();
						}
					}
				} else if (common._settings.tabbarPopup) {
					const popup = $$(common._settings.tabbarPopup);
					if (popup) popup.hide();
				}

				sum = obj.tabOffset;
				for (let i=0, lastTab=false; (i<tabs.length) && !lastTab; i++) {

					// tab width
					if(sizes && sizes.max){
						if(sizes.max == (i + 1)){
							lastTab = true;
						}
						contentWidth = common._input_width - obj.tabOffset*2-(!obj.type&&(sizes.max>1)?(obj.tabMargin)*(sizes.max-1):0);
						width = (contentWidth - obj.tabMoreWidth)/sizes.max ;
					}
					else
						width = sizes.width;

					width = (tabs[i].width||obj.optionWidth||width);

					sum += width + (i&&!obj.type?obj.tabMargin:0);

					if(obj.tabMargin>0&&i&&!obj.type)
						html += "<div class='webix_tab_filler' style='width:"+obj.tabMargin+"px;'></div>";

					// tab innerHTML
					html += common._getTabHTML(tabs[i], width);


					if(lastTab){
						html += "<div role=\"button\" tabindex=\"0\" aria-label=\""+i18n.aria.showTabs+"\" class=\"webix_tab_more_icon\" style=\"width:"+obj.tabMoreWidth+"px;\">"+obj.moreTemplate(obj,common)+"</div>";
						sum += obj.tabMoreWidth;
					}
				}


				leafWidth = common._content_width - sum;

				if (leafWidth>0 && !obj.type)
					html += "<div class='webix_tab_filler' style='width:"+leafWidth+"px;'>&nbsp;</div>";
			}

			resultHTML = "";

			// consider top and bottom offset in tabs height (top tabbar)
			style = (verticalOffset&& !obj.type)?"height:"+(common._content_height-verticalOffset)+"px":"";

			//space above tabs (top tabbar)
			if(obj.topOffset && !obj.type)
				resultHTML += "<div class='webix_before_all_tabs' style='width:100%;height:"+obj.topOffset+"px'></div>";

			// tabs html
			resultHTML +=  "<div style='"+style+"' role='tablist' class='webix_all_tabs "+(obj.type?("webixtype_"+obj.type):"")+"'>"+html+"</div>";

			//space below to tabs (top tabbar)
			if(obj.bottomOffset && !obj.type)
				resultHTML += "<div class='webix_after_all_tabs' style='width:100%;height:"+obj.bottomOffset+"px'></div>";

			return resultHTML;
		}
	},
	_getInputNode:function(){
		return this.$view.querySelectorAll(".webix_item_tab");
	},
	_getTabHTML: function(tab, width){
		var	html,
			className = "",
			tooltip = "",
			isDisabled = !!tab.disabled,
			config = this.config;

		if (tab.id == config.value)
			className += " webix_selected";

		if (isDisabled)
			className += " webix_disabled";

		if (tab.css)
			className+=" "+tab.css;

		if (config.tooltip)
			tooltip = " webix_t_id='"+tab.id+"'";

		width = (tab.width||width);
		html = "<div class=\"webix_item_tab"+className+"\" "+/*@attr*/"button_id=\""+tab.id+"\" role=\"tab\" "+
			"aria-selected=\""+(tab.id== config.value?"true":"false")+"\" tabindex=\""+(!isDisabled && tab.id==config.value?"0":"-1")+
			"\" style=\"width:"+width+"px;\""+(isDisabled?" webix_disabled=\"true\"":"")+tooltip+">";

		// a tab title
		if(this._tabTemplate){
			var calcHeight = this._content_height- config.inputPadding*2 - 2;
			var height = this._content_height - 2;
			var temp = extend({ cheight: calcHeight, aheight:height }, tab);
			html+= this._tabTemplate(temp);
		}
		else {
			var icon = tab.icon?("<span class='webix_icon "+tab.icon+"'></span> "):"";
			html+=icon + tab.value;
		}

		if (!isDisabled && (tab.close || config.close))
			html+="<span role='button' tabindex='0' aria-label='"+i18n.aria.closeTab+"' class='webix_tab_close webix_icon wxi-close'></span>";

		html+="</div>";
		return html;
	},
	_getBox:function(){
		return this._dataobj.firstChild;
	},
	_types:{
		image:"<div class='webix_img_btn_top' style='height:#cheight#px;background-image:url(#image#);'><div class='webix_img_btn_text'>#value#</div></div>",
		icon:"<div class='webix_img_btn' style='line-height:#cheight#px;height:#cheight#px;'><span class='webix_icon_btn #icon#' style='max-width:#cheight#px;max-height:#cheight#px;'></span>#value#</div>",
		iconTop:"<div class='webix_img_btn_top' style='height:#cheight#px;width:100%;top:0px;text-align:center;'><span class='webix_icon #icon#'></span><div class='webix_img_btn_text'>#value#</div></div>"
	},
	type_setter:function(value){
		this._settings.tabOffset = 0;
		if (this._types[value])
			this._tabTemplate = template(this._types[value]);
		return value;
	}
};


const view = protoUI(api,  segmented.view);
export default {api, view};