import {create} from "../webix/html";
import env from "../webix/env";
import {uid} from "../webix/helpers";
import {proto} from "../ui/core";


const HtmlMap = proto({
	$init:function(key){
		this._id = "map_"+uid();
		this._key = key;
		this._map = [];
		this._areas = [];
	},
	addRect: function(id,points,userdata) {
		this._createMapArea(id,"RECT",points,userdata);
	},
	addPoly: function(id,points,userdata) {
		this._createMapArea(id,"POLY",points,userdata);
	},
	_createMapArea:function(id,shape,coords,userdata){
		var extra_data = "";
		if(arguments.length==4) 
			extra_data = "userdata='"+userdata+"'";
		this._map.push("<area "+this._key+"='"+id+"' shape='"+shape+"' coords='"+coords.join()+"' "+extra_data+"></area>");
		this._areas.push({index: userdata, points:coords});

	},
	addSector:function(id,alpha0,alpha1,x,y,R,ky,userdata){
		var points = [];
		points.push(x);
		points.push(Math.floor(y*ky)); 
		for(var i = alpha0; i < alpha1; i+=Math.PI/18){
			points.push(Math.floor(x+R*Math.cos(i)));
			points.push(Math.floor((y+R*Math.sin(i))*ky));
		}
		points.push(Math.floor(x+R*Math.cos(alpha1)));
		points.push(Math.floor((y+R*Math.sin(alpha1))*ky));
		points.push(x);
		points.push(Math.floor(y*ky)); 
		
		return this.addPoly(id,points,userdata);
	},
	hide:function(obj, data, mode){
		if (obj.querySelectorAll){
			var nodes = obj.querySelectorAll("area[userdata=\""+data+"\"]");
			for (var i = 0; i < nodes.length; i++){
				var nod = nodes[i];
				if (mode){
					if (nod.getAttribute("coords")){
						nod.coordsdis = nod.getAttribute("coords");
						nod.setAttribute("coords", "");
						nod.coords = "";
					}
				} else if (!mode){
					if (nod.coordsdis){
						nod.setAttribute("coords", nod.coordsdis);
						nod.coords = nod.coordsdis;
						nod.coordsdis = "";
					}
				}
				nodes[i].style.display = mode?"none":"";
			}
		}
	},
	render:function(obj){
		var d = create("DIV");
		d.style.cssText="position:absolute; width:100%; height:100%; top:0px; left:0px;";
		obj.appendChild(d);
		var src = env.isIE?"":"src='data:image/gif;base64,R0lGODlhEgASAIAAAP///////yH5BAUUAAEALAAAAAASABIAAAIPjI+py+0Po5y02ouz3pwXADs='";
		d.innerHTML="<map id='"+this._id+"' name='"+this._id+"'>"+this._map.join("\n")+"</map><img "+src+" class='webix_map_img' usemap='#"+this._id+"'>";
		
		obj._htmlmap = d; //for clearing routine
		
		this._map = [];
	}
});

export default HtmlMap;