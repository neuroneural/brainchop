import {$active} from "../../webix/skin";
import {extend, isUndefined} from "../../webix/helpers";

export const errorMessage = "non-existing view for export";

function getDataHelper(key, column, raw){
	if (!raw && column.format)
		return function(obj){ return column.format(obj[key]); };

	return function(obj){ return obj[key]; };
}

function getHeaderText(view, header){
	let text = header.text;
	if (header.contentId){
		const content = view.getHeaderContent(header.contentId);
		if (content && !content.type.$icon)
			text = content.getValue(true);
	}
	return (text||"").toString().replace( /<[^>]*>/gi, "");
}

export function getStyles(r, c, styles){
	//row index, column index, styles array
	if(styles[r] && styles[r][c])
		return styles[r][c];
	return {};
}

export function getExportScheme(view, options){
	const scheme = [];
	let h_count = 0, f_count = 0;
	const isTable = view.getColumnConfig;
	let columns = options.columns;
	const raw = !!options.rawValues;
	const isTree = view.data.name == "TreeStore";

	let treeLines = options.treeLines;
	if(treeLines === true || isUndefined(treeLines))
		treeLines = "value";

	scheme.heights = {};

	if(options.hidden || options.hide){
		scheme.hiddenCols = {};
		scheme.hiddenRows = {};
	}

	if (!columns){
		columns = [];
		if (isTable){
			const order = view._hidden_column_order;
			if(options.hidden && order.length){
				for (let i = 0; i < order.length; i++){
					const col = view.getColumnConfig(order[i]);
					if(!view.isColumnVisible(col.id))
						scheme.hiddenCols[col.id] = 1;
					columns.push(col);
				}
			}
			else
				columns = columns.concat(view._columns);
		}
		else {
			const obj = view.data.pull[view.data.order[0]];
			for (let key in obj)
				if(key !== "id" && key[0] != "$")
					columns.push({id:key, isTree: isTree && key === treeLines});
		}
	}
	else if(!columns.length){
	//export options are set as - columns:{ rank:true, title:{ header:"custom"}}
		const arr = [];
		for(let key in columns)
			arr.push(extend({ id:key}, extend({}, columns[key])));
		columns = arr;
	}

	if (options.ignore)
		for (let i=columns.length-1; i>=0; i--)
			if (options.ignore[columns[i].id])
				columns.splice(i,1);

	if (options.id)
		scheme.push({ id:"id", width:50, header:" ", template:function(obj){ return obj.id; }});

	if (options.flatTree){
		const flatKey = options.flatTree.id;
		const copy = [].concat(options.flatTree.columns);
		const fill = [];
		const fillMode = !!options.flatTree.fill;
		for (let i = 1; i <= copy.length; i++)
			copy[i-1].template = (function(i){ 
				return function(obj){ 
					return obj.$level == i ? (fill[i]=obj[flatKey]) : ((fillMode && i<obj.$level)?fill[i]:""); 
				};
			})(i);

		let index = 0;
		for (let i = columns.length-1; i >= 0; i--)
			if (columns[i].id === flatKey)
				index = i;

		columns = [].concat(columns.slice(0,index)).concat(copy).concat(columns.slice(index+1));
	}

	let treeColumn;

	for (let j = 0; j < columns.length; j++) {
		let column = columns[j];
		let key = column.id;

		if (column.noExport) continue;

		// raw mode has sense only for datatable
		// in other cases we don't have built-in data templates
		let rawColumn = raw && isTable;
		if (isTable){
			const sourceColumn = view.getColumnConfig(key);
			// when these's no column to take raw data from, or custom template defined - ignore raw mode
			if (column.template && (!sourceColumn || sourceColumn.template != column.template))
				rawColumn = false;
			if(sourceColumn)
				column = extend(extend({}, column), sourceColumn);
		}

		let record = {
			id:         column.id,
			template:   (( rawColumn || !column.template) ? getDataHelper(key, column, raw)  : column.template ),
			width:      ((column.width   || 200) * (options.export_mode==="excel"?8.43/70:1 )),
			header:     (column.header!==false?(column.header||key)  : "")
		};

		if(isTree && key === treeLines)
			record.isTree = treeColumn = true;

		if(options.export_mode === "excel"){
			extend(record, {
				type: column.exportType || "",
				format:column.exportFormat || ""
			});
			if(column.hidden){
				if(!scheme.hiddenCols)
					scheme.hiddenCols = {};
				scheme.hiddenCols[column.id] = 1;
			}
		}

		if(typeof record.header === "string") record.header = [{text:record.header}];
		else record.header = [].concat(record.header);

		for(let i = 0; i<record.header.length; i++)
			record.header[i] = record.header[i] ? getHeaderText(view, record.header[i]) : "";

		h_count = Math.max(h_count, record.header.length);

		if(view.config.footer){
			let footer = column.footer || "";
			if(typeof footer == "string") footer = [{text:footer}];
			else footer = [].concat(footer);

			for(let i = 0; i<footer.length; i++)
				footer[i] = footer[i] ? getHeaderText(view, footer[i]) : "";

			record.footer = footer;
			f_count = Math.max(f_count, record.footer.length);
		}
		scheme.push(record);
	}


	if(!treeColumn && isTree && options.treeLines != treeLines && scheme[0])
		scheme[0].isTree = true;

	for(let i =0; i<scheme.length; i++){

		let diff = h_count-scheme[i].header.length;
		for(let d=0; d<diff; d++)
			scheme[i].header.push("");

		if(view.config.footer){
			diff = f_count-scheme[i].footer.length;
			for(let d=0; d<diff; d++)
				scheme[i].footer.push("");
		}
	}

	return scheme;
}

