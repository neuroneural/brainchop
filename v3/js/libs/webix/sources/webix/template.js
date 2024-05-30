/*
	Template - handles html templates
*/

import {uid} from "./helpers";
import {getValue} from "./html";
import env from "./env";
import {ajax} from "../load/ajax";
import {assert} from "./debug";

import CodeParser from "../core/codeparser";

var _cache = {};
var _csp_cache = {};
var newlines = new RegExp("(\\r\\n|\\n)","g");
var quotes   = new RegExp("(\\\")","g");
var slashes  = new RegExp("(\\\\)","g");
var escape = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#x27;",
	"`": "&#x60;"
};
var badChars = /[&<>"'`]/g;
var escapeChar = function(chr) {
	return escape[chr] || "&amp;";
};


function template(str){
	if (typeof str == "function") return str;
	if (_cache[str])
		return _cache[str];
		
	str=(str||"").toString();			
	if (str.indexOf("->")!=-1){
		var teststr = str.split("->");
		switch(teststr[0]){
			case "html": 	//load from some container on the page
				str = getValue(teststr[1]);
				break;
			case "http": 	//load from external file
				str = new ajax().sync().get(teststr[1],{uid:uid()}).responseText;
				break;
			default:
				//do nothing, will use template as is
				break;
		}
	}
		
	//supported idioms
	// {obj.attr} => named attribute or value of sub-tag in case of xml
	str=(str||"").toString();		

	// Content Security Policy enabled
	if(env.strict){
		if (!_csp_cache[str]){
			_csp_cache[str] = [];

			// get an array of objects (not sorted by position)
			var temp_res = [];
			str.replace(/\{obj\.([^}?]+)\?([^:]*):([^}]*)\}/g,function(search,s1,s2,s3,pos){
				temp_res.push({pos: pos, str: search, fn: function(obj){
					return obj[s1]?s2:s3;
				}});
			});
			str.replace(/\{common\.([^}(]*)\}/g,function(search,s,pos){
				temp_res.push({pos: pos, str: search, fn: function(_,common){
					return common[s]||"";
				}});
			});
			str.replace(/\{common\.([^}(]*)\(\)\}/g,function(search,s,pos){
				temp_res.push({pos: pos, str: search, fn: function(obj,common){
					return (common[s]?common[s].apply(this, arguments):"");
				}});
			});
			str.replace(/\{obj\.([^:}]*)\}/g,function(search,s,pos){
				temp_res.push({pos: pos, str: search, fn: function(obj){
					return obj[s];
				}});
			});
			str.replace("{obj}",function(search,pos){
				temp_res.push({pos: pos, str: search, fn: function(obj){
					return obj;
				}});
			});
			str.replace(/#([^#'";, ]+)#/gi,function(search,s,pos){
				if(s.charAt(0)=="!"){
					s = s.substr(1);
					temp_res.push({pos: pos, str: search, fn: function(obj){
						if(s.indexOf(".")!= -1)
							obj = CodeParser.collapseNames(obj); // apply complex properties
						return template.escape(obj[s]);
					}});
				}
				else{
					temp_res.push({pos: pos, str: search, fn: function(obj){
						if(s.indexOf(".")!= -1)
							obj = CodeParser.collapseNames(obj); // apply complex properties
						return obj[s];
					}});
				}

			});

			// sort template parts by position
			temp_res.sort(function(a,b){
				return (a.pos > b.pos)?1:-1;
			});

			// create an array of functions that return parts of html string
			if(temp_res.length){
				var lastPos = 0;
				var addStr = function(str,n0,n1){
					_csp_cache[str].push(function(){
						return str.slice(n0,n1);
					});
				};
				for(var i = 0; i< temp_res.length; i++){
					var pos = temp_res[i].pos;
					addStr(str,lastPos,pos);
					_csp_cache[str].push(temp_res[i].fn);
					lastPos = pos + temp_res[i].str.length;
				}
				addStr(str,lastPos,str.length);
			}
			else
				_csp_cache[str].push(function(){return str;});
		}
		return function(){
			var s = "";
			for(var i=0; i < _csp_cache[str].length;i++){
				s += _csp_cache[str][i].apply(this,arguments);
			}
			return s;
		};
	}

	let helpers = false;
	str=str.replace(slashes,"\\\\");
	str=str.replace(newlines,"\\n");
	str=str.replace(quotes,"\\\"");

	str=str.replace(/\{obj\.([^}?]+)\?([^:]*):([^}]*)\}/g,"\"+(obj.$1?\"$2\":\"$3\")+\"");
	str=str.replace(/\{common\.([^}(]*)\}/g,"\"+(common.$1||'')+\"");
	str=str.replace(/\{common\.([^}(]*)\(\)\}/g,"\"+(common.$1?common.$1.apply(this, arguments):\"\")+\"");
	str=str.replace(/\{obj\.([^}]*)\}/g,"\"+(obj.$1)+\"");
	str=str.replace("{obj}","\"+obj+\"");
	str=str.replace(/#([^#'";, ]+)#/gi,function(str, key){
		if (key.charAt(0)=="!"){
			helpers = true;
			return "\"+template.escape(obj."+key.substr(1)+")+\"";
		} else
			return "\"+(obj."+key+")+\"";
	});

	try {
		if (helpers){
			const temp = Function("obj","common","marks", "value", "template", "return \""+str+"\";");
			_cache[str] = function(a,b,c,d){ 
				return temp(a,b,c,d,template);
			};
		} else {
			_cache[str] = Function("obj","common","return \""+str+"\";");
		}
	} catch(e){
		assert(0, "Invalid template:"+str);
	}

	return _cache[str];
}



template.escape  = function(str){
	if (str === undefined || str === null) return "";
	return (str.toString() || "" ).replace(badChars, escapeChar);
};
template.empty=function(){	return "";	};

export default template;