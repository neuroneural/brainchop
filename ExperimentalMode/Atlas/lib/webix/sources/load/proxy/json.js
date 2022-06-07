import {ajax} from "../ajax";
import rest from "./rest";

const proxy = {
	$proxy:true,
	load:function(){
		return ajax(this.source);
	},
	save:function(view, update){
		var xhr = ajax().headers({ "Content-Type":"application/json" });
		return rest._save_logic.call(this, update, xhr);
	}
};

export default proxy;