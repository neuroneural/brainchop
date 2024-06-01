import {extend, bind} from "../webix/helpers";
import {assert} from "../webix/debug";
import {attachEvent} from "../webix/customevents";

import Area from "./sparklines/area";
import Bar from "./sparklines/bar";
import Line from "./sparklines/line";
import Pie from "./sparklines/pie";
import Spline from "./sparklines/spline";
import SplineArea from "./sparklines/splinearea";

function Sparklines(){}

function getData(data){
	var values = [];
	for (var i = data.length - 1; i >= 0; i--) {
		var value = data[i];
		values[i] = (typeof value === "object" ? value.value : value);
	}
	return values;
}


Sparklines.types ={};

Sparklines.getTemplate = function(customConfig){
	var config = customConfig||{};
	if(typeof customConfig == "string")
		config = { type: customConfig };

	extend(config,{ type:"line" });

	var slConstructor = this.types[config.type];
	assert(slConstructor,"Unknown sparkline type");
	return bind(this._template, new slConstructor(config));
};

Sparklines._template =  function(item, common, data, column){
	if (column)
		return this.draw(getData(data), column.width, 33);
	else
		return this.draw(item.data || item, common.width, common.height);
};

// add "sparklines" type
attachEvent("onDataTable", function(table){
	table.type.sparklines = Sparklines.getTemplate();
});

Sparklines.types["area"]=Area;
Sparklines.types["bar"]=Bar;
Sparklines.types["line"]=Line;
Sparklines.types["pie"]=Pie;
Sparklines.types["spline"]=Spline;
Sparklines.types["splineArea"]=SplineArea;

export default Sparklines;