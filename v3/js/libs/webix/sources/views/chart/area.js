

const AreaChart = {
	/**
	*   renders an area chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_area:function(ctx, data, point0, point1, sIndex, map){

		var align, config, i, mapRect, obj, params, path,
			res1, res2, x0, x1, y1, x2, y2, y0;

		params = this._calculateLineParams(ctx,data,point0,point1,sIndex);
		config = this._settings;

		//the size of map area
		mapRect = (config.eventRadius||Math.floor(params.cellWidth/2));

		if (data.length) {

			// area points
			path = [];

			//the x position of the first item
			x0 = (!config.offset?point0.x:point0.x+params.cellWidth*0.5);

			/*
			 iterates over all data items:
			 calculates [x,y] for area path, adds rect to chart map and renders labels
			 */
			for(i=0; i < data.length;i ++){
				obj = data[i];

				res2 = this._getPointY(obj,point0,point1,params);
				x2 = x0 + params.cellWidth*i ;
				if(res2){
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
							path.push([this._calcOverflowX(x1,x2,y1,y2,y0),y0]);
						}
						if(res2.out){
							y0 = (res2.out == "min"?point1.y:point0.y);
							path.push([this._calcOverflowX(x1,x2,y1,y2,y0),y0]);
							if(i == (data.length-1) && y0 == point0.y)
								path.push([x2,point0.y]);
						}
					}
					if(!res2.out){
						path.push([x2,y2]);
						//map
						map.addRect(obj.id,[x2-mapRect-point0.x,y2-mapRect-point0.y,x2+mapRect-point0.x,y2+mapRect-point0.y],sIndex);
					}

					//labels
					if(!config.yAxis){
						align = (!config.offset&&(i == data.length-1)?"left":"center");
						this.canvases[sIndex].renderTextAt(false, align, x2, y2-config.labelOffset,config.label(obj));
					}
				}

			}
			if(path.length){
				path.push([x2,point1.y]);
				path.push([path[0][0],point1.y]);
			}



			//filling area
			ctx.globalAlpha = this._settings.alpha.call(this,data[0]);
			ctx.fillStyle = this._settings.color.call(this,data[0]);
			ctx.beginPath();
			this._path(ctx,path);
			ctx.fill();

			ctx.lineWidth = 1;
			ctx.globalAlpha =1;

			//border
			if(config.border){
				ctx.lineWidth = config.borderWidth||1;
				if(config.borderColor)
					ctx.strokeStyle =  config.borderColor.call(this,data[0]);
				else
					this._setBorderStyles(ctx,ctx.fillStyle);

				ctx.beginPath();
				this._path(ctx,path);
				ctx.stroke();

			}


		}
	},
	
	/**
	*   renders an area chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_stackedArea:function(ctx, data, point0, point1, sIndex, map){

		var a0, a1, align, config, i, j, lastItem, mapRect, obj, params, path, x, y, yPos;

		params = this._calculateLineParams(ctx,data,point0,point1,sIndex);

		config = this._settings;

		/*the value that defines the map area position*/
		mapRect = (config.eventRadius||Math.floor(params.cellWidth/2));


		/*drawing all items*/
		if (data.length) {

			// area points
			path = [];

			// y item positions
			yPos = [];

			//the x position of the first item
			x = (!config.offset?point0.x:point0.x+params.cellWidth*0.5);


			var setOffset = function(i,y){
				return sIndex?(data[i].$startY?y-point1.y+data[i].$startY:0):y;
			};

			var solveEquation  = function(x,p0,p1){
				var k = (p1.y - p0.y)/(p1.x - p0.x);
				return  k*x + p0.y - k*p0.x;
			};

			/*
			 iterates over all data items:
			 calculates [x,y] for area path, adds rect to chart map and renders labels
			 */

			for(i=0; i < data.length;i ++){
				obj = data[i];

				if(!i){
					y =  setOffset(i,point1.y);
					path.push([x,y]);
				}
				else{
					x += params.cellWidth ;
				}

				y = setOffset(i,this._getPointY(obj,point0,point1,params));

				yPos.push((isNaN(y)&&!i)?(data[i].$startY||point1.y):y);

				if(y){
					path.push([x,y]);

					//map
					map.addRect(obj.id,[x-mapRect-point0.x,y-mapRect-point0.y,x+mapRect-point0.x,y+mapRect-point0.y],sIndex);

					//labels
					if(!config.yAxis){
						align = (!config.offset&&lastItem?"left":"center");
						this.canvases[sIndex].renderTextAt(false, align, x, y-config.labelOffset,config.label(obj));
					}
				}
			}

			// bottom right point
			path.push([x,setOffset(i-1,point1.y)]);

			// lower border from the end to start
			if(sIndex){
				for(i=data.length-2; i > 0; i --){
					x -= params.cellWidth ;
					y =  data[i].$startY;
					if(y)
						path.push([x,y]);
				}
			}

			// go to start point
			path.push([path[0][0],path[0][1]]);

			// filling path
			ctx.globalAlpha = this._settings.alpha.call(this,data[0]);
			ctx.fillStyle = this._settings.color.call(this,data[0]);
			ctx.beginPath();
			this._path(ctx,path);
			ctx.fill();

			// set y positions of the next series
			for(i=0; i < data.length;i ++){
				y =  yPos[i];

				if(!y){
					if(i == data.length-1){
						y = data[i].$startY;
					}
					for(j =i+1; j< data.length; j++){
						if(yPos[j]){
							a0 =  {x:point0.x,y:yPos[0]};
							a1 =  {x:(point0.x+params.cellWidth*j),y:yPos[j]};
							y = solveEquation(point0.x+params.cellWidth*i,a0,a1);
							break;
						}

					}
				}

				data[i].$startY = y;
			}


		}
	}
};

export default AreaChart;