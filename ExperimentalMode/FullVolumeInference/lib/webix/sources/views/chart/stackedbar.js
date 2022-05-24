import {getTextSize} from "../../webix/html";

const StackedBarChart = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_stackedBar:function(ctx, data, point0, point1, sIndex, map){
		var maxValue,minValue, xAxisY, x0, y0;
		/*necessary if maxValue - minValue < 0*/
		var valueFactor;
		/*maxValue - minValue*/
		var relValue;
		var config = this._settings;
		var total_height = point1.y-point0.y;

		var yax = !!config.yAxis;
		var xax = !!config.xAxis;

		var limits = this._getStackedLimits(data);

		var origin = (config.origin === 0);

		maxValue = limits.max;
		minValue = limits.min;

		/*an available width for one bar*/
		var cellWidth = Math.floor((point1.x-point0.x)/data.length);

		/*draws x and y scales*/
		if(!sIndex){
			xAxisY = this._drawScales(data,point0, point1,minValue,maxValue,cellWidth);
		}

		/*necessary for automatic scale*/
		if(yax){
			maxValue = parseFloat(config.yAxis.end);
			minValue = parseFloat(config.yAxis.start);
		}

		/*unit calculation (bar_height = value*unit)*/
		var relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];

		var unit = (relValue?total_height/relValue:10);

		/*a real bar width */
		var barWidth = parseInt(config.barWidth,10);
		if(barWidth+4 > cellWidth) barWidth = cellWidth-4;
		/*the half of distance between bars*/
		var barOffset = Math.floor((cellWidth - barWidth)/2);


		var inner_gradient = (config.gradient?config.gradient:false);

		/*draws a black line if the horizontal scale isn't defined*/
		if(!xax){
			//scaleY = y-bottomPadding;
			this._drawLine(ctx,point0.x,point1.y+0.5,point1.x,point1.y+0.5,"#edeff0",1); //hardcoded color!
		}

		for(var i=0; i < data.length;i ++){
			var value =  parseFloat(config.value(data[i]||0));

			if(this._logScaleCalc)
				value = this._log10(value);

			/*start point (bottom left)*/
			x0 = point0.x + barOffset + i*cellWidth;


			var negValue = origin&&value<0;
			if(!sIndex){
				y0 = xAxisY-1;
				data[i].$startY = y0;
				if(origin){
					if(negValue)
						y0 = xAxisY+1;
					data[i].$startYN = xAxisY+1;
				}
			}
			else{
				y0 = negValue?data[i].$startYN:data[i].$startY;
			}

			if(!value || isNaN(value))
				continue;

			/*adjusts the first tab to the scale*/
			if(!sIndex && !origin)
				value -= minValue;

			value *= valueFactor;

			const border = config.border;
			let label = config.label(data[i]);

			/*the max height limit*/
			if(y0 < (point0.y+1)) continue;

			var color = this._settings.color.call(this,data[i]);

			var firstSector =  Math.abs(y0-(origin?(point1.y+minValue*unit):point1.y))<3;

			/*drawing bar body*/
			ctx.globalAlpha = config.alpha.call(this,data[i]);
			ctx.fillStyle = ctx.strokeStyle = config.color.call(this,data[i]);
			ctx.beginPath();

			var y1 = y0 - unit*value + (firstSector?(negValue?-1:1):0);

			if(Math.floor(y1) > point1.y){
				y1 = point1.y;
				if(label != "" && y1-y0 < getTextSize(`<div class="webix_canvas_text">${label}</div>`, this.$view.className).height)
					label = "";
			}

			var points = this._setStakedBarPoints(ctx,x0-(border?0.5:0),y0,barWidth+(border?0.5:0),y1, 0,point0.y);
			ctx.fill();
			ctx.stroke();

			/*gradient*/
			if (inner_gradient){
				ctx.save();
				var gradParam = this._setBarGradient(ctx,x0,y0,x0+barWidth,points[1],inner_gradient,color,"y");
				ctx.fillStyle = gradParam.gradient;
				ctx.beginPath();
				points = this._setStakedBarPoints(ctx,x0+gradParam.offset,y0,barWidth-gradParam.offset*2,y1,(border?1:0),point0.y);
				ctx.fill();
				ctx.restore();
			}
			/*drawing the gradient border of a bar*/
			if(border){
				ctx.save();
				if(typeof border == "string")
					ctx.strokeStyle = border;
				else
					this._setBorderStyles(ctx,color);
				ctx.beginPath();

				this._setStakedBarPoints(ctx,x0-0.5,parseInt(y0,10)+0.5,barWidth+1,parseInt(y1,10)+0.5,0,point0.y, firstSector);
				ctx.stroke();
				ctx.restore();
			}
			ctx.globalAlpha = 1;

			/*sets a bar label*/
			this.canvases[sIndex].renderTextAt(false, true, x0+Math.floor(barWidth/2),(points[1]+(y0-points[1])/2)-7,label);
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[x0-point0.x,points[1]-point0.y,points[0]-point0.x,data[i][negValue?"$startYN":"$startY"]-point0.y],sIndex);

			/*the start position for the next series*/

			data[i][negValue?"$startYN":"$startY"] = points[1];

		}
	},
	/**
	 *   sets points for bar and returns the position of the bottom right point
	 *   @param: ctx - canvas object
	 *   @param: x0 - the x position of start point
	 *   @param: y0 - the y position of start point
	 *   @param: barWidth - bar width
	 *   @param: radius - the rounding radius of the top
	 *   @param: unit - the value defines the correspondence between item value and bar height
	 *   @param: value - item value
	 *   @param: offset - the offset from expected bar edge (necessary for drawing border)
	 *   @param: minY - the minimum y position for the bars ()
	 */
	_setStakedBarPoints:function(ctx,x0,y0,barWidth,y1,offset,minY,skipBottom){
		/*start*/
		ctx.moveTo(x0,y0);
		/*maximum height limit*/

		if(y1<minY)
			y1 = minY;
		ctx.lineTo(x0,y1);
		var x3 = x0 + barWidth;
		var y3 = y1;
		ctx.lineTo(x3,y3);
		/*right rounding*/
		/*bottom right point*/
		var x5 = x0 + barWidth;
		ctx.lineTo(x5,y0);
		/*line to the start point*/
		if(!skipBottom){
			ctx.lineTo(x0,y0);
		}
		//	ctx.lineTo(x0,0); //IE fix!
		return [x5,y3];
	}
};

export default StackedBarChart;