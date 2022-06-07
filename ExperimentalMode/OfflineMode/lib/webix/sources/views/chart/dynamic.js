import {remove} from "../../webix/html";


var animateDuration = 400,
	cellWidth = 30;

const DynamicChart = {
	dynamic_setter: function(value){
		if(value)
			init(this);
		return value;
	}
};

/**
 * Sets event handlers and properties for a stock chart
 * @param {object} chart - chart view
 */
function init(chart){
	if(chart._stockRenderHandler)
		return;
	var config = chart._settings;

	if(!config.cellWidth)
		config.cellWidth = cellWidth;
	if(!config.animateDuration)
		config.animateDuration = animateDuration;
	config.offset = false;

	chart._stockRenderHandler = chart.attachEvent("onBeforeRender", function(data, type){
		var bounds = chart._getChartBounds(chart._content_width, chart._content_height);
		resizeStockCanvases(chart);
		filterStockData(data, bounds.start, bounds.end, config.cellWidth);
		if(type == "add")
			startAnimation(chart);
	});
	chart._stockXAxisHandler = chart.attachEvent("onBeforeXAxis", function(ctx,data,point0,point1,cellWidth,y){
		drawXAxis(chart,ctx,data,point0,point1,cellWidth,y);
		return false;
	});
}

/**
 * Starts stock animation
 * @param {object} chart - chart view
 */
function startAnimation(chart){
	var cellWidth = chart._settings.cellWidth;
	if(chart._stockAnimationOffset != cellWidth){
		chart._stockAnimationOffset = cellWidth;
		chart.render();
	}

	chart._stockAnimationOffset = 0;
	chart._stockAnimationStart = null;

	if(window.requestAnimationFrame && !document.hidden)
		window.requestAnimationFrame(function(t){
			animate(chart,t);
		});

	if(!chart._stockAnimateHandler)
		chart._stockAnimateHandler = chart.attachEvent("onAfterRender", function(data){
			applyStockOffset(chart, data);
		});
}

/**
 * Animates a chart
 * @param {object} chart - chart view
 * @param {number} timestamp - timestamp
 */
function animate(chart, timestamp){
	var progress,
		duration = chart._settings.animateDuration,
		cellWidth = chart._settings.cellWidth;

	if(cellWidth && chart.count() > 1){
		if (!chart._stockAnimationStart)
			chart._stockAnimationStart = timestamp;
		progress = timestamp - chart._stockAnimationStart;
		chart._stockAnimationOffset = Math.min(Math.max(progress/duration*cellWidth,1), cellWidth);
		chart.render();
		if (progress < duration)
			window.requestAnimationFrame(function(t){
				animate(chart,t);
			});
	}
}

/**
 * Applies animation offset to "series" and "x-axis" canvases
 * @param {object} chart - chart view
 * @param {object} data - data array
 */
function applyStockOffset(chart, data){
	var count = chart.count(),
		bounds = chart._getChartBounds(chart._content_width,chart._content_height),
		cellWidth = chart._settings.cellWidth,
		offset = chart._stockAnimationOffset || 0,
		isScroll = (data.length < count || (data.length-1)*cellWidth > bounds.end.x-bounds.start.x);

	function setCanvasOffset(canvas, x0, x1, skipRight){
		var ctx = canvas.getCanvas(),
			elem = canvas._canvas,
			labels = canvas._canvas_labels,
			series = canvas._canvas_series;


		// if we need to display less values than they are
		if(offset && (data.length < count || (data.length-1)*cellWidth > x1-x0)){
			// move canvas to the left
			elem.style.left = - offset + "px";
			if(data.length > 1){
				setLabelsOffset(labels, offset, series);
				// clear out of the scale parts
				ctx.clearRect(0, 0, x0+offset, elem.offsetHeight);
				ctx.clearRect(x1+offset, 0, elem.offsetWidth, elem.offsetHeight);
			}
		}
		// animation for the right part (added item)
		else{
			elem.style.left = "0px";
			if(!skipRight && offset!= cellWidth)
				ctx.clearRect(x0+(data.length-1)*cellWidth-cellWidth+offset, 0, elem.offsetWidth, elem.offsetHeight);
		}

		// show label for the last label after finishing animation
		if(labels.length>1 && offset && offset != cellWidth){
			var last = labels.length-1;
			if(isAxisTitle(series, labels[last]))
				last -= 1;
			labels[last].style.display = "none";
		}
			
	}

	eachStockCanvas(chart,function(name, canvas){
		setCanvasOffset(canvas, bounds.start.x,  bounds.end.x, name == "x");
	});

	setHtmlMapSizes(chart,bounds, isScroll?offset:0);
}

