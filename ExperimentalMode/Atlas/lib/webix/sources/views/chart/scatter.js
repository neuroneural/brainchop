const Scatter = {

	/**
	*   renders a graphic
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: point0  - top left point of a chart
	*   @param: point1  - right bottom point of a chart
	*   @param: sIndex - index of drawing chart
    *   @param: map - map object
	*/
	$render_scatter:function(ctx, data, point0, point1, sIndex, map){
		if(!this._settings.xValue)
			return;
		var config = this._settings;
		var lines = !(config.disableLines || typeof config.disableLines == "undefined");

		/*max in min values*/
		var limitsY = this._getLimits();
		var limitsX = this._getLimits("h","xValue");
		/*render scale*/
		if(!sIndex){
			if(!this.canvases["x"])
				this.canvases["x"] = this._createCanvas("axis_x");
			if(!this.canvases["y"])
				this.canvases["y"] = this._createCanvas("axis_y");
			this._drawYAxis(this.canvases["y"].getCanvas(),data,point0,point1,limitsY.min,limitsY.max);
			this._drawHXAxis(this.canvases["x"].getCanvas(),data,point0,point1,limitsX.min,limitsX.max);
		}
		limitsY = {min:config.yAxis.start,max:config.yAxis.end};
		limitsX = {min:config.xAxis.start,max:config.xAxis.end};
		var params = this._getScatterParams(ctx,data,point0,point1,limitsX,limitsY);
		
		this._mapStart = point0;

		var items = [];
		for(let i=0;i<data.length;i++){
			var x = this._calculateScatterItemPosition(params, point1, point0, limitsX, data[i], "X");
			var y = this._calculateScatterItemPosition(params, point0, point1, limitsY, data[i], "Y");
			if(isNaN(x) || isNaN(y))
				continue;
			items.push({ x:x, y:y, index:i });
		}
		var x1, y1, x2, y2, di;
		for(let i=0; i<items.length; i++){
			di = items[i].index;

			if (lines){
				var color = config.line.color.call(this,data[di]);
				//line start position
				x1 = items[i].x;
				y1 = items[i].y;

				if(i == items.length-1){
					//connecting last and first items
					if (config.shape && items.length>2){
						this._drawLine(ctx,x2,y2,items[0].x,items[0].y,color,config.line.width);
						//render shape on top of the line
						if(!config.disableItems)
							this._drawScatterItem(ctx,map, items[0],data[0],sIndex);
						if(config.fill)
							this._fillScatterChart(ctx, items, data);
					}
				} else {
					// line between two points
					x2 = items[i+1].x;
					y2 = items[i+1].y;
					this._drawLine(ctx,x1,y1,x2,y2,color,config.line.width);
				}
			}

			//item
			if(!config.disableItems && items[i]){
				this._drawScatterItem(ctx,map, items[i],data[di],sIndex);
			}
		}
	},
	_fillScatterChart:function(ctx,points,data){
		var pos0,pos1;
		ctx.globalAlpha= this._settings.alpha.call(this,{});

		ctx.beginPath();
		for(var i=0;i < points.length;i++){
			ctx.fillStyle = this._settings.fill.call(this,data[i]);
			pos0 = points[i];
			pos1 = (points[i+1]|| points[0]);
			if(!i){
				ctx.moveTo(pos0.x,pos0.y);
			}
			ctx.lineTo(pos1.x,pos1.y);
		}
		ctx.fill();
		ctx.globalAlpha=1;
	},
	_getScatterParams:function(ctx, data, point0, point1,limitsX,limitsY){
		var params = {};
		/*available space*/
		params.totalHeight = point1.y-point0.y;
		/*available width*/
		params.totalWidth = point1.x-point0.x;
		/*unit calculation (y_position = value*unit)*/
		this._calcScatterUnit(params,limitsX.min,limitsX.max,params.totalWidth,"X");
		this._calcScatterUnit(params,limitsY.min,limitsY.max,params.totalHeight,"Y");
		return params;
	},
	_drawScatterItem:function(ctx,map,item,obj,sIndex){
		this._drawItem(ctx,item.x,item.y,obj,this._settings.label.call(this,obj),sIndex,map);
	},
	_calculateScatterItemPosition:function(params, point0, point1, limits, obj, axis){
		/*the real value of an object*/
		var value = this._settings[axis=="X"?"xValue":"value"].call(this,obj);
		/*a relative value*/
		var valueFactor = params["valueFactor"+axis];
		var v = (parseFloat(value||0) - limits.min)*valueFactor;
		/*a vertical coordinate*/
		var unit = params["unit"+axis];
		var pos = point1[axis.toLowerCase()] - (axis=="X"?(-1):1)*Math.floor(unit*v);
		/*the limit of the minimum value is  the minimum visible value*/
		if(v<0)
			pos = point1[axis.toLowerCase()];
		/*the limit of the maximum value*/
		if(value > limits.max)
			pos = point0[axis.toLowerCase()];
		/*the limit of the minimum value*/
		if(value < limits.min)
			pos = point1[axis.toLowerCase()];
		return pos;
	},
	_calcScatterUnit:function(p,min,max,size,axis){
		var relativeValues = this._getRelativeValue(min,max);
		axis = (axis||"");
		p["relValue"+axis] = relativeValues[0];
		p["valueFactor"+axis] = relativeValues[1];
		p["unit"+axis] = (p["relValue"+axis]?size/p["relValue"+axis]:10);
	}
};

export default Scatter;