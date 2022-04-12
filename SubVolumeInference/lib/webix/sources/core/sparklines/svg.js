import color from "../../webix/color";
import {assert} from "../../webix/debug";


function joinAttributes(attrs){
	var result = " ";
	if(attrs)
		for(var a in attrs)
			result += a+"=\""+attrs[a]+"\" ";
	return result;
}
// SVG
var SVG = {};

SVG.draw = function(content, width, height, css){
	var attrs = {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.1",
		height: "100%",
		width: "100%",
		viewBox: "0 0 "+width+" "+height,
		"class": css||""
	};
	return "<svg "+joinAttributes(attrs)+">"+content+"</svg>";
};
SVG.styleMap = {
	"lineColor": "stroke",
	"color": "fill"
};
SVG.group = function(path){
	return "<g>"+path+"</g>";
};
SVG._handlers = {
	// MoveTo: {x:px,y:py}
	"M": function(p){
		return " M "+ p.x+" "+ p.y;
	},
	// LineTo: {x:px,y:py}
	"L": function(p){
		return " L "+ p.x+" "+ p.y;
	},
	// Curve: 3 points {x:px,y:py}: two control points and an end point
	"C": function(cp0, cp1, p){
		return " C "+cp0.x + " "+cp0.y+" "+cp1.x + " "+cp1.y+" "+p.x + " "+p.y;
	},
	// Arc: center point {x:px,y:py}, radius, angle0, angle1
	"A": function(p, radius, angle0, angle1){
		var x = p.x+Math.cos(angle1)*radius;
		var y = p.y+Math.sin(angle1)*radius;
		var bigCircle = angle1-angle0 >= Math.PI;
		return  " A "+radius+" "+radius+" 0 "+(bigCircle?1:0)+" 1 "+x+" "+y;
	}
};
// points is an array of an array with two elements: {string} line type, {array}
SVG.definePath = function(points, close){
	var path = "";
	for(var i =0; i < points.length; i++){
		assert(points[i][0]&&typeof points[i][0] == "string", "Path type must be a string");
		var type = (points[i][0]).toUpperCase();
		assert(this._handlers[type], "Incorrect path type");
		path += this._handlers[type].apply(this,points[i].slice(1));

	}
	if(close)
		path += " Z";

	return path;
};
SVG._linePoints = function(points){
	var result = [];
	for(var i = 0; i< points.length; i++){
		result.push([i?"L":"M",points[i]]);
	}
	return result;
};
SVG.setOpacity = function(rawColor,opacity){
	let rgbColor = color.toRgb(rawColor);
	rgbColor.push(opacity);
	return "rgba("+rgbColor.join(",")+")";
};
SVG._curvePoints = function(points){
	var result = [];
	for(var i = 0; i< points.length; i++){
		var p = points[i];
		if(!i){
			result.push(["M",p[0]]);
		}
		result.push(["C",p[1],p[2],p[3]]);
	}
	return result;
};
SVG.getPath = function(path, css, attrs){
	attrs = joinAttributes(attrs);
	return "<path class=\""+css+"\" vector-effect=\"non-scaling-stroke\" d=\""+path+"\" "+attrs+"/>";
};
SVG.getSector = function(p, radius, angle0, angle1, css, attrs){
	attrs = joinAttributes(attrs);
	var x0 = p.x+Math.cos(angle0)*radius;
	var y0 = p.y+Math.sin(angle0)*radius;
	var lines = [
		["M",p],
		["L",{x:x0, y:y0}],
		["A", p,radius,angle0,angle1],
		["L",p]
	];


	return "<path class=\""+css+"\" vector-effect=\"non-scaling-stroke\" d=\""+SVG.definePath(lines,true)+"\" "+attrs+"/>";
};
SVG.getCurve = function(points,css, attrs){
	attrs = joinAttributes(attrs);
	var path = this.definePath(this._curvePoints(points));
	return "<path fill=\"none\" class=\""+css+"\" vector-effect=\"non-scaling-stroke\" d=\""+path+"\" "+attrs+"/>";
};
SVG.getLine = function(p0,p1,css, attrs){
	return this.getPath(this.definePath(this._linePoints([p0,p1]),true),css,attrs);
};
SVG.getCircle = function(p, radius, css, attrs){
	attrs = joinAttributes(attrs);
	return "<circle class=\""+css+"\" cx=\""+ p.x+"\" cy=\""+ p.y+"\" r=\""+radius+"\" "+attrs+"/>";
};
SVG.getRect = function(x, y, width, height, css, attrs){
	attrs = joinAttributes(attrs);
	return "<rect class=\""+css+"\" rx=\"0\" ry=\"0\" x=\""+x+"\" y=\""+y+"\" width=\""+width+"\" height=\""+height+"\" "+attrs+"/>";
};


export default SVG;