import base from "../views/view";
import template from "../webix/template";
import color from "../webix/color";
import env from "../webix/env";
import i18n from "../webix/i18n";

import Group from "../core/group";
import AutoTooltip from "../core/autotooltip";
import DataLoader from "../core/dataloader";
import MouseEvents from "../core/mouseevents";
import EventSystem from "../core/eventsystem";
import Destruction from "../core/destruction";
import HtmlMap from "../core/htmlmap";
import Canvas from "../core/canvas";
import GroupMethods from "../core/groupmethods";

import {locate, offset as getOffset, pos as getPos, create, remove} from "../webix/html";
import {protoUI} from "../ui/core";
import {bind, extend, isUndefined} from "../webix/helpers";
import {assert} from "../webix/debug";

import Pie from "./chart/pie";
import Bar from "./chart/bar";
import Line from "./chart/line";
import BarH from "./chart/barh";
import StackedBar from "./chart/stackedbar";
import StackedBarH from "./chart/stackedbarh";
import Spline from "./chart/spline";
import Area from "./chart/area";
import Radar from "./chart/radar";
import Scatter from "./chart/scatter";
import Presets from "./chart/presets";
import SplineArea from "./chart/splinearea";
import DynamicChart from "./chart/dynamic";
import TooltipControl from "../core/tooltipcontrol";

import {$active} from "../webix/skin";

