import {errorMessage, getExportScheme, getExportData, getStyles, getFileName} from "./common";

import i18n from "../../webix/i18n";
import promise from "../../thirdparty/promiz";
import require from "../../load/require";
import env from "../../webix/env";

import {download} from "../../webix/html";
import {isArray} from "../../webix/helpers";
import {extend, isUndefined} from "../../webix/helpers";
import {$$} from "../../ui/core";
import {assert} from "../../webix/debug";

let font = {};
export const toPDF = function(id, options){
	options = options || {};

	options.export_mode = "pdf";

	options.fontName = options.fontName || "pt-sans.regular";
	options.boldFontName = options.boldFontName || "pt-sans.bold";

	id = isArray(id)?id:[id];
	let views = [];

	for (let i = 0; i < id.length; i++) {
		if(!id[i].id) id[i]  = { id:id[i] }; 

		let view = $$(id[i].id);

		if(view){
			const viewOptions = extend(id[i].options || {}, options);
			const display = viewOptions.display || "table";
			if(viewOptions.display == "image")
				delete viewOptions.styles;

			if(view.$exportView)
				view = view.$exportView(viewOptions);

			//$exportView returns array
			if(isArray(view)){
				views = views.concat(view);
				if(options.autowidth)
					getAutowidth(viewOptions, options);
			}
			else{
				//display table should be first (in case of styles:true $exportView adds styles to the first view)
				if(display == "table" || display == "all"){
					if(view.data && view.data.pull){
						const scheme = getExportScheme(view, viewOptions);
						views.push({
							scheme, 
							exportData: getExportData(view, viewOptions, scheme),
							viewOptions
						});
						if(options.autowidth)
							getAutowidth(view, options, scheme);
					}
				}
				if(display == "image" || display == "all"){
					const node = viewOptions._hidden ? cloneNodeWithStyles(view.$view) : view.$view;

					views.push({ node, viewOptions });
					if(options.autowidth)
						getAutowidth(view, options);
				}
			}
		}
		assert(view, errorMessage);
	}

	if(options.dataOnly)
		return views;

	return require([
		env.cdn + "/extras/pdfjs.js", env.cdn + "/extras/html2canvas-1.0.min.js"
	]).then(function(){
		if(views.length == 0)
			return promise.reject(errorMessage);

		if(font[options.fontName] && font[options.boldFontName]){
			options._export_font = font[options.fontName];
			options._export_font_bold = font[options.boldFontName];
			return getPdfData(views, options).then(function(pdf){
				return getBlob(pdf, options);
			});
		}
		else{
			const defer = promise.defer();
			/* global pdfjs */
			pdfjs.load(options.fontURL||env.cdn + "/extras/"+options.fontName+".ttf", function(err, regular){
				if(err)
					return defer.reject(err);
				pdfjs.load(options.boldFontURL||env.cdn + "/extras/"+options.boldFontName+".ttf", function(err, bold){
					options._export_font = font[options.fontName] = new pdfjs.TTFFont(regular);
					options._export_font_bold = font[options.boldFontName] = err ? null : new pdfjs.TTFFont(bold);

					defer.resolve(
						getPdfData(views, options).then(function(pdf){
							return getBlob(pdf, options);
						})
					);
				});
			});
			return defer;
		}
	});
};

function getBlob(pdf, options){
	const filename = getFileName(options.filename, "pdf");
	const blob = new Blob([pdf.toString()], { type: "application/pdf" });

	if(options.download !== false)
		download(blob, filename);
	return blob;
}

function getPdfData(views, options){
	const doc = addPDFDoc(options);
	let promises = [];
	for (let i = 0; i < views.length; i++) {
		if(views[i].node)
			promises.push(getPDFImage(views[i].node));
		else
			promises.push(promise.resolve());
	}

	return promise.all(promises).then(function(images){
		for(let i = 0; i < promises.length; i++){
			const viewOptions = views[i].viewOptions;
			if(viewOptions.textBefore)
				addText(doc, "before", viewOptions.textBefore);

			if(images[i])
				doc.image(images[i], {align:"center"});
			else{
				viewOptions._export_font_bold = options._export_font_bold;
				addPDFTable(views[i], doc);
			}

			if(viewOptions.textAfter)
				addText(doc, "after", viewOptions.textAfter);
			if(i != views.length - 1)
				doc.pageBreak();
		}
		return addPDFHeader(doc, options);
	});
}

function addText(doc, type, text){
	if(type == "after")
		doc.text().br();
	if(typeof text == "string")
		text = {text:text};

	doc.text(text.text, text.options || {});
	if(type == "before")
		doc.text().br();
}

function getPDFImage(node){
	const hidden = !document.body.contains(node);
	if(hidden){
		//node is a cloneNode of the real view, so it shouldn't be visible
		document.body.appendChild(node);
		node.style.position = "absolute";
		node.style.left = "-9999px";
	}

	return window.html2canvas(
		node,
		{
			background:"#fff",
			logging:false,
			useCORS:true
		})
		.then(function(canvas){
			const image = canvas.toDataURL("image/jpeg");
			const binary_string =  window.atob(image.split("base64,")[1]);
			const length = binary_string.length;
			const bytes = new Uint8Array(length);
			for (let i = 0; i < length; i++)
				bytes[i] = binary_string.charCodeAt(i);
			return new pdfjs.Image(bytes.buffer);
		})
		.finally(function(){
			if(hidden)
				document.body.removeChild(node);
		});
}

