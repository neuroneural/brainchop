import {createCss} from "../../webix/html";
import {extend, copy} from "../../webix/helpers";

import SVG from "./svg";
import Base from "./line";

var defaults = {
	paddingX: 3,
	paddingY: 6,
	radius: 2,
	minHeight: 4,
	eventRadius: 8
};

function Spline(config){
	this.config = extend(copy(defaults),config||{},true);
}

Spline.prototype.draw = function(data, width, height){
	var config = this.config,
		graph = "",
		Line = Base.prototype,
		points = this.getPoints(data, width, height),
		renderer = SVG,
		styles = config.color?this._applyColor(renderer,config.color):null;

	// draw spline
	graph += renderer.group(renderer.getCurve(points, "webix_sparklines_line"+(styles?" "+styles.line:"")));

	var linePoints = Line.getPoints.call(this,data, width, height);
	// draw items
	graph += Line._drawItems(renderer, linePoints, config.radius, "webix_sparklines_item"+(styles?" "+styles.item:""));
	// draw event items
	var eventRadius = Math.min(data.length?(width-2*(config.paddingX||0))/data.length:0,config.eventRadius);
	graph += Line._drawEventItems(renderer, linePoints, eventRadius);
	return  renderer.draw(graph, width, height,"webix_sparklines_line_chart"+(config.css?" "+config.css:""));
};
Spline.prototype._applyColor = function(renderer,color){
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
Spline.prototype.getPoints = function(data, width, height){
	var i, points, px, py,
		result = [], x = [], y =[],
		Line = Base.prototype;

	points = Line.getPoints.call(this, data, width, height);

	for(i = 0; i< points.length; i++){
		x.push(points[i].x);
		y.push(points[i].y);
	}
	px = this._getControlPoints(x);
	py = this._getControlPoints(y);
	/*updates path settings, the browser will draw the new spline*/
	for ( i=0;i<points.length-1;i++){
		result.push([points[i],{x:px[0][i],y:py[0][i]},{x:px[1][i],y:py[1][i]},points[i+1]]);
	}
	return result;

};
/* code from https://www.particleincell.com/2012/bezier-splines/ */
Spline.prototype._getControlPoints = function(points){
	var a=[], b=[], c=[], r=[], p1=[], p2=[],
		i, m, n = points.length-1;

	a[0]=0;
	b[0]=2;
	c[0]=1;
	r[0] = points[0] + 2*points[1];

	for (i = 1; i < n - 1; i++){
		a[i]=1;
		b[i]=4;
		c[i]=1;
		r[i] = 4 * points[i] + 2 * points[i+1];
	}

	a[n-1]=2;
	b[n-1]=7;
	c[n-1]=0;
	r[n-1] = 8*points[n-1]+points[n];

	for (i = 1; i < n; i++){
		m = a[i]/b[i-1];
		b[i] = b[i] - m * c[i - 1];
		r[i] = r[i] - m*r[i-1];
	}

	p1[n-1] = r[n-1]/b[n-1];
	for (i = n - 2; i >= 0; --i)
		p1[i] = (r[i] - c[i] * p1[i+1]) / b[i];

	for (i=0;i<n-1;i++)
		p2[i]=2*points[i+1]-p1[i+1];

	p2[n-1]=0.5*(points[n]+p1[n-1]);

	return [p1, p2];
};



export default Spline;