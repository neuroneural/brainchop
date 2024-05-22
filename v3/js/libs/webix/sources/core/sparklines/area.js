import {createCss} from "../../webix/html";
import {extend, copy} from "../../webix/helpers";

import SVG from "./svg";
import BaseLine from "./line";



var defaults = {
	paddingX: 3,
	paddingY: 4,
	radius: 1,
	minHeight: 4,
	eventRadius: 8
};

function Area(config){
	this.config = extend(copy(defaults),config||{},true);
}

Area.prototype.draw = function(data, width, height){
	var eventRadius, graph, path, points, styles,
		config = this.config,
		Line = BaseLine.prototype,
		renderer = SVG;

	// draw area
	points = this.getPoints(data, width, height);
	path = renderer.definePath(Line._getLinePoints(points),true);

	if(config.color)
		styles = this._applyColor(renderer,config.color);

	graph = renderer.group(renderer.getPath(path,"webix_sparklines_area"+(styles?" "+styles.area:"")));
	// draw line
	points.splice(points.length - 3, 3);
	path = renderer.definePath(Line._getLinePoints(points));
	graph += renderer.group(renderer.getPath(path,"webix_sparklines_line"+(styles?" "+styles.line:"")));
	// draw items
	graph += Line._drawItems(renderer, points, config.radius, "webix_sparklines_item"+(styles?" "+styles.item:""));
	// draw event areas
	eventRadius = Math.min(data.length?(width-2*(config.paddingX||0))/data.length:0,config.eventRadius);
	graph += Line._drawEventItems(renderer, points, eventRadius);
	return  renderer.draw(graph, width, height, "webix_sparklines_area_chart"+(config.css?" "+config.css:""));
};
Area.prototype._applyColor = function(renderer,color){
	var config = {"area": {}, "line":{},"item":{}},
		map = renderer.styleMap;
	if(color){
		config.area[map.color] = renderer.setOpacity(color,0.2);
		config.line[map.lineColor] = color;
		config.item[map.color] = color;
		for(var name in config)
			config[name] = createCss(config[name]);
	}

	return config;
};
Area.prototype.getPoints = function(data, width, height){
	var Line = BaseLine.prototype;
	var points =Line.getPoints.call(this, data, width, height);
	var x = this.config.paddingX || 0;
	var y = this.config.paddingY || 0;
	points.push({x: width - x, y: height - y},{x: x, y: height - y},{x: x, y: points[0].y});
	return points;
};

export default Area;