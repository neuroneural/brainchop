import i18n from "./i18n.js";

// converts an object into a string with respect to dates
export function stringify(obj){
	var origin = Date.prototype.toJSON;
	Date.prototype.toJSON = function(){
		return i18n.parseFormatStr(this);
	};

	var result;
	if (obj instanceof Date)
		result = obj.toJSON();
	else
		result = JSON.stringify(obj);

	Date.prototype.toJSON = origin;
	return result;
}