import {remove} from "../webix/html";
import {ui, hasMethod} from "../ui/core";
import DataDriver from "../load/drivers/index";


const markup = {
	namespace:"x",
	attribute:"data-",
	dataTag:"li",
	_dash:/-([a-z])/g,
	_after_dash:function (match) { return match[1].toUpperCase(); },
	_parse_int:{
		width:true,
		height:true,
		gravity:true,
		margin:true,
		padding:true,
		paddingX:true,
		paddingY:true,
		minWidth:true,
		maxWidth:true,
		minHeight:true,
		maxHeight:true,
		headerRowHeight:true
	},
	_parse_bool:{
		disabled:true,
		hidden:true
	},
	_view_has_method:function(view, name){
		return hasMethod(view, name);
	},

	init: function(node, target, scope){
		node = node || document.body;

		var els = [];
		var temp = this._get_core_els(node);
		var html = temp.html;
		var ui = null;

		//make copy to prevent node removing effects
		for (let i = temp.length - 1; i >= 0; i--) els[i] = temp[i];
		
		for (let i = 0; i < els.length; i++) {
			var config;
			//collect configuration
			config = this._sub_markup(els[i], html);
			config.$scope = scope;
			ui = this._initComponent(config, els[i], html, target);
		}
		return ui;
	},

	parse:function(source, mode){
		//convert from string to object
		if (typeof source == "string")
			source = DataDriver[mode || "xml"].toObject(source, source);

		var els = this._get_core_els(source, mode);
		return this._sub_markup(els[0], els.html);
	},

	_initComponent:function(config, node, html, target){
		if (!target){
			config.container = node.parentNode;
			remove(node);
		} else 
			config.container = target;

		if (this._view_has_method(config.view, "setPosition"))
			delete config.container;

		//init ui
		return ui(config);
	},

	_get_core_els:function(node){
		this._full_prefix = this.namespace?(this.namespace+":"):"";
		this._full_prefix_top = this._full_prefix+"ui";

		//xhtml mode
		var els = node.getElementsByTagName(this._full_prefix_top);
		if (!els.length && node.documentElement && node.documentElement.tagName == this._full_prefix_top)
			els = [ node.documentElement ];

		//loading from xml file with valid namespace
		if (!els.length && this.namespace){
			els = node.getElementsByTagName("ui");
			if (!els.length && node.documentElement && node.documentElement.tagName == "ui")
				els = [ node.documentElement ];
		}

		if (!els.length){
			//html mode
			els = this._get_html_tops(node);
			els.html = true;
		}
		return els;
	},

	//html conversion
	_get_html_tops: function(node){
		if (node.getAttribute && node.getAttribute(this.attribute+"view"))
			return [node];

		var els = node.querySelectorAll("["+this.attribute+"view]");

		var tags = [];
		for (var i = 0; i < els.length; i++)
			if (!els[i].parentNode.getAttribute(this.attribute+"view"))
				tags.push(els[i]);

		return tags;
	},



	_sub_markup: function(el, html, json){
		var htmltable = false;
		//ignore top x:ui for xhtml and xml 
		if (!json){
			let name = this._get_name(el, html);
			if (name == "ui"){
				var childs = el.childNodes;
				for (var i = 0; i < childs.length; i++)
					if (childs[i].nodeType == 1){
						return this._sub_markup(childs[i], html);
					}
			}
			json = { view: name };
			if (html && el.tagName.toLowerCase() == "table"){
				json.data = el;
				json.datatype = "htmltable";
				htmltable = true;
			}
		}

		var is_layout = json.view == "cols" || json.view == "rows" || this._view_has_method(json.view, "addView");

		var subs = [];
		var has_tags = 0; 
		var allow_sub_tags = !(html || el.style); //only for xml documents
		var first = el.firstChild;
		while (first){
			//tag node
			if (first.nodeType == 1){
				let name = this._get_name(first, html);
				if (name == "data"){
					has_tags = 1;
					var data = first; first = first.nextSibling;
					json.data = this._handle_data(data, html);
					continue;
				} else if (name == "config"){
					this._get_config_html(first, json, html);
					var confignode = first;
					first = first.nextSibling;

					remove(confignode);
					continue;
				} else if (name == "column"){
					has_tags = 1;

					var column = this._tag_to_json(first, html);
					column.header = column.header || column.value;
					column.width = column.width * 1 || "";

					json.columns = json.columns || [];
					json.columns.push(column);
				} else if (name || (is_layout && html)){
					var obj = this._sub_markup(first , html , { view:name });
					if (obj.view == "head")
						json.head = obj.rows ? obj.rows[0] : obj.template;
					else if (obj.view == "body"){
						if (this._view_has_method(json.view, "addView")){
							//multiview, accordion

							//subtag or plain value
							//in case of multiple sub tags, only first will be used
							// #dirty
							subs.push({
								body: (obj.rows ? obj.rows[0] : obj.value),
								header:obj.header || ""
							});
						} else {
							//window, fieldset

							//one sub tag - use it
							//multiple sub tags - create sub layout
							//or use plain text value
							json.body = obj.rows ? ( obj.rows.length == 1 ? obj.rows[0] : { rows:obj.rows } ) : obj.value;
						}
					} else
						subs.push(obj);
				} else if (allow_sub_tags) {
					has_tags = 1;
					var tagName = first.tagName;
					if (html) tagName = tagName.toLowerCase().replace(this._dash, this._after_dash);
					json[tagName] = DataDriver.xml.tagToObject(first);
					
				}
			}

			first = first.nextSibling;
		}

		this._attrs_to_json(el, json, html);

		if (subs.length){
			if (json.stack){
				json[json.stack] = subs;
			} else if (json.subui){
				json[json.subui] = subs[0];
			} else if (this._view_has_method(json.view, "setValues")){
				json["elements"] = subs;
			} else if (json.view == "rows"){
				json.view = "layout";
				json.rows = subs;
			} else if (json.view == "cols"){
				json.view = "layout";
				json.cols = subs;
			} else if (this._view_has_method(json.view, "setValue")){
				json["cells"] = subs;
			} else if (this._view_has_method(json.view, "getBody")){
				json.body = subs.length == 1 ? subs[0] : { rows:subs };
			} else {
				json["rows"] = subs;
			}
		} else if (!htmltable && !has_tags){
			if (html && !json.template && (!json.view || json.view == "template")){
				json.view = "template";
				json.content = el;
			} else {
				var content = this._content(el, html);
				if (content){
					var target = "template";
					if (this._view_has_method(json.view, "setValue"))
						target = "value";
					json[target] = json[target] || content;	
				}
			}
		}

		return json;
	},

	_empty: function(str) {
		var clean = str.replace(/\s+/gm, "");
		return (clean.length > 0) ? false : true;	 
	},

	_markup_names:{
		body:1,
		head:1,
		data:1,
		rows:1,
		cols:1,
		cells:1,
		elements:1,
		ui:1,
		column:1,
		config:1
	},

	_get_config_html:function(tag, json, html){
		var master = this._attrs_to_json(tag, { });
		if (master.name){
			json[master.name] = master;
			delete master.name;
		} else 
		if (master.stack) json[master.stack] = [];
		else
			json = master;

		var childs = tag.childNodes;
		for (var i = 0; i < childs.length; i++) {
			var sub = null;
			if (childs[i].nodeType == 1 && childs[i].tagName.toLowerCase() == "config" && childs[i].attributes.length)
				sub = this._get_config_html(childs[i], master, html);
			else if (childs[i].nodeType == 1 && childs[i].tagName.toLowerCase() == "data"){
				sub = this._handle_data(childs[i], html);
				if (!master.stack)
					master.data = sub;
			} else
				sub = childs[i].innerHTML;

			if (master.stack && sub)
				json[master.stack].push(sub);

		}
		return json;
	},

	_get_name:function(tag, html){
		//value of view attribute or config tag
		if (html)
			return tag.getAttribute(this.attribute+"view") || ( tag.tagName.toLowerCase() == "config" ? "config" : null);
		var name = tag.tagName.toLowerCase();
		if (this.namespace){
			if (name.indexOf(this._full_prefix) === 0 || tag.scopeName == this.namespace)
				return name.replace(this._full_prefix,"");
		} else {
			if (ui[name] || this._markup_names[name])
				return name;
		}
		return 0;
	},

	_handle_data:function(el, html){
		var data = [];

		var records = el.getElementsByTagName(markup.dataTag);
		for (var i=0; i<records.length; i++){
			var rec = records[i];
			if (rec.parentNode.parentNode.tagName != markup.dataTag){
				var json = this._tag_to_json(rec, html);
				//reuse css class 
				if (rec.className) json.$css = rec.className;
				data.push(json);
			}
		}

		remove(el);

		return data;
	},
	_content:function(el){
		if (el.style) return el.innerHTML;
		if (el.firstChild)
			return el.firstChild.wholeText||el.firstChild.data||"";
		return "";
	},


	_tag_to_json:function(el, html){
		if (!html)
			return DataDriver.xml.tagToObject(el);

		var json = this._attrs_to_json(el, {}, html);
		if (!json.value && el.childNodes.length)
			json.value = this._content(el, html);

		return json;
	},
	_attrs_to_json:function(el, json, html){
		var attrs = el.attributes;
		for (var i=0; i<attrs.length; i++){
			var name = attrs[i].name;
			if (html){
				if (name.indexOf(this.attribute) !== 0)
					continue;
				name = name.replace(this.attribute,"").replace(this._dash, this._after_dash);
			}

			var value = attrs[i].value;
			if (value.indexOf("json://") != -1)
				value = JSON.parse(value.replace("json://",""));

			if (this._parse_int[name])
				value = parseInt(value,10);
			else if (this._parse_bool[name])
				value = (value && value !== "false" && value != "0");

			json[name] = value;
		}
		return json;
	}
};

export default markup;