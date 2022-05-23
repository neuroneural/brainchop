import {createCss} from "../../webix/html";
import {extend, copy} from "../../webix/helpers";

import SVG from "./svg";
import Spline from "./spline";
import Base from "./line";


var defaultsArea = {
	paddingX: 3,
	paddingY: 6,
	radius: 1,
	minHeight: 4,
	eventRadius: 8
};
// spline area
function SplineArea(config){
	this.config = extend(copy(defaultsArea),config||{},true);
}
SplineArea.prototype = copy(Spline.prototype);
SplineArea.prototype.draw = function(data, width, height){
	var config = this.config,
		Line = Base.prototype,
		renderer = SVG,
		styles = config.color?this._applyColor(renderer,config.color):null;

	var points = this.getPoints(data, width, height);
	// draw area
	var linePoints = points.splice(points.length - 3, 3);
	var linePath = renderer._linePoints(linePoints);
	linePath[0][0] = "L";
	var areaPoints = renderer._curvePoints(points).concat(linePath);
	var graph = renderer.group(renderer.getPath(renderer.definePath(areaPoints),"webix_sparklines_area"+(styles?" "+styles.area:""), true));
	// draw line
	graph += renderer.group(renderer.getPath(renderer.definePath(renderer._curvePoints(points)),"webix_sparklines_line"+(styles?" "+styles.line:"")));

	var itemPoints = Line.getPoints.call(this,data, width, height);
	// draw items
	graph += Line._drawItems(renderer, itemPoints, config.radius, "webix_sparklines_item"+(styles?" "+styles.item:""));
	// draw event items
	var eventRadius = Math.min(data.length?(width-2*(config.paddingX||0))/data.length:0,config.eventRadius);
	graph += Line._drawEventItems(renderer, itemPoints, eventRadius);
	return  renderer.draw(graph, width, height, "webix_sparklines_splinearea_chart"+(config.css?" "+config.css:""));
};
SplineArea.prototype._applyColor = function(renderer,color){
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
SplineArea.prototype.getPoints = function(data, width, height){
	var points = Spline.prototype.getPoints.call(this, data, width, height);
	var x = this.config.paddingX || 0;
	var y = this.config.paddingY || 0;
	points.push({x: width - x, y: height - y},{x: x, y: height - y},{x: x, y: points[0][0].y});
	return points;
};

export default SplineArea;