import env from "../webix/env";
import {stringify} from "./stringify";
import DataDriver from "../load/drivers/index";


const storage = {};

storage.prefix = function(scope, storage){
	scope = scope + ".";
	return {
		put:function(name, data){
			return storage.put(scope+name, data);
		},
		get:function(name){
			return storage.get(scope+name);
		},
		remove:function(name){
			return storage.remove(scope+name);
		}
	};
};

storage.local = {
	put:function(name, data){
		if(name && window.JSON && window.localStorage){
			window.localStorage.setItem(name, stringify(data));
		}
	},
	get:function(name){
		if(name && window.JSON && window.localStorage){
			var json = window.localStorage.getItem(name);
			if(!json)
				return null;
			return DataDriver.json.toObject(json);
		}else
			return null;
	},
	remove:function(name){
		if(name && window.JSON && window.localStorage){
			window.localStorage.removeItem(name);
		}
	},
	clear:function(){
		window.localStorage.clear();
	}
};

storage.session = {
	put:function(name, data){
		if(name && window.JSON && window.sessionStorage){
			window.sessionStorage.setItem(name, stringify(data));
		}
	},
	get:function(name){
		if(name && window.JSON && window.sessionStorage){
			var json = window.sessionStorage.getItem(name);
			if(!json)
				return null;
			return DataDriver.json.toObject(json);
		}else
			return null;
	},
	remove:function(name){
		if(name && window.JSON && window.sessionStorage){
			window.sessionStorage.removeItem(name);
		}
	},
	clear:function(){
		window.sessionStorage.clear();
	}
};

storage.cookie = {
	put:function(name, data, domain, expires ){
		if(name && window.JSON){
			document.cookie = name + "=" + escape(stringify(data)) +
			(( expires && (expires instanceof Date)) ? ";expires=" + expires.toUTCString() : "" ) +
			(( domain ) ? ";domain=" + domain : "" ) + 
			(( env.https ) ? ";secure" : "");
		}
	},
	getRaw:function(check_name){
		// first we'll split this cookie up into name/value pairs
		// note: document.cookie only returns name=value, not the other components
		var a_all_cookies = document.cookie.split( ";" );
		var a_temp_cookie = "";
		var cookie_name = "";
		var cookie_value = "";
		var b_cookie_found = false; // set boolean t/f default f

		for (var i = 0; i < a_all_cookies.length; i++ ){
			// now we'll split apart each name=value pair
			a_temp_cookie = a_all_cookies[i].split( "=" );

			// and trim left/right whitespace while we're at it
			cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, "");

			// if the extracted name matches passed check_name
			if (cookie_name == check_name ){
				b_cookie_found = true;
				// we need to handle case where cookie has no value but exists (no = sign, that is):
				if ( a_temp_cookie.length > 1 ){
					cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, "") );
				}
				// note that in cases where cookie is initialized but no value, null is returned
				return cookie_value;
			}
			a_temp_cookie = null;
			cookie_name = "";
		}
		if ( !b_cookie_found ){
			return null;
		}
		return null;
	},
	get:function(name){
		if(name && window.JSON){
			var json = this.getRaw(name);
			if(!json)
				return null;
			return DataDriver.json.toObject(unescape(json));
		}else
			return null;
	},
	remove:function(name, domain){
		if(name && this.getRaw(name)) 
			document.cookie = name + "=" + (( domain ) ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	},
	clear:function(domain){
		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++)
			document.cookie = /^[^=]+/.exec(cookies[i])[0] + "=" + (( domain ) ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";		
	}
};

export default storage;