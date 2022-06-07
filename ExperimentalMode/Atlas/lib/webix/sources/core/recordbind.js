const RecordBind={
	$init:function(){
		this.attachEvent("onChange", this._update_binds);		
	},
	_bind_update:function(target, rule, format){
		var data = this.getValues()||null;
		if (format)
			data = format(data);
		this._bind_update_common(target, rule, data);
	}
};


export default RecordBind;