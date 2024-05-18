import Number from "../core/number";

import env from "../webix/env";
import patterns from "../webix/patterns";

import {preventEvent, getSelectionRange, setSelectionRange} from "../webix/html";
import {bind, isUndefined} from "../webix/helpers";
import {_event} from "../webix/htmlevents";

const nav_controls = {
	9:"tab",
	38:"up",
	40:"down",
	37:"left",
	39:"right"
};

const TextPattern = {
	$init:function(config){
		const pattern =  this.defaults.pattern || config.pattern;
		let format = this.defaults.format || config.format;
		config.value = isUndefined(config.value) ? "" :config.value;

		if (pattern || (format && !this.format_setter)){
			this.attachEvent("onKeyPress", function(code, e){
				if(e.ctrlKey || e.altKey || this._settings.readonly || this._custom_format)
					return;

				if(code>105 && code<112) //numpad operators
					code -=64;

				if(nav_controls[code] && code !== 8 && code !==46){  //del && bsp
					return;
				}

				preventEvent(e);
				this._on_key_pressed(e, code);
			});

			this.attachEvent("onAfterRender", this._after_render);
			this.getText = function(){ return this.getInputNode().value; };
			this.$prepareValue = function(value){ return this._pattern(value, false); };
			this._pattern = function(value, mode){
				if (mode === false)
					return this._getRawValue(value);
				else
					return this._matchPattern(value);
			};

			if (format){
				if (typeof format === "object"){
					this._custom_format = format;
				} else {
					format = Number.getConfig(format);
					this._custom_format = {
						parse : function(value){ return Number.parse(value, format); },
						edit : function(value){ return Number.format(value, format); },
					};
				}
			}
		}

		// initialize pattern before value_setter
		if (pattern){
			this._settings.pattern = this.pattern_setter(pattern);
			delete config.pattern;
		}
	},
	pattern_setter:function(value){
		var pattern = patterns[value] || value;

		if (typeof pattern == "string") pattern = { mask: pattern };
		pattern.allow = pattern.allow || /[A-Za-z0-9]/g;

		this._patternScheme(pattern);
		return pattern;
	},
	_init_validation:function(){
		this.config.validate = this.config.validate || bind(function(){
			var value = this.getText();
			var raw = value.replace(this._pattern_chars, "");
			var matches = (value.toString().match(this._pattern_allows) || []).join("");
			return (matches.length == raw.length && value.length == this._settings.pattern.mask.length);
		}, this);
	},
	_after_render:function(){
		var ev =  env.isIE8?"propertychange":"input";
		
		if (!this._custom_format) 
			_event(this.getInputNode(), ev, function(){
				var stamp =  (new Date()).valueOf();
				//dark ie8 magic
				var width = this.$view.offsetWidth; //eslint-disable-line
				if(!this._property_stamp || stamp-this._property_stamp>100){
					this._property_stamp = stamp;
					this.$setValue(this.getText());
				}
			}, {bind:this});

		_event(this.getInputNode(), "blur", function(){
			this._applyChanges();
		}, {bind:this});
	},
	_patternScheme:function(pattern){
		var mask = pattern.mask, scheme = {}, chars = "", count = 0;
		
		for(var i = 0; i<mask.length; i++){
			if(mask[i] === "#"){
				scheme[i] = count; count++;
			}
			else{
				scheme[i] = false;
				if(chars.indexOf(mask[i]) === -1) chars+="\\"+mask[i];
			}
		}
		this._pattern_allows = pattern.allow;
		this._pattern_chars = new RegExp("["+chars+"]", "g");
		this._pattern_scheme = scheme;

		this._init_validation();
	},
	_on_key_pressed:function(e, code){
		var node = this.getInputNode();
		var value = node.value;
		var pos = getSelectionRange(node);
		var chr = "";

		if(code == 8 || code == 46){
			if(pos.start == pos.end){
				if(code == 8) pos.start--;
				else pos.end++;
			}
		}
		else{
			chr = String.fromCharCode(code);
			const isCapsLock = e.getModifierState("CapsLock");
			if (!e.shiftKey && !isCapsLock || e.shiftKey && isCapsLock) chr = chr.toLowerCase();
		}

		value = value.substr(0, pos.start) + chr +value.substr(pos.end);
		pos = this._getCaretPos(chr, value.length, pos.start, code);

		this._input_code = code;
		this.$setValue(value);

		setSelectionRange(node, pos);
	},
	_getCaretPos:function(chr, len, pos, code){
		if((chr && chr.match(this._pattern_allows)) || (code ==8 || code ==46)){
			pos = chr ? pos+1 : pos;
			pos = this._fixCaretPos(pos, code);
		}
		else if(len-1 == pos && code !==8 && code !==46){
			var rest = this._settings.pattern.mask.indexOf("#", pos);
			if(rest>0) pos += rest;
		}
		return pos;
	},
	_fixCaretPos:function(pos, code){
		var prev = pos-(code !== 46)*1;

		if(this._pattern_scheme[prev] === false){
			pos = pos+(code ==8 ? -1: 1);
			return this._fixCaretPos(pos, code);
		}
		if(this._pattern_scheme[pos] === false && code !==8)
			return this._fixCaretPos(pos+1, code)-1;
		return pos;
	},
	_getRawValue:function(value){
		if (this._custom_format)
			return this._custom_format.parse(value);

		value = value || value === 0 ? value : "";
		var matches = value.toString().match(this._pattern_allows) || [];
		return matches.join("").replace(this._pattern_chars, "");
	},
	_matchPattern:function(value){
		if (this._custom_format)
			return this._custom_format.edit(this._custom_format.parse(value));

		var raw = this._getRawValue(value),
			pattern = this._settings.pattern.mask,
			mask = this._settings.pattern.mask,
			scheme = this._pattern_scheme,
			end = false,
			index = 0,
			rawIndex = 0,
			rawLength = 0;

		for(var i in scheme){
			if(scheme[i]!==false){
				if(!end){
					index = i*1;
					rawIndex = scheme[i];
					var rchar = raw[rawIndex]||"";
					var next = raw[rawIndex+1];

					pattern = (rchar?pattern.substr(0, index):"") + rchar +(rchar && next?pattern.substr(index + 1):"");
					if(!next) end = true;
				}
				rawLength++;
			}
		}

		//finalize value with subsequent mask chars 
		var icode = this._input_code;
		if((icode && icode !== 8) || (!icode && rawLength-1 === rawIndex && pattern.length < mask.length)){
			if(raw){
				var nind = index+1;
				if(mask.charAt(nind)!=="#" && pattern.length < mask.length){
					var lind = mask.indexOf("#", nind);
					if(lind<0) lind = mask.length;
					pattern += mask.substr(nind, lind-nind);
				}
			}
			else if(icode !==46){
				pattern += mask.substr(0, mask.indexOf("#"));
			}
		}
		this._input_code = null;
		return pattern;
	}
};

export default TextPattern;