export function getAutowidth(view, options, scheme){
	const prop = options.orientation && options.orientation == "landscape" ? "height" : "width";
	let width;

	if(scheme){
		width = 80; //paddings
		for(let i = 0; i<scheme.length; i++)
			width += scheme[i].width;
	}
	else if(view.$width)
		width = view.$width;
	else //'view' can be local settings and we need to compare them with common ones
		width = view[prop];

	options[prop] = Math.max(options[prop] || 0, width || 0);
}

function addPDFDoc(options){
	let width = options.width||595.296, height = options.height || 841.896;// default A4 size

	if(options.orientation && options.orientation ==="landscape")
		height = [width, width = height][0];

	return new pdfjs.Document({
		padding: 40,
		font: options._export_font,
		threshold:256,
		width,
		height
	});
}

function addPDFTable(view, doc){
	const scheme = view.scheme;
	const data = view.exportData;
	const options = view.viewOptions;
	const styles = view.styles;

	options.header = (isUndefined(options.header) || options.header === true) ? {} : options.header;
	options.footer = (isUndefined(options.footer) || options.footer === true) ? {} : options.footer;
	options.table = options.table || {};

	//render table
	const h_count = options.header === false ? 0: scheme[0].header.length;
	const f_count = (options.footer === false || !scheme[0].footer) ? 0: scheme[0].footer.length;

	const colWidths = [];
	for(let i = 0; i<scheme.length; i++)
		colWidths[i] = scheme[i].width;

	const tableOps = extend(options.table, {
		borderWidth: 1,height:20, lineHeight:1.1,
		borderColor: 0xEEEEEE, backgroundColor: 0xFFFFFF, color:0x666666,
		textAlign:"left", paddingRight:10, paddingLeft:10,
		headerRows:h_count, widths: colWidths.length?colWidths:["100%"]
	});

	const table = doc.table(tableOps);
	const boldFont = options._export_font_bold;

	//render table header
	if(h_count){
		const headerOps = extend(options.header, {
			borderRightColor:0xB0CEE3, borderBottomColor:0xB0CEE3,
			color:0x4A4A4A, backgroundColor:0xD2E3EF,
			height:27, lineHeight:1.2
		});

		for(let i = 0; i<h_count; i++){
			const header = table.tr(headerOps);
			for(let s=0; s<scheme.length; s++){
				const cellStyle = styles ? getStyles(i, s, styles) : {};
				if(boldFont && cellStyle.bold)
					cellStyle.font = boldFont;
				header.td(scheme[s].header[i].toString(), cellStyle);
			}
		}
	}

	//render table data
	for(let r=0; r<data.length;r++){
		let row = table.tr({});
		for(let c=0; c< data[r].length; c++){
			const cellStyle = styles ? getStyles(r+h_count, c, styles) : {};
			if(boldFont && cellStyle.bold)
				cellStyle.font = boldFont;
			row.td(data[r][c], cellStyle);
		}
	}

	//render table footer
	if(f_count){
		let footerOps = extend(options.footer, {
			borderRightColor:0xEEEEEE, borderBottomColor:0xEEEEEE,
			backgroundColor: 0xFAFAFA, color:0x666666,
			height:27, lineHeight:1.2
		});

		for(let i = 0; i<f_count; i++){
			const beforeCount = h_count + data.length;
			let footer = table.tr(footerOps);
			for(let s=0; s<scheme.length; s++){
				const cellStyle = styles ? getStyles(i+beforeCount, s, styles) : {};
				if(boldFont && cellStyle.bold)
					cellStyle.font = boldFont;
				footer.td(scheme[s].footer[i].toString(), cellStyle);
			}
		}
	}
}

function addPDFHeader(doc, options){
	//doc footer
	if(options.docFooter !== false){
		let ft = doc.footer();
		ft.text({
			color: 0x666666, textAlign:"center"
		}).append((i18n.dataExport.page||"Page")).pageNumber().append("  "+(i18n.dataExport.of || "of")+"  ").pageCount();
	}

	const horder = { text:0, image:1};

	//doc header, configurable
	if(options.docHeader){
		if(typeof options.docHeader == "string") options.docHeader = {text:options.docHeader};
		extend(options.docHeader, {
			color: 0x666666, textAlign:"right", order:0
		});
		horder.text = options.docHeader.order;
	}

	if (options.docHeaderImage){
		if(typeof options.docHeaderImage == "string") options.docHeaderImage = {url:options.docHeaderImage};
		extend(options.docHeaderImage, {
			align:"right", order:1
		});
		horder.image = options.docHeaderImage.order;
	}

	if(options.docHeader && horder.image > horder.text)
		doc.header({paddingBottom:10}).text(options.docHeader.text, options.docHeader);

	if (options.docHeaderImage){
		const defer = promise.defer();
		pdfjs.load(options.docHeaderImage.url, function(err, buffer){
			if (!err){
				const img = new pdfjs.Image(buffer);
				doc.header({paddingBottom:10}).image(img, options.docHeaderImage);

				if(options.docHeader && horder.image < horder.text)
					doc.header({paddingBottom:10}).text(options.docHeader.text, options.docHeader);
			}
			//render pdf and show in browser
			defer.resolve(doc.render());
		});
		return defer;
	}
	else
		return promise.resolve(doc.render());
}

function cloneNodeWithStyles(node){
	const clone = node.cloneNode(false);

	if(node.tagName){
		const styles = window.getComputedStyle(node);
		clone.style.cssText = styles.cssText;
	}

	for (let i = 0; i < node.childNodes.length; i++)
		clone.appendChild(cloneNodeWithStyles(node.childNodes[i]));

	return clone;
}