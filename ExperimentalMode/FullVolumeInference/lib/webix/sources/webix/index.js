/*
	Common helpers
*/

export * from "./consts";
export * from "./helpers";
export * from "./htmlevents";
export * from "./customevents";
export * from "./stringify";
export * from "./export";
export * from "./message";
export * from "./api";
export * from "./init";

import "./ie8";

/*
	Next two ugly blocks are here for IE8 compatibility
	rollup converts "import * as" to Object.freeze which doesn't work in IE8

	for modern browsers it can be replaced with 
*/

//	import * as html from "./html";
import { denySelect, allowSelect, index, createCss, addStyle, removeStyle, create, getValue, remove, insertBefore, locate, offset, posRelative, pos, preventEvent, stopEvent, triggerEvent, addCss, removeCss, getTextSize, download, _getClassName, setSelectionRange, getSelectionRange, addMeta } from "./html";
const html = { denySelect, allowSelect, index, createCss, addStyle, removeStyle, create, getValue, remove, insertBefore, locate, offset, posRelative, pos, preventEvent, stopEvent, triggerEvent, addCss, removeCss, getTextSize, download, _getClassName, setSelectionRange, getSelectionRange, addMeta };
export { html };

//	import * as skin from "./skin";
export { skin } from "./skin";

export {debug} from "./debug";

export {default as i18n} from "./locale";
export {default as ready} from "./ready";
export {default as env} from "./env";
export {default as color} from "./color";
export {default as csv} from "./csv";
export {default as clipbuffer} from "./clipbuffer";
export {default as storage} from "./storage";
export {default as template} from "./template";
export {default as type} from "./type";
export {default as editors} from "./editors";
export {default as animate} from "./animate";
export {default as print} from "./print";
export {default as rules} from "./rules";
export {default as filters} from "./filters";
export {default as patterns} from "./patterns";
export {default as fullscreen} from "./fullscreen";