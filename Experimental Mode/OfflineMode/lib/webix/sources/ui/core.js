import {assert} from "../webix/debug";

import {uid, isArray, toNode, isUndefined, toFunctor} from "../webix/helpers";
import {attachEvent} from "../webix/customevents";
import {locate} from "../webix/html";
import {use} from "../services";

import type from "../webix/type";
import state from "../core/state";

//global click events for UI
import "./click";

const views = {};

function ui(config, parent, id){
	var res;
	state._ui_creation++;
	// save old value of global scope
	const temp = state._global_scope;
	// set global scope to the scope of new UI or to previous value
	// as result inner webix.ui calls will have access the scope of master view
	// mainly necessary for suggests
	state._global_scope = config.$scope || temp;
	try {
		res = _ui_creator(config, parent, id);
	} finally {
		state._ui_creation--;
		// restore global scope
		state._global_scope = temp;
	}
	return res;
}
ui.views = views;


function _ui_creator(config, parent, id){
	var multiset = isArray(config);
	var node = toNode((config.container||parent)||document.body);

	// solve problem with non-unique ids
	if(node._settings)
		id = _correctId(node, multiset, id);

	var top_node;
	var moving = false;
	var body_child = (node == document.body);
	if (config._settings || (node && multiset)){
		top_node = config;
		moving = true;
	} else {
		if (node && body_child)
			config.$topView = true;
		if (!config._inner)
			config._inner = {};

		if (parent && parent.getParentView){
			state._parent_cell = (!id && id!==0) ? parent.getParentView() : parent;
		}

		top_node = _view(config);
	}

	if (body_child && !top_node.setPosition && !top_node.$apiOnly)
		use("_fixHeight")();

	if (top_node._settings && top_node._settings._hidden && !node.$view){
		top_node._settings._container = node;
	} else if (!top_node.$apiOnly){
		if (node.appendChild)
			_appendDom(node, top_node, config);
		else if (node.destructor){
			var target = node;

			//addView or view moving with target id
			if (!id && id!==0 && !isArray(top_node)){
				id = node;
				node = node.getParentView();
			}

			//if target supports view adding
			if (node && node._replace){
				if (moving && top_node.getParentView){
					//if source supports view removing
					let parent = top_node.getParentView();
					if (parent  && parent._remove){
						parent._remove(top_node);
					}
					//adjust parent link and scope
					top_node._parent_cell = node;
					top_node.$scope = node.$scope;
				}

				node._replace(top_node, id);
			} else {
				let parent = target.$view.parentNode;
				target.destructor();
				_appendDom(parent, top_node, config);
			}
		} else
			assert(0, "Not existing parent:"+config.container);
	}

	return top_node;
}

function _appendDom(node, top_node, config){
	node.appendChild(top_node._viewobj);
	if (top_node.getParentView()) return;

	//resize window with position center or top
	//do not resize other windows and elements
	// which are attached to custom html containers
	if (((!top_node.setPosition || top_node._settings.fullscreen) && node == document.body) || top_node._settings.position )
		state.top_views.push(top_node._destructor_handler);
	if (!config.skipResize)
		top_node.adjust();
}

function _correctId(target, multiset, id){
	//replace view
	var views = [target];
	//replace content of layout
	if (multiset)
		views = target.getChildViews();
	//replace content of window
	else if (target._body_cell)
		views = [target._body_cell];
	//add cell in layout by number
	else if (typeof id == "number"){
		return id;
	//replace cell in layout by id
	} else if (id){
		views = [$$(id)];
		_deleteIds(views);
		return views[0].config.id;
	}

	_deleteIds(views);
	return id;
}

function _deleteIds(uis){
	for (var i = uis.length - 1; i >= 0; i--){
		let current = uis[i];
		//remove original id
		delete views[current.config.id];
		//create temp id
		current.config.id = "x"+uid();
		views[current.config.id] = current;
		//process childs
		if (current.getChildViews)
			_deleteIds(current.getChildViews());
		//process related UI
		if (current._destroy_with_me)
			_deleteIds(current._destroy_with_me);
	}
}


function _view(config){

	if (DEBUG){
		// check for trailing comma
		var coll = config.cells || config.rows || config.elements || config.cols;
		if (coll)
			for (let i=0; i<coll.length; i++)
				if (coll[i] === null || typeof coll[i] === "undefined")
					assert(0, "You have trailing comma or Null element in collection's configuration");
	}

	if (config.view){
		var view = config.view;
		assert(ui[view], "unknown view:"+view);
		return new ui[view](config);
	} else if (config.rows || config.cols){
		var cells = config.rows||config.cols;
		var accordion = false;
		for (let i=0; i<cells.length; i++){
			if (cells[i].body && !cells[i].view && !cells[i].align)
				accordion = true;
		}
		if (accordion){
			return new ui.headerlayout(config);
		} else
			return new ui.layout(config);
	}
	else if (config.cells)
		return new ui.multiview(config);
	else if (config.template || config.content)
		return new ui.template(config);	
	else if (config.align && config.body){
		return new ui.align(config);
	} else return new ui.spacer(config);
}
//FIXME
ui._view = _view;

