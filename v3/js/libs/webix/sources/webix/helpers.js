import {assert} from "./debug";

let level = 0;
export function level_in(){
	level++;
	assert(level !== 100, "Attempt to copy object with self reference");
}
export function level_out(){
	level--;
}

//coding helpers
export function clone(source){
	var f = clone._function;
	f.prototype = source;
	return new f();
}
clone._function = function(){};

//copies methods and properties from source to the target
let extend = function(base, source, force){
	assert(base,"Invalid mixing target");
	assert(source,"Invalid mixing source");

	if (base.$protoWait){
		_power_array.insertAt.call(base.$protoWait, source,1);
		return base;
	}

	//copy methods, overwrite existing ones in case of conflict
	for (var method in source)
		if ((!(method in base)) || force)
			base[method] = source[method];

	//in case of defaults - preffer top one
	if (source.defaults)
		extend(base.defaults, source.defaults);
	
	//if source object has init code - call init against target
	if (source.$init)	
		source.$init.call(base);

	return base;	
};

//copies methods and properties from source to the target from all levels
export function copy(source){
	assert(source,"Invalid mixing target");
	if (DEBUG) level_in();

	var esModern = !!window.Map && !!window.Set && !!window.WeakMap && !!window.WeakSet;
	var target;
	if(arguments.length>1){
		target = arguments[0];
		source = arguments[1];
	} else 
		target = (isArray(source)?[]:{});

	for (var method in source){
		var from = source[method];
		if(from && typeof from == "object" && !(from instanceof RegExp)){
			if (isDate(from))
				target[method] = new Date(from);
			/* jshint ignore:start */
			else if (esModern && (from instanceof Map || from instanceof Set || from instanceof WeakMap || from instanceof WeakSet))
				target[method] = from;
			/* jshint ignore:end */
			else {
				target[method] = (isArray(from)?[]:{});
				copy(target[method],from);
			}
		} else {
			target[method] = from;
		}
	}

	if (DEBUG) level_out();
	return target;	
}

export function single(source){ 
	var instance = null;
	var t = function(){
		if (!instance)
			instance = new source({});
			
		if (instance._reinit)
			instance._reinit.apply(instance, arguments);
		return instance;
	};
	return t;
}


//creates function with specified "this" pointer
export function bind(functor, object){ 
	return function(){ return functor.apply(object,arguments); };  
}


//evaluate javascript code in the global scoope
export function exec(code){
	if (window.execScript)	//special handling for IE
		window.execScript(code);
	else window.eval(code);
}

export function wrap(code, wrap){
	if (!code) return wrap;
	return function(){
		var result = code.apply(this, arguments);
		wrap.apply(this,arguments);
		return result;
	};
}

//check === undefined
export function isUndefined(a){
	return typeof a == "undefined";
}
//delay call to after-render time
export function delay(method, obj, params, delay){
	return window.setTimeout(function(){
		if(!(obj&&obj.$destructed)){
			var ret = method.apply(obj,(params||[]));
			method = obj = params = null;
			return ret;
		}
	},delay||1);
}

export function once(method){
	var flag = true;
	return function(){
		if (flag){
			flag = false;
			method.apply(this, arguments);
		}
	};
}

//common helpers

//generates unique ID (unique per window, nog GUID)
let _seed = (new Date()).valueOf();
export function uid(){
	_seed++;
	return _seed;
}
//resolve ID as html object
export function toNode(node){
	if (typeof node == "string") return document.getElementById(node);
	return node;
}
//resolve function name
export function toFunctor(str, scope){ 
	if (typeof(str)=="string"){
		var method = str.replace("()","");
		if (scope && scope[method]) return scope[method];
		return window[method] || window.eval(str);
	}
	return str;
}
/*checks where an object is instance of Array*/
export function isArray(obj) {
	return Array.isArray?Array.isArray(obj):(Object.prototype.toString.call(obj) === "[object Array]");
}
export function isDate(obj){
	return obj instanceof Date;
}

//adds extra methods for the array
export function _to_array(array){ 
	return extend((array||[]),_power_array, true);
}
//can be used by _to_array()
export const _power_array={
	//remove element at specified position
	removeAt:function(pos,len){
		if (pos>=0) this.splice(pos,(len||1));
	},
	//find element in collection and remove it 
	remove:function(value){
		this.removeAt(this.find(value));
	},	
	//add element to collection at specific position
	insertAt:function(data,pos){
		if (!pos && pos!==0)	//add to the end by default
			this.push(data);
		else {
			this.splice(pos, 0, data); 
		}
	},
	//return index of element, -1 if it doesn't exists
	find:function(data){ 
		for (var i=0; i<this.length; i++) 
			if (data==this[i]) return i;
		return -1; 
	},
	//execute some method for each element of array
	each:function(functor,master){
		for (var i=0; i < this.length; i++)
			functor.call((master||this),this[i]);
	},
	//create new array from source, by using results of functor 
	map:function(functor,master){
		for (var i=0; i < this.length; i++)
			this[i]=functor.call((master||this),this[i]);
		return this;
	}, 
	filter:function(functor, master){
		for (var i=0; i < this.length; i++)
			if (!functor.call((master||this),this[i])){
				this.splice(i,1);
				i--;
			}
		return this;
	}
};

//hook for documentation generator
if (DEBUG){
	if (window.webix_on_core_ready){
		extend = window.webix_on_core_ready({ extend }).extend;
	}
}

export { extend };