import {extend, uid} from "../../webix/helpers";
import {use} from "../../services";

const proxy = {
	$proxy:true,
	init:function(){
		this.clientId = this.clientId || uid();
	},
	load:function(view){
		var selfid = this.clientId;

		this.client.subscribe(this.source, function(update){
			if (update.clientId == selfid) return;

			use("dp")(view).ignore(function(){
				if (update.operation == "delete")
					view.remove(update.data.id);
				else if (update.operation == "insert")
					view.add(update.data);
				else if (update.operation == "update"){
					var item = view.getItem(update.data.id);
					if (item){
						extend(item, update.data, true);
						view.refresh(item.id);
					}
				}
			});
		});
	},
	save:function(view, update){
		update.clientId = this.clientId;
		this.client.publish(this.source, update);
	}
};

export default proxy;