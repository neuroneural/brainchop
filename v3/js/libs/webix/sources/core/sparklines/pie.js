import {extend} from "../../webix/helpers";

import SVG from "./svg";

var defaults = {
	paddingY: 2
};

function Pie(config){
	this.config = extend(defaults,config||{},true);
}
Pie.prototype._defColorsCursor = 0;
Pie.prototype._defColors  = [
	"#f55b50","#ff6d3f","#ffa521","#ffc927","#ffee54","#d3e153","#9acb61","#63b967",
	"#21a497","#21c5da","#3ea4f5","#5868bf","#7b53c0","#a943ba","#ec3b77","#9eb0b8"
];
Pie.prototype._getColor = function(i,data){
	var count = data.length;
	var colorsCount = this._defColors.length;
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
};
Pie.prototype.draw = function(data, width, height){
	var attrs, graph, i, sectors,
		config = this.config,
		color = config.color||this._getColor,
		points = this.getAngles(data),
		renderer = SVG,
		y = config.paddingY|| 0,
		// radius
		r = height/2 - y,
		// center
		x0 = width/2, y0 = height/2;

	// draw sectors
	if(typeof color != "function")
		color = function(){return color;};
	sectors = "";
	for( i =0; i < points.length; i++){
		attrs = {};
		attrs[renderer.styleMap["color"]] = color.call(this,i,data,this._context);
		sectors += renderer.getSector({x:x0,y:y0},r,points[i][0],points[i][1],"webix_sparklines_sector", attrs);
	}
	graph = renderer.group(sectors);

	// draw event areas
	sectors = "";
	for(i =0; i < points.length; i++){
		sectors += renderer.getSector({x:x0,y:y0},r,points[i][0],points[i][1],"webix_sparklines_event_area",{"webix_area":i});
	}
	graph += renderer.group(sectors);

	return  renderer.draw(graph, width, height, "webix_sparklines_pie_chart"+(config.css?" "+config.css:""));
};
Pie.prototype.getAngles = function(data){
	var a0 = -Math.PI/ 2, a1,
		i, result = [];

	var ratios = this._getRatios(data);

	for( i =0; i < data.length; i++){
		a1= -Math.PI/2+ratios[i]-0.0001;
		result.push([a0,a1]);
		a0 = a1;
	}
	return result;
};
Pie.prototype._getTotalValue = function(data){
	var t=0;
	for(var i = 0; i < data.length;i++)
		t += data[i]*1;
	return  t;
};
Pie.prototype._getRatios = function(data){
	var i, value,
		ratios = [],
		prevSum = 0,
		totalValue = this._getTotalValue(data);
	for(i = 0; i < data.length;i++){
		value = data[i]*1;
		ratios[i] = Math.PI*2*(totalValue?((value+prevSum)/totalValue):(1/data.length));
		prevSum += value;
	}
	return ratios;
};

export default Pie;