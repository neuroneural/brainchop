import { log, assert } from "../../webix/debug";
import {isArray, uid} from "../../webix/helpers";

const json = {
	//convert json string to json object if necessary
	toObject:function(data){
		if (!data) return null;
		if (typeof data == "string"){
			try{
				if (this.parseDates){
					var isodate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{1-3})?Z/;
					data = JSON.parse(data, function(key, value){
						if (typeof value == "string"){
							if (isodate.test(value))
								return new Date(value);
						}
						return value;
					});
				} else {
					data =JSON.parse(data);
				}
			} catch(e){
				log(e);
				log(data);
				assert(0, "Invalid JSON data for parsing");
				return null;
			}
		}

		return data;
	},
	//get array of records
	getRecords:function(data){
		if (data && data.data)
			data = data.data;

		if (data && !isArray(data))
			return [data];
		return data;
	},
	//get hash of properties for single record
	getDetails:function(data){
		if (typeof data == "string")
			return { id:(data||uid()), value:data };
		return data;
	},
	getOptions:function(data){
		return data.collections;
	},
	//get count of data and position at which new data need to be inserted
	getInfo:function(data){
		return {
			size:(data.total_count||0),
			from:data.pos,
			parent:(data.parent||0),
			config:(data.config)
		};
	},
	child:"data",
	parseDates:false
};

export default json;