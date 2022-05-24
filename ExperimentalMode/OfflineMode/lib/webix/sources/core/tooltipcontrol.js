import {pos as getPos} from "../webix/html";
import {toNode, _to_array, isUndefined, delay} from "../webix/helpers";
import {event, eventRemove} from "../webix/htmlevents";
import {attachEvent, detachEvent} from "../webix/customevents";
import {assert} from "../webix/debug";
import {ui} from "../ui/core";


const TooltipControl = {
	_tooltip_masters: _to_array(["dummy"]),
	_tooltip_exist: 0,
	overflow: false,
	delay: 400,
	addTooltip:function(target,config){
		let node, ctrl;
		target = toNode(target);
		assert(target, "Target isn't defined");

		if (target instanceof Element){
			node = target;
			if (typeof config === "string")
				node.setAttribute("webix_tooltip",config);
			else ctrl = config;
		} else {
			node = target.$view;
			ctrl = target;
		}
		ctrl = ctrl || this;

		let index = this._tooltip_masters.find(ctrl);
		if (index === -1){
			index = this._tooltip_masters.length;
			this._tooltip_masters.push(ctrl);
		}
		node.webix_tooltip = index;
		this._tooltip_exist++;

		if(!this._tooltip){
			this._tooltip = new ui.tooltip({});
			this._tooltip._css_name = "webix_tooltip webix_global_tooltip";

			this._webix_tooltip_mm = event(document,"mousemove",this._move_tooltip,{ bind:this });
			this._webix_tooltip_ml = event(document,"mouseleave",this._hide_tooltip, { bind:this });
			this._drag_event = attachEvent("onDragMode", () => this._hide_tooltip());
			this._click_event = attachEvent("onClick", () => this._hide_tooltip());
		}
	},
	getTooltip:function(){
		return this._tooltip;
	},
	_move_tooltip:function(e){
		const c = { };
		let node = e.target;
		while (node instanceof Element && node.tagName != "HTML"){
			// find `webix_tooltip` marker
			if (!c.first || !c.overflow){
				const text = node.getAttribute("webix_tooltip");
				c.first = c.first || text;
				if (text && node.scrollWidth > node.clientWidth)
					c.overflow = text;
			}
			// find tooltip master
			if ( this._tooltip_masters[node.webix_tooltip] ){
				if (this._last && this._last != node){
					this.$tooltipOut(this._last,node,e);
					this._last = null;
					return;
				}
				if (!this._last)
					this._last = this.$tooltipIn(node,e);
				return this.$tooltipMove(node,e,c);
			}
			node = node.parentElement;
		}
		if (this._last)
			this._last = this.$tooltipOut(this._last,null,e);
	},
	_hide_tooltip:function(){
		clearTimeout(this._before_show_delay);
		this._tooltip.hide();
	},
	getMaster:function(t){
		return this._tooltip_masters[t.webix_tooltip];
	},
	removeTooltip:function(target){
		let node;
		assert(target, "Target isn't defined");

		target = toNode(target);
		if (target instanceof Element)
			node = target;
		else node = target.$view;

		const tip = node.webix_tooltip;
		if (tip){
			if (this._last == node){
				this._hide_tooltip();
				this._last = null;
			}
			delete node.webix_tooltip;
			this._tooltip_exist--;

			this._tooltip_masters[tip] = null;
		}

		if (!this._tooltip_exist && this._tooltip){
			// detach events first
			this._webix_tooltip_mm = eventRemove(this._webix_tooltip_mm);
			this._webix_tooltip_ml = eventRemove(this._webix_tooltip_ml);
			this._drag_event = detachEvent(this._drag_event);
			this._click_event = detachEvent(this._click_event);

			// then destroy the tooltip
			this._tooltip.destructor();
			this._tooltip = this._last = null;
			this._tooltip_masters = _to_array(["dummy"]);
		}
	},
	$tooltipIn:function(t,e){
		let m = this._tooltip_masters[t.webix_tooltip];
		if (m.$tooltipIn && m!=this)
			return m.$tooltipIn(t,e);
		this._tooltip.define( { dx:20, dy:0, template:"", css:""} );
		return t;
	},
	$tooltipOut:function(t,n,e){
		let m = this._tooltip_masters[t.webix_tooltip];
		if (m.$tooltipOut && m!=this)
			return m.$tooltipOut(t,n,e);
		this._hide_tooltip();
		return null;
	},
	$tooltipMove:function(t,e,c){
		let m = this._tooltip_masters[t.webix_tooltip];
		if (m.$tooltipMove && m!=this)
			return m.$tooltipMove(t,e,c);

		const overflow = isUndefined(m.overflow) ? this.overflow : m.overflow;
		const time = isUndefined(m.delay) ? this.delay : m.delay;
		const text = overflow ? c.overflow : c.first;

		if (time > 0)
			this._hide_tooltip();
		this._before_show_delay = delay(this._tooltip.show, this._tooltip, [text||{ }, getPos(e)], time);
	}

};

export default TooltipControl;