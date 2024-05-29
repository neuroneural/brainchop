import env from "./env";
// Only IE8 doesn't support defineProperty
if (env.isIE8){
	// Not really a polyfill, silence the esModule flag
	Object.defineProperty = function(obj, key, data){
		obj[key] = data.value;
	};
}