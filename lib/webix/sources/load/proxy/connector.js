import {ajax} from "../ajax";
import state from "../../core/state";

const proxy = {
	$proxy:true,

	connectorName:"!nativeeditor_status",
	load:function(){
		return ajax(this.source);
	},
	saveAll:function(view, updates){
		var url = this.source;

		var data = {};
		var ids = [];
		for (var i = 0; i < updates.length; i++) {
			var action = updates[i];
			ids.push(action.id);

			for (var j in action.data)
				if (j.indexOf("$")!==0)
					data[action.id+"_"+j] = action.data[j];
			data[action.id+"_"+this.connectorName] = action.operation;
		}

		data.ids = ids.join(",");
		data.webix_security = state.securityKey;
	
		url += (url.indexOf("?") == -1) ? "?" : "&";
		url += "editing=true";

		return ajax().post(url, data).then(data => {
			data = data.xml();
			if (!data)
				throw "Data loading error";

			var actions = data.data.action;
			if (!actions.length)
				actions = [actions];

			var hash = [];

			for (var i = 0; i < actions.length; i++) {
				var obj = actions[i];
				obj.status = obj.type;
				obj.id = obj.sid;
				obj.newid = obj.tid;

				hash.push(obj);
			}

			return hash;
		});
	}
};

export default proxy;
