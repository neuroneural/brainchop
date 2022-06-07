import {isArray} from "../webix/helpers";

const color = {
	_toHex:["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"],
	toHex:function(number, length){
		number=parseInt(number,10);
		var str = "";
		while (number>0){
			str=this._toHex[number%16]+str;
			number=Math.floor(number/16);
		}
		while (str.length <length)
			str = "0"+str;
		return str;
	},
	rgbToHex:function(rgb){
		var arr=[];
		if(typeof(rgb) === "string")
			rgb.replace(/[\d+.]+/g, function(v){ 
				arr.push(parseFloat(v));
			});
		else if(isArray(rgb))  arr = rgb;
		
		//transparent
		if(arr[3] === 0) return "";

		return arr.slice(0, 3).map(function(n){
			return color.toHex(Math.floor(n), 2);
		}).join("");
	},
	hexToDec:function(hex){
		return parseInt(hex, 16);
	},
	toRgb:function(rgb){
		var r,g,b,rgbArr;
		if (typeof(rgb) != "string") {
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
		} else if (rgb.indexOf("rgb")!=-1) {
			rgbArr = rgb.substr(rgb.indexOf("(")+1,rgb.lastIndexOf(")")-rgb.indexOf("(")-1).split(",");
			r = rgbArr[0];
			g = rgbArr[1];
			b = rgbArr[2];
		} else {
			if (rgb.substr(0, 1) == "#") {
				rgb = rgb.substr(1);
			}
			r = this.hexToDec(rgb.substr(0, 2));
			g = this.hexToDec(rgb.substr(2, 2));
			b = this.hexToDec(rgb.substr(4, 2));
		}
		r = (parseInt(r,10)||0);
		g = (parseInt(g,10)||0);
		b = (parseInt(b,10)||0);
		if (r < 0 || r > 255)
			r = 0;
		if (g < 0 || g > 255)
			g = 0;
		if (b < 0 || b > 255)
			b = 0;
		return [r,g,b];
	},
	hsvToRgb:function(h, s, v){
		var hi,f,p,q,t,r,g,b;
		hi = Math.floor((h/60))%6;
		f = h/60-hi;
		p = v*(1-s);
		q = v*(1-f*s);
		t = v*(1-(1-f)*s);
		r = 0;
		g = 0;
		b = 0;
		switch(hi) {
			case 0:
				r = v; g = t; b = p;
				break;
			case 1:
				r = q; g = v; b = p;
				break;
			case 2:
				r = p; g = v; b = t;
				break;
			case 3:
				r = p; g = q; b = v;
				break;
			case 4:
				r = t; g = p; b = v;
				break;
			case 5:
				r = v; g = p; b = q;
				break;
			default:
				break;
		}
		r = Math.floor(r*255);
		g = Math.floor(g*255);
		b = Math.floor(b*255);
		return [r, g, b];
	},
	rgbToHsv:function(r, g, b){
		var r0,g0,b0,min0,max0,s,h,v;
		r0 = r/255;
		g0 = g/255;
		b0 = b/255;
		min0 = Math.min(r0, g0, b0);
		max0 = Math.max(r0, g0, b0);
		h = 0;
		s = max0===0?0:(1-min0/max0);
		v = max0;
		if (max0 == min0) {
			h = 0;
		} else if (max0 == r0 && g0>=b0) {
			h = 60*(g0 - b0)/(max0 - min0)+0;
		} else if (max0 == r0 && g0 < b0) {
			h = 60*(g0 - b0)/(max0 - min0)+360;
		} else if (max0 == g0) {
			h = 60*(b0 - r0)/(max0-min0)+120;
		} else if (max0 == b0) {
			h = 60*(r0 - g0)/(max0 - min0)+240;
		}
		return [h, s, v];
	}
};

export default color;