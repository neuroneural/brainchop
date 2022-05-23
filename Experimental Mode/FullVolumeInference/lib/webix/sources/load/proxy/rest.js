import {ajax} from "../ajax";

const proxy = {
	$proxy:true,
	load:function(){
		return ajax(this.source);
	},
	save:function(view, update){
		return proxy._save_logic.call(this, update, ajax());
	},
	_save_logic:function(update, ajax){
		var url = this.source;
		var query = "";
		var mark = url.indexOf("?");

		if (mark !== -1){
			query = url.substr(mark);
			url = url.substr(0, mark);
		}

		url += url.charAt(url.length-1) == "/" ? "" : "/";
		var mode = update.operation;


		var data = update.data;
		if (mode == "insert") delete data.id;

		//call rest URI
		if (mode == "update"){
			return ajax.put(url + data.id + query, data);
		} else if (mode == "delete") {
			return ajax.del(url + data.id + query, data);
		} else {
			return ajax.post(url + query, data);
		}
	}
};

export default proxy;
