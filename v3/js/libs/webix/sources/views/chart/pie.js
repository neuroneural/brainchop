import {$active} from "../../webix/skin";

const Pie = {
	$render_pie:function(ctx,data,x,y,sIndex,map){
		this._renderPie(ctx,data,x,y,1,map,sIndex);
	},
	/**
	 *   renders a pie chart
	 *   @param: ctx - canvas object
	 *   @param: data - object those need to be displayed
	 *   @param: x - the width of the container
	 *   @param: y - the height of the container
	 *   @param: ky - value from 0 to 1 that defines an angle of inclination (0<ky<1 - 3D chart)
	 */
	_renderPie:function(ctx,data,point0,point1,ky,map,sIndex){
		if(!data.length)
			return;
		var coord = this._getPieParameters(point0,point1);
		/*pie radius*/
		var radius = (this._settings.radius?this._settings.radius:coord.radius);
		if(radius<0)
			return;

		/*real values*/
		var values = this._getValues(data);

		var totalValue = this._getTotalValue(values);

		/*weighed values (the ratio of object value to total value)*/
		var ratios = this._getRatios(values,totalValue);

		/*pie center*/
		var x0 = (this._settings.x?this._settings.x:coord.x);
		var y0 = (this._settings.y?this._settings.y:coord.y);
		/*adds shadow to the 2D pie*/
		if(ky==1&&this._settings.shadow)
			this._addShadow(ctx,x0,y0,radius);

		/*changes vertical position of the center according to 3Dpie cant*/
		y0 = y0/ky;
		/*the angle defines the 1st edge of the sector*/
		var alpha0 = -Math.PI/2;
		var angles = [];
		/*changes Canvas vertical scale*/
		ctx.scale(1,ky);
		/*adds radial gradient to a pie*/
		if (this._settings.gradient){
			var x1 = (ky!=1?x0+radius/3:x0);
			var y1 = (ky!=1?y0+radius/3:y0);
			this._showRadialGradient(ctx,x0,y0,radius,x1,y1);
		}
		for(var i = 0; i < data.length;i++){
			if (!values[i]) continue;
			/*drawing sector*/
			//ctx.lineWidth = 2;
			ctx.strokeStyle = this._settings.lineColor.call(this,data[i]);
			ctx.beginPath();
			ctx.moveTo(x0,y0);
			angles.push(alpha0);
			/*the angle defines the 2nd edge of the sector*/
			var alpha1 = -Math.PI/2+ratios[i]-0.0001;
			ctx.arc(x0,y0,radius,alpha0,alpha1,false);
			ctx.lineTo(x0,y0);

			var color = this._settings.color.call(this,data[i]);
			ctx.fillStyle = color;
			ctx.fill();

			/*text that needs being displayed inside the sector*/
			if(this._settings.pieInnerText)
				this._drawSectorLabel(x0,y0,5*radius/6,alpha0,alpha1,ky,this._settings.pieInnerText(data[i],totalValue),true);
			/*label outside the sector*/
			if(this._settings.label)
				this._drawSectorLabel(x0,y0,radius+this._settings.labelOffset,alpha0,alpha1,ky,this._settings.label(data[i]));
			/*drawing lower part for 3D pie*/
			if(ky!=1){
				this._createLowerSector(ctx,x0,y0,alpha0,alpha1,radius,true);
				ctx.fillStyle = "#000000";
				ctx.globalAlpha = 0.2;
				this._createLowerSector(ctx,x0,y0,alpha0,alpha1,radius,false);
				ctx.globalAlpha = 1;
				ctx.fillStyle = color;
			}
			/*creats map area (needed for events)*/
			map.addSector(data[i].id,alpha0,alpha1,x0-point0.x,y0-point0.y/ky,radius,ky,sIndex);

			alpha0 = alpha1;
		}
		/*renders radius lines and labels*/
		ctx.globalAlpha = 0.8;
		var p;
		for(i=0;i< angles.length;i++){
			p = this._getPositionByAngle(angles[i],x0,y0,radius);
			this._drawLine(ctx,x0,y0,p.x,p.y,this._settings.lineColor.call(this,data[i]),2);
		}
		ctx.globalAlpha =1;
		if(ky==1 && this._settings.border){
			ctx.lineWidth = this._settings.borderWidth||2;
			ctx.strokeStyle = this._settings.borderColor ? this._settings.borderColor.call(this) : "#ffffff";
			ctx.beginPath();
			ctx.arc(x0,y0,radius+1,0,2*Math.PI,false);
			ctx.stroke();
		}

		ctx.scale(1,1/ky);
	},
	/**
	 *   returns list of values
	 *   @param: data array
	 */
	_getValues:function(data){
		const v = [];
		for(let i=0; i<data.length; i++)
			v.push(Math.abs(parseFloat(this._settings.value(data[i]))||0));
		return v;
	},
	/**
	 *   returns total value
	 *   @param: the array of values
	 */
	_getTotalValue:function(values){
		var t=0;
		for(var i = 0; i < values.length;i++)
			t += values[i];
		return  t;
	},
	/**
	 *   gets angles for all values
	 *   @param: the array of values
	 *   @param: total value (optional)
	 */
	_getRatios:function(values,totalValue){
		var value;
		var ratios = [];
		var prevSum = 0;
		totalValue = totalValue||this._getTotalValue(values);
		for(var i = 0; i < values.length;i++){
			value = values[i];

			ratios[i] = Math.PI*2*(totalValue?((value+prevSum)/totalValue):(1/values.length));
			prevSum += value;
		}
		return ratios;
	},
	/**
	 *   returns calculated pie parameters: center position and radius
	 *   @param: x - the width of a container
	 *   @param: y - the height of a container
	 */
	_getPieParameters:function(point0,point1){
		/*var offsetX = 0;
		 var offsetY = 0;
		 if(this._settings.legend &&this._settings.legend.layout!="x")
		 offsetX = this._settings.legend.width*(this._settings.legend.align=="right"?-1:1);
		 var x0 = (x + offsetX)/2;
		 if(this._settings.legend &&this._settings.legend.layout=="x")
		 offsetY = this._settings.legend.height*(this._settings.legend.valign=="bottom"?-1:1);
		 var y0 = (y+offsetY)/2;*/
		var width = point1.x-point0.x;
		var height = point1.y-point0.y;
		var x0 = point0.x+width/2;
		var y0 = point0.y+height/2;
		var radius = Math.min(width/2,height/2);
		return {"x":x0,"y":y0,"radius":radius};
	},
	/**
	 *   creates lower part of sector in 3Dpie
	 *   @param: ctx - canvas object
	 *   @param: x0 - the horizontal position of the pie center
	 *   @param: y0 - the vertical position of the pie center
	 *   @param: a0 - the angle that defines the first edge of a sector
	 *   @param: a1 - the angle that defines the second edge of a sector
	 *   @param: R - pie radius
	 *   @param: line (boolean) - if the sector needs a border
	 */
	_createLowerSector:function(ctx,x0,y0,a1,a2,R,line){
		ctx.lineWidth = 1;
		/*checks if the lower sector needs being displayed*/
		if(!((a1<=0 && a2>=0)||(a1>=0 && a2<=Math.PI)||(Math.abs(a1-Math.PI)>0.003&&a1<=Math.PI && a2>=Math.PI))) return;

		if(a1<=0 && a2>=0){
			a1 = 0;
			line = false;
			this._drawSectorLine(ctx,x0,y0,R,a1,a2);
		}
		if(a1<=Math.PI && a2>=Math.PI){
			a2 = Math.PI;
			line = false;
			this._drawSectorLine(ctx,x0,y0,R,a1,a2);
		}
		/*the height of 3D pie*/
		var offset = (this._settings.pieHeight||Math.floor(R/4))/this._settings.cant;
		ctx.beginPath();
		ctx.arc(x0,y0,R,a1,a2,false);
		ctx.lineTo(x0+R*Math.cos(a2),y0+R*Math.sin(a2)+offset);
		ctx.arc(x0,y0+offset,R,a2,a1,true);
		ctx.lineTo(x0+R*Math.cos(a1),y0+R*Math.sin(a1));
		ctx.fill();
		if(line)
			ctx.stroke();
	},
	/**
	 *   draws a serctor arc
	 */
	_drawSectorLine:function(ctx,x0,y0,R,a1,a2){
		ctx.beginPath();
		ctx.arc(x0,y0,R,a1,a2,false);
		ctx.stroke();
	},
	/**
	 *   adds a shadow to pie
	 *   @param: ctx - canvas object
	 *   @param: x - the horizontal position of the pie center
	 *   @param: y - the vertical position of the pie center
	 *   @param: R - pie radius
	 */
	_addShadow:function(ctx,x,y,R){
		ctx.globalAlpha = 0.5;
		var shadows = ["#c4c4c4","#c6c6c6","#cacaca","#dcdcdc","#dddddd","#e0e0e0","#eeeeee","#f5f5f5","#f8f8f8"];
		for(var i = shadows.length-1;i>-1;i--){
			ctx.beginPath();
			ctx.fillStyle = shadows[i];
			ctx.arc(x+1,y+1,R+i,0,Math.PI*2,true);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	},
	/**
	 *   returns a gray gradient
	 *   @param: gradient - gradient object
	 */
	_getGrayGradient:function(gradient){
		gradient.addColorStop(0.0,"#ffffff");
		gradient.addColorStop(0.7,"#7a7a7a");
		gradient.addColorStop(1.0,"#000000");
		return gradient;
	},
	/**
	 *   adds gray radial gradient
	 *   @param: ctx - canvas object
	 *   @param: x - the horizontal position of the pie center
	 *   @param: y - the vertical position of the pie center
	 *   @param: radius - pie radius
	 *   @param: x0 - the horizontal position of a gradient center
	 *   @param: y0 - the vertical position of a gradient center
	 */
	_showRadialGradient:function(ctx,x,y,radius,x0,y0){
		//ctx.globalAlpha = 0.3;
		ctx.beginPath();
		var gradient;
		if(typeof this._settings.gradient!= "function"){
			gradient = ctx.createRadialGradient(x0,y0,radius/4,x,y,radius);
			gradient = this._getGrayGradient(gradient);
		}
		else gradient = this._settings.gradient(gradient);
		ctx.fillStyle = gradient;
		ctx.arc(x,y,radius,0,Math.PI*2,true);
		ctx.fill();
		//ctx.globalAlpha = 1;
		ctx.globalAlpha = 0.7;
	},
	/**
	 *   returns the calculates pie parameters: center position and radius
	 *   @param: ctx - canvas object
	 *   @param: x0 - the horizontal position of the pie center
	 *   @param: y0 - the vertical position of the pie center
	 *   @param: R - pie radius
	 *   @param: alpha1 - the angle that defines the 1st edge of a sector
	 *   @param: alpha2 - the angle that defines the 2nd edge of a sector
	 *   @param: ky - the value that defines an angle of inclination
	 *   @param: text - label text
	 *   @param: in_width (boolean) - if label needs being displayed inside a pie
	 */
	_drawSectorLabel:function(x0,y0,R,alpha1,alpha2,ky,text,in_width){
		var t = this.canvases[0].renderText(0,0,text,0,1);
		if (!t) return;

		//get existing width of text
		var labelWidth = t.scrollWidth;
		t.style.width = labelWidth+"px";	//adjust text label to fit all text
		if (labelWidth>x0) labelWidth = x0;	//the text can't be greater than half of view

		//calculate expected correction based on default font metrics
		var width = (alpha2-alpha1<0.2?4:8);
		if (in_width) width = labelWidth/1.8;
		var alpha = alpha1+(alpha2-alpha1)/2;

		//position and its correction
		R = R-(width-8)/2;
		var corr_x = - width;
		var corr_y = -8;
		var align = "right";

		//for items in left upper and lower sector
		if(alpha>=Math.PI/2 && alpha<Math.PI || alpha<=3*Math.PI/2 && alpha>=Math.PI){
			corr_x = -labelWidth-corr_x+1;/*correction for label width*/
			align = "left";
		}

		/*
		   calculate position of text
		   basically get point at center of pie sector
		*/
		var offset = 0;

		if(!in_width&&ky<1&&(alpha>0&&alpha<Math.PI))
			offset = (this._settings.height||Math.floor(R/4))/ky;

		var y = (y0+Math.floor((R+offset)*Math.sin(alpha)))*ky+corr_y;
		var x = x0+Math.floor((R+width/2)*Math.cos(alpha))+corr_x;

		/*
		   if pie sector starts in left of right part pie,
		   related text	must be placed to the left of to the right of pie as well
		*/
		var left_end = (alpha2 < Math.PI/2+0.01);
		var left_start = (alpha1 < Math.PI/2);
		if (left_start && left_end){
			x = Math.max(x,x0+3);	//right part of pie
			/*if(alpha2-alpha1<0.2)
				x = x0;*/
		}
		else if (!left_start && !left_end)
			x = Math.min(x,x0-labelWidth);	//left part of pie
		else if (!in_width&&(alpha>=Math.PI/2 && alpha<Math.PI || alpha<=3*Math.PI/2 && alpha>=Math.PI)){
			x += labelWidth/3;
		}


		//we need to set position of text manually, based on above calculations
		t.style.top  = y+"px";
		t.style.left = x+"px";
		t.style.width = labelWidth+"px";
		t.style.textAlign = align;
		t.style.whiteSpace = "nowrap";
	},
	$render_pie3D:function(ctx,data,x,y,sIndex,map){
		this._renderPie(ctx,data,x,y,this._settings.cant,map);
	},
	$render_donut:function(ctx,data,point0,point1,sIndex,map){
		if(!data.length)
			return;
		this._renderPie(ctx,data,point0,point1,1,map,sIndex);
		const config = this._settings;
		const coord = this._getPieParameters(point0,point1);
		const pieRadius = (config.radius?config.radius:coord.radius);
		if (pieRadius <= 0)
			return;
		const innerRadius = ((config.innerRadius&&(config.innerRadius<pieRadius))?config.innerRadius:pieRadius/3);
		const x0 = (config.x?config.x:coord.x);
		const y0 = (config.y?config.y:coord.y);
		ctx.fillStyle = $active.backColor;
		ctx.beginPath();
		ctx.arc(x0,y0,innerRadius,0,Math.PI*2,true);
		ctx.fill();

		if(this._settings.donutInnerText){
			const values = this._getValues(data);
			const totalValue = this._getTotalValue(values);

			const padding = $active.dataPadding;
			const width = innerRadius*2-padding*2;

			const centerText = this.canvases[0].renderText(
				x0-innerRadius+padding,
				y0-innerRadius+padding,
				`<div class="webix_donut_center_text">${this._settings.donutInnerText(data, totalValue)}</div>`,
				"webix_donut_center_text_box",
				width
			);

			centerText.style.height = centerText.style.lineHeight = width+"px";
		}
	}
};

export default Pie;