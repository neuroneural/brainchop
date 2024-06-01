import env from "../webix/env";
import ready from "../webix/ready";

import {event, eventRemove} from "../webix/htmlevents";
import {callEvent} from "../webix/customevents";
import {preventEvent, removeCss, create, remove, addCss, addStyle} from "../webix/html";

//late binding
import {ui, $$} from "../ui/core";

const Touch = {
	config:{
		longTouchDelay:1000,
		scrollDelay:150,
		gravity:500,
		deltaStep:30,
		speed:"0ms",
		finish:1500,
		ellastic:true
	},
	limit:function(value){
		Touch._limited = value !== false;	
	},
	disable:function(){
		Touch._disabled = true;
	},
	enable:function(){
		Touch._disabled = false;
	},
	$init:function(){
		Touch.$init = function(){};

		event(document.body, mouse.down,	Touch._touchstart, {passive:false});
		event(document.body, mouse.move, 	Touch._touchmove, {passive:false});
		event(document.body, mouse.up, 	Touch._touchend);

		event(document.body,"dragstart",function(e){
			if(Touch._disabled || Touch._limited) return;
			return preventEvent(e);
		});

		Touch._clear_artefacts();
		Touch._scroll = [null, null];
		Touch.$active = true;
	},
	_clear_artefacts:function(){
		Touch._start_context = Touch._current_context = Touch._prev_context = Touch._scroll_context = null;
		Touch._scroll_mode = Touch._scroll_node = Touch._scroll_stat = Touch._long_touched = null;
		//remove(Touch._scroll);
		//Touch._scroll = [null, null];
		Touch._delta = 	{ _x_moment:0, _y_moment:0, _time:0 };

		if (Touch._css_button_remove){
			removeCss(Touch._css_button_remove,"webix_touch");
			Touch._css_button_remove = null;
		}
		
		window.clearTimeout(Touch._long_touch_timer);
		Touch._was_not_moved = true;
		Touch._axis_x = true;
		Touch._axis_y = true;
		if (!Touch._active_transion)
			Touch._scroll_end();
	},
	_touchend:function(e){
		if (Touch._start_context) {
			if (!Touch._scroll_mode) {
				if (!Touch._long_touched) {
					if (Touch._axis_y && !Touch._axis_x) {
						Touch._translate_event("onSwipeX");
					} else if (Touch._axis_x && !Touch._axis_y) {
						Touch._translate_event("onSwipeY");
					}
				}
			} else {
				var temp = Touch._get_matrix(Touch._scroll_node);
				var x = temp.e;
				var y = temp.f;
				var finish = Touch.config.finish;

				var delta = Touch._get_delta(e, true);
				var view = $$(Touch._scroll_node);

				var gravity = (view && view.$scroll ? view.$scroll.gravity : Touch.config.gravity);
				if (delta._time) {
					var nx = x + gravity * delta._x_moment / delta._time;
					var ny = y + gravity * delta._y_moment / delta._time;

					var cnx = Touch._scroll[0] ? Touch._correct_minmax(nx, false, false, Touch._scroll_stat.dx, Touch._scroll_stat.px) : x;
					var cny = Touch._scroll[1] ? Touch._correct_minmax(ny, false, false, Touch._scroll_stat.dy, Touch._scroll_stat.py) : y;


					var size = Math.max(Math.abs(cnx - x), Math.abs(cny - y));
					if (size < 150)
						finish = finish * size / 150;

					if (cnx != x || cny != y)
						finish = Math.round(finish * Math.max((cnx - x) / (nx - x), (cny - y) / (ny - y)));

					var result = {e: cnx, f: cny};


					view = $$(Touch._scroll_node);
					if (view && view.adjustScroll)
						view.adjustScroll(result);


					//finish = Math.max(100,(Touch._fast_correction?100:finish));
					finish = Math.max(100, finish);


					if (x != result.e || y != result.f) {
						Touch._set_matrix(Touch._scroll_node, result.e, result.f, finish + "ms");
						if (Touch._scroll_master)
							Touch._scroll_master._sync_scroll(result.e, result.f, finish + "ms");
						Touch._set_scroll(result.e, result.f, finish + "ms");
					} else {
						Touch._scroll_end();
					}
				} else
					Touch._scroll_end();
			}
			Touch._translate_event("onTouchEnd");
			Touch._clear_artefacts();
		}
	},
	_touchmove:function(e){
		if (!Touch._scroll_context || !Touch._start_context) return;

		var	delta = Touch._get_delta(e);
		Touch._translate_event("onTouchMove");

		if (Touch._scroll_mode){
			Touch._set_scroll_pos(delta);
		} else {
			Touch._axis_x = Touch._axis_check(delta._x, "x", Touch._axis_x);
			Touch._axis_y = Touch._axis_check(delta._y, "y", Touch._axis_y);
			if (Touch._scroll_mode){
				var view = Touch._get_event_view("onBeforeScroll", true);
				if (view){
					var data = {};
					view.callEvent("onBeforeScroll",[data]);
					if (data.update){
						Touch.config.speed = data.speed;
						Touch.config.scale = data.scale;
					}
				}
				Touch._init_scroller(delta); //apply scrolling
			} else if (env.isMac) {
				const view = $$(Touch._start_context);
				if (view && view.$hasYScroll && view.$hasYScroll() && e.cancelable){
					return preventEvent(e);
				}
			}
		}

		if (Touch._scroll_mode && e.cancelable)
			return preventEvent(e);
	},
	_set_scroll_pos:function(){
		if (!Touch._scroll_node) return;
		var temp = Touch._get_matrix(Touch._scroll_node);
		var prev = Touch._prev_context || Touch._start_context;

		var view = $$(Touch._scroll_node);
		var ellastic = (view&&view.$scroll)?view.$scroll.ellastic: Touch.config.ellastic;
		if (Touch._scroll[0])
			temp.e = Touch._correct_minmax( temp.e - prev.x + Touch._current_context.x , ellastic, temp.e, Touch._scroll_stat.dx, Touch._scroll_stat.px);
		if (Touch._scroll[1])
			temp.f = Touch._correct_minmax( temp.f - prev.y + Touch._current_context.y , ellastic, temp.f, Touch._scroll_stat.dy, Touch._scroll_stat.py);

		Touch._set_matrix(Touch._scroll_node, temp.e, temp.f, "0ms");
		if (Touch._scroll_master)
			Touch._scroll_master._sync_scroll(temp.e, temp.f, "0ms");
		Touch._set_scroll(temp.e, temp.f, "0ms");
	},
	_set_scroll:function(dx, dy, speed){
		
		var edx = Touch._scroll_stat.px/Touch._scroll_stat.dx * -dx;
		var edy = Touch._scroll_stat.py/Touch._scroll_stat.dy * -dy;
		if (Touch._scroll[0])
			Touch._set_matrix(Touch._scroll[0], edx, 0 ,speed);
		if (Touch._scroll[1])
			Touch._set_matrix(Touch._scroll[1], 0, edy ,speed);
	},
	scrollTo:function(node, x, y, speed){
		Touch._set_matrix(node,x,y,speed);
	},
	_set_matrix:function(node, xv, yv, speed){
		if (!speed){
			node.style[env.transform] = "";
			return;
		}

		Touch._active_transion = true;
		if (node){
			var trans = Touch.config.translate || env.translate;
			node.style[env.transform] = trans+"("+Math.round(xv)+"px, "+Math.round(yv)+"px"+((trans=="translate3d")?", 0":"")+")";
			node.style[env.transitionDuration] = speed;
		}
	},
	_get_matrix:function(node){
		var matrix = window.getComputedStyle(node)[env.transform];
		var tmatrix;

		if (matrix == "none")
			tmatrix = {e:0, f:0};
		else {
			if(window.WebKitCSSMatrix)
				/* global WebKitCSSMatrix */
				tmatrix = new WebKitCSSMatrix(matrix);
			else if (window.MSCSSMatrix)
				/* global MSCSSMatrix */
				tmatrix = new MSCSSMatrix(matrix);
			else {
				// matrix(1, 0, 0, 1, 0, 0) --> 1, 0, 0, 1, 0, 0
				var _tmatrix = matrix.replace(/(matrix\()(.*)(\))/gi, "$2");
				// 1, 0, 0, 1, 0, 0 --> 1,0,0,1,0,0
				_tmatrix = _tmatrix.replace(/\s/gi, "");
				_tmatrix = _tmatrix.split(",");

				tmatrix = {};
				var tkey = ["a", "b", "c", "d", "e", "f"];
				for(var i=0; i<tkey.length; i++){
					tmatrix[tkey[i]] = parseInt(_tmatrix[i], 10);
				}
			}
		}

		if (Touch._scroll_master)
			Touch._scroll_master._sync_pos(tmatrix);

		return tmatrix;
	},	
	_correct_minmax:function(value, allow, current, dx, px){
		if (value === current) return value;
		
		var delta = Math.abs(value-current);
		var sign = delta/(value-current);
		//	Touch._fast_correction = true;
		
		
		if (value>0) return allow?(current + sign*Math.sqrt(delta)):0;
		
		var max = dx - px;
		if (max + value < 0)	
			return allow?(current - Math.sqrt(-(value-current))):-max;
			
		//	Touch._fast_correction = false;
		return value;
	},	
	_init_scroll_node:function(node){
		if (!node.scroll_enabled){ 
			node.scroll_enabled = true;	
			node.parentNode.style.position="relative";
			var prefix = env.cssPrefix;
			node.style.cssText += prefix+"transition: "+prefix+"transform; "+prefix+"user-select:none; "+prefix+"transform-style:flat;";
			node.addEventListener(env.transitionEnd,Touch._scroll_end,false);
		}
	},
	_init_scroller:function(){
		if (Touch._scroll_mode.indexOf("x") != -1)
			Touch._scroll[0] = Touch._create_scroll("x", Touch._scroll_stat.dx, Touch._scroll_stat.px, "width");
		if (Touch._scroll_mode.indexOf("y") != -1)
			Touch._scroll[1] = Touch._create_scroll("y", Touch._scroll_stat.dy, Touch._scroll_stat.py, "height");

		Touch._init_scroll_node(Touch._scroll_node);
		window.setTimeout(function(){
			Touch._set_scroll_pos();
			if (Touch._scroll_stat && !Touch._scroll_stat.hidden){
				if (Touch._scroll[0]) Touch._scroll[0].style.visibility = "visible";
				if (Touch._scroll[1]) Touch._scroll[1].style.visibility = "visible";
			}
		}, 0);
	},
	_create_scroll:function(mode, dy, py, dim){
		if (dy - py <2){
			var matrix = Touch._get_matrix(Touch._scroll_node);
			var e = (mode=="y"?matrix.e:0);
			var f = (mode=="y"?0:matrix.f);
			if (!Touch._scroll_master)
				Touch._set_matrix(Touch._scroll_node, e, f, "0ms");
			Touch._scroll_mode = Touch._scroll_mode.replace(mode,"");
			return "";
		}

		var scroll = create("DIV", {
			"class":"webix_scroll_"+mode
		},"");

		scroll.style.visibility = "hidden";
		scroll.style[dim] = Math.max((py*py/dy-7),10) +"px";
		if (Touch._scroll_stat.left){
			if (mode === "x")
				scroll.style.left = Touch._scroll_stat.left+"px";
			else
				scroll.style.right = (-Touch._scroll_stat.left)+"px";
		}

		Touch._scroll_node.parentNode.appendChild(scroll);

		return scroll;
	},
	_axis_check:function(value, mode, old){
		if (value > Touch.config.deltaStep){
			if (Touch._was_not_moved){
				Touch._long_move(mode);
				Touch._locate(mode);
				if ((Touch._scroll_mode||"").indexOf(mode) == -1) Touch._scroll_mode = "";
			}
			return false;
		}
		return old;
	},
	_scroll_end:function(){
		//sending event to the owner of the scroll only
		var result,state,view;
		view = $$(Touch._scroll_node||this);
		if (view){
			if (Touch._scroll_node)
				result = Touch._get_matrix(Touch._scroll_node);
			else if(view.getScrollState){
				state = view.getScrollState();
				result = {e:-state.x, f:-state.y};
			}
			callEvent("onAfterScroll", [result]);
			if (view.callEvent)
				view.callEvent("onAfterScroll",[result]);
		}
		if (!Touch._scroll_mode){
			remove(Touch._scroll);
			Touch._scroll = [null, null];
		}
		Touch._active_transion = false;
	},
	_long_move:function(){
		window.clearTimeout(Touch._long_touch_timer);
		Touch._was_not_moved = false;	
	},	
	_stop_old_scroll:function(e){
		if (Touch._scroll[0] || Touch._scroll[1]){
			Touch._stop_scroll(e, Touch._scroll[0]?"x":"y");
		}else
			return true;
	},
	_touchstart :function(e){
		var target = e.target;

		if (Touch._disabled) return;

		Touch._long_touched = null;
		Touch._scroll_context = Touch._start_context = mouse.context(e);

		// in "limited" mode we should have possibility to use slider
		var element = $$(e);

		if (Touch._limited && !Touch._is_scroll() && !(element && element.$touchCapture)){
			Touch._scroll_context = null;
		}

		Touch._translate_event("onTouchStart");

		if (Touch._stop_old_scroll(e))
			Touch._long_touch_timer = window.setTimeout(Touch._long_touch, Touch.config.longTouchDelay);

		if (element && element.touchable && (!target.className || target.className.indexOf("webix_view")!==0)){
			Touch._css_button_remove = element.getNode(e);
			addCss(Touch._css_button_remove,"webix_touch");
		}
	},
	_long_touch:function(){
		if(Touch._start_context){
			Touch._long_touched = true;
			Touch._translate_event("onLongTouch");
			callEvent("onClick", [Touch._start_context]);
			//Touch._clear_artefacts();
		}
	},
	_stop_scroll:function(e, stop_mode){ 
		Touch._locate(stop_mode);
		var scroll = Touch._scroll[0]||Touch._scroll[1];
		if (scroll){
			var view = Touch._get_event_view("onBeforeScroll", true);
			if (view)
				view.callEvent("onBeforeScroll", [Touch._start_context,Touch._current_context]);
		}
		if (scroll && (!Touch._scroll_node || scroll.parentNode != Touch._scroll_node.parentNode)){
			Touch._clear_artefacts();
			Touch._scroll_end();
			Touch._start_context = mouse.context(e);
		}
		Touch._touchmove(e);
	},	
	_get_delta:function(e){
		Touch._prev_context = Touch._current_context;
		Touch._current_context = mouse.context(e);
			
		Touch._delta._x = Math.abs(Touch._start_context.x - Touch._current_context.x);
		Touch._delta._y = Math.abs(Touch._start_context.y - Touch._current_context.y);
		
		if (Touch._prev_context){
			if (Touch._current_context.time - Touch._prev_context.time < Touch.config.scrollDelay){
				Touch._delta._x_moment = Touch._delta._x_moment/1.3+Touch._current_context.x - Touch._prev_context.x;
				Touch._delta._y_moment = Touch._delta._y_moment/1.3+Touch._current_context.y - Touch._prev_context.y;
			}
			else {
				Touch._delta._y_moment = Touch._delta._x_moment = 0;
			}
			Touch._delta._time = Touch._delta._time/1.3+(Touch._current_context.time - Touch._prev_context.time);
		}
		
		return Touch._delta;
	},
	_get_sizes:function(node){
		Touch._scroll_stat = {
			dx:node.offsetWidth,
			dy:node.offsetHeight,
			px:node.parentNode.offsetWidth,
			py:node.parentNode.offsetHeight
		};
	},
	_is_scroll:function(locate_mode){
		var node = Touch._start_context.target;
		if (!env.touch && !env.transition && !env.transform) return null;
		while(node && node.tagName!="BODY"){
			if(node.getAttribute){
				var mode = node.getAttribute("touch_scroll");
				if (mode && (!locate_mode || mode.indexOf(locate_mode)!=-1))
					return [node, mode];
			}
			node = node.parentNode;
		}
		return null;
	},
	_locate:function(locate_mode){
		var state = this._is_scroll(locate_mode);
		if (state){
			Touch._scroll_mode = state[1];
			Touch._scroll_node = state[0];
			Touch._get_sizes(state[0]);
		}
		return state;
	},
	_translate_event:function(name){
		callEvent(name, [Touch._start_context,Touch._current_context]);
		var view = Touch._get_event_view(name);
		if (view)
			view.callEvent(name, [Touch._start_context,Touch._current_context]);
	},
	_get_event_view:function(name, active){
		var view = $$(active ? Touch._scroll_node : Touch._start_context);
		if(!view) return null;
		
		while (view){
			if (view.hasEvent&&view.hasEvent(name))	
				return view;
			view = view.getParentView();
		}
		
		return null;
	},	
	_get_context:function(e){
		if (!e.touches[0]) {
			var temp = Touch._current_context;
			temp.time = new Date();
			return temp;
		}
			
		return {
			target:e.target,
			x:e.touches[0].pageX,
			y:e.touches[0].pageY,
			time:new Date()
		};
	},
	_get_context_m:function(e){
		return {
			target:e.target,
			x:e.pageX,
			y:e.pageY,
			time:new Date()
		};
	}
};

