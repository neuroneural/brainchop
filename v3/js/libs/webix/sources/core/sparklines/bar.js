import {createCss} from "../../webix/html";
import {extend, copy} from "../../webix/helpers";

import SVG from "./svg";


var defaults = {
	paddingX: 3,
	paddingY: 4,
	width: 20,
	margin: 4,
	minHeight: 4,
	eventRadius: 8,
	origin:0,
	itemCss: function(value){return value < (this.config.origin||0)?" webix_sparklines_bar_negative":"";}
};
function Bar(config){
	this.config = extend(copy(defaults),config||{},true);
}

Bar.prototype.draw = function(data, width, height){
	var i, css, p, y, padding,
		config = this.config,
		graph = "", items = [],
		points = this.getPoints(data, width, height),
		renderer = SVG;

	// draw bars
	for( i = 0; i< points.length; i++){
		css = (typeof config.itemCss == "function"?config.itemCss.call(this,data[i]):(config.itemCss||""));
		if (config.negativeColor && data[i] < config.origin)
			css += " "+this._applyColor(renderer,config.negativeColor);
		else if(config.color)
			css += " "+this._applyColor(renderer,config.color);
		p = points[i];
		items.push(renderer.getRect(p.x, p.y, p.width, p.height,"webix_sparklines_bar "+css));
	}
	graph += renderer.group(items.join(""));
	// origin)
	y = parseInt(this._getOrigin(data, width, height),10)+0.5;
	padding = config.paddingX||0;
	graph += renderer.group(renderer.getLine({x:padding, y: y},{x: width-padding, y: y},"webix_sparklines_origin"));

	// event areas
	var evPoints = this._getEventPoints(data, width, height);
	var evItems = [];
	for( i = 0; i< evPoints.length; i++){
		p = evPoints[i];
		evItems.push(renderer.getRect(p.x, p.y, p.width, p.height,"webix_sparklines_event_area ",{"webix_area":i}));
	}
	graph += renderer.group(evItems.join(""));
	return  renderer.draw(graph, width, height, "webix_sparklines_bar_chart"+(config.css?" "+config.css:""));
};
Bar.prototype._applyColor = function(renderer,color){
	var config = {},
		map = renderer.styleMap;
	if(color)
		config[map.color] = color;
	return createCss(config);
};
Bar.prototype._getOrigin = function(data, width, height){
	var config = this.config;
	var y = config.paddingY||0;
	height = (height||100)-y*2;
	var pos = y+height;
	if(config.origin !== false){
		var minValue = Math.min.apply(null,data);
		var maxValue = Math.max.apply(null,data);
		var origin = config.origin||-0.000001;
		if(origin >= maxValue){
			pos = y;
		}
		else if(origin > minValue){
			var unitY = height/(maxValue - minValue);
			pos -= unitY*(origin-minValue);
		}
	}
	return pos;
};
Bar.prototype._getEventPoints = function(data, width, height){
	var result = [];
	var x = this.config.paddingX||0;
	var y = this.config.paddingY||0;
	width = (width||100)-x*2;
	height = (height||100)-y*2;
	if(data.length){
		var unitX = width/data.length;
		for(var i=0; i < data.length; i++)
			result.push({x: Math.ceil(unitX*i)+x, y: y, height: height, width: unitX});
	}
	return result;
};
Bar.prototype.getPoints = function(data, width, height){
	var config = this.config;
	var minValue = Math.min.apply(null,data);
	if (config.origin < minValue) 
		minValue = config.origin;

	var maxValue = Math.max.apply(null,data);
	var result = [];
	var x = config.paddingX;
	var y = config.paddingY;
	var margin = config.margin;
	var barWidth = config.width||20;
	var originY = this._getOrigin(data,width,height);
	width = (width||100)-x*2;
	height = (height||100)-y*2;
	if(data.length){
		var unitX = width/data.length;
		var yNum = config.scale || (maxValue - minValue);
		barWidth = Math.min(unitX-margin,barWidth);
		margin = unitX-barWidth;
		var minHeight = 0;
		var origin = minValue;

		if(config.origin !== false && config.origin > minValue)
			origin = config.origin||0;
		else
			minHeight = config.minHeight;

		var unitY = (height-minHeight)/(yNum?yNum:1);

		for(var i=0; i < data.length; i++){
			var h = Math.ceil(unitY*(data[i]-origin));
			result.push({x: Math.ceil(unitX*i)+x+margin/2, y: originY-(data[i]>=origin?h:0)-minHeight, height: Math.abs(h)+minHeight, width: barWidth});
		}

	}
	return result;
};

export default Bar;