export function getFileName(name, extension){
	if(name)
		name = name.replace(/[/?\\<>:*|"]/g, "").substring(0, 150);
	return `${name || "Data"}.${extension}`;
}

export function getExportData(view, options, scheme){
	const filterHTML = !!options.filterHTML;
	const htmlFilter = /<[^>]*>/gi;
	let data = [];
	let header, headers;
	const mode = options.export_mode;

	if((mode === "excel" || mode == "csv") && options.docHeader){
		data = [[(options.docHeader.text || options.docHeader).toString()], [""]];
		if(mode === "excel" && options.docHeader.height)
			scheme.heights[0] = options.docHeader.height;
	}

	if( options.header !== false && scheme.length){
		for(let h=0; h < scheme[0].header.length; h++){
			headers = [];
			for (let i = 0; i < scheme.length; i++){ 
				header = "";
				if(scheme[i].header[h]){
					header = scheme[i].header[h];
					if (filterHTML)
						header = scheme[i].header[h] = header.replace(htmlFilter, "");
				}
				headers.push(header);
			}

			if(mode =="excel" && view._columns && options.heights !==false &&
			(view._headers[h] !== $active.barHeight || options.heights == "all")
			) scheme.heights[data.length] = view._headers[h];

			if (mode !== "pdf")
				data[data.length] = headers;
		}
	}
	options.yCorrection = (options.yCorrection||0)-data.length;

	const treeline = (options.flatTree || options.plainOutput) ? "" : "-";

	view.data.each(function(item, index){
		if(!options.filter || options.filter(item)){
			const reallyHidden = options.hidden && view.data._filter_order && view.getIndexById(item.id) == -1;
			if((options.hide && options.hide(item)) || reallyHidden){
				const header = (options.docHeader?2:0)+(options.header===false?0:scheme[0].header.length);
				scheme.hiddenRows[header+index] = 1;
			}

			if(this.data._scheme_export){
				item = view.data._scheme_export(item);
			}

			let line = [];
			for (let i = 0; i < scheme.length; i++){
				let column = scheme[i], cell = null;
				//spreadsheet use muon to store data, get value via $getExportValue
				if(view.$getExportValue)
					cell = view.$getExportValue(item.id, column.id, options);
				//datatable math
				else if(options.math && item["$"+column.id] && item["$"+column.id].charAt(0) =="=")
					cell = item["$"+column.id];
				if(this._spans_pull){
					let span = this.getSpan(item.id, column.id);
					if(span && span[4] && span[0] == item.id && span[1] == column.id){
						cell = span[4];
						if(filterHTML && typeof cell === "string")
							cell = cell.replace(htmlFilter, "");
					}
				}
				if(!cell){
					cell = column.template(item, view.type, item[column.id], column, i);
					if (!cell && cell !== 0) cell = "";
					if(column.isTree && treeline)
						cell = " "+Array(item.$level).join(treeline)+" "+cell;
					if (filterHTML && typeof cell === "string"){
						cell = cell.replace(htmlFilter, "");
					}
					//remove end/start spaces(ex.hierarchy data)
					if (typeof cell === "string" && mode === "csv")
						cell = cell.trim();
					//for multiline data
					if (typeof cell === "string" && (mode === "excel" || mode === "csv")){
						cell = cell.replace(/<br\s*\/?>/mg,"\n");
					}
				}
				line.push(cell);
			}

			if(mode =="excel" && view._columns && options.heights !== false &&
			((item.$height && item.$height !== $active.rowHeight) || options.heights == "all")
			) scheme.heights[data.length] = item.$height || this.config.rowHeight;

			data.push(line);
		}
	}, view, options.hidden);

	if( options.footer !==false ){
		let f_count = scheme[0].footer?scheme[0].footer.length:0;
		for (let f = 0; f < f_count; f++){
			let footers  = [];
			for(let i = 0; i<scheme.length; i++){
				let footer = scheme[i].footer[f];
				if (filterHTML) footer = scheme[i].footer[f] = footer.toString().replace(htmlFilter, "");
				footers.push(footer);
			}

			if(mode =="excel" && view._columns && options.heights !==false &&
			(view._footers[f] !== $active.barHeight || options.heights=="all")
			) scheme.heights[data.length] = view._footers[f];

			if(mode !== "pdf")
				data.push(footers);
		}
	}

	if(mode ==="excel" && options.docFooter){
		data = data.concat([[], [(options.docFooter.text || options.docFooter).toString()]]);
		if(options.docFooter.height)
			scheme.heights[data.length-1] = options.docFooter.height;
	}

	return data;
}