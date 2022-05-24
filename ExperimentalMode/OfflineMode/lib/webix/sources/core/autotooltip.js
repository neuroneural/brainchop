import {pos as getPos} from "../webix/html";
import {delay, extend, isUndefined} from "../webix/helpers";
import TooltipControl from "../core/tooltipcontrol";

//indirect UI import
import "../views/tooltip";

/*
	Behavior: AutoTooltip - links tooltip to data driven item
*/

const AutoTooltip = {
	tooltip_setter:function(value){
		if (value){
			if (typeof value === "function" || typeof value === "string")
				value = { template:value };
			if (typeof value !== "object")
				value = {};

			if (value.overflow && isUndefined(value.template))
				value.template = "";

			this._init_tooltip_once();
			return value;
		} else if (this._settings.tooltip)
			return { template:"" };
	},
	_init_tooltip_once:function(){
		TooltipControl.addTooltip(this);
		this.attachEvent("onDestruct",function(){
			TooltipControl.removeTooltip(this);
		});
		this.attachEvent("onAfterScroll", function(){
			if (TooltipControl._tooltip_exist)
				TooltipControl._hide_tooltip();
		});

		this._init_tooltip_once = function(){};
	},
	$tooltipIn:function(t){
		let tooltip = TooltipControl._tooltip;
		let def = extend({dx:20, dy:0, template:"{obj.value}", css:""}, this._settings.tooltip, true);

		tooltip.define( def );
		return t;
	},
	$tooltipOut:function(){
		TooltipControl._hide_tooltip();
		return null;
	},
	$tooltipMove:function(t,e,c){
		const tooltip = this._settings.tooltip;
		const overflow = !tooltip || isUndefined(tooltip.overflow) ? TooltipControl.overflow : tooltip.overflow;
		const time = !tooltip || isUndefined(tooltip.delay) ? TooltipControl.delay : tooltip.delay;
		const text = overflow ? c.overflow : c.first;

		if (time > 0)
			TooltipControl._hide_tooltip();
		TooltipControl._before_show_delay = delay(this._show_tooltip, this, [t, e, text], time);
	},
	_show_tooltip:function(t,e,text){
		const data = text || this._get_tooltip_data(t,e);
		if (!data || !this.isVisible())
			return;
		TooltipControl._tooltip.show(data, getPos(e));
	},
	_get_tooltip_data:function(t,e){
		if (this.locate && this.getItem){
			let id = this.locate(e);
			if (!id) return null;

			return this.getItem(id);
		}
		return this._settings;
	}
};

export default AutoTooltip;