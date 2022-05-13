import {create} from "../webix/html.js";
import {exec} from "../webix/helpers.js";
import {ajax} from "./ajax.js";

import Promise from "../thirdparty/promiz";

const _modules = {};	//hash of already loaded modules

//loads module from external js file
export default function require(module, callback, master){
	var promise = Promise.defer();

	if (callback && callback !== true)
		promise = promise.then(function(){ callback.call(master || this); });

	if (require.disabled){
		promise.resolve();
		return promise;
	}

	//multiple files required at once
	if (typeof module != "string"){
		var count = module.length||0;
		
		if (!count){
			// { file: true, other: true }
			for (let file in module) count++; // eslint-disable-line
			let callback2 = function(){
				count--;
				if (count === 0)
					promise.resolve();
			};
			for (let file in module)
				require(file).then(callback2, () => promise.reject());
		} else {
			// [ file, other ]
			let callback2 = function(){
				if (count){
					count--;
					require(module[module.length - count - 1])
						.then(callback2, () => promise.reject());

				} else {
					promise.resolve();
				}
			};
			callback2();
		}
		return promise;
	}

	if (_modules[module] !== true){
		const fullpath = module;

		if (callback === true){
			//sync mode
			exec( ajax().sync().get(fullpath).responseText );
			_modules[module]=true;
			return promise.resolve();
		}

		if (!_modules[module])	//first call
			_modules[module] = [promise];
		else {
			_modules[module].push(promise);
			return promise;
		}

		const onerror = function(){
			const calls = _modules[module];
			_modules[module] = false;
			for (var i=0; i<calls.length; i++)
				calls[i].reject();
		};

		const onload = function(){
			const calls = _modules[module];
			_modules[module] = true;
			for (var i=0; i<calls.length; i++)
				calls[i].resolve();
		};

		//css, async, no waiting
		var parts = module.split("?");
		if (parts[0].substr(parts[0].length-4) == ".css") {
			var link = create("LINK",{  type:"text/css", rel:"stylesheet", href:fullpath});
			link.onload = onload;
			link.onerror = onerror;

			document.getElementsByTagName("head")[0].appendChild(link);
		} else {
			var newScript = document.createElement("script");
			newScript.onload = onload;
			newScript.onerror = onerror;

			document.getElementsByTagName("head")[0].appendChild(newScript);
			newScript.src = fullpath;
		}
	} else 
		promise.resolve();

	return promise;
}