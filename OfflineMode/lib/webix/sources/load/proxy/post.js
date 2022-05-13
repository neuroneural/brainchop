import {extend} from "../../webix/helpers";

import {ajax} from "../ajax";

const proxy = {
	$proxy:true,
	load:function(view, params){
		params = extend(params||{}, this.params || {}, true);
		return ajax().post(this.source, params);
	}
};

export default proxy;