import {assert} from "../../webix/debug";
import {toNode, extend} from "../../webix/helpers";
import {remove} from "../../webix/html";

const htmltable={

	//convert json string to json object if necessary
	toObject:function(data){
		data = toNode(data);
		assert(data, "table is not found");
		assert(data.tagName.toLowerCase() === "table", "Incorrect table object");

		var tr = data.rows;
		remove(data);
		return tr;
	},
	//get array of records
	getRecords:function(data){
		var new_data = [];
		//skip header rows if necessary
		var i = (data[0] && data[0]._webix_skip)?1:0;

		for (; i < data.length; i++)
			new_data.push(data[i]);
		return new_data;
	},
	//get hash of properties for single record
	getDetails:function(data){
		var td = data.getElementsByTagName("td");
		data = {};
		//get hash of properties for single record, data named as "data{index}"
		for (var i=0; i < td.length; i++) {
			data["data" + i] = td[i].innerHTML;
		}
		return data;
	},
	//get count of data and position at which new data need to be inserted
	getInfo:function(){
		// dyn loading is not supported for htmltable
		return { 
			size:0
		};
	},
	getOptions:function(){},

	/*! gets header from first table row
	 **/
	getConfig: function(data) {
		var columns = [];
		var td = data[0].getElementsByTagName("th");
		if (td.length) data[0]._webix_skip = true;
		for (var i = 0; i < td.length; i++) {
			var col = {
				id: "data" + i,
				header: this._de_json(td[i].innerHTML)
			};
			var attrs = this._get_attrs(td[i]);
			col = extend(col, attrs);
			columns.push(col);
		}
		return columns;
	},

	_de_json:function(str){
		var pos = str.indexOf("json://");
		
		if (pos != -1)
			str = JSON.parse(str.substr(pos+7));
		return str;
	},
	
	/*! gets hash of html-element attributes
	 **/
	_get_attrs: function(el) {
		var attr = el.attributes;
		var hash = {};
		for (var i = 0; i < attr.length; i++) {
			hash[attr[i].nodeName] = this._de_json(attr[i].nodeValue);
		}
		hash.width = parseInt(hash.width, 10);
		return hash;
	}
};

export default htmltable;