import {delay} from "../../webix/helpers";



const proxy = {
	$proxy:true,
	load:function(){},
	save:function(v,u,d){
		delay(function(){
			window.console.log("[DP] "+u.id+" -> "+u.operation, u.data);
			var data = {
				id:u.data.id,
				newid:u.data.id,
				status:u.data.operation
			};
			d.processResult(data, data);
		});
	}
};

export default proxy;