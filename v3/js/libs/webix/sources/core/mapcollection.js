import {uid,isArray} from "../webix/helpers";
import {$$} from "../ui/core";

import i18n from "../webix/i18n";
import {use} from "../services";

import template from "../webix/template";



/*Data collection mapping logic */

const MapCollection = {
	$init:function(){
		this.$ready.push(this._create_scheme_init);
		this.attachEvent("onStructureUpdate", this._create_scheme_init);
		this.attachEvent("onStructureLoad", function(){
			if(!this._scheme_init_order.length)
				this._create_scheme_init();
		});
	},
	_create_scheme_init:function(){
		var stack = this._scheme_init_order = [];
		var config = this._settings;

		if (config.columns)
			this._build_data_map(config.columns);
		if (this._settings.map)
			this._process_field_map(config.map);

		if (stack.length){
			this.data._scheme_init = function(obj){
				for (var i=0; i<stack.length; i++){
					stack[i](obj);
				}
			};
		}
	},
	_process_field_map:function(map){
		for (var key in map)
			this._scheme_init_order.push(this._process_single_map(key, map[key]));
	},
	_process_single_map:function(target, map, extra){
		var source = map.replace(/^(\s|)\((date|number)\)/, "");
		var getSource;
		if (source === ""){
			getSource = a => a[target];
		} else {
			if (source.indexOf("#") === -1 && source.indexOf("{") === -1){
				source = "#"+source+"#";
			}
			getSource = template(source);
		}

		if (map.indexOf("(date)")===0){
			if (extra && !extra.format) extra.format = i18n.dateFormatStr;

			return function(obj){
				const dateStr = (getSource(obj) || "").toString();
				obj[target] = i18n.parseFormatDate(dateStr);
			};
		} else if (map.indexOf("(number)")===0){
			return function(obj){
				obj[target] = getSource(obj)*1;
			};
		} else {
			return function(obj){
				obj[target] = getSource(obj) || "";
			};
		}
	},
	_build_data_map:function(columns){ //for datatable
		for (let i=0; i<columns.length; i++){
			const col = columns[i];
			if (!col.id) {
				col.id = "i" + uid();
				if (!col.header)
					col.header = "";
			}
			if (col.map)
				this._scheme_init_order.push(this._process_single_map(col.id, col.map, columns[i]));

			this._map_options(columns[i]);
		}
	},
	_create_collection:function(options){
		if (typeof options === "string"){
			let options_view = $$(options);										//id of some other view

			if (!options_view){													//or url
				options = new (use("DataCollection"))({ url: options });
				this._destroy_with_me.push(options);
			} else options = options_view;
			if (options.getBody)												//if it was a view, special check for suggests
				options = options_view.getBody();

		} else if (typeof options === "function" || options.$proxy){			//proxy or function
			options = new (use("DataCollection"))({ url:options });
			this._destroy_with_me.push(options);

		} else if (!options.loadNext){
			let array = isArray(options);
			let data = [];

			if (array && typeof options[0] !== "object"){						//["one", "two"]
				for (let i=0; i<options.length; i++)
					data.push({id:options[i], value:options[i]});
				options = data;
			} else if (!array){													//{ 1:"one", 2:"two" }
				for (let i in options)
					data.push({id:i, value:options[i]});
				options = data;
			} 																	// else [{ id:1, value:"one"}, ...]

			options = new (use("DataCollection"))({ data:options });
			this._destroy_with_me.push(options);

		} 																		// else data collection or view
		return options;
	},
	_map_options:function(column){
		let options = column.options||column.collection;
		if (options){
			options = this._create_collection(options);
			this._bind_collection(options, column);
		}
		if (column.header){
			this._map_header_options(column.header);
			this._map_header_options(column.footer);
		}
	},
	_map_header_options:function(arr){
		arr = arr || [];
		for (let i=0; i<arr.length; i++){
			let config = arr[i];

			if (config && config.options){
				let options = config.options;
				if (!options.loadNext)
					options = config.options = this._create_collection(options);

				let id = options.data.attachEvent("onStoreUpdated", () => {
					if(this.refreshFilter)
						this.refreshFilter(config.columnId);
				});
				this.attachEvent("onDestruct", function(){
					if (!options.$destructed) options.data.detachEvent(id);
				});
			}
		}
	},
	_bind_collection:function(options, column){
		if (column){
			delete column.options;
			column.collection = options;
			column.template = column.template || this._bind_template(options, column.id, column.optionslist);
			let id = options.data.attachEvent("onStoreUpdated", () => {
				this.refresh();
				if(this.refreshFilter)
					this.refreshFilter(column.id);
			});
			this.attachEvent("onDestruct", function(){
				if (!options.$destructed) options.data.detachEvent(id);
			});
		}
	},
	_bind_template:function(options, columnId, multi){
		columnId = this.getColumnConfig ? columnId : "value";
		if (multi) {
			let separator = typeof multi=="string" ? multi : ",";
			return function(obj){
				let value = obj[columnId];
				if (!value) return "";

				let ids = value.toString().split(separator);
				for (let i = 0; i < ids.length; i++){
					let data = options.data.pull[ids[i]];
					ids[i] = data ? (data.value  || "") : "";
				}
				
				return ids.join(", ");
			};
		} else {
			return function(obj){
				let data = options.data.pull[ obj[columnId] ];
				if (data && (data.value || data.value === 0))
					return data.value;
				return "";
			};
		}
	}
};

export default MapCollection;