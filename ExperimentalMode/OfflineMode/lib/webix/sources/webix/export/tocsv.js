import {errorMessage, getExportScheme, getExportData, getFileName} from "./common";

import csv from "../../webix/csv";
import promise from "../../thirdparty/promiz";

import {download} from "../../webix/html";
import {$$} from "../../ui/core";
import {assert} from "../../webix/debug";

export const toCSV = function(id, options){
	options = options || {};

	let view = $$(id);
	if (view && view.$exportView)
		view = view.$exportView(options);
	assert(view, errorMessage);
	if(!view) return promise.reject(errorMessage);

	options.export_mode = "csv";
	options.filterHTML = true;

	const scheme = getExportScheme(view, options);
	const result = getExportData(view, options, scheme);

	const data = getCsvData(result, scheme);
	const filename = getFileName(options.filename, "csv");

	const blob = new Blob(["\uFEFF" + data], { type: "text/csv" });
	if(options.download !== false)
		download(blob, filename);

	return promise.resolve(blob);
};

function getCsvData(data) {
	return csv.stringify(data);
}