function touchInit(){
	if (env.touch){
		Touch.$init();
		//not full screen mode
		if (document.body.className.indexOf("webix_full_screen") == -1)
			Touch.limit(true);

		if (env.isSafari)
			addStyle(".webix_view{ -webkit-overflow-scrolling: touch; }");

		if (window.MSCSSMatrix)
			addStyle(".webix_view{ -ms-touch-action: none; }");
	} else {
		var id = event(document.body, "touchstart", function(ev){
			if (ev.touches.length && ev.touches[0].radiusX > 4){
				env.touch = true;
				setMouse(mouse);
				touchInit();
				for (var key in ui.views){
					var view = ui.views[key];
					if (view && view.$touch)
						view.$touch();
				}
			}
			eventRemove(id);
		}, { capture: true });
	}
}

function setMouse(mouse){
	mouse.down = "touchstart";
	mouse.move = "touchmove";
	mouse.up   = "touchend";
	mouse.context = Touch._get_context;
}

ready(touchInit);


var mouse = env.mouse = { down:"mousedown", up:"mouseup", 
	move:"mousemove", context:Touch._get_context_m };

if (window.navigator.pointerEnabled){
	mouse.down = "pointerdown";
	mouse.move = "pointermove";
	mouse.up   = "pointerup";
} else if (window.navigator.msPointerEnabled){
	mouse.down = "MSPointerDown";
	mouse.move = "MSPointerMove";
	mouse.up   = "MSPointerUp";
} else if (env.touch)
	setMouse(mouse);
	

export default Touch;