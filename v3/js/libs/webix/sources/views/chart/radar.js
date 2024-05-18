const Radar = {
	$render_radar:function(ctx,data,x,y,sIndex,map){
		this._renderRadarChart(ctx,data,x,y,sIndex,map);
	}, 
	/**
	*   renders a pie chart
	*   @param: ctx - canvas object
	*   @param: data - object those need to be displayed
	*   @param: x - the width of the container
	*   @param: y - the height of the container
	*   @param: ky - value from 0 to 1 that defines an angle of inclination (0<ky<1 - 3D chart)
	*/
	_renderRadarChart:function(ctx,data,point0,point1,sIndex,map){
		if(!data.length)
			return;
		var coord = this._getPieParameters(point0,point1);
		/*scale radius*/
		var radius = (this._settings.radius?this._settings.radius:coord.radius);
		/*scale center*/
		var x0 = (this._settings.x?this._settings.x:coord.x);
		var y0 = (this._settings.y?this._settings.y:coord.y);
		/*angles for each unit*/
		var ratioUnits = [];
		for(var i=0;i<data.length;i++)
			ratioUnits.push(1);
		var ratios = this._getRatios(ratioUnits,data.length);
		this._mapStart = point0;
		if(!sIndex)
			this._drawRadarAxises(ratios,x0,y0,radius,data);
		this._drawRadarData(ctx,ratios,x0,y0,radius,data,sIndex,map);
	},
	_drawRadarData:function(ctx,ratios,x,y,radius,data,sIndex,map){
		var alpha0 ,alpha1, config, i, min, max, pos0, pos1, posArr,
			r0, r1, relValue, startAlpha, value, value0, value1, valueFactor,
			unit, unitArr;
		config = this._settings;
		/*unit calculation (item_radius_pos = value*unit)*/
		min = config.yAxis.start;
		max = config.yAxis.end;
		unitArr = this._getRelativeValue(min,max);
		relValue = unitArr[0];
		unit = (relValue?radius/relValue:radius/2);
		valueFactor = unitArr[1];

		startAlpha = -Math.PI/2;
		alpha0 =  alpha1 = startAlpha;
		posArr = [];
		pos1 = 0;
		for(i=0;i<data.length;i++){
			if(!value1){
				value = config.value(data[i]);
				if(this._logScaleCalc)
					value = this._log10(value);
				/*a relative value*/
				value0 = (parseFloat(value||0) - min)*valueFactor;
			}
			else
				value0 = value1;
			r0 = Math.floor(unit*value0);

			value = config.value((i!=(data.length-1))?data[i+1]:data[0]);
			if(this._logScaleCalc)
				value = this._log10(value);

			value1 = (parseFloat(value||0) - min)*valueFactor;
			r1 = Math.floor(unit*value1);
			alpha0 = alpha1;
			alpha1 = ((i!=(data.length-1))?(startAlpha+ratios[i]-0.0001):startAlpha);
			pos0 = (pos1||this._getPositionByAngle(alpha0,x,y,r0));
			pos1 = this._getPositionByAngle(alpha1,x,y,r1);
			/*creates map area*/
			/*areaWidth  = (config.eventRadius||(parseInt(config.item.radius.call(this,data[i]),10)+config.item.borderWidth));
			 map.addRect(data[i].id,[pos0.x-areaWidth,pos0.y-areaWidth,pos0.x+areaWidth,pos0.y+areaWidth],sIndex);*/
			//this._drawLine(ctx,pos0.x,pos0.y,pos1.x,pos1.y,config.line.color.call(this,data[i]),config.line.width)
			posArr.push(pos0);
		}
		if(config.fill)
			this._fillRadarChart(ctx,posArr,data);
		if(!config.disableLines && data.length>2)
			this._strokeRadarChart(ctx,posArr,data);
		if(!config.disableItems || data.length<3)
			this._drawRadarItemMarkers(ctx,posArr,data,sIndex,map);
		posArr = null;
	},
	_drawRadarItemMarkers:function(ctx,points,data,sIndex,map){
		for(var i=0;i < points.length;i++){
			this._drawItem(ctx,points[i].x,points[i].y,data[i],this._settings.label.call(this,data),sIndex,map);
		}
	},
	_fillRadarChart:function(ctx,points,data){
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
	_strokeRadarChart:function(ctx,points,data){
		var pos0,pos1;
		for(var i=0;i < points.length;i++){
			pos0 = points[i];
			pos1 = (points[i+1]|| points[0]);
			this._drawLine(ctx,pos0.x,pos0.y,pos1.x,pos1.y,this._settings.line.color.call(this,data[i]),this._settings.line.width);
		}
	},
	_drawRadarAxises:function(ratios,x,y,radius,data){
		var configY = this._settings.yAxis;
		var configX = this._settings.xAxis;
		var start = configY.start;
		var end = configY.end;
		var step = configY.step;
		var scaleParam= {};
		var config = this._configYAxis;
		if(typeof config.step =="undefined"||typeof config.start=="undefined"||typeof config.end =="undefined"){
			var limits = this._getLimits();
			scaleParam = this._calculateScale(limits.min,limits.max);
			start = scaleParam.start;
			end = scaleParam.end;
			step = scaleParam.step;
			configY.end = end;
			configY.start = start;
		}
		var units = [];
		var i,j,p;
		var c=0;
		var stepHeight = radius*step/(end-start);
		/*correction for small step*/
		var power,corr;
		if(step<1){
			power = Math.min(this._log10(step),(start<=0?0:this._log10(start)));
			corr = Math.pow(10,-power);
		}
		var angles = [];
		if(!this.canvases["scale"])
			this.canvases["scale"] =  this._createCanvas("radar_scale");
		var ctx = this.canvases["scale"].getCanvas();
		for(i = end; i>=start; i -=step){
			var value = this._logScaleCalc?Math.pow(10,i):i;
			if(scaleParam.fixNum)  value = parseFloat(i).toFixed(scaleParam.fixNum);

			units.push(Math.floor(c*stepHeight)+ 0.5);
			if(corr && !this._logScaleCalc){
				value = Math.round(value*corr)/corr;
				i = value;
			}
			var unitY = y-radius+units[units.length-1];

			this.canvases["scale"].renderTextAt("middle","left",x,unitY,
				configY.template(value.toString()),
				"webix_axis_item_y webix_radar"
			);

			var startAlpha = -Math.PI/2;/*possibly need  to moved in config*/
			var alpha0 = startAlpha;
			var alpha1;

			for(j=0;j< ratios.length;j++){
				if(!c)
					angles.push(alpha0);
				alpha1 = startAlpha+ratios[j]-0.0001;
				this._drawScaleSector(ctx,(ratios.length>2?(config.lineShape||"line"):"arc"),x,y,radius-units[units.length-1],alpha0,alpha1,i,j,data[i]);
				alpha0 = alpha1;
			}
			c++;
		}
		/*renders radius lines and labels*/
		for(i=0;i< angles.length;i++){
			p = this._getPositionByAngle(angles[i],x,y,radius);
			if(configX){
				if(configX.lines.call(this,data[i],i))
					this._drawLine(ctx,x,y,p.x,p.y,configX.lineColor.call(this,data[i]),1);
				this._drawRadarScaleLabel(ctx,x,y,radius,angles[i],configX.template.call(this,data[i]));
			}
		}

	},
	_drawScaleSector:function(ctx,shape,x,y,radius,a1,a2,i,j){
		var pos1, pos2;
		if(radius<0)
			return false;
		pos1 = this._getPositionByAngle(a1,x,y,radius);
		pos2 = this._getPositionByAngle(a2,x,y,radius);
		var configY = this._settings.yAxis;
		if(configY.bg){
			ctx.beginPath();
			ctx.moveTo(x,y);
			if(shape=="arc")
				ctx.arc(x,y,radius,a1,a2,false);
			else{
				ctx.lineTo(pos1.x,pos1.y);
				ctx.lineTo(pos2.x,pos2.y);
			}
			ctx.fillStyle =  configY.bg(i,j);
			ctx.moveTo(x,y);
			ctx.fill();
			ctx.closePath();
		}
		if(configY.lines.call(this,i)){
			ctx.lineWidth = 1;
			ctx.beginPath();
			if(shape=="arc")
				ctx.arc(x,y,radius,a1,a2,false);
			else{
				ctx.moveTo(pos1.x,pos1.y);
				ctx.lineTo(pos2.x,pos2.y);
			}
			ctx.strokeStyle = configY.lineColor.call(this,i);
			ctx.stroke();
		}
	},
	_drawRadarScaleLabel:function(ctx,x,y,r,a,text){
		if(!text)
			return false;
		var t = this.canvases["scale"].renderText(0,0,text,"webix_axis_radar_title",1);
		var width = t.scrollWidth;
		var height = t.offsetHeight;
		var delta = 0.001;
		var pos =  this._getPositionByAngle(a,x,y,r+5);
		var corr_x=0,corr_y=0;
		if(a<0||a>Math.PI){
			corr_y = -height;
		}
		if(a>Math.PI/2){
			corr_x = -width;
		}
		if(Math.abs(a+Math.PI/2)<delta||Math.abs(a-Math.PI/2)<delta){
			corr_x = -width/2;
		}
		else if(Math.abs(a)<delta||Math.abs(a-Math.PI)<delta){
			corr_y = -height/2;
		}
		t.style.top  = pos.y+corr_y+"px";
		t.style.left = pos.x+corr_x+"px";
		t.style.width = width+"px";
		t.style.whiteSpace = "nowrap";
	}
};

export default Radar;