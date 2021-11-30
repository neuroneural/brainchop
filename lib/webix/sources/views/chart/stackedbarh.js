

const StackedBarHChart = {
/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*   @param: map - map object
	*/
	$render_stackedBarH:function(ctx, data, point0, point1, sIndex, map){
		var maxValue,minValue;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;

		var total_width = point1.x-point0.x;

		var yax = !!this._settings.yAxis;

		var limits = this._getStackedLimits(data);
		maxValue = limits.max;
		minValue = limits.min;

		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.y-point0.y)/data.length);

		/*draws x and y scales*/
		if(!sIndex)
			this._drawHScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);

		/*necessary for automatic scale*/
		if(yax){
			maxValue = parseFloat(this._settings.xAxis.end);
			minValue = parseFloat(this._settings.xAxis.start);
		}

		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];

		var unit = (relValue?total_width/relValue:10);
		var startValue = 0;
		if(!yax){
			/*defines start value for better representation of small values*/
			startValue = 10;
			unit = (relValue?(total_width-startValue)/relValue:10);
		}

		/*a real bar width */
		var barWidth = parseInt(this._settings.barWidth,10);
		if((barWidth+4)>cellWidth) barWidth = cellWidth-4;
		/*the half of distance between bars*/
		var barOffset = (cellWidth - barWidth)/2;
		/*the radius of rounding in the top part of each bar*/
		var radius = 0;

		var inner_gradient = false;
		var gradient = this._settings.gradient;
		if (gradient){
			inner_gradient = true;
		}
		/*draws a black line if the horizontal scale isn't defined*/
		if(!yax){
			this._drawLine(ctx,point0.x-0.5,point0.y,point0.x-0.5,point1.y,"#edeff0",1); //hardcoded color!
		}

		var seriesNumber = 0;
		var seriesIndex = 0;
		for(i=0; i<this._series.length; i++ ){
			if(i == sIndex){
				seriesIndex  = seriesNumber;
			}
			if(this._series[i].type == "stackedBarH")
				seriesNumber++;
		}

		for(var i=0; i < data.length;i ++){

			if(!seriesIndex)
				data[i].$startX = point0.x;

			var value =  Math.abs(parseFloat(this._settings.value(data[i]||0)));
			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;

			/*start point (bottom left)*/
			var x0 = point0.x;
			var y0 = point0.y+ barOffset + i*cellWidth;

			if(!seriesIndex)
				data[i].$startX = x0;
			else
				x0 = data[i].$startX;

			if(!value || isNaN(value))
				continue;

			/*takes start value into consideration*/
			if(!yax) value += startValue/unit;
			var color = this._settings.color.call(this,data[i]);


			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			ctx.fillStyle = this._settings.color.call(this,data[i]);
			ctx.beginPath();
			var points = this._setBarHPoints(ctx,x0,y0,barWidth,radius,unit,value,0);
			if (gradient&&!inner_gradient) ctx.lineTo(point0.x+total_width,y0+(this._settings.border?1:0)); //fix gradient sphreading
			ctx.fill();

			if (inner_gradient){
				var gradParam = this._setBarGradient(ctx,x0,y0+barWidth,x0,y0,inner_gradient,color,"x");
				ctx.fillStyle = gradParam.gradient;
				ctx.beginPath();
				points = this._setBarHPoints(ctx,x0,y0, barWidth,radius,unit,value,0);
				ctx.fill();
			}
			/*drawing the gradient border of a bar*/
			if(this._settings.border){
				this._drawBarHBorder(ctx,x0,y0,barWidth,minValue,radius,unit,value,color);
			}

			ctx.globalAlpha = 1;

			/*sets a bar label*/
			this.canvases[sIndex].renderTextAt("middle",true,data[i].$startX+(points[0]-data[i].$startX)/2-1, y0+(points[1]-y0)/2, this._settings.label(data[i]));
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[data[i].$startX-point0.x,y0-point0.y,points[0]-point0.x,points[1]-point0.y],sIndex);
			/*the start position for the next series*/
			data[i].$startX = points[0];
		}
	}
};

export default StackedBarHChart;