import {create, remove} from "../webix/html";
import {isUndefined, toNode} from "../webix/helpers";
import {proto} from "../ui/core";

const Canvas = proto({
	$init:function(container){
		this._canvas_labels = [];
		this._canvas_series =  (!isUndefined(container.series)?container.series:container.name);
		this._obj = toNode(container.container||container);
		var width = container.width*(window.devicePixelRatio||1);
		var height = container.height*(window.devicePixelRatio||1);
		var style = container.style||"";
		style += ";width:"+container.width+"px;height:"+container.height+"px;";
		this._prepareCanvas(container.name, style ,width, height, container.title);
	},
	_prepareCanvas:function(name,style,x,y, title){
		//canvas has the same size as master object
		this._canvas = create("canvas",{ title:title, width:x, height:y, canvas_id:name, style:(style||"")});
		this._obj.appendChild(this._canvas);
		return this._canvas;
	}, 
	getCanvas:function(context){
		var ctx = (this._canvas||this._prepareCanvas(this._contentobj)).getContext(context||"2d");
		if(!this._webixDevicePixelRatio){
			this._webixDevicePixelRatio = true;
			ctx.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
		}
		return ctx;
	},
	_resizeCanvas:function(x, y){
		if (this._canvas){
			this._canvas.setAttribute("width", x*(window.devicePixelRatio||1));
			this._canvas.setAttribute("height", y*(window.devicePixelRatio||1));
			this._canvas.style.width = x+"px";
			this._canvas.style.height = y+"px";
			this._webixDevicePixelRatio = false;
		}
	},
	renderText:function(x,y,text,css,w){
		if (!text) return; //ignore empty text
		if (w) w = Math.max(w,0);
		if (y) y = Math.max(y,0);
		var t = create("DIV",{
			"class":"webix_canvas_text"+(css?(" "+css):""),
			"style":"left:"+x+"px; top:"+y+"px;",
			"aria-hidden":"true"
		},text);
		this._obj.appendChild(t);
		this._canvas_labels.push(t); //destructor?
		if (w)
			t.style.width = w+"px";
		return t;
	},
	renderTextAt:function(valign,align, x,y,t,c,w){
		var text=this.renderText.call(this,x,y,t,c,w);
		if (text){
			if (valign){
				if(valign == "middle")
					text.style.top = parseInt(y-text.offsetHeight/2,10) + "px";
				else
					text.style.top = y-text.offsetHeight + "px";
			}
			if (align){
				if(align == "left")
					text.style.left = x-text.offsetWidth + "px";
				else
					text.style.left = parseInt(x-text.offsetWidth/2,10) + "px";
			}
		}
		return text;
	},
	clearCanvas:function(skipMap){
		var areas=[];

		remove(this._canvas_labels);
		this._canvas_labels = [];

		if (!skipMap&&this._obj._htmlmap){

			//areas that correspond this canvas layer
			areas = this._getMapAreas();
			//removes areas of this canvas
			while(areas.length){
				areas[0].parentNode.removeChild(areas[0]);
				areas.splice(0,1);
			}
			areas = null;

			//removes _htmlmap object if all its child nodes are removed
			if(!this._obj._htmlmap.getElementsByTagName("AREA").length){
				this._obj._htmlmap.parentNode.removeChild(this._obj._htmlmap);
				this._obj._htmlmap = null;
			}
		}
		//FF breaks, when we are using clear canvas and call clearRect without parameters
		//width|height are used insead of offsetWidth|offsetHeight for hidden canvas (series)
		this.getCanvas().clearRect(0,0,
			this._canvas.offsetWidth||Math.floor(this._canvas.width/(window.devicePixelRatio||1)), 
			this._canvas.offsetHeight||Math.floor(this._canvas.height/(window.devicePixelRatio||1))
		);
	},
	toggleCanvas:function(){
		this._toggleCanvas(this._canvas.style.display=="none");
	},
	showCanvas:function(){
		this._toggleCanvas(true);
	},
	hideCanvas:function(){
		this._toggleCanvas(false);
	},
	_toggleCanvas:function(show){
		var areas, i;

		for(i=0; i < this._canvas_labels.length;i++)
			this._canvas_labels[i].style.display = (show?"":"none");

		if (this._obj._htmlmap){
			areas = this._getMapAreas();
			for( i = 0; i < areas.length; i++){
				if(show)
					areas[i].removeAttribute("disabled");
				else
					areas[i].setAttribute("disabled","true");
			}
		}
		//FF breaks, when we are using clear canvas and call clearRect without parameters
		this._canvas.style.display = (show?"":"none");
	},
	_getMapAreas:function(){
		var res = [], areas, i;
		areas = this._obj._htmlmap.getElementsByTagName("AREA");
		for(i = 0; i < areas.length; i++){
			if(areas[i].getAttribute("userdata") == this._canvas_series){
				res.push(areas[i]);
			}
		}

		return res;
	}
});

export default Canvas;