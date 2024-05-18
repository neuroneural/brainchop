import {errorMessage, getExportScheme, getExportData, getStyles, getFileName} from "./common";

import promise from "../../thirdparty/promiz";
import require from "../../load/require";
import env from "../../webix/env";

import {download} from "../../webix/html";
import {extend, isArray} from "../../webix/helpers";
import {$$} from "../../ui/core";
import {assert} from "../../webix/debug";

export const toExcel = function(id, options){
	options = options || {};
	options.export_mode = "excel";

	id = isArray(id)?id:[id];
	let views = [];

	for(let i = 0; i<id.length; i++){
		if(!id[i].id) id[i]  = { id:id[i] }; 
		let view = $$(id[i].id);
		const viewOptions = extend(id[i].options || {}, options);
		if (view && view.$exportView)
			view = view.$exportView(viewOptions);

		assert(view, errorMessage);

		//$exportView returns array
		if(isArray(view))
			views = views.concat(view);
		else if(view.data && view.data.pull){
			//spreadsheet and excelviewer require plain data output first
			const scheme = getExportScheme(view, viewOptions);
			views.push({
				scheme : scheme,
				exportData:getExportData(view, viewOptions, scheme),
				spans:(viewOptions.spans ? getSpans(view, viewOptions) : []),
				viewOptions: viewOptions
			});
		}
	}
	if(options.dataOnly) return views;

	const defer = promise.defer(); 

	return require(env.cdn + "/extras/xlsx.core.styles.min.js").then(function(){
		if(!views.length) return defer.reject(errorMessage);

		const wb = { SheetNames:[], Sheets:{}, Workbook:{ WBProps :{}, Names:[] }};

		for(let i = 0; i<views.length; i++){
			const viewOptions = views[i].viewOptions;
			const scheme = views[i].scheme;
			const result = views[i].exportData;
			const spans  = views[i].spans;
			const ranges =  views[i].ranges || [];
			const styles = views[i].styles || [];
			const data   = getExcelData(result, scheme, spans, styles, viewOptions);
			let sname  = (viewOptions.name || "Data"+(i+1)).replace(/[*?:[\]\\/]/g,"").replace(/&/g, "&amp;").substring(0, 31);

			//avoid name duplication
			let k = i;
			while(wb.SheetNames.indexOf(sname) != -1)
				sname = "Data"+(++k);

			wb.SheetNames.push(sname);
			wb.Sheets[sname] = data;
			wb.Workbook.Names = wb.Workbook.Names.concat(ranges);
		}

		/* global XLSX */
		const xls = XLSX.write(wb, {bookType:"xlsx", bookSST:false, type: "binary"});
		const filename =  getFileName(options.filename, "xlsx");

		const blob = new Blob([str2array(xls)], { type: "application/xlsx" });
		if(options.download !== false)
			download(blob, filename);
		defer.resolve(blob);
		return defer;
	});
};

