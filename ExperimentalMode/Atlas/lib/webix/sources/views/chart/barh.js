const BarHChart = {
	/**
	*   renders a bar chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_barH:function(ctx, data, point0, point1, sIndex, map){
		var barOffset, barWidth, cellWidth, color, gradient, i, limits, maxValue, minValue,
			innerGradient, valueFactor, relValue, radius, relativeValues,
			startValue, totalWidth,value,  unit, x0, y0, xax;

		/*an available width for one bar*/
		cellWidth = (point1.y-point0.y)/data.length;

		limits = this._getLimits("h");

		maxValue = limits.max;
		minValue = limits.min;

		totalWidth = point1.x-point0.x;

		xax = !!this._settings.xAxis;

		/*draws x and y scales*/
		if(!sIndex )
			this._drawHScales(ctx,data,point0, point1,minValue,maxValue,cellWidth);

		/*necessary for automatic scale*/
		if(xax ){
			maxValue = parseFloat(this._settings.xAxis.end);
			minValue = parseFloat(this._settings.xAxis.start);
		}

		/*unit calculation (bar_height = value*unit)*/
		relativeValues = this._getRelativeValue(minValue,maxValue);
		relValue = relativeValues[0];
		valueFactor = relativeValues[1];

		unit = (relValue?totalWidth/relValue:10);
		if(!xax){
			/*defines start value for better representation of small values*/
			startValue = 10;
			unit = (relValue?(totalWidth-startValue)/relValue:10);
		}


		/*a real bar width */
		barWidth = parseInt(this._settings.barWidth,10);
		if((barWidth*this._series.length+4)>cellWidth) barWidth = cellWidth/this._series.length-4;
		/*the half of distance between bars*/
		barOffset = Math.floor((cellWidth - barWidth*this._series.length)/2);
		/*the radius of rounding in the top part of each bar*/
		radius = (typeof this._settings.radius!="undefined"?parseInt(this._settings.radius,10):Math.round(barWidth/5));

		innerGradient = false;
		gradient = this._settings.gradient;

		if (gradient&&typeof(gradient) != "function"){
			innerGradient = gradient;
			gradient = false;
		} else if (gradient){
			gradient = ctx.createLinearGradient(point0.x,point0.y,point1.x,point0.y);
			this._settings.gradient(gradient);
		}
		/*draws a black line if the horizontal scale isn't defined*/
		if(!xax){
			this._drawLine(ctx,point0.x-0.5,point0.y,point0.x-0.5,point1.y,"#edeff0",1); //hardcoded color!
		}



		for(i=0; i < data.length;i ++){


			value =  parseFloat(this._settings.value(data[i]||0));
			if(this._logScaleCalc)
				value = this._log10(value);
			
			if(!value || isNaN(value))
				continue;

			if(value>maxValue) value = maxValue;
			value -= minValue;
			value *= valueFactor;

			/*start point (bottom left)*/
			x0 = point0.x;
			y0 = point0.y+ barOffset + i*cellWidth+(barWidth+1)*sIndex;

			if((value<0&&this._settings.origin=="auto")||(this._settings.xAxis&&value===0&&!(this._settings.origin!="auto"&&this._settings.origin>minValue))){
				this.canvases[sIndex].renderTextAt("middle", "right", x0+10,y0+barWidth/2+barOffset,this._settings.label(data[i]));
				continue;
			}
			if(value<0&&this._settings.origin!="auto"&&this._settings.origin>minValue){
				value = 0;
			}

			/*takes start value into consideration*/
			if(!xax) value += startValue/unit;
			color = gradient||this._settings.color.call(this,data[i]);

			/*drawing the gradient border of a bar*/
			if(this._settings.border){
				this._drawBarHBorder(ctx,x0,y0,barWidth,minValue,radius,unit,value,color);
			}

			/*drawing bar body*/
			ctx.globalAlpha = this._settings.alpha.call(this,data[i]);
			var points = this._drawBarH(ctx,point1,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,innerGradient);
			if (innerGradient){
				this._drawBarHGradient(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,innerGradient);

			}
			ctx.globalAlpha = 1;


			/*sets a bar label and map area*/

			if(points[3]==y0){
				this.canvases[sIndex].renderTextAt("middle", "left", points[0]-5,points[3]+Math.floor(barWidth/2),this._settings.label(data[i]));
				map.addRect(data[i].id,[points[0]-point0.x,points[3]-point0.y,points[2]-point0.x,points[3]+barWidth-point0.y],sIndex);

			}else{
				this.canvases[sIndex].renderTextAt("middle", false, points[2]+5,points[1]+Math.floor(barWidth/2),this._settings.label(data[i]));
				map.addRect(data[i].id,[points[0]-point0.x,y0-point0.y,points[2]-point0.x,points[3]-point0.y],sIndex);
			}

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
	 */
	_setBarHPoints:function(ctx,x0,y0,barWidth,radius,unit,value,offset,skipLeft){
		/*correction for displaing small values (when rounding radius is bigger than bar height)*/
		var angle_corr = 0;

		if(radius>unit*value){
			var sinA = (radius-unit*value)/radius;
			angle_corr = -Math.asin(sinA)+Math.PI/2;
		}
		/*start*/
		ctx.moveTo(x0,y0+offset);
		/*start of left rounding*/
		var x1 = x0 + unit*value - radius - (radius?0:offset);
		x1 = Math.max(x0,x1);
		if(radius<unit*value)
			ctx.lineTo(x1,y0+offset);
		/*left rounding*/
		var y2 = y0 + radius;
		if (radius&&radius>0)
			ctx.arc(x1,y2,radius-offset,-Math.PI/2+angle_corr,0,false);
		/*start of right rounding*/
		var y3 = y0 + barWidth - radius - (radius?0:offset);
		var x3 = x1 + radius - (radius?offset:0);
		ctx.lineTo(x3,y3);
		/*right rounding*/
		if (radius&&radius>0)
			ctx.arc(x1,y3,radius-offset,0,Math.PI/2-angle_corr,false);
		/*bottom right point*/
		var y5 = y0 + barWidth-offset;
		ctx.lineTo(x0,y5);
		/*line to the start point*/
		if(!skipLeft){
			ctx.lineTo(x0,y0+offset);
		}
		//	ctx.lineTo(x0,0); //IE fix!
		return [x3,y5];
	},
	_drawHScales:function(ctx,data,point0,point1,start,end,cellWidth){
		var x = 0;
		if(this._settings.xAxis){
			if(!this.canvases["x"])
				this.canvases["x"] =  this._createCanvas("axis_x");
			x = this._drawHXAxis(this.canvases["x"].getCanvas(),data,point0,point1,start,end);
		}
		if (this._settings.yAxis){
			if(!this.canvases["y"])
				this.canvases["y"] =  this._createCanvas("axis_y");
			this._drawHYAxis(this.canvases["y"].getCanvas(),data,point0,point1,cellWidth,x);
		}
	},
	_drawHYAxis:function(ctx,data,point0,point1,cellWidth,yAxisX){
		if (!this._settings.yAxis) return;
		var unitPos;
		var x0 = parseInt((yAxisX?yAxisX:point0.x),10)-0.5;
		var y0 = point1.y+0.5;
		var y1 = point0.y;
		this._drawLine(ctx,x0,y0,x0,y1,this._settings.yAxis.color,1);



		for(var i=0; i < data.length;i ++){

			/*scale labels*/
			var right = ((this._settings.origin!="auto")&&(this._settings.type=="barH")&&(parseFloat(this._settings.value(data[i]))<this._settings.origin));
			unitPos = y1+cellWidth/2+i*cellWidth;
			this.canvases["y"].renderTextAt("middle",(right?false:"left"),(right?x0+5:x0-5),unitPos,
				this._settings.yAxis.template(data[i]),
				"webix_axis_item_y",(right?0:x0-10)
			);
			if(this._settings.yAxis.lines.call(this,data[i]))
				this._drawLine(ctx,point0.x,unitPos,point1.x,unitPos,this._settings.yAxis.lineColor.call(this,data[i]),1);
		}

		if(this._settings.yAxis.lines.call(this,{}))
			this._drawLine(ctx,point0.x+0.5,y1+0.5,point1.x,y1+0.5,this._settings.yAxis.lineColor.call(this,{}),1);
		this._setYAxisTitle(point0,point1);
	},
	_drawHXAxis:function(ctx,data,point0,point1,start,end){
		var step;
		var scaleParam= {};
		var axis = this._settings.xAxis;
		if (!axis) return;

		var y0 = point1.y+0.5;
		var x0 = point0.x-0.5;
		var x1 = point1.x-0.5;
		var yAxisStart = point0.x;
		this._drawLine(ctx,x0,y0,x1,y0,axis.color,1);

		if(axis.step)
			step = parseFloat(axis.step);

		if(typeof this._configXAxis.step =="undefined"||typeof this._configXAxis.start=="undefined"||typeof this._configXAxis.end =="undefined"){
			scaleParam = this._calculateScale(start,end);
			start = scaleParam.start;
			end = scaleParam.end;
			step = scaleParam.step;
			this._settings.xAxis.end = end;
			this._settings.xAxis.start = start;
			this._settings.xAxis.step = step;
		}

		if(step===0) return;
		var stepHeight = (x1-x0)*step/(end-start);
		var c = 0;
		for(var i = start; i<=end; i += step){
			var value = this._logScaleCalc?Math.pow(10,i):i;
			if(scaleParam.fixNum)  value = parseFloat(value).toFixed(scaleParam.fixNum);
			var xi = Math.floor(x0+c*stepHeight)+ 0.5;/*canvas line fix*/

			if(!(i==start&&this._settings.origin=="auto") && axis.lines.call(this,i))
				this._drawLine(ctx,xi,y0,xi,point0.y,this._settings.xAxis.lineColor.call(this,i),1);
			if(i == this._settings.origin) yAxisStart = xi+1;
			/*correction for JS float calculation*/
			if(step<1 && !this._logScaleCalc){
				var power = Math.min(Math.floor(this._log10(step)),(start<=0?0:Math.floor(this._log10(start))));
				var corr = Math.pow(10,-power);
				value = Math.round(value*corr)/corr;
				i = value;
			}
			this.canvases["x"].renderTextAt(false, true,xi,y0+2,axis.template(value.toString()),"webix_axis_item_x");
			c++;
		}
		this.canvases["x"].renderTextAt(true, false, x0,point1.y+this._settings.padding.bottom-3,
			this._settings.xAxis.title,
			"webix_axis_title_x",
			point1.x - point0.x
		);
		return yAxisStart;
	},
	_correctBarHParams:function(ctx,x,y,value,unit,barWidth,minValue){
		var yax = this._settings.yAxis;
		var axisStart = x;
		if(!!yax&&this._settings.origin!="auto" && (this._settings.origin>minValue)){
			x += (this._settings.origin-minValue)*unit;
			axisStart = x;
			value = value-(this._settings.origin-minValue);
			if(value < 0){
				value *= (-1);
				ctx.translate(x,y+barWidth);
				ctx.rotate(Math.PI);
				x = 0.5;
				y = 0;
			}
			x += 0.5;
		}

		return {value:value,x0:x,y0:y,start:axisStart};
	},
	_drawBarH:function(ctx,point1,x0,y0,barWidth,minValue,radius,unit,value,color,gradient,inner_gradient){
		ctx.save();
		var p = this._correctBarHParams(ctx,x0,y0,value,unit,barWidth,minValue);
		ctx.fillStyle = color;
		ctx.beginPath();
		var points = this._setBarHPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,(this._settings.border?1:0));
		if (gradient&&!inner_gradient) ctx.lineTo(point1.x,p.y0+(this._settings.border?1:0)); //fix gradient sphreading
		ctx.fill();
		ctx.restore();
		var y1 = p.y0;
		var y2 = (p.y0!=y0?y0:points[1]);
		var x1 = (p.y0!=y0?(p.start-points[0]):p.start);
		var x2 = (p.y0!=y0?p.start:points[0]);

		return [x1,y1,x2,y2];
	},
	_drawBarHBorder:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color){
		ctx.save();
		var p = this._correctBarHParams(ctx,x0,y0,value,unit,barWidth,minValue);

		ctx.beginPath();
		this._setBorderStyles(ctx,color);
		ctx.globalAlpha =0.9;
		this._setBarHPoints(ctx,p.x0,p.y0,barWidth,radius,unit,p.value,ctx.lineWidth/2,1);

		ctx.stroke();
		ctx.restore();
	},
	_drawBarHGradient:function(ctx,x0,y0,barWidth,minValue,radius,unit,value,color,inner_gradient){
		ctx.save();
		var p = this._correctBarHParams(ctx,x0,y0,value,unit,barWidth,minValue);
		var gradParam = this._setBarGradient(ctx,p.x0,p.y0+barWidth,p.x0+unit*p.value,p.y0,inner_gradient,color,"x");
		ctx.fillStyle = gradParam.gradient;
		ctx.beginPath();
		this._setBarHPoints(ctx,p.x0,p.y0+gradParam.offset,barWidth-gradParam.offset*2,radius,unit,p.value,gradParam.offset);
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.restore();
	}
};

export default BarHChart;