function isAxisTitle(series, label){
	return series ==="axis_x" && label.className.indexOf("webix_axis_title_x") !== -1;
}

function setLabelsOffset(labels, offset, series){
	if(labels.length){

		remove(labels[0]);
		for(var i = 1; i< labels.length; i++){
			//don't move axis title
			if(isAxisTitle(series, labels[i])) continue;
			labels[i].style.left = labels[i].offsetLeft - offset + "px";
		}
			
	}
}

/**
 * Gets visible chart data
 * @param {object} data - an array with all chart data
 * @param {object} point0 - a top left point of a plot
 * @param {object} point1 - a bottom right point of a plot
 * @param {number} cellWidth - a unit width
 */
function filterStockData(data, point0, point1, cellWidth){
	if(cellWidth && data.length){
		var limit = Math.ceil((point1.x - point0.x)/cellWidth);
		if(data.length > limit+1)
			data.splice(0, data.length - limit-1);
	}
}

/**
 * Calls a function for "series" and "x-axis" canvases
 * @param {object} chart - chart view
 * @param {function} func - function to call
 */
function eachStockCanvas(chart, func){
	if(chart.canvases){
		for(var i=0; i < chart._series.length;i++)
			if (chart.canvases[i])
				func(i,chart.canvases[i]);

		if (chart.canvases["x"])
			func("x",chart.canvases["x"]);
	}
}

/**
 * Set sizes for animated canvases
 * @param {object} chart - chart view
 */
function resizeStockCanvases(chart){
	eachStockCanvas(chart, function(name, canvas){
		canvas._resizeCanvas(chart._content_width+2*chart._settings.cellWidth, chart._content_height);
	});
}

/**
 * Set sizes for an html map of a chart
 * @param {object} chart - a chart view
 * @param {object} bounds - start and end points of a plot
 * @param {number} offset - an offset to apply
 */
function setHtmlMapSizes(chart, bounds, offset){
	chart._contentobj._htmlmap.style.left = (bounds.start.x - offset)+"px";
	chart._contentobj._htmlmap.style.width = (bounds.end.x-bounds.start.x+offset)+"px";
}

/**
 * Renders lines and labels of an x-axis
 * @param {object} chart - a chart view
 * @param {object} ctx - a canvas Context
 * @param {object} data - a data array
 * @param {object} point0 - a top left point of a plot
 * @param {object} point1 - a bottom right point of a plot
 * @param {number} cellWidth - a width of a unit
 * @param {number} y - the vertical position of an "x-axis" line
 */
function drawXAxis(chart, ctx, data,point0,point1,cellWidth,y){
	var center, i, isScroll,unitPos,
		config = chart._settings,
		x0 = point0.x-0.5,
		y0 = parseInt((y?y:point1.y),10)+0.5,
		x1 = point1.x;

	if(!config.dynamic)
		return false;

	isScroll = ((data.length-1)*cellWidth > x1-x0 || data.length < chart.count());

	for(i=0; i < data.length;i++){
		unitPos = x0+i*cellWidth ;
		center = isScroll?i>1:!!i;
		unitPos = Math.ceil(unitPos)-0.5;
		//scale labels
		chart._drawXAxisLabel(unitPos,y0,data[i],center);
		//draws a vertical line for the horizontal scale
		if(i && config.xAxis.lines.call(chart, data[i]))
			chart._drawXAxisLine(ctx,unitPos,point1.y,point0.y,data[i]);

	}

	chart.canvases["x"].renderTextAt(true, false, x0, point1.y + config.padding.bottom-3,
		config.xAxis.title,
		"webix_axis_title_x",
		point1.x - point0.x
	);
	chart._drawLine(ctx,x0,y0,x1+ (isScroll?chart._stockAnimationOffset:0),y0,config.xAxis.color,1);
}


export default DynamicChart;