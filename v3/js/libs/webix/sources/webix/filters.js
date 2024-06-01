const filters = {
	number:{
		greater: function(a, b){ return a > b; },
		less: function(a, b){ return a < b; },
		greaterOrEqual: function(a, b){ return a >= b; },
		lessOrEqual: function(a, b){ return a <= b; },
		equal: function(a, b){ return a == b; },
		notEqual: function(a, b){ return a != b; },

		contains: function(a, b){ return a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) !== -1; },
		notContains: function(a, b){ return a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) === -1; }
	},
	text:{
		equal: function(a, b){ return a.toLowerCase() === b.toLowerCase(); },
		notEqual: function(a, b){ return a.toLowerCase() !== b.toLowerCase(); },
		contains: function(a, b){ return a.toLowerCase().indexOf(b.toLowerCase()) !== -1; },
		notContains: function(a, b){ return a.toLowerCase().indexOf(b.toLowerCase()) === -1; },

		beginsWith: function(a, b){ return a.toLowerCase().lastIndexOf(b.toLowerCase(), 0) === 0; },
		notBeginsWith: function(a, b){ return a.toLowerCase().lastIndexOf(b.toLowerCase(), 0) !== 0; },
		endsWith: function(a, b){ return a.toLowerCase().indexOf(b.toLowerCase(), a.length - b.length) !== -1; },
		notEndsWith: function(a, b){ return a.toLowerCase().indexOf(b.toLowerCase(), a.length - b.length) === -1; }
	},
	date:{
		greater: function(a, b){ return a > b; },
		less: function(a, b){ return a < b; },
		greaterOrEqual: function(a, b){ return a >= b; },
		lessOrEqual: function(a, b){ return a <= b; },
		equal: function(a, b){
			if (!a || !b) return false;
			return a.valueOf() === b.valueOf();
		},
		notEqual: function(a, b){
			if (!a || !b) return true;
			return a.valueOf() !== b.valueOf();
		},
		between: function(a, b){ return (!b.start || a > b.start) && (!b.end || a < b.end); },
		notBetween: function(a, b){ return (!b.start || a <= b.start) || (!b.end || a >= b.end); }
	}
};

export default filters;