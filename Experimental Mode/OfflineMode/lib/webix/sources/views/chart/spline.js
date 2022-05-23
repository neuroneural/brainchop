

const Spline = {
	/**
	*   renders a spline chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: width - the width of the container
	*   @param: height - the height of the container
	*   @param: sIndex - index of drawing chart
	*/
	$render_spline:function(ctx, data, point0, point1, sIndex, map){
		var config,i,items,j,params,sparam,x,x0,x1,x2,y,y1,y2;
		params = this._calculateLineParams(ctx,data,point0,point1,sIndex);
		config = this._settings;
		this._mapStart = point0;

		/*array of all points*/
		items = [];

		/*drawing all items*/
		if (data.length) {

			/*getting all points*/
			x0 = (config.offset?point0.x+params.cellWidth*0.5:point0.x);
			for(i=0; i < data.length;i ++){
				y = this._getPointY(data[i],point0,point1,params);
				if(y || y=="0"){
					x = ((!i)?x0:params.cellWidth*i - 0.5 + x0);
					items.push({x:x,y:y,v:this._settings.value(data[i]),index:i});
				}
			}
			sparam = this._getSplineParameters(items);

			for(i =0; i< items.length; i++){
				x1 = items[i].x;
				y1 = items[i].y;
				if(i<items.length-1){
					x2 = items[i+1].x;
					y2 = items[i+1].y;
					for(j = x1; j < x2; j++){
						var sY1 = this._getSplineYPoint(j,x1,i,sparam.a,sparam.b,sparam.c,sparam.d);
						if(sY1<point0.y)
							sY1=point0.y;
						if(sY1>point1.y)
							sY1=point1.y;
						var sY2 = this._getSplineYPoint(j+1,x1,i,sparam.a,sparam.b,sparam.c,sparam.d);
						if(sY2<point0.y)
							sY2=point0.y;
						if(sY2>point1.y)
							sY2=point1.y;
						this._drawLine(ctx,j,sY1,j+1,sY2,config.line.color(data[i]),config.line.width);

					}
					this._drawLine(ctx,x2-1,this._getSplineYPoint(j,x1,i,sparam.a,sparam.b,sparam.c,sparam.d),x2,y2,config.line.color(data[i]),config.line.width);
				}
				this._drawItem(ctx,x1,y1,data[items[i].index],config.label(data[items[i].index]), sIndex, map);
			}
		}
	},
	/*gets spline parameter*/
	_getSplineParameters:function(points){
		var a ,b, c, d, i, s, u, v,
			h = [],
			m = [],
			n = points.length;

		for(i =0; i<n-1;i++){
			h[i] = points[i+1].x - points[i].x;
			m[i] = (points[i+1].y - points[i].y)/h[i];
		}
		u = [];	v = [];
		u[0] = 0;
		u[1] = 2*(h[0] + h[1]);
		v[0] = 0;
		v[1] = 6*(m[1] - m[0]);
		for(i =2; i < n-1; i++){
			u[i] = 2*(h[i-1]+h[i]) - h[i-1]*h[i-1]/u[i-1];
			v[i] = 6*(m[i]-m[i-1]) - h[i-1]*v[i-1]/u[i-1];
		}

		s = [];
		s[n-1] = s[0] = 0;
		for(i = n -2; i>=1; i--)
			s[i] = (v[i] - h[i]*s[i+1])/u[i];

		a = []; b = []; c = [];	d = [];

		for(i =0; i<n-1;i++){
			a[i] = points[i].y;
			b[i] = - h[i]*s[i+1]/6 - h[i]*s[i]/3 + (points[i+1].y-points[i].y)/h[i];
			c[i] = s[i]/2;
			d[i] = (s[i+1] - s[i])/(6*h[i]);
		}

		for (i=0; i<points.length-1; i++){
			if (points[i].v === 0 && points[i+1].v === 0){
				a[i] = points[i].y;
				d[i] = c[i] = b[i] = 0;
			}
		}
		
		return {a:a,b:b,c:c,d:d};
	},
	/*returns the y position of the spline point */
	_getSplineYPoint:function(x,xi,i,a,b,c,d){
		return a[i] + (x - xi)*(b[i] + (x-xi)*(c[i]+(x-xi)*d[i]));
	}
};

export default Spline;