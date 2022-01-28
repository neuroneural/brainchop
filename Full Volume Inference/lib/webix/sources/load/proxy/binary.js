import {ajax} from "../ajax";

const proxy = {
	$proxy:true,
	load:function(){
		var parts = this.source.split("@");
		var ext = parts[0].split(".").pop();
		return ajax().response("arraybuffer").get(parts[0]).then(function(res){
			var options = { ext:ext, dataurl : parts[1] };
			return { data:res, options:options };
		});
	}
};

export default proxy;