import {ajax} from "../ajax";

const proxy = {
	$proxy:true,
	load:function(view, callback){
		ajax().sync().bind(view).get(this.source, null, callback);
	}
};

export default proxy;
