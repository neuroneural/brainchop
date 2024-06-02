import {delay, uid, toNode, isUndefined} from "./helpers.js";
import env from "./env.js";

let _native_on_selectstart = 0;
const _style_element = {};
const _style_cache = {};

export function denySelect(){
	if (!_native_on_selectstart)
		_native_on_selectstart = document.onselectstart;
	document.onselectstart = stopEvent;
}

export function allowSelect(){
	if (_native_on_selectstart !== 0){
		document.onselectstart = _native_on_selectstart||null;
	}
	_native_on_selectstart = 0;

}

export function index(node){
	var k=0;
	//must be =, it is not a comparation!
	while ((node = node.previousSibling)) k++;
	return k;
}

export function createCss(rule, sufix){
	var text = "";
	sufix = sufix || "";

	for (var key in rule)
		text+= key+":"+rule[key]+";";
    
	var name = _style_cache[text+sufix];
	if (!name){
		name = "s"+uid();
		addStyle("."+name+(sufix||"")+"{"+text+"}");
		_style_cache[text+sufix] = name;
	}
	return name;
}

export function addStyle(rule, group){
	var style = group ? _style_element[group] :_style_element["default"];
	if(!style){
		style = document.createElement("style");
		style.setAttribute("type", "text/css");
		style.setAttribute("media", "screen,print");
		document.getElementsByTagName("head")[0].appendChild(style);

		if (group)
			_style_element[group] = style;
		else
			_style_element["default"] = style;
	}
	/*IE8*/
	if (style.styleSheet)
		style.styleSheet.cssText += rule;
	else
		style.appendChild(document.createTextNode(rule));
}

export function removeStyle(group){
	var box = _style_element[group||"default"];
	if (box)
		box.innerHTML = "";
}

export function create(name,attrs,html){
	attrs = attrs || {};
	var node = document.createElement(name);
	for (var attr_name in attrs)
		node.setAttribute(attr_name, attrs[attr_name]);
	if (attrs.style)
		node.style.cssText = attrs.style;
	if (attrs["class"])
		node.className = attrs["class"];
	if (html)
		node.innerHTML=html;
	return node;
}

//return node value, different logic for different html elements
export function getValue(node){
	node = toNode(node);
	if (!node) return "";
	return isUndefined(node.value)?node.innerHTML:node.value;
}

//remove html node, can process an array of nodes at once
export function remove(node){
	if (node instanceof Array)
		for (var i=0; i < node.length; i++)
			remove(node[i]);
	else if (node && node.parentNode)
		node.parentNode.removeChild(node);
}

//insert new node before sibling, or at the end if sibling doesn't exist
export function insertBefore(node,before,rescue){
	if (!node) return;
	if (before && before.parentNode)
		before.parentNode.insertBefore(node, before);
	else
		rescue.appendChild(node);
}

//return custom ID from html element 
//will check all parents starting from event's target
export function locate(e,id){
	var trg;
	if (e.tagName)
		trg = e;
	else {
		e=e||event;
		trg=e.target;
	}
    
	while (trg){
		if (trg.getAttribute){	//text nodes has not getAttribute
			var test = trg.getAttribute(id);
			if (test) return test;
		}
		trg=trg.parentNode;
	}	
	return null;
}

//returns position of html element on the page
export function offset(elem) {
	if (elem.getBoundingClientRect) { //HTML5 method
		const box = elem.getBoundingClientRect();
		const body = document.body;
		const docElem = document.documentElement;
		const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		const clientTop = docElem.clientTop || body.clientTop || 0;
		const clientLeft = docElem.clientLeft || body.clientLeft || 0;
		const top  = box.top +  scrollTop - clientTop;
		const left = box.left + scrollLeft - clientLeft;
		return { y: Math.round(top), x: Math.round(left), width:elem.offsetWidth, height:elem.offsetHeight };
	} else { //fallback to naive approach
		let top=0, left=0;
		while(elem) {
			top = top + parseInt(elem.offsetTop,10);
			left = left + parseInt(elem.offsetLeft,10);
			elem = elem.offsetParent;
		}
		return { y: top, x: left, width:elem.offsetHeight, height:elem.offsetWidth };
	}
}

//returns relative position of event
export function posRelative(ev){
	ev = ev || event;
	if (!isUndefined(ev.offsetX))
		return { x:ev.offsetX, y:ev.offsetY };	//ie, webkit
	else
		return { x:ev.layerX, y:ev.layerY };	//firefox
}

