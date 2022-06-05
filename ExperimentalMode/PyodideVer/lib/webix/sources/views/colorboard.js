import {locate, addCss, removeCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {bind} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import template from "../webix/template";
import {$active} from "../webix/skin";

import color from "../webix/color";
import KeysNavigation from "../core/keysnavigation";
import EventSystem from "../core/eventsystem";
import base from "../views/view";

const api = {
	name:"colorboard",
	defaults:{
		template:(obj) => {
			return `<div class="webix_color_item" style="background-color:${obj.val};"></div>`;
		},
		palette:null,
		height:250,
		width:260,
		cols:11,
		rows:10,
		minLightness:0.15,
		maxLightness:1,
		navigation:true,
		grayScale:true,
		type:"material" // "classic"
	},
	$init:function(){
		_event(this._viewobj, "click", bind(function(e){

			// prevent selection the main item container
			const node = e.target.parentNode;
			let value = locate(node, /*@attr*/"webix_val");
			// locate can return null in case of drag
			if (value){
				const oldvalue = this._settings.value;
				value = this.setValue(value, "user");

				this.callEvent("onItemClick", [value, e]);
				if (value != oldvalue)
					this.callEvent("onSelect", [value]);
			}
		}, this));

		this.$view.setAttribute("role", "grid");
		this._viewobj.setAttribute("aria-readonly", "true");
	},
	_get_clear_palette:function(){
		return [
			"#F34336",
			"#FF9700",
			"#FFEA3B",
			"#4CB050",
			"#009788",
			"#00BCD4",
			"#2196F3",
			"#3F51B5",
			"#673BB7",
			"#9C28B1",
			"#EA1E63",
		];
	},
	_set_item_focus:function(){
		if(!this.getValue())
			this.moveSelection("up");
	},
	_findIndex:function(value){
		const pal = this._settings.palette;
		value = (value || "").toUpperCase();
		for(let r= 0, rows= pal.length; r < rows; r++)
			for(let c= 0, cols = pal[r].length; c < cols; c++){
				if(pal[r][c].toUpperCase() == value){
					return {row:r, col:c};
				}
			}
		return null;
	},
	$setSize:function(x,y){
		if(base.api.$setSize.call(this,x,y)){
			this.render();
		}
	},
	getValue:function(){
		return this._settings.value;
	},
	_getBox:function(){
		return this._viewobj.firstChild;
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
		return value;
	},
	$setValue:function(value){
		if(this.isVisible(this._settings.id)){
			// clear previous
			if (this._activeSelection){
				const oldCell = this._getCell(this._activeSelection);
				this._setSelection(oldCell, false);
			}

			const ind = this._activeSelection = this._findIndex(value);
			if (ind){
				const cell = this._getCell(ind);
				this._setSelection(cell, true);
			}
		}
	},
	_getCell(ind){
		return this._viewobj.lastChild.childNodes[ind.row].childNodes[ind.col];
	},
	_setSelection(cell, state){
		if (state){
			cell.setAttribute("tabindex", "0");
			cell.setAttribute("aria-selected", "true");
			addCss(cell, "webix_color_selected");
		} else {
			cell.setAttribute("tabindex", "-1");
			cell.removeAttribute("aria-selected");
			removeCss(cell, "webix_color_selected");
		}
	},
	/* handle colors */
	_numToHex:function(n){
		return color.toHex(n, 2);
	},
	_rgbToHex:function(r,g,b){
		return "#"+this._numToHex( Math.floor(r)) +this._numToHex( Math.floor(g)) + this._numToHex(Math.floor(b));
	},
	_hslToRgb:function(h, s, l){
		let r, g, b;
		if(!s){
			r = g = b = l; // achromatic
		}else{
			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			r = this._hue2rgb(p, q, h + 1/3);
			g = this._hue2rgb(p, q, h);
			b = this._hue2rgb(p, q, h - 1/3);
		}

		return {r:r * 255, g:g * 255, b:b * 255};
	},
	_hue2rgb:function(p, q, t){
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if (t < 1/6)
			return p + (q - p) * 6 * t; 
		else if (t <= 1/2)
			return q;
		else if (t < 2/3) 
			return p + (q - p) * (2/3 - t) * 6;
		else
			return p;
	},
	_lightenRgb:function(rgb, lt){
		/*	color = color * alpha + background * (1 - alpha); */
		const r = rgb[0]*lt + 255*(1-lt);
		const g = rgb[1]*lt + 255*(1-lt);
		const b = rgb[2]*lt + 255*(1-lt);
		return {r, g, b};
	},
	_getGrayScale:function(colCount){
		const gray = [];
		let	val = 255,
			step = val / colCount;

		for(let i=0; i < colCount; i++){
			val = Math.round(val > 0 ? val : 0);
			gray.push(this._rgbToHex(val, val, val));
			val -= step;
		}
		gray[gray.length - 1] = "#000000";
		return gray;
	},
	_initPalette:function(config){
		/* default palette (material and custom) */
		const clearColors = this._get_clear_palette();		
		config.cols = clearColors.length; // always use the same set

		const colors = [];

		let colorRows = config.rows - 1; // a row is reserved for clear colors		
		let lightStep = 1/config.rows;
		let colorRange = null;

		if (this._settings.grayScale){
			const grayColors = this._getGrayScale(config.cols);
			colors.push(grayColors.reverse()); // inverted order
			lightStep = 1/colorRows;
			colorRows -= 1;
		}

		colors.push(clearColors);

		for(let step = 0, lt = config.maxLightness; step < colorRows; step++){
			lt-=lightStep;
			colorRange = [];
			for(let col = 0; col < config.cols; col++ ){
				const clearRgb = color.toRgb(clearColors[col]);
				const val = this._lightenRgb(clearRgb, lt);
				colorRange.push(this._rgbToHex(val.r, val.g, val.b));
			}
			colors.push(colorRange);
		}
		this._settings.palette = colors;
	},
	_initOldPalette:function(config){
		/* old (classic) palette */
		const colors = [];
		const colorStep = 1/config.cols;

		let colorRows = config.rows;
		let colorRange = null;

		if (this._settings.grayScale){
			colors.push(this._getGrayScale(config.cols));
			colorRows -= 1;
		}

		let lightStep = (config.maxLightness - config.minLightness)/colorRows;

		for(let step = 0, lt = config.minLightness; step < colorRows; step++){
			colorRange = [];
			for(let c = 0, col = 0; c < config.cols; c++ ){
				const val = this._hslToRgb(col, 1, lt );
				colorRange.push(this._rgbToHex(val.r, val.g, val.b));
				col += colorStep;
			}
			colors.push(colorRange);
			lt+=lightStep;
		}

		this._settings.palette = colors;
	},
	moveSelection:function(mode, details, focus){
		let value = this.getValue(), ind, cell;

		if(value) ind = this._findIndex(value);
		if(!ind) ind = {row:0, col:0};

		if(ind){
			if(mode == "up" || mode == "down")
				ind.row = ind.row + (mode == "up"?-1:1);
			else if(mode == "right" || mode == "left")
				ind.col = ind.col +(mode == "right"?1:-1);
			else if(mode == "top" )
				ind.row = ind.col = 0;
			else if(mode == "bottom"){
				ind.row = this._viewobj.lastChild.querySelectorAll(".webix_color_row").length-1;
				ind.col = this._viewobj.lastChild.childNodes[ind.row].childNodes.length-1;
			}
			ind.row = Math.max(ind.row, 0);
			if(ind.row>=0){
				// check if this is a last row
				const row = this._viewobj.lastChild.childNodes[ind.row];
				if (row) cell = row.childNodes[ind.col];
			}
			if(cell){
				value = cell.getAttribute(/*@attr*/"webix_val");
				const config = (details && details.e instanceof KeyboardEvent) ? "user" : "auto";
				this.setValue(value, config);
				this.callEvent("onSelect", [this._settings.value]);

				if(focus !== false){
					const sel = this._viewobj.querySelector("div[tabindex='0']");
					if(sel) sel.focus();
				}
			}
		}
	},
	_renderRow:function(row, widths, height){
		const data = {width: 0, height:0, val:0};
		let rowHtml = "<div class=\"webix_color_row\" role=\"row\">";

		for(let cell = 0; cell < row.length; cell++){
			data.width = widths[cell];
			data.height = height;
			data.val = row[cell];
			rowHtml += this._renderItem(data);
		}
		rowHtml += "</div>";
		return rowHtml;
	},
	_renderItem:function(obj){
		const colorTemplate = template(this._settings.template||"");
		return `<div role="gridcell" tabindex="-1" aria-label="${obj.val}" style="width:${obj.width}px;height:${obj.height}px;" ${/*@attr*/"webix_val"}="${obj.val}">${colorTemplate(obj)}</div>`;
	},
	render:function(){
		if(!this.isVisible(this._settings.id))
			return;

		const type = this._settings.type;
		if(!this._settings.palette){
			if (type === "classic")
				this._initOldPalette(this._settings);
			else 
				this._initPalette(this._settings);
		}
		const palette = this._settings.palette;

		this.callEvent("onBeforeRender",[]);
		const padding = type === "classic" ? 0 : $active.colorPadding;
		const single = typeof palette[0] == "object";
		const firstRow = single ? palette[0] : palette;

		const deltaWidth = padding*2 + padding*(firstRow.length-1);
		const deltaHeight = padding*2 + padding*(single ? palette.length-1 : 0);

		let width = this.$width - deltaWidth,
			height =  this.$height - deltaHeight,
			widths = [];

		let html = `<div class="webix_color_palette ${"webix_palette_"+type}" role="rowgroup">`;
		
		for(let i=0; i < firstRow.length; i++){
			widths[i] = Math.floor(width/(firstRow.length - i));
			width -= widths[i];
		}

		if(typeof palette[0] == "object"){
			for(let r=0; r < palette.length; r++){
				const cellHeight = Math.floor(height/(palette.length - r));
				height -= cellHeight;
				const row = palette[r];
				html += this._renderRow(row, widths, cellHeight);
			}
		} else
			html += this._renderRow(palette, widths, height);
		html += "</div>";

		this._viewobj.innerHTML = html;

		if(this._settings.value)
			this.$setValue(this._settings.value);
		else
			this._viewobj.lastChild.childNodes[0].childNodes[0].setAttribute("tabindex", "0");

		this._fix_cover();
		this.callEvent("onAfterRender",[]);
	},
	refresh:function(){ this.render(); }
};

const view = protoUI(api, KeysNavigation, base.view, EventSystem);
export default {api, view};