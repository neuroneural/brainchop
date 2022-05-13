import {ajax} from "../ajax";

function unbox(data){
	if (!data || !typeof data === "object" || Array.isArray(data))
		return data;

	var lkey ="";
	var count = 0;
	for (var key in data){
		count++;
		if (count == 2) return data;
		lkey = key;
	}

	return data[lkey];
}

const GraphQL = {
	$proxy:true,
	save:function(data){
		return this.load(data);
	},
	load:function(view){
		var params = {
			query: this.source
		};
		if (arguments.length === 1){
			params.variables = view;
		}

		return ajax()
			.headers({ "Content-type": "application/json" })
			.post(this.url, params)
			.then(function(data){
				return unbox(data.json().data);
			});
	}
};

export default GraphQL;