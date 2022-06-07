

const GroupMethods = {
	sum:function(property, data){
		data = data || this;
		var summ = 0;
		for (var i = 0; i < data.length; i++){
			const num = parseFloat(property(data[i]), 10);
			if (!isNaN(num))
				summ+=num;
		}

		return summ;
	},
	min:function(property, data){
		data = data || this;
		var min = Infinity;


		for (var i = 0; i < data.length; i++){
			const num = parseFloat(property(data[i]), 10);
			if (isNaN(num)) continue;
			if (num < min) min = num;
		}

		return min === Infinity ? 0 : min*1;
	},
	max:function(property, data){
		data = data || this;
		var max = -Infinity;

		for (var i = 0; i < data.length; i++){
			const num = parseFloat(property(data[i]), 10);
			if (isNaN(num)) continue;
			if (num > max) max = num;
		}

		return max === -Infinity ? 0 : max*1;
	},
	count:function(property, data){
		var count = 0;
		for (var i = 0; i < data.length; i++) {
			var some = property(data[i]);
			if (some !== null && typeof some !== "undefined")
				count++;
		}
		return count;
	},
	any:function(property, data){
		return property(data[0]);
	},
	string:function(property){
		return property.$name;
	}
};

export default GroupMethods;