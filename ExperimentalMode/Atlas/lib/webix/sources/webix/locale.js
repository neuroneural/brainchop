import en from "../i18n/en";
import i18n from "./i18n";

import wDate from "../core/date";
import Number from "../core/number";

import {copy, isArray} from "../webix/helpers";
import template from "./template";


function extend(base,source){
	for (var method in source){
		if(typeof(source[method]) == "object" && !isArray(source[method])){
			if(!base[method]){
				base[method] = {};
			}
			extend(base[method],source[method]);
		}
		else
			base[method] = source[method];
	}
}

const helpers = ["fullDateFormat", "timeFormat", "dateFormat", "longDateFormat", "parseFormat", "parseTimeFormat"];

i18n.setLocale = function(locale){
	if (typeof locale == "string")
		locale = i18n.locales[locale];
	if (locale){
		locale.priceSettings  = copy(locale.priceSettings || locale);
		extend(i18n, locale);
		delete i18n.calendar.monthShort_hash;
		delete i18n.calendar.monthFull_hash;
	}
	for( var i=0; i<helpers.length; i++){
		var key = helpers[i];
		var utc = i18n[key+"UTC"];
		i18n[key+"Str"] = wDate.dateToStr(i18n[key], utc);
		i18n[key+"Date"] = wDate.strToDate(i18n[key], utc);
	}

	const _price_format = template(i18n.price);
	const _price_settings = i18n.priceSettings || i18n;

	i18n.intFormat = Number.numToStr({ groupSize:i18n.groupSize, groupDelimiter:i18n.groupDelimiter, decimalSize : 0});
	i18n.priceFormat = function(value){ return _price_format(Number.format(value, _price_settings)); };
	i18n.numberFormat = Number.format;
};


i18n.locales={ "en-US" : en };
i18n.setLocale("en-US");

export default i18n;