//returns position of event
export function pos(ev){
	ev = ev || event;
	if (ev.touches && ev.touches[0])
		ev = ev.touches[0];

	if(ev.pageX || ev.pageY)	//FF, KHTML
		return {x:ev.pageX, y:ev.pageY};
	//IE
	var d  =  ((env.isIE)&&(document.compatMode != "BackCompat"))?document.documentElement:document.body;
	return {
		x:ev.clientX + d.scrollLeft - d.clientLeft,
		y:ev.clientY + d.scrollTop  - d.clientTop
	};
}

//prevent event action
export function preventEvent(e){
	if(e && e.preventDefault) e.preventDefault();
	if(e) e.returnValue = false;
	return stopEvent(e);
}

//stop event bubbling
export function stopEvent(e){
	e = (e||event);
	if(e.stopPropagation) e.stopPropagation();
	e.cancelBubble=true;
	return false;
}

export function triggerEvent(node, type, name){
	if(document.createEventObject){
		const ev = document.createEventObject();
		if (node.fireEvent)
			node.fireEvent("on"+name, ev);
	} else{
		const ev = document.createEvent(type);
		ev.initEvent(name, true, true);
		if (node.dispatchEvent)
			node.dispatchEvent(ev);
	}
}

//add css class to the node
export function addCss(node,name,check){
	if (!check || node.className.indexOf(name) === -1)
		node.className+=" "+name;
}

//remove css class from the node
export function removeCss(node,name){
	node.className=node.className.replace(RegExp(" "+name,"g"),"");
}

export function getTextSize(text, css, basewidth){
	var d = create("DIV",{"class":"webix_view webix_measure_size "+(css||"")},"");
	d.style.cssText = "height:auto;visibility:hidden; position:absolute; top:0px; left:0px; overflow:hidden;"+(basewidth?("width:"+basewidth+"px;"):"width:auto;white-space:nowrap;");
	document.body.appendChild(d);

	var all = (typeof text !==  "object") ? [text] : text;
	var width = 0;
	var height = 0;

	for (var i = 0; i < all.length; i++) {
		d.innerHTML = all[i];
		//we need to add 1 to offsetWidth/Height because these methods return value as an integer
		//we can use ie9+ d.getBoundingClientRect().width
		width = Math.max(width, d.offsetWidth+1);
		height = Math.max(height, d.offsetHeight+1);
	}
    
	remove(d);
	return { width:width, height:height };
}

export function download(data, filename){
	var objUrl = false;

	if(typeof data =="object"){//blob
		if(window.navigator.msSaveBlob)
			return window.navigator.msSaveBlob(data, filename);
		else {
			data = window.URL.createObjectURL(data);
			objUrl = true;
		}
	}
	//data url or blob url
	var link = document.createElement("a");
	link.href = data;
	link.download = filename;
	document.body.appendChild(link);
	link.click(); 

	delay(function(){
		if(objUrl) window.URL.revokeObjectURL(data);
		document.body.removeChild(link);
		link.remove();
	});
}

export function _getClassName(node){
	if(!node) return "";

	var className = node.className || "";
	if(className.baseVal)//'className' exist but not a string - IE svg element in DOM
		className = className.baseVal;

	if(!className.indexOf)
		className = "";

	return className;
}

export function setSelectionRange(node, start, end){
	start = start || 0;
	end  = end || start;

	node.focus();
	if(node.setSelectionRange)
		node.setSelectionRange(start, end);
	else{
		//ie8
		var textRange = node.createTextRange();
		textRange.collapse(true);
		textRange.moveEnd("character", end);
		textRange.moveStart("character", start);
		textRange.select();
	}
}

export function getSelectionRange(node){
	if("selectionStart" in node)
		return {start:node.selectionStart || 0, end:node.selectionEnd || 0};
	else{
		//ie8
		node.focus();
		var selection = document.selection.createRange();
		var bookmark = selection.getBookmark();
		var textRange = node.createTextRange();

		textRange.moveToBookmark(bookmark);
		var length = textRange.text.length;
        
		textRange.collapse(true);
		textRange.moveStart("character", -node.value.length);

		var start = textRange.text.length;
		return {start:start, end: start + length};
	}
}

export function addMeta(name, value){
	document.getElementsByTagName("head").item(0).appendChild(create("meta",{
		name:name,
		content:value
	}));	
}

