

const SplineArea = {
	/**
	 *   renders an splineArea chart
	 *   @param: ctx - canvas object
	 *   @param: data - object those need to be displayed
	 *   @param: width - the width of the container
	 *   @param: height - the height of the container
	 *   @param: sIndex - index of drawing chart
	 */
	$render_splineArea:function(ctx, data, point0, point1, sIndex, map){
		var color, i,items,j,mapRect,params,sParams,
			x,x0,x1,x2,y,y2,
			config = this._settings,
			path = [];

		params = this._calculateLineParams(ctx,data,point0,point1,sIndex);
		mapRect = (config.eventRadius||Math.floor(params.cellWidth/2));
		/*array of all points*/
		items = [];

		if (data.length) {
			/*getting all points*/
			x0 = point0.x;
			for(i=0; i < data.length;i ++){
				y = this._getPointY(data[i],point0,point1,params);
				if(y || y=="0"){
					x = ((!i)?x0:params.cellWidth*i - 0.5 + x0);
					items.push({x:x,y:y,index:i});
					map.addRect(data[i].id,[x-mapRect-point0.x,y-mapRect-point0.y,x+mapRect-point0.x,y+mapRect-point0.y],sIndex);
				}
			}
			
			sParams = this._getSplineParameters(items);

			for(i =0; i< items.length; i++){
				x1 = items[i].x;
				if(i<items.length-1){
					x2 = items[i+1].x;
					y2 = items[i+1].y;
					for(j = x1; j < x2; j++){
						var sY1 = this._getSplineYPoint(j,x1,i,sParams.a,sParams.b,sParams.c,sParams.d);
						if(sY1<point0.y)
							sY1=point0.y;
						if(sY1>point1.y)
							sY1=point1.y;
						var sY2 = this._getSplineYPoint(j+1,x1,i,sParams.a,sParams.b,sParams.c,sParams.d);
						if(sY2<point0.y)
							sY2=point0.y;
						if(sY2>point1.y)
							sY2=point1.y;
						path.push([j,sY1]);
						path.push([j+1,sY2]);
					}
					path.push([x2,y2]);
				}
			}

			color = this._settings.color.call(this,data[0]);

			if(path.length){
				path.push([x2,point1.y]);
				path.push([path[0][0],point1.y]);
			}

			//filling area
			ctx.globalAlpha = this._settings.alpha.call(this,data[0]);
			ctx.fillStyle = color;
			ctx.beginPath();
			this._path(ctx,path);
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.globalAlpha =1;

			// draw line
			if(config.border){
				ctx.lineWidth = config.borderWidth||1;
				if(config.borderColor)
					ctx.strokeStyle =  config.borderColor.call(this,data[0]);
				else
					this._setBorderStyles(ctx,color);
				ctx.beginPath();
				path.splice(path.length-3);
				this._path(ctx,path);
				ctx.stroke();
			}
		}
	}
};

export default SplineArea;