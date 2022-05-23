const jsarray={
	//parse jsarray string to jsarray object if necessary
	toObject:function(data){
		if (typeof data == "string")
			return JSON.parse(data);
		return data;
	},
	//get array of records
	getRecords:function(data){
		if (data && data.data)
			data = data.data;
		return data;
	},
	//get hash of properties for single record, in case of array they will have names as "data{index}"
	getDetails:function(data){
		var result = {};
		for (var i=0; i < data.length; i++)
			result["data"+i]=data[i];
		if (this.idColumn !== null)
			result.id = data[this.idColumn];

		return result;
	},
	getOptions:function(){ return false; },
	//dyn loading is not supported by js-array data source
	getInfo:function(){
		return {
			size:0
		};
	},
	idColumn:null
};

export default jsarray;