const api = {
	name:"chart",
	$init:function(config){
		this._series = [this._settings];
		this._legend_labels = [];
		this._contentobj.className += " webix_chart";
		this.$ready.push(this._after_init_call);
		/*preset*/
		if(config.preset){
			this._definePreset(config);
		}

		// move series to end of configuration properties hash
		// so it will be parsed after other settings
		if(config.series){
			var series = config.series;
			delete config.series;
			config.series = series;
		}

		this.data.provideApi(this, true);
	},
	_after_init_call:function(){
		this.data.attachEvent("onStoreUpdated",bind(function(){
			this.render.apply(this,arguments);
		},this));
	},
	defaults:{
		ariaLabel:"chart",
		color:"default",
		alpha:"1",
		radius:0,
		label:false,
		value:"{obj.value}",
		padding:{},
		type:"pie",
		lineColor:"#ffffff",
		cant:0.5,
		barWidth: 30,
		line:{
			width:2,
			color:"#1ca1c1"
		},
		item:{
			radius:3,
			borderColor:"#1ca1c1",
			borderWidth:2,
			color: "#ffffff",
			alpha:1,
			type:"r",
			shadow:false
		},
		shadow:false,
		gradient:false,
		border:false,
		labelOffset: 20,
		origin:"auto",
		scale: "linear"
	},
	_id:/*@attr*/"webix_area_id",
	on_click:{
		webix_chart_legend_item: function(e,id,obj){
			var series = obj.getAttribute(/*@attr*/"series_id");
			if(this.callEvent("onLegendClick",[e,series,obj])){
				if((typeof series != "undefined")&&this._series.length>1){
					var config = this._settings;
					var values = config.legend.values;
					var toggle = (values&&values[series].toggle)||config.legend.toggle;

					// hide action
					if(toggle){
						if(obj.className.indexOf("hidden")!=-1){
							this.showSeries(series);
						}
						else{
							this.hideSeries(series);
						}
					}
				}
			}
		}
	},
	on_dblclick:{
	},
	on_mouse_move:{
	},
	locate: function(e){
		return locate(e,this._id);
	},
	$setSize:function(x,y){
		var res = base.api.$setSize.call(this,x,y);
		if(res){
			for(var c in this.canvases){
				this.canvases[c]._resizeCanvas(this._content_width, this._content_height);
			}
			this.render();
		}
		return res;
	},
	type_setter:function(val){
		assert(this["$render_"+val], "Chart type is not supported, or extension is not loaded: "+val);
		
		if (typeof this._settings.offset == "undefined"){
			this._settings.offset = !(val.toLowerCase().indexOf("area")!=-1);
		}

		if(val=="radar"&&!this._settings.yAxis)
			this.define("yAxis",{});
		if(val=="scatter"){
			if(!this._settings.yAxis)
				this.define("yAxis",{});
			if(!this._settings.xAxis)
				this.define("xAxis",{});
		}
			
			
		return val;
	},
	destructor: function(){
		this.removeAllSeries();
		Destruction.destructor.apply(this,arguments);
	},
	removeAllSeries: function(){
		this.clearCanvas();
		if(this._legendObj){
			this._legendObj.innerHTML = "";
			this._legendObj.parentNode.removeChild(this._legendObj);
			this._legendObj = null;
		}
		if(this.canvases){
			this.canvases = {};
		}
		this._contentobj.innerHTML="";
		this._series = [];
	},
	clearCanvas:function(){
		if(this.canvases&&typeof this.canvases == "object")
			for(var c in this.canvases){
				this.canvases[c].clearCanvas();
			}
	},
	render:function(id, changes, type){
		var bounds, data, map, temp;
		if (!this.isVisible(this._settings.id))
			return;

		data = this._getChartData();

		if (!this.callEvent("onBeforeRender",[data, type]))
			return;
		
		if(this.canvases&&typeof this.canvases == "object"){
			for(const i in this.canvases){
				this.canvases[i].clearCanvas();
			}
		}
		else
			this.canvases = {};
		
		if(this._settings.legend){
			if(!this.canvases["legend"])
				this.canvases["legend"] =  this._createCanvas("legend");
			this._drawLegend(
				this.data.getRange(),
				this._content_width,
				this._content_height
			);
		}

		this._map = map = new HtmlMap(this._id);
		temp = this._settings;

		bounds =this._getChartBounds(this._content_width,this._content_height);

		if(this._series){
			for(let i=0; i < this._series.length;i++){
				this._settings = this._series[i];
				if(!this.canvases[i])
					this.canvases[i] = this._createCanvas(this.name+" "+i,"z-index:"+(2+i),null,i, this._settings.ariaLabel);
				this["$render_"+this._settings.type](
					this.canvases[i].getCanvas(),
					data,
					bounds.start,
					bounds.end,
					i,
					map
				);
			}
		}
		
		map.render(this._contentobj);
		
		this._contentobj.lastChild.style.zIndex = 80;
		this._applyBounds(this._contentobj.lastChild,bounds);
		this.callEvent("onAfterRender",[data]);
		this._settings = temp;

		// hide hidden series
		if(this._settings.legend && this._settings.legend.values){
			var series = this._settings.legend.values;
			for(let i = 0; i<series.length; i++){
				if(series[i].$hidden) this.hideSeries(i);
			}
		}
	},
	_applyBounds: function(elem,bounds){
		var style = {};
		style.left = bounds.start.x;
		style.top = bounds.start.y;
		style.width = bounds.end.x-bounds.start.x;
		style.height = bounds.end.y - bounds.start.y;
		for(var prop in style){
			elem.style[prop] = style[prop]+"px";
		}
	},
	_getChartData: function(){
		var axis, axisConfig ,config, data, i, newData,
			start, units, value, valuesHash;
		data = this.data.getRange();
		axis = (this._settings.type.toLowerCase().indexOf("barh")!=-1?"yAxis":"xAxis");
		axisConfig = this._settings[axis];
		if(axisConfig&&axisConfig.units&&(typeof axisConfig.units == "object")){
			config = axisConfig.units;
			units = [];
			if(typeof config.start != "undefined"&&typeof config.end != "undefined" && typeof config.next != "undefined"){
				start = config.start;
				while(start<=config.end){
					units.push(start);
					start = config.next.call(this,start);
				}
			}
			else if(Object.prototype.toString.call(config) === "[object Array]"){
				units = config;
			}
			newData = [];
			if(units.length){
				value = axisConfig.value;
				valuesHash = {};
				for(i=0;i < data.length;i++){
					valuesHash[value(data[i])] = i;
				}
				for(i=0;i< units.length;i++){
					if(typeof valuesHash[units[i]]!= "undefined"){
						data[valuesHash[units[i]]].$unit = units[i];
						newData.push(data[valuesHash[units[i]]]);
					}
					else{
						newData.push({$unit:units[i]});
					}
				}
			}
			return newData;
		}
		return data;
	},
	series_setter:function(config){
		if (!config || typeof config != "object"){
			assert(config,"Chart :: Series must be an array or object");
		} else {
			this._parseSettings(!config.length ? config : config[0]);
			this._series = [this._settings];

			for (let i=1; i<config.length; i++)
				this.addSeries(config[i]);
		}
		return config;
	},
	value_setter:template,
	xValue_setter:template,
	yValue_setter:function(config){
		this.define("value",config);
	},
	alpha_setter:template,
	label_setter:template,
	lineColor_setter:template,
	borderColor_setter:template,
	pieInnerText_setter:template,
	donutInnerText_setter:template,
	gradient_setter:function(config){
		if((typeof(config)!="function")&&config&&(config === true))
			config = "light";
		return config;
	},
	colormap:{
		"RAINBOW":function(obj){
			var pos = Math.floor(this.getIndexById(obj.id)/this.count()*1536);
			if (pos==1536) pos-=1;
			return this._rainbow[Math.floor(pos/256)](pos%256);
		},

		"default": function(obj){
			var count = this.count();
			var colorsCount = this._defColors.length;
			var i = this.getIndexById(obj.id);
			if(colorsCount > count){
				if(i){
					if(i < colorsCount - count)
						i = this._defColorsCursor +2;
					else
						i = this._defColorsCursor+1;
				}
				this._defColorsCursor = i;
			}
			else
				i = i%colorsCount;
			return this._defColors[i];
		}
	},
	color_setter:function(value){
		return this.colormap[value]||template( value);
	},
	fill_setter:function(value){
		return ((!value||value=="0")?false:template( value));
	},
	_definePreset:function(obj){
		this.define("preset",obj.preset);
		delete obj.preset;
	},
	preset_setter:function(value){
		var a, b, preset;
		this.defaults = extend({},this.defaults);
		preset =  this.presets[value];

		if(typeof preset == "object"){

			for(a in preset){

				if(typeof preset[a]=="object"){
					if(!this.defaults[a]||typeof this.defaults[a]!="object"){
						this.defaults[a] = extend({},preset[a]);
					}
					else{
						this.defaults[a] = extend({},this.defaults[a]);
						for(b in preset[a]){
							this.defaults[a][b] = preset[a][b];
						}
					}
				}else{
					this.defaults[a] = preset[a];
				}
			}
			return value;
		}
		return false;
	},
	legend_setter:function( config){
		if(!config){
			if(this._legendObj){
				this._legendObj.innerHTML = "";
				this._legendObj = null;
			}
			return false;
		}
		if(typeof(config)!="object")	//allow to use template string instead of object
			config={template:config};

		this._mergeSettings(config,{
			width:150,
			height:18,
			layout:"y",
			align:"left",
			valign:"bottom",
			template:"",
			toggle:(this._settings.type.toLowerCase().indexOf("stacked")!=-1?"":"hide"),
			marker:{
				type:"square",
				width:15,
				height:15,
				radius:3
			},
			margin: 4,
			padding: 3
		});

		config.template = template(config.template);
		return config;
	},
	item_setter:function( config){
		if(typeof(config)!="object")
			config={color:config, borderColor:config};
		this._mergeSettings(config,extend({},this.defaults.item));
		var settings = ["alpha","borderColor","color","radius", "type"];
		this._converToTemplate(settings,config);
		return config;
	},
	line_setter:function( config){
		if(typeof(config)!="object")
			config={color:config};

		config = extend(config,this.defaults.line);
		config.color = template(config.color);
		return config;
	},
	padding_setter:function( config){
		if(typeof(config)!="object")
			config={left:config, right:config, top:config, bottom:config};
		this._mergeSettings(config,{
			left:50,
			right:20,
			top:35,
			bottom:40
		});
		return config;
	},
	xAxis_setter:function( config){
		if(!config) return false;
		if(typeof(config)!="object")
			config={ template:config };

		this._mergeSettings(config,{
			title:"",
			color:"#edeff0",
			lineColor:"#edeff0",
			template:"{obj}",
			lines:true
		});
		var templates = ["lineColor","template","lines"];
		this._converToTemplate(templates,config);
		this._configXAxis = extend({},config);
		return config;
	},
	yAxis_setter:function( config){
		this._mergeSettings(config,{
			title:"",
			color:"#edeff0",
			lineColor:"#edeff0",
			template:"{obj}",
			lines:true,
			bg:$active.backColor
		});
		var templates = ["lineColor","template","lines","bg"];
		this._converToTemplate(templates,config);
		this._configYAxis = extend({},config);
		return config;
	},
	_converToTemplate:function(arr,config){
		for(var i=0;i< arr.length;i++){
			config[arr[i]] = template(config[arr[i]]);
		}
	},
	_createCanvas: function(name,style,container, index, title){
		var params = {container:(container||this._contentobj),name:name, title:isUndefined(title)?name:title||"", series: index, style:(style||""), width: this._content_width, height:this._content_height };
		return new Canvas(params);
	},
	_drawScales:function(data,point0,point1,start,end,cellWidth){
		var ctx, y = 0;
		if(this._settings.yAxis){
			if(!this.canvases["y"])
				this.canvases["y"] =  this._createCanvas("axis_y");

			y = this._drawYAxis(this.canvases["y"].getCanvas(),data,point0,point1,start,end);
		}
		if (this._settings.xAxis){
			if (!this.canvases["x"])
				this.canvases["x"] = this._createCanvas("axis_x");
			ctx = this.canvases["x"].getCanvas();
			if(this.callEvent("onBeforeXAxis",[ctx,data,point0,point1,cellWidth,y]))
				this._drawXAxis(ctx, data, point0, point1, cellWidth, y);
		}
		return y;
	},
	_drawXAxis:function(ctx,data,point0,point1,cellWidth,y){
		var i, unitPos,
			config = this._settings,
			x0 = point0.x-0.5,
			y0 = parseInt((y?y:point1.y),10)+0.5,
			x1 = point1.x,
			center = true,
			labelY = config.type == "stackedBar"?(point1.y+0.5):y0;

		for(i=0; i < data.length;i++){
			if(config.offset === true)
				unitPos = x0+cellWidth/2+i*cellWidth;
			else{
				unitPos = (i==data.length-1 && !config.cellWidth)?point1.x:x0+i*cellWidth;
				center = !!i;
			}
			unitPos = Math.ceil(unitPos)-0.5;
			/*scale labels*/
			var top = ((config.origin!="auto")&&(config.type=="bar")&&(parseFloat(config.value(data[i]))<config.origin));
			this._drawXAxisLabel(unitPos,labelY,data[i],center,top);
			/*draws a vertical line for the horizontal scale*/
			if((config.offset||i||config.cellWidth)&&config.xAxis.lines.call(this,data[i]))
				this._drawXAxisLine(ctx,unitPos,point1.y,point0.y,data[i]);
		}

		this.canvases["x"].renderTextAt(true, false, x0, point1.y + config.padding.bottom-3,
			config.xAxis.title,
			"webix_axis_title_x",
			point1.x - point0.x
		);
		this._drawLine(ctx,x0,y0,x1,y0,config.xAxis.color,1);
		/*the right border in lines in scale are enabled*/
		if (!config.xAxis.lines.call(this,{}) || !config.offset) return;
		this._drawLine(ctx,x1+0.5,point1.y,x1+0.5,point0.y+0.5,config.xAxis.lineColor.call(this,{}),1);
	},
	_drawYAxis:function(ctx,data,point0,point1,start,end){
		var step;
		var scaleParam= {};
		if (!this._settings.yAxis) return;

		var x0 = point0.x - 0.5;
		var y0 = point1.y;
		var y1 = point0.y;
		var lineX = point1.y+0.5;

		//this._drawLine(ctx,x0,y0,x0,y1,this._settings.yAxis.color,1);

		if(this._settings.yAxis.step)
			step = parseFloat(this._settings.yAxis.step);

		if(typeof this._configYAxis.step =="undefined"||typeof this._configYAxis.start=="undefined"||typeof this._configYAxis.end =="undefined"){
			scaleParam = this._calculateScale(start,end);
			start = scaleParam.start;
			end = scaleParam.end;
			step = scaleParam.step;

			this._settings.yAxis.end = end;
			this._settings.yAxis.start = start;
		}
		else if(this.config.scale == "logarithmic")
			this._logScaleCalc = true;

		this._setYAxisTitle(point0,point1);
		if(step===0) return;
		if(end==start){
			return y0;
		}
		var stepHeight = (y0-y1)*step/(end-start);
		var c = 0;
		const origin = this._settings.origin;
		for(var i = start; i<=end; i += step){
			var value = this._logScaleCalc?Math.pow(10,i):i;
			if (scaleParam.fixNum)  value = parseFloat(value).toFixed(scaleParam.fixNum);
			var yi = Math.floor(y0-c*stepHeight)+ 0.5;/*canvas line fix*/
			if(!(i==start&&origin=="auto") &&this._settings.yAxis.lines.call(this,i))
				this._drawLine(ctx,x0,yi,point1.x,yi,this._settings.yAxis.lineColor.call(this,i),1);

			if(origin != "auto" && i<=origin && i+step>origin)
				lineX = yi-stepHeight*(origin-value)/step;

			/*correction for JS float calculation*/
			if(step<1 && !this._logScaleCalc){
				var power = Math.min(Math.floor(this._log10(step)),(start<=0?0:Math.floor(this._log10(start))));
				var corr = Math.pow(10,-power);
				value = Math.round(value*corr)/corr;
				i = value;
			}
			this.canvases["y"].renderText(0,yi-5,
				this._settings.yAxis.template(value.toString()),
				"webix_axis_item_y",
				point0.x-5
			);
			c++;
		}
		this._drawLine(ctx,x0,y0+1,x0,y1,this._settings.yAxis.color,1);
		return lineX;
	},

	_setYAxisTitle:function(point0,point1){
		var className = "webix_axis_title_y";
		var text=this.canvases["y"].renderTextAt("middle",false,0,parseInt((point1.y-point0.y)/2+point0.y,10),this._settings.yAxis.title,className);
		if (text)
			text.style.left = (env.transform?(text.offsetHeight-text.offsetWidth)/2:0)+"px";
	},
	_calculateLogScale: function(nmin,nmax){
		var startPower = Math.floor(this._log10(nmin));
		var endPower = Math.ceil(this._log10(nmax));
		return {start: startPower, step: 1, end: endPower};
	},
	_normStep:function(step){
		var power = Math.floor(this._log10(step));
		var calculStep = Math.pow(10,power);
		var stepVal = step/calculStep;
		stepVal = (stepVal>5?10:5);
		return parseInt(stepVal,10)*calculStep;	
	},
	_calculateScale:function(nmin,nmax){
		this._logScaleCalc = false;
		if(this._settings.scale == "logarithmic"){
			var logMin = Math.floor(this._log10(nmin));
			var logMax = Math.ceil(this._log10(nmax));
			if(nmin>0 && nmax > 0 && (logMax-logMin>1) ){
				this._logScaleCalc = true;
				return this._calculateLogScale(nmin,nmax);
			}

		}
		if(this._settings.origin!="auto"&&this._settings.origin<nmin)
			nmin = this._settings.origin;

		var	start,end;
		var step = this._normStep(((nmax-nmin)/8)||1);
		var power = Math.floor(this._log10(step));

		if(step>Math.abs(nmin))
			start = (nmin<0?-step:0);
		else{
			var absNmin = Math.abs(nmin);
			var powerStart = Math.floor(this._log10(absNmin));
			var nminVal = absNmin/Math.pow(10,powerStart);
			if (powerStart != 0 || step >= 0.1)
				start = Math.ceil(nminVal*10)/10*Math.pow(10,powerStart)-step;
			else
				start = absNmin;

			if(absNmin>1&&step>0.1){
				start = Math.ceil(start);
			}
			while(nmin<0?start<=nmin:start>=nmin)
				start -= step;
			if(nmin<0) start =-start-2*step;

			start = start - (start % step);
			start = parseFloat((start*1.0).toFixed(Math.abs(power)));
		}
		if ((nmax-start) > 10)
			step = this._normStep(((nmax-start)/8)||1);
		end = start;

		if(nmax == 0 && nmax == nmin)
			nmax = step;

		while(end<nmax){
			end += step;
			end = parseFloat((end*1.0).toFixed(Math.abs(power)));
		}
		
		return { start:start,end:end,step:step,fixNum:power<0?Math.abs(power):0 };
	},
	_getLimits:function(orientation,value){
		var data = this.data._obj_array();

		var maxValue, minValue;
		var axis = ((arguments.length && orientation=="h")?this._configXAxis:this._configYAxis);
		value = value||"value";
		if(axis&&(typeof axis.end!="undefined")&&(typeof axis.start!="undefined")&&axis.step){
			maxValue = parseFloat(axis.end);
			minValue = parseFloat(axis.start);
		}
		else{
			maxValue = GroupMethods.max(this._series[0][value], data);
			minValue = (axis&&(typeof axis.start!="undefined"))?parseFloat(axis.start):GroupMethods.min(this._series[0][value], data);
			if(this._series.length>1)
				for(var i=1; i < this._series.length;i++){
					var maxI = GroupMethods.max(this._series[i][value], data);
					var minI = GroupMethods.min(this._series[i][value], data);
					if (maxI > maxValue) maxValue = maxI;
					if (minI < minValue) minValue = minI;
				}
		}
		return {max:maxValue,min:minValue};
	},
	_log10:function(n){
		var method_name="log";
		return Math[method_name](n)/Math.LN10;
	},
	_drawXAxisLabel:function(x,y,obj,center,top){
		if (!this._settings.xAxis) return;
		var elem = this.canvases["x"].renderTextAt(top, center, x,y-(top?2:0),this._settings.xAxis.template(obj));
		if (elem)
			elem.className += " webix_axis_item_x";
	},
	_drawXAxisLine:function(ctx,x,y1,y2,obj){
		if (!this._settings.xAxis||!this._settings.xAxis.lines) return;
		this._drawLine(ctx,x,y1,x,y2,this._settings.xAxis.lineColor.call(this,obj),1);
	},
	_drawLine:function(ctx,x1,y1,x2,y2,color,width){
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
		ctx.lineWidth = 1;
	},
	_getRelativeValue:function(minValue,maxValue){
		var relValue;
		var valueFactor = 1;
		if(maxValue != minValue){
			relValue = maxValue - minValue;
		}
		else relValue = minValue;
		return [relValue,valueFactor];
	},
	_rainbow : [
		function(pos){ return "#FF"+color.toHex(pos/2,2)+"00";},
		function(pos){ return "#FF"+color.toHex(pos/2+128,2)+"00";},
		function(pos){ return "#"+color.toHex(255-pos,2)+"FF00";},
		function(pos){ return "#00FF"+color.toHex(pos,2);},
		function(pos){ return "#00"+color.toHex(255-pos,2)+"FF";},
		function(pos){ return "#"+color.toHex(pos,2)+"00FF";}		
	],
	_defColors : [
		"#f55b50","#ff6d3f","#ffa521","#ffc927","#ffee54","#d3e153","#9acb61","#63b967",
		"#21a497","#21c5da","#3ea4f5","#5868bf","#7b53c0","#a943ba","#ec3b77","#9eb0b8"
	],
	_defColorsCursor: 0,
	/**
	*   adds series to the chart (value and color properties)
	*   @param: obj - obj with configuration properties
	*/
	addSeries:function(obj){
		const temp = this._settings;

		this._settings = extend({}, temp);
		this._parseSettings(obj);
		this._series.push(this._settings);

		this._settings = temp;
	},
	$tooltipIn:function(t){
		return t;
	},
	_get_tooltip_data:function(t,e){
		let id = this.locate(e);
		if (!id) return null;

		let active = this._getActiveSeries(e);
		let def = extend({dx:20, dy:0, template:"{obj.value}", css:""}, (this._series[active].tooltip || {template:""}), true);

		TooltipControl._tooltip.define( def );
		return this.getItem(id);
	},
	_getActiveSeries: function(e){
		var a, areas, i, offset, pos, selection,  x, y;

		areas = this._map._areas;
		offset = getOffset(this._contentobj._htmlmap);
		pos = getPos(e);
		x = pos.x - offset.x;
		y = pos.y - offset.y;

		for( i = 0; i < areas.length; i++){
			a = areas[i].points;
			if(x <= a[2] && x >= a[0] && y <= a[3] && y >= a[1]){
				if(selection){
					if(areas[i].index > selection.index)
						selection = areas[i];
				}
				else
					selection = areas[i];
			}
		}

		return selection?selection.index:0;
	},
	hideSeries:function(series){
		this.canvases[series].hideCanvas();
		var legend = this._settings.legend;
		if(legend && legend.values && legend.values[series]){
			legend.values[series].$hidden = true;
			this._drawLegend();
		}
		this._map.hide(this._contentobj, series, true);
	},
	showSeries:function(series){
		this.canvases[series].showCanvas();
		var legend = this._settings.legend;
		if(legend && legend.values && legend.values[series]){
			delete legend.values[series].$hidden;
			this._drawLegend();
		}
		this._map.hide(this._contentobj, series, false);
	},
	/**
	*   renders legend block
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*/
	_drawLegend:function(data,width){
		/*position of the legend block*/
		var i, legend, legendContainer, legendHeight, legendItems, legendWidth, style,
			x=0, y= 0, ctx, itemColor, disabled, item;

		data = data||[];
		width = width||this._content_width;
		ctx = this.canvases["legend"].getCanvas();
		/*legend config*/
		legend = this._settings.legend;
		/*the legend sizes*/

		style = (this._settings.legend.layout!="x"?"width:"+legend.width+"px":"");
		/*creation of legend container*/

		if(this._legendObj){

			this._legendObj.innerHTML = "";
			this._legendObj.parentNode.removeChild(this._legendObj);
		}
		this.canvases["legend"].clearCanvas(true);

		legendContainer = create("DIV",{
			"class":"webix_chart_legend",
			"style":"left:"+x+"px; top:"+y+"px;"+style
		},"");
		if(legend.padding){
			legendContainer.style.padding =  legend.padding+"px";
		}
		this._legendObj = legendContainer;
		this._contentobj.appendChild(legendContainer);

		/*rendering legend text items*/
		legendItems = [];
		if(!legend.values)
			for(i = 0; i < data.length; i++){
				legendItems.push(this._drawLegendText(legendContainer,legend.template(data[i]), data[i].id));
			}
		else
			for(i = 0; i < legend.values.length; i++){
				legendItems.push(this._drawLegendText(legendContainer,legend.values[i].text,(typeof legend.values[i].id!="undefined"?typeof legend.values[i].id:i),legend.values[i].$hidden));
			}

		const rendered = document.body.contains(this._contentobj);
		let parentNode, d;

		// inside window
		if(!rendered){
			d = create("DIV",{"style":"visibility:hidden; position:absolute; top:0px; left:0px;"},"");

			parentNode = this._contentobj.parentNode;

			document.body.appendChild(d);
			d.appendChild(this._contentobj);
		}

		legendWidth = legendContainer.offsetWidth;
		legendHeight = legendContainer.offsetHeight;

		/*this._settings.legend.width = legendWidth;
		this._settings.legend.height = legendHeight;*/
		/*setting legend position*/
		if(legendWidth<width){
			if(legend.layout == "x"&&legend.align == "center"){
				x = (width-legendWidth)/2;
			}
			if(legend.align == "right"){
				x = width-legendWidth;
			}
			if(legend.margin&&legend.align != "center"){
				x += (legend.align == "left"?1:-1)*legend.margin;
			}
		}

		if(legendHeight<this._content_height){
			if(legend.valign == "middle"&&legend.align != "center"&&legend.layout != "x")
				y = (this._content_height-legendHeight)/2;
			else if(legend.valign == "bottom")
				y = this._content_height-legendHeight;
			if(legend.margin&&legend.valign != "middle"){
				y += (legend.valign == "top"?1:-1)*legend.margin;
			}
		}
		legendContainer.style.left = x+"px";
		legendContainer.style.top = y+"px";

		/*drawing colorful markers*/
		ctx.save();
		for(i = 0; i < legendItems.length; i++){
			item = legendItems[i];
			if(legend.values&&legend.values[i].$hidden){
				disabled = true;
				itemColor = (legend.values[i].disableColor?legend.values[i].disableColor:"#edeff0");
			}
			else{
				disabled = false;
				itemColor = (legend.values?legend.values[i].color:this._settings.color.call(this,data[i]));
			}
			this._drawLegendMarker(ctx,item.offsetLeft+x,item.offsetTop+y,itemColor,item.offsetHeight,disabled,i);
		}
		ctx.restore();

		if(!rendered){
			parentNode.appendChild(this._contentobj);
			remove(d);
		}

		legendItems = null;
	},
	/**
	*   appends legend item to legend block
	*   @param: ctx - canvas object
	*   @param: obj - data object that needs being represented
	*/
	_drawLegendText:function(cont,value,series,disabled){
		var style = "";
		if(this._settings.legend.layout=="x")
			style = "float:left;";
		/*the text of the legend item*/
		var text = create("DIV",{
			"style":style+"padding-left:"+(10+this._settings.legend.marker.width)+"px",
			"class":"webix_chart_legend_item"+(disabled?" hidden":""),
			"role":"button",
			"tabindex":"0",
			"aria-label":(i18n.aria[(disabled?"show":"hide")+"Chart"])+" "+value
		},value);
		if(arguments.length>2)
			text.setAttribute(/*@attr*/"series_id",series);
		cont.appendChild(text);
		return text;
	},
	/**
	*   draw legend colorful marder
	*   @param: ctx - canvas object
	*   @param: x - the horizontal position of the marker
	*   @param: y - the vertical position of the marker
	*   @param: obj - data object which color needs being used
	*/
	_drawLegendMarker:function(ctx,x,y,color,height,disabled,i){
		var p = [];
		var marker = this._settings.legend.marker;
		var values = this._settings.legend.values;
		var type = (values&&values[i].markerType?values[i].markerType:marker.type);
		if(color){
			ctx.strokeStyle = ctx.fillStyle = color;
		}

		if(type=="round"||!marker.radius){
			ctx.beginPath();
			const r = marker.height/2;
			ctx.arc(x+r+5, y+height/2, r, 0, 2 * Math.PI);
			ctx.fill();
		}
		else if(type=="item"){
			/*copy of line*/
			if(this._settings.line&&this._settings.type != "scatter" && !this._settings.disableLines){
				ctx.beginPath();
				ctx.lineWidth = this._series[i].line.width;
				ctx.strokeStyle = disabled?color:this._series[i].line.color.call(this,{});
				let x0 = x + 5;
				let y0 = y + height/2;
				ctx.moveTo(x0,y0);
				let x1 = x0 + marker.width;
				ctx.lineTo(x1,y0);
				ctx.stroke();
			}
			/*item copy*/
			var config = this._series[i].item;
			var radius = parseInt(config.radius.call(this,{}),10)||0;
			var markerType = config.type.call(this,{});
			if(radius){
				ctx.beginPath();
				if(disabled){
					ctx.lineWidth = config.borderWidth;
					ctx.strokeStyle = color;
					ctx.fillStyle = color;
				}
				else{
					ctx.lineWidth = config.borderWidth;
					ctx.fillStyle = config.color.call(this,{});
					ctx.strokeStyle = config.borderColor.call(this,{});
					ctx.globalAlpha = config.alpha.call(this,{});
				}
				ctx.beginPath();
				x += marker.width/2+5;
				y += height/2;
				this._strokeChartItem(ctx,x,y,radius+1,markerType);
				ctx.fill();
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
		}else{
			ctx.beginPath();
			ctx.lineWidth = 1;
			x += 5;
			y += height/2-marker.height/2;
			p = [
				[x+marker.radius,y+marker.radius,marker.radius,Math.PI,3*Math.PI/2,false],
				[x+marker.width-marker.radius,y],
				[x+marker.width-marker.radius,y+marker.radius,marker.radius,-Math.PI/2,0,false],
				[x+marker.width,y+marker.height-marker.radius],
				[x+marker.width-marker.radius,y+marker.height-marker.radius,marker.radius,0,Math.PI/2,false],
				[x+marker.radius,y+marker.height],
				[x+marker.radius,y+marker.height-marker.radius,marker.radius,Math.PI/2,Math.PI,false],
				[x,y+marker.radius]
			];
			this._path(ctx,p);
			ctx.stroke();
			ctx.fill();
		}

	},
	/**
	*   gets the points those represent chart left top and right bottom bounds
	*   @param: width - the width of the chart container
	*   @param: height - the height of the chart container
	*/
	_getChartBounds:function(width,height){
		var chartX0, chartY0, chartX1, chartY1;
		
		chartX0 = this._settings.padding.left;
		chartY0 = this._settings.padding.top;
		chartX1 = width - this._settings.padding.right;
		chartY1 = height - this._settings.padding.bottom;	
		
		if(this._settings.legend){
			var legend = this._settings.legend;
			/*legend size*/
			var legendWidth = this._settings.legend.width;
			var legendHeight = this._settings.legend.height;
		
			/*if legend is horizontal*/
			if(legend.layout == "x"){
				if(legend.valign == "center"){
					if(legend.align == "right")
						chartX1 -= legendWidth;
					else if(legend.align == "left")
						chartX0 += legendWidth;
				} else if(legend.valign == "bottom"){
					chartY1 -= legendHeight;
				} else {
					chartY0 += legendHeight;
				}
			}
			/*vertical scale*/
			else {
				if(legend.align == "right")
					chartX1 -= legendWidth;
				else if(legend.align == "left")
					chartX0 += legendWidth;
			}
		}
		return {start:{x:chartX0,y:chartY0},end:{x:chartX1,y:chartY1}};
	},
	/**
	*   gets the maximum and minimum values for the stacked chart
	*   @param: data - data set
	*/
	_getStackedLimits:function(data){
		var i, j, maxValue, minValue, value;
		if(this._settings.yAxis&&(typeof this._settings.yAxis.end!="undefined")&&(typeof this._settings.yAxis.start!="undefined")&&this._settings.yAxis.step){
			maxValue = parseFloat(this._settings.yAxis.end);
			minValue = parseFloat(this._settings.yAxis.start);
		}
		else{
			for(i=0; i < data.length; i++){
				data[i].$sum = 0 ;
				data[i].$min = Infinity;
				for(j =0; j < this._series.length;j++){
					value = Math.abs(parseFloat(this._series[j].value(data[i])||0));
					if(isNaN(value)) continue;
					if(this._series[j].type.toLowerCase().indexOf("stacked")!=-1)
						data[i].$sum += value;
					if(value < data[i].$min) data[i].$min = value;
				}
			}
			maxValue = -Infinity;
			minValue = Infinity;
			for(i=0; i < data.length; i++){
				if (data[i].$sum > maxValue) maxValue = data[i].$sum ;
				if (data[i].$min < minValue) minValue = data[i].$min ;
			}
			if(minValue>0) minValue =0;
		}
		return {max: maxValue, min: minValue};
	},
	/*adds colors to the gradient object*/
	_setBarGradient:function(ctx,x1,y1,x2,y2,type,rawColor,axis){
		var gradient, offset, rgb, hsv, rawColor0, stops;
		if(type == "light"){
			if(axis == "x")
				gradient = ctx.createLinearGradient(x1,y1,x2,y1);
			else
				gradient = ctx.createLinearGradient(x1,y1,x1,y2);
			stops = [[0,"#FFFFFF"],[0.9,rawColor],[1,rawColor]];
			offset = 2;
		}
		else if(type == "falling"||type == "rising"){
			if(axis == "x")
				gradient = ctx.createLinearGradient(x1,y1,x2,y1);
			else
				gradient = ctx.createLinearGradient(x1,y1,x1,y2);
			rgb = color.toRgb(rawColor);
			hsv = color.rgbToHsv(rgb[0],rgb[1],rgb[2]);
			hsv[1] *= 1/2;
			rawColor0 = "rgb("+color.hsvToRgb(hsv[0],hsv[1],hsv[2])+")";
			if(type == "falling"){
				stops = [[0,rawColor0],[0.7,rawColor],[1,rawColor]];
			}
			else if(type == "rising"){
				stops = [[0,rawColor],[0.3,rawColor],[1,rawColor0]];
			}
			offset = 0;
		}
		else{
			ctx.globalAlpha = 0.37;
			offset = 0;
			if(axis == "x")
				gradient = ctx.createLinearGradient(x1,y2,x1,y1);
			else
				gradient = ctx.createLinearGradient(x1,y1,x2,y1);
			stops = [[0,"#9d9d9d"],[0.3,"#e8e8e8"],[0.45,"#ffffff"],[0.55,"#ffffff"],[0.7,"#e8e8e8"],[1,"#9d9d9d"]];
		}
		this._gradient(gradient,stops);
		return {gradient: gradient,offset: offset};
	},
	/**
	*   returns the x and y position
	*   @param: a - angle
	*   @param: x - start x position
	*   @param: y - start y position
	*   @param: r - destination to the point
	*/
	_getPositionByAngle:function(a,x,y,r){
		a *= (-1);
		x = x+Math.cos(a)*r;
		y = y-Math.sin(a)*r;
		return {x:x,y:y};
	},
	_gradient:function(gradient,stops){
		for(var i=0; i< stops.length; i++){
			gradient.addColorStop(stops[i][0],stops[i][1]);
		}
	},
	_path: function(ctx,points){
		var i, method;
		for(i = 0; i< points.length; i++){
			method = (i?"lineTo":"moveTo");
			if(points[i].length>2)
				method = "arc";
			ctx[method].apply(ctx,points[i]);
		}
	},
	_addMapRect:function(map,id,points,bounds,sIndex){
		map.addRect(id,[points[0].x-bounds.x,points[0].y-bounds.y,points[1].x-bounds.x,points[1].y-bounds.y],sIndex);
	}
};


const view = protoUI(api, Pie, Bar, Line, BarH, StackedBar, StackedBarH, Spline, Area, Radar, Scatter, Presets, SplineArea, DynamicChart, Group, AutoTooltip, DataLoader, MouseEvents,  EventSystem , base.view);
export default {api, view};