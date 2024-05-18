import {ui, $$} from "./core";
import {create} from "../webix/html";
import ani from "../webix/animate";

export function animate(obj, parent, config){
	var pobj = $$(parent);
	if (pobj){
		var aniset = config || { type:"slide", direction:"left" };
		var d = pobj._viewobj.cloneNode(true);
		var view = ui(obj, parent);

		view._viewobj.parentNode.appendChild(d);
		var line = ani.formLine(
			view._viewobj,
			d,
			aniset
		);

		aniset.callback = function(){
			ani.breakLine(line);
		};
		ani(line, aniset);

		return view;
	}
}

export function animateView(view, stateHandler, config){
	view = $$(view);
	if (view){
		config = config || { type:"slide", direction:"left" };

		var getHTML = function(view){
			var el = view._viewobj;
			var css = el.className;
			var content =el.innerHTML;
			return "<div class='"+css+"' style='width:"+el.offsetWidth+"px;height:"+el.offsetHeight+"px;'>"+content+"</div>";
		};

		// get 'display' state of child nodes
		var display = [];
		for(let i=0; i<view._viewobj.childNodes.length; i++){
			var node = view._viewobj.childNodes[i];
			var value = node.currentStyle ?node.currentStyle.display : getComputedStyle(node, null).display;
			display.push(value||"");
		}
		// get current html content
		var currentState = getHTML(view);

		// apply new state
		if(typeof stateHandler == "function"){
			stateHandler.call(this);
		}

		// get new html content
		var newState = getHTML(view);

		// insert elements into the view
		var tempParent = view._viewobj.insertBefore(create("DIV",{
			"class" : "webix_view_animate",
			"style" : "width:"+view._viewobj.offsetWidth+"px;height:"+view._viewobj.offsetHeight+"px;"
		}, newState+currentState),view._viewobj.firstChild);

		// hide child nodes
		for(let i =1; i<view._viewobj.childNodes.length; i++){
			view._viewobj.childNodes[i].style.display = "none";
		}

		// animate inserted elements
		var line = ani.formLine(
			tempParent.childNodes[0],
			tempParent.childNodes[1],
			config
		);
		config.callback = function(){
			if(tempParent){
				view._viewobj.removeChild(tempParent);
				tempParent = null;
				// restore 'display' state of child nodes
				for(var i =0; i< view._viewobj.childNodes.length;i++){
					view._viewobj.childNodes[i].style.display = display[i];
				}
			}
		};
		ani(line, config);

		return view;
	}
}