function $$(id){
	if (!id) return null;
	
	if (views[id]) return views[id];

	var name = id;
	if (typeof id == "object"){
		if (id._settings)
			return id;
		name = id.target||id;
	}
	return views[locate({ target:toNode(name)},/*@attr*/"view_id")];
}
if (typeof window.$$ === "undefined") window.$$ = $$;
	
	

let protoUI = function(){
	var origins = arguments;
	var selfname = origins[0].name;
	
	var t = function(data){
		if (!t)
			return ui[selfname].prototype;

		var origins = t.$protoWait;
		if (origins){
			var params = [origins[0]];
			
			for (let i=1; i < origins.length; i++){
				params[i] = origins[i];

				if (params[i].$protoWait)
					params[i] = params[i].call(-1, params[i].name);

				if (params[i].prototype && params[i].prototype.name)
					ui[params[i].prototype.name] = params[i];
			}
			ui[selfname] = proto.apply(-1, params);

			if (t._webix_type_wait)	
				for (let i=0; i < t._webix_type_wait.length; i++)
					type(ui[selfname], t._webix_type_wait[i]);
				
			t = origins = null;	
		}
			
		if (this != -1)
			return new ui[selfname](data);
		else 
			return ui[selfname];
	};
	t.$protoWait = Array.prototype.slice.call(arguments, 0);
	return (ui[selfname]=t);
};

let proto = function(){
	var origins = arguments;
	var compilation = origins[0];
	var has_constructor = !!compilation.$init;
	var construct = [];
	
	assert(compilation,"Invalid mixing target");
		
	for (var i=origins.length-1; i>0; i--) {
		assert(origins[i],"Invalid mixing source");
		if (typeof origins[i]== "function")
			origins[i]=origins[i].prototype;
		if (origins[i].$init) 
			construct.push(origins[i].$init);
		if (origins[i].defaults){ 
			var defaults = origins[i].defaults;
			if (!compilation.defaults)
				compilation.defaults = {};
			for (let def in defaults)
				if (isUndefined(compilation.defaults[def]))
					compilation.defaults[def] = defaults[def];
		}
		if (origins[i].type && compilation.type){
			for (let def in origins[i].type)
				if (!compilation.type[def])
					compilation.type[def] = origins[i].type[def];
		}
			
		for (var key in origins[i]){
			if (!compilation[key] && compilation[key] !== false)
				compilation[key] = origins[i][key];
		}
	}
	
	if (has_constructor)
		construct.push(compilation.$init);
	
	
	compilation.$init = function(){
		for (var i=0; i<construct.length; i++)
			construct[i].apply(this, arguments);
	};
	if (compilation.$skin)
		compilation.$skin();

	var result = function(config){
		this.$ready=[];
		assert(this.$init,"object without init method");
		this.$init(config);
		if (this._parseSettings)
			this._parseSettings(config, this.defaults);
		for (var i=0; i < this.$ready.length; i++)
			this.$ready[i].call(this);
	};
	result.prototype = compilation;
	
	compilation = origins = null;
	return result;
};

attachEvent("onClick", function(e){
	var element = $$(e);
	if (element && element.touchable){
		use("UIManager").applyChanges(element);

		//for inline elements - restore pointer to the master element
		element.getNode(e);
		//reaction on custom css elements in buttons
		var trg=e.target;
		if (element.config.disabled)
			return;

		var css = "";
		if (trg.className && trg.className.toString().indexOf("webix_view")===0) return;

		if (element)
			use("UIManager")._focus_action(element);

		//loop through all parents
		while (trg && trg.parentNode){
			if (trg.getAttribute){
				if (trg.getAttribute(/*@attr*/"view_id"))
					break;
					
				css=trg.className;
				if (css){
					css = css.toString().split(" ");
					for (var i =0; i<css.length; i++){
						if (element.on_click[css[i]]){
							var res =  element.on_click[css[i]].call(element,e,element._settings.id,trg);
							if (res===false)
								return;
						}
					}
				}
			}
			trg=trg.parentNode;
		}


		if (element._settings.click){
			var code = toFunctor(element._settings.click, element.$scope);
			if (code && code.call) code.call(element, element._settings.id, e);
		}

		let popup = element._settings.popup;
		if (popup && !element._settings.readonly){
			if (typeof popup == "object" && !popup.name){
				popup = element._settings.popup = ui(popup)._settings.id;
				element._destroy_with_me.push($$(popup));
			}

			popup = $$(popup);
			assert(popup, "Unknown popup");

			if (!popup.isVisible()){
				popup._settings.master = element._settings.id;
				popup.show((element.getInputNode()||element.getNode()),null,true);
			}
		}

		element.callEvent("onItemClick", [element._settings.id, e]);
	}
});


//hook for documentation generator
if (DEBUG){
	if (window.webix_on_core_ready){
		var mod = window.webix_on_core_ready({ proto, protoUI});
		proto = mod.proto;
		protoUI = mod.protoUI;
	}
}

export { ui, proto, protoUI, $$ };