

const LineChart = {
	/**
	*   renders a graphic
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_line:function(ctx, data, point0, point1, sIndex, map){
		var config,i,items,params,x0,x1,x2,y1,y2,y0,res1,res2;
		params = this._calculateLineParams(ctx,data,point0,point1,sIndex);
		config = this._settings;

		if (data.length) {
			x0 = (config.offset?point0.x+params.cellWidth*0.5:point0.x);
			//finds items with data (excludes scale units)
			items= [];
			for(i=0; i < data.length;i++){
				res2 = this._getPointY(data[i],point0,point1,params);
				if(res2 || res2=="0"){
					x2 = ((!i)?x0:params.cellWidth*i - 0.5 + x0);
					y2 = (typeof res2 == "object"?res2.y0:res2);
					if(i && this._settings.fixOverflow){
						res1 = this._getPointY(data[i-1],point0,point1,params);
						if(res1.out && res1.out == res2.out){
							continue;
						}
						x1 = params.cellWidth*(i-1) - 0.5 + x0;
						y1 = (typeof res1 == "object"?res1.y0:res1);

						if(res1.out){
							y0 = (res1.out == "min"?point1.y:point0.y);
							items.push({x:this._calcOverflowX(x1,x2,y1,y2,y0),y:y0});
						}
						if(res2.out){
							y0 = (res2.out == "min"?point1.y:point0.y);
							items.push({x:this._calcOverflowX(x1,x2,y1,y2,y0),y:y0});
						}

					}

					if(!res2.out)
						items.push({x:x2, y: res2, index: i});
				}
			}
			this._mapStart = point0;
			for(i = 1; i <= items.length; i++){
				//line start position
				x1 = items[i-1].x;
				y1 = items[i-1].y;
				if(i<items.length){
					//line end position
					x2 = items[i].x;
					y2 = items[i].y;
					//line
					this._drawLine(ctx,x1,y1,x2,y2,config.line.color.call(this,data[i-1]),config.line.width);
					//line shadow
					if(config.line&&config.line.shadow){
						ctx.globalAlpha = 0.3;
						this._drawLine(ctx,x1+2,y1+config.line.width+8,x2+2,y2+config.line.width+8,"#eeeeee",config.line.width+3);
						ctx.globalAlpha = 1;
					}
				}
				//item
				if(typeof items[i-1].index != "undefined"){
					this._drawItem(ctx,x1,y1,data[items[i-1].index],config.label(data[items[i-1].index]), sIndex, map, point0);

				}
			}

		}
	},
	_calcOverflowX: function(x1,x2,y1,y2,y){
		return  x1 + ( y - y1 )*( x2 - x1 )/( y2 - y1 );
	},
	/**
	*   draws an item and its label
	*   @param: ctx - canvas object
	*   @param: x0 - the x position of a circle
	*   @param: y0 - the y position of a circle
	*   @param: obj - data object
	*   @param: label - (boolean) defines wherether label needs being drawn
	*/
	_drawItem:function(ctx,x0,y0,obj,label,sIndex,map){
		var config = this._settings.item;

		var R = parseInt(config.radius.call(this,obj),10)||0;
		var mapStart = this._mapStart;
		var item = config.type.call(this, obj);
		if(R){
			ctx.save();
			if(config.shadow){
				ctx.lineWidth = 1;
				ctx.strokeStyle = "#bdbdbd";
				ctx.fillStyle = "#bdbdbd";
				var alphas = [0.1,0.2,0.3];
				for(var i=(alphas.length-1);i>=0;i--){
					ctx.globalAlpha = alphas[i];
					ctx.strokeStyle = "#d0d0d0";
					ctx.beginPath();
					this._strokeChartItem(ctx,x0,y0+2*R/3,R+i+1,item);
					ctx.stroke();
				}
				ctx.beginPath();
				ctx.globalAlpha = 0.3;
				ctx.fillStyle = "#bdbdbd";
				this._strokeChartItem(ctx,x0,y0+2*R/3,R+1,item);
				ctx.fill();
			}
			ctx.restore();
			ctx.lineWidth = config.borderWidth;
			ctx.fillStyle = config.color.call(this,obj);
			ctx.strokeStyle = config.borderColor.call(this,obj);
			ctx.globalAlpha = config.alpha.call(this,obj);
			ctx.beginPath();
			this._strokeChartItem(ctx,x0,y0,R+1,item);
			ctx.fill();
			ctx.stroke();
			ctx.globalAlpha = 1;
		}
		/*item label*/
		if(label){
			this.canvases[sIndex].renderTextAt(false, true, x0,y0-R-this._settings.labelOffset,this._settings.label.call(this,obj));
		}
		if(map){
			var areaPos = (this._settings.eventRadius||R+1);
			//this._addMapRect(map,obj.id,[{x:x0-areaPos,y:y0-areaPos},{x0+areaPos,y:y0+areaPos}],point0,sIndex);
			map.addRect(obj.id,[x0-areaPos-mapStart.x,y0-areaPos-mapStart.y,x0+areaPos-mapStart.x,y0+areaPos-mapStart.y],sIndex);
		}

	},
	_strokeChartItem:function(ctx,x0,y0,R,type){
		var p=[];
		if(type && (type=="square" || type=="s")){
			R *= Math.sqrt(2)/2;
			p = [
				[x0-R-ctx.lineWidth/2,y0-R],
				[x0+R,y0-R],
				[x0+R,y0+R],
				[x0-R,y0+R],
				[x0-R,y0-R]
			];
		}
		else if(type && (type=="diamond" || type=="d")){
			var corr = (ctx.lineWidth>1?ctx.lineWidth*Math.sqrt(2)/4:0);
			p = [
				[x0,y0-R],
				[x0+R,y0],
				[x0,y0+R],
				[x0-R,y0],
				[x0+corr,y0-R-corr]
			];
		}
		else if(type && (type=="triangle" || type=="t")){
			p = [
				[x0,y0-R],
				[x0+Math.sqrt(3)*R/2,y0+R/2],
				[x0-Math.sqrt(3)*R/2,y0+R/2],
				[x0,y0-R]
			];
		}
		else
			p = [
				[x0,y0,R,0,Math.PI*2,true]
			];
		this._path(ctx,p);
	},
	/**
	*   gets the vertical position of the item
	*   @param: data - data object
	*   @param: y0 - the y position of chart start
	*   @param: y1 - the y position of chart end
	*   @param: params - the object with elements: minValue, maxValue, unit, valueFactor (the value multiple of 10)
	*/
	_getPointY: function(data,point0,point1,params){
		var minValue = params.minValue;
		var maxValue = params.maxValue;
		var unit = params.unit;
		var valueFactor = params.valueFactor;
		/*the real value of an object*/
		var value = this._settings.value(data);
		if(this._logScaleCalc){
			value = this._log10(value);
		}
		/*a relative value*/
		var v = (parseFloat(value||0) - minValue)*valueFactor;
		if(!this._settings.yAxis)
			v += params.startValue/unit;
		/*a vertical coordinate*/
		var y = point1.y - unit*v;
		/*the limit of the max and min values*/
		if(this._settings.fixOverflow && ( this._settings.type == "line" || this._settings.type == "area")){
			if(value > maxValue)
				y = {y: point0.y, y0:  y, out: "max"};
			else if(v<0 || value < minValue)
				y = {y: point1.y, y0:  y, out: "min"};
		}
		else{
			if(value > maxValue)
				y =  point0.y;
			if(v<0 || value < minValue)
				y =  point1.y;
		}
		return y;
	},
	_calculateLineParams: function(ctx,data,point0,point1,sIndex){
		var params = {};

		/*maxValue - minValue*/
		var relValue;

		/*available height*/
		params.totalHeight = point1.y-point0.y;

		/*a space available for a single item*/
		//params.cellWidth = Math.round((point1.x-point0.x)/((!this._settings.offset&&this._settings.yAxis)?(data.length-1):data.length));
		if(this._settings.cellWidth)
			params.cellWidth = Math.min(point1.x-point0.x, this._settings.cellWidth);
		else
			params.cellWidth = (point1.x-point0.x)/((!this._settings.offset)?(data.length-1):data.length);
		/*scales*/
		var yax = !!this._settings.yAxis;

		var limits = (this._settings.type.indexOf("stacked")!=-1?this._getStackedLimits(data):this._getLimits());
		params.maxValue = limits.max;
		params.minValue = limits.min;

		/*draws x and y scales*/
		if(!sIndex)
			this._drawScales(data, point0, point1,params.minValue,params.maxValue,params.cellWidth);

		/*necessary for automatic scale*/
		if(yax){
			params.maxValue = parseFloat(this._settings.yAxis.end);
			params.minValue = parseFloat(this._settings.yAxis.start);
		}

		/*unit calculation (y_position = value*unit)*/
		var relativeValues = this._getRelativeValue(params.minValue,params.maxValue);
		relValue = relativeValues[0];
		params.valueFactor = relativeValues[1];
		params.unit = (relValue?params.totalHeight/relValue:10);

		params.startValue = 0;
		if(!yax){
			/*defines start value for better representation of small values*/
			params.startValue = 10;
			if(params.unit!=params.totalHeight)
				params.unit = (relValue?(params.totalHeight - params.startValue)/relValue:10);
		}
		return params;
	}
};

export default LineChart;