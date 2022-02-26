import {pos as htmlPos, addCss, removeCss, offset, preventEvent} from "../webix/html";
import {protoUI} from "../ui/core";
import {_event, event, eventRemove} from "../webix/htmlevents";
import {$active, $name} from "../webix/skin";
import i18n from "../webix/i18n";
import env from "../webix/env";

import color from "../webix/color";

import EventSystem from "../core/eventsystem";
import base from "../views/view";

const api = {
	name:"colorselect",
	defaults:{
		width: 260,
		height: 250,
		value:"#751FE0"
	},
	$init:function(){
		this._hValue = this._sValue = this._vValue = 0;

		if(env.touch){
			this.attachEvent("onTouchStart", (e, ctx) => {
				const css = e.target.className;
				const parent = e.target.parentNode.className;

				if(css == "webix_color_block" || parent == "webix_color_block")
					this._handle_dnd(ctx||e);
				else if(css.indexOf("webix_color_line") == 0)
					this._handle_dnd(ctx||e, true);
			});
		}
		_event(this.$view, "keydown", (e) => this._handle_move_keyboard(e));
		this.attachEvent("onAfterRender", function(){
			if(!env.touch){
				_event(this._colorBlock, "mousedown", (e) => this._handle_dnd(e));
				_event(this._colorLine, "mousedown", (e) => this._handle_dnd(e, true));
			}
			_event(this._colorOutText, "change", () => this.setValue(this._colorOutText.value, "user"));
			if(this._settings.button)
				_event(this._viewobj.querySelector(".webix_button"), "click", () => {
					this.callEvent("onColorSelect", [this.getValue()]);
				});
		});
		this.attachEvent("onDestruct", function(){
			this._colorCircle = this._colorLineCircle = this._colorBlock = null;
			this._colorLine = this._colorOutText = this._colorOutBlock = this._offset = null;

			if(this._handle_drag_events) this._detach_drag_events();
		});
	},
	$skin:function(){
		if($name == "compact" || $name == "mini")
			this._inpHeight = 24;
		else
			this._inpHeight = 32;
	},
	$setSize:function(x,y){
		if(base.api.$setSize.call(this,x,y)){
			this.render();
		}
	},
	getValue:function(){
		return this._settings.value;
	},
	$prepareValue:function(value){
		value = value ? value.toString(16) : "";
		if (value && value.charAt(0) != "#" && /^[0-9a-fA-F]+$/.test(value))
			value = "#" + value;
		return value;
	},
	value_setter:function(value){
		return this.$prepareValue(value);
	},
	setValue:function(value, config){
		value = this.$prepareValue(value);
		const oldvalue = this._settings.value;

		if (oldvalue != value){
			this._settings.value = value;
			this.$setValue(value);
			this.callEvent("onChange", [value, oldvalue, config]);
		}
	},
	$setValue:function(value){
		if(this.isVisible(this._settings.id)){
			const rgb = color.toRgb(value);

			if(value !==this._current_value){//set by API
				const hsv = color.rgbToHsv(...rgb);
				this._hValue = hsv[0];
				this._sValue = hsv[1];
				this._vValue = hsv[2];
			}

			const left = (this._hValue*this._offset.width)/359;
			this._colorLineCircle.style.left = left+"px";

			const x = this._sValue*(this._offset.width);
			const y = Math.abs((this._offset.height)*(this._vValue-1));

			this._colorCircle.style.left = Math.max(Math.min(x, this._offset.width), 0)+"px";
			this._colorCircle.style.top = Math.max(Math.min(y, this._offset.height), 0)+"px";

			this._colorCircle.setAttribute("aria-valuetext", value);
			this._colorLineCircle.setAttribute("aria-valuetext", value);

			this._setOutColors(rgb, value);
			this._setBlockColors();
		}
	},
	_setOutColors:function(rgb, hex){
		if(!rgb) rgb = color.hsvToRgb(this._hValue, this._sValue, this._vValue);
		if(!hex) hex = "#"+color.rgbToHex(rgb);

		const bgColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		this._colorCircle.style.backgroundColor = bgColor;
		this._colorOutBlock.style.backgroundColor = bgColor;
		this._colorOutText.value = hex.toUpperCase();

		this._current_value = hex;
	},
	_setBlockColors:function(){
		const rgb = color.hsvToRgb(this._hValue, 1, 1);
		const rgbStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		this._colorLineCircle.style.backgroundColor = rgbStr;
		this._colorBlock.style.backgroundColor = rgbStr;
	},

	// dragging to set value
	_move_block:function(e){
		const pos = env.touch ? {x: e.x, y: e.y} : htmlPos(e);

		let x = pos.x - this._offset.x;
		let y = pos.y - this._offset.y;

		x = Math.max(Math.min(x, this._offset.width), 0);
		y = Math.max(Math.min(y, this._offset.height), 0);

		this._colorCircle.style.left = x+"px";
		this._colorCircle.style.top = y+"px";

		const pxX = (this._offset.width)/100;
		const pxY = (this._offset.height)/100;

		const s = Math.ceil(x/pxX)/100;
		const v = Math.ceil(Math.abs(y/pxY-100))/100;

		this._sValue = s;
		this._vValue = v;

		this._setOutColors();
	},
	_move_line:function(e){
		const pos = env.touch ? {x: e.x, y: e.y} : htmlPos(e);

		let x = pos.x - this._offset.x;
		x = Math.max(Math.min(x, this._offset.width), 0);

		this._colorLineCircle.style.left = x+"px";

		const h =  Math.round(x*359/this._offset.width);
		this._hValue = Math.max(Math.min(h, 359), 0);

		this._setOutColors();
		this._setBlockColors();
	},
	_handle_dnd:function(e, line){
		this._offset = offset(this._colorBlock);
		
		if(line){
			addCss(this._colorLine, "webix_color_area_active");
			this._move_line(e);
		} else {
			addCss(this._colorBlock, "webix_color_area_active");
			this._move_block(e);
		}

		if(env.touch){
			this._handle_drag_events = [
				this.attachEvent("onTouchMove", (e, ctx) => this._handle_move_process(ctx||e, line)),
				this.attachEvent("onTouchEnd", () => this._handle_move_stop(line))
			];
		} else {
			this._handle_drag_events = [
				event(document.body, "mousemove", (e) => this._handle_move_process(e, line)),
				event(window, "mouseup", () => this._handle_move_stop(line))
			];
		}
		addCss(document.body,"webix_noselect");
	},
	_handle_move_process:function(e, line){
		if(line) this._move_line(e);
		else this._move_block(e);
	},
	_detach_drag_events:function(){
		if(env.touch){
			this.detachEvent(this._handle_drag_events[0]);
			this.detachEvent(this._handle_drag_events[1]);
		} else {
			eventRemove(this._handle_drag_events[0]);
			eventRemove(this._handle_drag_events[1]);
		}
		this._handle_drag_events = null;
	},
	_handle_move_stop:function(line){
		this._detach_drag_events();
		this.setValue(this._current_value, "user");

		if(line){
			removeCss(this._colorLine, "webix_color_area_active");
			this._colorLineCircle.focus();
		} else {
			removeCss(this._colorBlock, "webix_color_area_active");
			this._colorCircle.focus();
		}
		removeCss(document.body,"webix_noselect");
	},
	_move_block_value(val, inc){
		return Math.min(Math.max(val+inc/100, 0), 1);
	},
	_move_line_value(val, inc){
		return Math.min(Math.max(val+inc, 0), 359);
	},
	_handle_move_keyboard:function(e){
		const code = e.keyCode;

		if(code>32 && code <41){
			const match =  /webix_color_(\w*)circle/.exec(e.target.className);
			if(!match) return;
			preventEvent(e);

			if(match[1].length){ //line
				if(code === 36) this._hValue = 0;
				else if(code === 35) this._hValue = 359;
				else{
					let inc = (code === 37 || code === 40 || code === 34) ? -1 : 1;
					this._hValue = this._move_line_value(this._hValue, inc);
				}
				this._setBlockColors();
			} else {
				if(code === 36){
					this._sValue = 0;
					this._vValue = 1;
				}
				else if(code === 35) 
					this._sValue = this._vValue = 1;
				else if(code === 39 || code === 37){
					let inc = code === 39 ? 1: -1;
					this._sValue = this._move_block_value(this._sValue, inc);
				}
				else{
					let inc = (code === 33 || code === 38) ? 1 : -1;
					this._vValue = this._move_block_value(this._vValue, inc);
				}
			}
			this._setOutColors();

			//paint value, black colors may have a bigger step
			if(this._settings.value == this._current_value)
				this.$setValue(this._current_value);
			else
				this.setValue(this._current_value, "user");
		}
	},
	moveSelection:function(mode){
		if(mode == "pgup" || mode == "pgdown"){ //line
			let inc = mode === "pgup" ? -1 : 1;
			this._hValue = this._move_line_value(this._hValue, inc);
			this._setBlockColors();
		}
		else if(mode !="top" && mode !=="bottom"){
			let inc = (mode == "up" || mode == "right") ? 1 : -1;
			if(mode == "down" || mode == "up")
				this._vValue = this._move_block_value(this._vValue, inc);
			else
				this._sValue = this._move_block_value(this._sValue, inc);
		}
		this._setOutColors();
		this.setValue(this._current_value, "auto");
	},
	render:function(){
		if(!this.isVisible(this._settings.id))
			return;

		this.callEvent("onBeforeRender",[]);

		const inpWidth = (this.$width - $active.dataPadding*3)/2;
		//24 paddings, 32 color line, 12 padding
		const bHeight = this.$height - 24 - 32 - this._inpHeight - (this._settings.button ? (this._inpHeight+12) : 0);
		
		let html = "<div class=\"webix_color_area\">";
		html += `
			<div ${/*@attr*/"webix_disable_drag"}="true" class="webix_color_block" style="height:${bHeight}px;">
				<div class="webix_color_circle" tabindex="0" role="slider"></div>
			</div>
			<div ${/*@attr*/"webix_disable_drag"}="true" class="webix_color_line">
				<div class="webix_color_line_circle" tabindex="0" role="slider"></div>
			</div>
			<div class="webix_color_out">
				<div style="width:${inpWidth}px" class="webix_color_out_block"></div>
				<input type="text" style="width:${inpWidth}px" class="webix_color_out_text"></input>
			</div>
		`;

		if(this._settings.button)
			html += `<div class='webix_secondary'><button class="webix_button">${i18n.combo.select}</button></div>`;
		html += "</div>";

		this._viewobj.innerHTML = html;

		this._collect_vars();
		this.$setValue(this._settings.value);

		this._fix_cover();
		this.callEvent("onAfterRender",[]);
	},
	_collect_vars:function(){
		this._colorCircle = this._viewobj.querySelector(".webix_color_circle");
		this._colorLineCircle = this._viewobj.querySelector(".webix_color_line_circle");
		this._colorBlock = this._viewobj.querySelector(".webix_color_block");
		this._colorLine = this._viewobj.querySelector(".webix_color_line");
		this._colorOutText = this._viewobj.querySelector(".webix_color_out_text");
		this._colorOutBlock = this._viewobj.querySelector(".webix_color_out_block");

		this._offset = offset(this._colorBlock);
	},
	refresh:function(){ this.render(); }
};

const view = protoUI(api, base.view, EventSystem);
export default {api, view};