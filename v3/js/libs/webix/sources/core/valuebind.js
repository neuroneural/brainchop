const ValueBind={
	$init:function(){
		this.attachEvent("onChange", this._update_binds);
	},
	_bind_update:function(target, rule, format){
		rule = rule || "value";
		var data = this.getValue()||"";
		if (format) data = format(data);
		
		if (target.setValue)
			target.setValue(data,"auto");
		else if (!target.filter){
			var pod = {}; pod[rule] = data;
			if (target._check_data_feed(data))
				target.setValues(pod,false,"auto");
		} else{
			target.data.silent(function(){
				this.filter(rule,data);
			});
		}
		target.callEvent("onBindApply", [data,rule,this]);
	}
};

export default ValueBind;