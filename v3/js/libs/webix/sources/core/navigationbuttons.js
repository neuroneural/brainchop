import {preventEvent, remove, create} from "../webix/html";
import {bind} from "../webix/helpers";
import {$$} from "../ui/core";
import i18n from "../webix/i18n";
import {event} from "../webix/htmlevents";


/*
    UI: navigation control
*/
const NavigationButtons = {
	$init:function(){
		this.$ready.push(function(){
			this.attachEvent("onKeyPress", this._onKeyPress);
		});
	},
	_moveActive:function(code, e){
		if(code === 37  || code === 39){
			preventEvent(e);
			this._showNavItem(code===37?-1:1);

			var node = this._navPanel.querySelector("[tabindex='0']");
			if(node) node.focus();
		}
	},
	_renderPanel:function(){
		remove(this._navPanel);


		this._navPanel = create("DIV",{
			"class":"webix_nav_panel "+"webix_nav_panel_"+this._settings.navigation.type,
			"role":"tablist"
		},"");

		this._viewobj.appendChild(this._navPanel);


		this._renderNavItems();
		this._renderNavButtons();
		this._setLinkEventHandler();
	},
	_setLinkEventHandler: function(){
		var h = [];
		if(this._navPanel)
			h[0] = event(this._navPanel,"click", bind(function(e){
				var elem = e.target;
				var found = false;
				while(elem != this._navPanel && !found){
					var bindId = elem.getAttribute(this._linkAttr);
					if(bindId){
						found = true;
						this._showPanelBind(bindId);
					}
					elem = elem.parentNode;
				}
			},this));
		if(this._prevNavButton)
			h[1] = event(this._prevNavButton,"click", bind(function(){
				this._showNavItem(-1);
			},this));
		if(this._nextNavButton)
			h[1] = event(this._nextNavButton,"click", bind(function(){
				this._showNavItem(1);
			},this));
		this.attachEvent("onDestruct", function(){
			for(var i=0;i< h.length; i++){
				this.detachEvent(h[i]);
			}
			h = null;
		});
	},
	_showNavItem: function(inc){
		if(this._cells){
			var index = this._active_cell + inc;
			if(index >= this._cells.length || index < 0){
				index = (index < 0?this._cells.length-1:0);
			}
			this.setActiveIndex(index);
		}
	},
	_showPanelBind: function(id){
		if(this._cells)
			$$(id).show();
	},
	_renderNavItems:function(){
		var item, config;
		config = this._settings.navigation;
		if(config.items){
			this._linkAttr = config.linkAttr || /*@attr*/"bind_id";

			if(!this._navPanel)
				this._renderPanel();
			else
				this._clearPanel();

			var data = (this._cells?this._cells:this.data.order);
			if(data.length>1){
				for (var i=0; i < data.length; i++){

					item = create("DIV",{
						"class":"webix_nav_item webix_nav_"+(i==this._active_cell?"active":"inactive"),
						"role":"tab",
						"tabindex":(i==this._active_cell?"0":"-1")
					});
					var id = this._cells?this._cells[i]._settings.id:data[i];
					if(id)
						item.setAttribute(this._linkAttr, id);
					this._navPanel.appendChild(item);
				}
			}
		}
	},
	_clearPanel:function(){
		if (this._navPanel){
			var coll = this._navPanel.childNodes;
			for (var i = coll.length - 1; i >= 0; i--)
				remove(coll[i]);
		}
	},
	_renderNavButtons: function(){
		var config = this._settings.navigation;
		if(config.buttons){

			if(this._prevNavButton)
				remove(this._prevNavButton);
			if(this._prevNavButton)
				remove(this._nextNavButton);


			this._prevNavButton = create(
				"DIV",
				{
					"class":"webix_nav_button_"+config.type+" webix_nav_button_prev "
				},
				"<div role=\"button\" tabindex=\"0\" aria-label=\""+i18n.aria.prevTab+"\" class=\"webix_nav_button_inner\"></div>"
			);
			this._viewobj.appendChild(this._prevNavButton);

			this._nextNavButton = create(
				"DIV",
				{
					"class":"webix_nav_button_"+config.type+" webix_nav_button_next "
				},
				"<div role=\"button\" tabindex=\"0\" aria-label=\""+i18n.aria.prevTab+"\" class=\"webix_nav_button_inner\"></div>"
			);
			this._viewobj.appendChild(this._nextNavButton);
		}
	}
};

export default NavigationButtons;