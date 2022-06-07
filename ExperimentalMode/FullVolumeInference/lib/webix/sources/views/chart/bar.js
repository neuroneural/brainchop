import color from "../../webix/color";

const BarChart = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_bar:function(ctx, data, point0, point1, sIndex, map){
		var barWidth, cellWidth,
			i,
			limits, maxValue, minValue,
			relValue, valueFactor, relativeValues,
			startValue, unit,
			xax, yax,
			totalHeight = point1.y-point0.y;

		yax = !!this._settings.yAxis;
		xax = !!this._settings.xAxis;

		limits = this._getLimits();
		maxValue = limits.max;
		minValue = limits.min;

		/*an available width for one bar*/
		cellWidth = (point1.x-point0.x)/data.length;


		/*draws x and y scales*/
		if(!sIndex&&!(this._settings.origin!="auto"&&!yax)){
			this._drawScales(data,point0, point1,minValue,maxValue,cellWidth);
		}

		/*necessary for automatic scale*/
		if(yax){
			maxValue = parseFloat(this._settings.yAxis.end);
			minValue = parseFloat(this._settings.yAxis.start);
		}

		/*unit calculation (bar_height = value*unit)*/
		relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];

		unit = (relValue?totalHeight/relValue:relValue);

		if(!yax&&!(this._settings.origin!="auto"&&xax)){
			/*defines start value for better representation of small values*/
			startValue = 10;
			unit = (relValue?(totalHeight-startValue)/relValue:startValue);
		}
		/*if yAxis isn't set, but with custom origin */
		if(!sIndex&&(this._settings.origin!="auto"&&!yax)&&this._settings.origin>minValue){
			this._drawXAxis(ctx,data,point0,point1,cellWidth,point1.y-unit*(this._settings.origin-minValue));
		}

		/*a real bar width */
		barWidth = parseInt(this._settings.barWidth,10);
		var seriesNumber = 0;
		var seriesIndex = 0;
		for(i=0; i<this._series.length; i++ ){
			if(i == sIndex){
				seriesIndex  = seriesNumber;
			}
			if(this._series[i].type == "bar")
				seriesNumber++;
		}
		if(this._series&&(barWidth*seriesNumber+4)>cellWidth) barWidth = parseInt(cellWidth/seriesNumber-4,10);

		/*the half of distance between bars*/
		var barOffset = (cellWidth - barWidth*seriesNumber)/2;

		/*the radius of rounding in the top part of each bar*/
		var radius = (typeof this._settings.radius!="undefined"?parseInt(this._settings.radius,10):Math.round(barWidth/5));

		var inner_gradient = false;
		var gradient = this._settings.gradient;

		if(gradient && typeof(gradient) != "function"){
			inner_gradient = gradient;
			gradient = false;
		} else if (gradient){
			gradient = ctx.createLinearGradient(0,point1.y,0,point0.y);
			this._settings.gradient(gradient);
		}
		/*draws a black line if the horizontal scale isn't defined*/
		if(!xax){
			this._drawLine(ctx,point0.x,point1.y+0.5,point1.x,point1.y+0.5,"#edeff0",1); //hardcoded color!
		}

		for(i=0; i < data.length;i ++){
			var value =  parseFloat(this._settings.value(data[i])||0);
			if(this._logScaleCalc)
				value = this._log10(value);

			if(!value || isNaN(value))
				continue;

			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;

			/*start point (bottom left)*/
			var x0 = point0.x + barOffset + i*cellWidth+(barWidth+1)*seriesIndex;
			var y0 = point1.y;

			var color = gradient||this._settings.color.call(this,data[i]);
			var border = this._settings.border?1:0;
			var label = this._settings.label(data[i]);
			
			/*takes start value into consideration */
			if(!yax&&!(this._settings.origin!="auto"&&xax)) 
				value += startValue/unit;
			/* don't draw borders and labels for not painted values (on y-Axis or lower) */
			else if(value == this._settings.origin || (this._settings.origin =="auto" && this._settings.value(data[i]) == minValue)){
				border = 0;
				label = "";
			}
			else if(value<0||(this._settings.yAxis&&value===0&&!(this._settings.origin!="auto"&&this._settings.origin>minValue))){
				value = border = 0;
				label = "";
			}

			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			var points = this._drawBar(ctx,point0,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,inner_gradient, border);
			if (inner_gradient){
				this._drawBarGradient(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,inner_gradient, border);
			}
			/*drawing the gradient border of a bar*/
			if(border)
				this._drawBarBorder(ctx,x0,y0,barWidth,minValue,radius,unit,value,color);

			ctx.globalAlpha = 1;

			/*sets a bar label*/
			if(points[0]!=x0)
				this.canvases[sIndex].renderTextAt(false, true, x0+Math.floor(barWidth/2),points[1],label);
			else
				this.canvases[sIndex].renderTextAt(true, true, x0+Math.floor(barWidth/2),points[3],label);
			/*defines a map area for a bar*/
			map.addRect(data[i].id,[x0-point0.x,points[3]-point0.y,points[2]-point0.x,points[1]-point0.y],sIndex);
			//this._addMapRect(map,data[i].id,[{x:x0,y:points[3]},{x:points[2],y:points[1]}],point0,sIndex);
		}
	},
	_correctBarParams:function(ctx,x,y,value,unit,barWidth,minValue){
		var axisStart = y;
		if(this._settings.origin!="auto" && (this._settings.origin>minValue)){
			y -= (this._settings.origin-minValue)*unit;
			axisStart = y;
			value = value-(this._settings.origin-minValue);
			if(value < 0){
				value *= (-1);
				ctx.translate(x+barWidth,y);
				ctx.rotate(Math.PI);
				x = 0;
				y = 0;
			}
			y -= 0.5;
		}

		return {value:value,x0:x,y0:y,start:axisStart};
	},
	_drawBar:function(ctx,point0,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,inner_gradient, border){
		ctx.save();
		ctx.fillStyle = color;
		var p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		var points = this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,border);
		if (gradient&&!inner_gradient) ctx.lineTo(p.x0+border,point0.y); //fix gradient sphreading
		ctx.fill();
		ctx.restore();
		var x1 = p.x0;
		var x2 = (p.x0!=x0?x0+points[0]:points[0]);
		var y1 = (p.x0!=x0?(p.start-points[1]-p.y0):p.y0);
		var y2 = (p.x0!=x0?p.start-p.y0:points[1]);

		return [x1,y1,x2,y2];
	},
	_setBorderStyles:function(ctx, rawColor){
		var hsv,rgb;
		rgb = color.toRgb(rawColor);
		hsv = color.rgbToHsv(rgb[0],rgb[1],rgb[2]);
		hsv[2] /= 1.4;
		var rgbColor = "rgb("+color.hsvToRgb(hsv[0],hsv[1],hsv[2])+")";
		ctx.strokeStyle = rgbColor;
		if(ctx.globalAlpha==1)
			ctx.globalAlpha = 0.9;
	},
	_drawBarBorder:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color){
		var p;
		ctx.save();
		p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		this._setBorderStyles(ctx,color);
		this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,ctx.lineWidth/2,1);
		ctx.stroke();
		/*ctx.fillStyle = color;
		 this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,0);
		 ctx.lineTo(p.x0,0);
		 ctx.fill()


		 ctx.fillStyle = "#000000";
		 ctx.globalAlpha = 0.37;

		 this._setBarPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,0);
		 ctx.fill()
		 */
		ctx.restore();
	},
	_drawBarGradient:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,inner_gradient, border){
		ctx.save();
		var p = this._correctBarParams(ctx,x0,y0,value,unit,barWidth,minValue);
		var gradParam = this._setBarGradient(ctx,p.x0,p.y0,p.x0+barWidth,p.y0-unit*p.value+2,inner_gradient,color,"y");
		ctx.fillStyle = gradParam.gradient;
		this._setBarPoints(ctx,p.x0+gradParam.offset,p.y0,barWidth-gradParam.offset*2,radius,unit,p.value,gradParam.offset+border);
		ctx.fill();
		ctx.restore();
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
	 */
	_setBarPoints:function(ctx,x0,y0,barWidth,radius,unit,value,offset,skipBottom){
		/*correction for displaing small values (when rounding radius is bigger than bar height)*/
		ctx.beginPath();
		//y0 = 0.5;
		var angle_corr = 0;
		if(radius>unit*value){
			var cosA = (radius-unit*value)/radius;
			if(cosA<=1&&cosA>=-1)
				angle_corr = -Math.acos(cosA)+Math.PI/2;
		}
		/*start*/
		ctx.moveTo(x0+offset,y0);
		/*start of left rounding*/
		var y1 = y0 - Math.floor(unit*value) + radius + (radius?0:offset);
		if(radius<unit*value)
			ctx.lineTo(x0+offset,y1);
		/*left rounding*/
		var x2 = x0 + radius;

		if (radius&&radius>0)
			ctx.arc(x2,y1,Math.max(radius-offset,0),-Math.PI+angle_corr,-Math.PI/2,false);
		/*start of right rounding*/
		var x3 = x0 + barWidth - radius - offset;
		var y3 = y1 - radius + (radius?offset:0);
		ctx.lineTo(x3,y3);
		/*right rounding*/
		if (radius&&radius>0)
			ctx.arc(x3+offset,y1,Math.max(radius-offset,0),-Math.PI/2,0-angle_corr,false);
		/*bottom right point*/
		var x5 = x0 + barWidth-offset;
		ctx.lineTo(x5,y0);
		/*line to the start point*/
		if(!skipBottom){
			ctx.lineTo(x0+offset,y0);
		}
		//	ctx.lineTo(x0,0); //IE fix!
		return [x5,y3];
	}
};

export default BarChart;