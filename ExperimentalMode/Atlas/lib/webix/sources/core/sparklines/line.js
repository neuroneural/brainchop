import {createCss} from "../../webix/html";
import {extend, copy} from "../../webix/helpers";

import SVG from "./svg";

var defaults = {
	paddingX: 6,
	paddingY: 6,
	radius: 2,
	minHeight: 4,
	eventRadius: 8
};
function Line(config){
	this.config = extend(copy(defaults),config||{},true);
}

Line.prototype.draw = function(data, width, height){
	var points = this.getPoints(data, width, height);
	var config = this.config;
	var renderer = SVG;
	var styles = config.color?this._applyColor(renderer,config.color):null;
	// draw line
	var path = renderer.definePath(this._getLinePoints(points));
	var graph = renderer.group(renderer.getPath(path,"webix_sparklines_line"+(styles?" "+styles.line:"")));
	// draw items
	graph += this._drawItems(renderer, points, config.radius, "webix_sparklines_item"+(styles?" "+styles.item:""));
	// draw event items
	var eventRadius = Math.min(data.length?(width-2*(config.paddingX||0))/data.length:0,config.eventRadius);
	graph += this._drawEventItems(renderer, points, eventRadius);
	return  renderer.draw(graph, width, height, "webix_sparklines_line_chart"+(config.css?" "+config.css:""));
};
Line.prototype._applyColor = function(renderer,color){
	var config = {"line":{},"item":{}},
		map = renderer.styleMap;
	if(color){
		config.line[map.lineColor] = color;
		config.item[map.color] = color;
		for(var name in config)
			config[name] = createCss(config[name]);
	}
	return config;
};
Line.prototype._drawItems = function(renderer,points,radius,css,attrs){
	var items = [];
	for(var i = 0; i< points.length; i++){
		items.push(renderer.getCircle(points[i], radius, css,attrs));
	}
	return renderer.group(items.join(""));
};
Line.prototype._drawEventItems = function(renderer,points,radius){
	var items = [];
	for(var i = 0; i< points.length; i++){
		items.push(renderer.getCircle(points[i], radius, "webix_sparklines_event_area", {webix_area:i}));
	}
	return renderer.group(items.join(""));
};

Line.prototype._getLinePoints = function(points){
	var i, type, result =[];
	for( i =0; i< points.length; i++){
		type = i?"L":"M";
		result.push([type,points[i]]);
	}
	return result;
};
Line.prototype.getPoints = function(data, width, height) {
	var config = this.config;
	var minValue = Math.min.apply(null,data);
	if (typeof config.origin !== "undefined")
		minValue = Math.min(config.origin, minValue);

	var maxValue = Math.max.apply(null,data);
	var result = [];
	var x = config.paddingX||0;
	var y = config.paddingY||0;
	width = (width||100)-x*2;
	var minHeight = config.minHeight||0;
	height = (height||100)-y*2;
	if(data.length){
		if(data.length==1)
			result.push({x: width/2+x, y: height/2+x});
		else{
			var unitX = width/(data.length-1);
			var yNum = config.scale || (maxValue - minValue);
			var unitY = (height- minHeight)/(yNum?yNum:1);
			if(!yNum)
				height /= 2;
			for(var i=0; i < data.length; i++){
				result.push({x: Math.ceil(unitX*i)+x, y: height-Math.ceil(unitY*(data[i]-minValue))+y-minHeight});
			}
		}
	}
	return result;
};

export default Line;