function str2array(s) {
	const buf = new ArrayBuffer(s.length);
	const view = new Uint8Array(buf);
	for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

const types = { number:"n", date:"n", string:"s", boolean:"b"};
const table = "_table";
function getExcelData(data, scheme, spans, styles, options) {
	const ws = {};
	const range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(let R = 0; R != data.length; ++R) {
		for(let C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;

			const cell = {v: data[R][C]};
			if(cell.v === null) continue;
			const cell_ref = XLSX.utils.encode_cell({c:C,r:R});

			const stringValue = cell.v.toString();
			const isFormula = (stringValue.charAt(0) === "=");

			if(styles){
				const cellStyle = getStyles(R, C, styles);
				if(cellStyle.format){
					cell.z = cellStyle.format;
					delete cellStyle.format;
				}
				if(cellStyle.type){
					cell.t = types[cellStyle.type];
					delete cellStyle.type;
				}
				cell.s = cellStyle;
			}

			// set type based on column's config
			// skip headers and formula based cells
			const header = (options.docHeader?2:0)+scheme[0].header.length;
			if(R>=header && !isFormula){
				const column = scheme[C];
				if(column.type && !cell.t) cell.t = (types[column.type] || "");
				if(column.format && !cell.z) cell.z = column.format;
			}
			// set type based on cell's value
			if(options.stubCells && !stringValue)
				cell.t = "z";
			else if(cell.v instanceof Date){
				cell.t = cell.t || "n";
				cell.z = cell.z || XLSX.SSF[table][14];
				cell.v = excelDate(cell.v);
			}
			else if(isFormula){
				cell.t = cell.t || "n";
				cell.f = cell.v.substring(1);
				delete cell.v;
			}
			else if(!cell.t){
				if(typeof cell.v === "boolean")
					cell.t = "b";
				else if(typeof cell.v === "number" || parseFloat(cell.v) == cell.v){
					cell.v = cell.v*1;
					cell.t = "n";
				}
				else {
					// convert any other object to a string
					cell.v = stringValue;
					cell.t = "s";
				}
			}

			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);

	ws["!rows"] = getRowHeights(scheme);
	ws["!cols"] = getColumnsWidths(scheme);
	if(spans.length)
		ws["!merges"] = spans;

	return ws;
}

function getRowHeights(scheme){
	const heights = scheme.heights;
	for(const i in heights)
		heights[i] = {hpx:heights[i], hpt:heights[i]*0.75 };

	const hidden = scheme.hiddenRows;
	if(hidden)
		for(const i in hidden){
			if(!heights[i])
				heights[i] = {};
			heights[i].hidden = 1;
		}

	return heights;
}

function getSpans(view, options){
	const isTable = view.getColumnConfig;
	const pull = view._spans_pull;
	let spans = [];

	if(isTable){
		if(options.header!==false)
			spans = getHeaderSpans(view, options, "header", spans); 

		if(pull){
			const xc = options.xCorrection || 0;
			const yc = options.yCorrection || 0;
			for(const row in pull){
				//{ s:{c:1, r:0}, e:{c:3, r:0} }
				const cols = pull[row];
				for(const col in cols){
					let colIndex = view.getColumnIndex(col);

					const rowId = view.getItem(row).id;
					let rowIndex = view.getIndexById(rowId);

					if(options.hidden){
						const hiddenColsOrder = view._hidden_column_order;
						if(hiddenColsOrder.length){
							const colId = view.getColumnConfig(col).id;
							colIndex = hiddenColsOrder.indexOf(colId);
						}

						const hiddenRowsOrder = view.data._filter_order;
						if(hiddenRowsOrder && hiddenRowsOrder.length)
							rowIndex = hiddenRowsOrder.indexOf(rowId);
					}

					const sc = colIndex - xc;
					const sr = rowIndex - yc;
					if(sc<0||sr<0) //hidden cols/rows
						continue;
					const ec = sc+cols[col][0]-1;
					const er = sr+(cols[col][1]-1);

					spans.push({ s:{c:sc, r:sr}, e:{c:ec, r:er} });
				}
			}
		}
		if(options.footer!==false)
			spans = getHeaderSpans(view, options, "footer", spans);
	}

	return spans;
}

function getHeaderSpans(view, options, group, spans){
	const columns = view.config.columns;
	const delta = (options.docHeader?2:0)+(group == "header" ? 0 :((options.header!==false?view._headers.length:0)+view.count()));

	for(let i=0; i<columns.length; i++){
		const header = columns[i][group];
		for(let h = 0; h<header.length; h++){
			if(header[h] && (header[h].colspan || header[h].rowspan)){
				spans.push({
					s:{ c:i, r:h+delta},
					e:{ c:i+(header[h].colspan||1)-1, r:h+(header[h].rowspan ||1)-1+delta }
				});
			}
		}
	}
	return spans;
}

function excelDate(date) {
	const returnDateTime = 25569 + ((date.getTime() - (date.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
	return returnDateTime.toString().substr(0,20);
}

function getColumnsWidths(scheme){
	const wscols = [];
	for (let i = 0; i < scheme.length; i++){
		const col = scheme[i];
		wscols.push({
			wch: col.width,
			hidden: scheme.hiddenCols ? scheme.hiddenCols[ col.id ] : 0
		});
	}

	return wscols;
}