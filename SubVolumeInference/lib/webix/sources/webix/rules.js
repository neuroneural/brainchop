const rules = {
	isEmail: function(value){
		return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test((value || "").toString());
	},
	isNumber: function(value){
		return (parseFloat(value) == value);
	},
	isChecked: function(value){
		return (!!value) || value === "0";
	},
	isNotEmpty: function(value){
		return (value === 0 || value);
	}
};

export default rules;