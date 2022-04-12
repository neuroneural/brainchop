const csv = {
	//incoming data always a string
	toObject:function(data){
		return data;
	},
	//get array of records
	getRecords:function(data){
		return data.split(this.row);
	},
	//get hash of properties for single record, data named as "data{index}"
	getDetails:function(data){
		data = this.stringToArray(data);
		var result = {};
		for (var i=0; i < data.length; i++) 
			result["data"+i]=data[i];

		if (this.idColumn !== null)
			result.id = data[this.idColumn];

		return result;
	},
	getOptions:function(){ return false; },
	//dyn loading is not supported by csv data source
	getInfo:function(){
		return {
			size:0
		};
	},
	//split string in array, takes string surrounding quotes in account
	stringToArray:function(data){
		data = data.split(this.cell);
		for (var i=0; i < data.length; i++)
			data[i] = data[i].replace(/^[ \t\n\r]*("|)/g,"").replace(/("|)[ \t\n\r]*$/g,"");
		return data;
	},
	idColumn:null,
	row:"\n",	//default row separator
	cell:","	//default cell separator
};

export default csv;