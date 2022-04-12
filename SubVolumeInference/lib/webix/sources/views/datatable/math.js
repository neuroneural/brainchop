import template from "../../webix/template";
import env from "../../webix/env";
import {assert} from "../../webix/debug";
import {bind} from "../../webix/helpers";


const Mixin = {

	math_setter:function(value){
		if (value)
			this._math_init();
		return value;
	},

	_math_pref: "$",

	_math_init: function() {
		if(env.strict) return;

		this.data.attachEvent("onStoreUpdated", bind(this._parse_row_math, this));
		this.data.attachEvent("onStoreLoad", bind(this._parse_math, this));
		this.attachEvent("onStructureLoad", this._parse_math);
	},
	_parse_row_math:function(id, obj, action){
		if (!id || action=="paint") return;
		
		if (action == "delete"){
			for (let i=0; i<this._columns.length; i++){
				this._remove_old_triggers(obj,  this._columns[i].id);
			}
		}
		else {
			if (action == "add")
				this._exprs_by_columns(obj);

			for (let i=0; i<this._columns.length; i++){
				this._math_recalc = {};
				this._parse_cell_math(id, this._columns[i].id);
			}
			this._math_recalc = {};
		}
	},
	_parse_cell_math: function(row, col) {
		var item = this.getItem(row);
		var value;

		// use previosly saved formula if available
		value = item[this._math_pref + col] || item[col];

		if (value && value.length > 0 && value.toString().substr(0, 1) === "=") {
			// calculate math value
			item[this._math_pref + col] = value;
			item[col] = this._calculate(value, row, col);
			//this.updateItem(item);
		} else {
			// just a string
			if (typeof(item[this._math_pref + col]) !== "undefined")
				delete item[this._math_pref + col];
			// remove triggers if they were setted earlier
			this._remove_old_triggers(item, col);
		}
		// recalculate depending cells
		if (typeof(item.depends) !== "undefined" && typeof(item.depends[col]) !== "undefined") {
			for (var i in item.depends[col]) {
				var name = item.depends[col][i][0] + "__" + item.depends[col][i][1];
				if (typeof(this._math_recalc[name]) === "undefined") {
					this._math_recalc[name] = true;
					this._parse_cell_math(item.depends[col][i][0], item.depends[col][i][1]);
				}
			}
		}
	},

	_set_original_value: function(row, col) {
		var item = this.getItem(row);
		if (typeof(item[this._math_pref + col]) !== "undefined")
			item[col] = item[this._math_pref + col];
	},

	_parse_math: function(){
		if (!this._columns || !this.count()) return;
		
		this._exprs_by_columns();

		for (var j = 0; j < this._columns.length; j++){
			var col = this.columnId(j);
			this.data.each(function(obj){
				this._math_recalc = {};
				this._parse_cell_math(obj.id, col);
			}, this);
		}

		this._math_recalc = {};
	},

	_exprs_by_columns: function(row) {
		for (var i = 0; i < this._columns.length; i++){
			if (this._columns[i].math) {
				var col = this.columnId(i);
				var math = "=" + this._columns[i].math;
				math = math.replace(/\$c/g, "#$c#");
				if (row){
					row[col] = this._parse_relative_expr(math, row.id, col);
					delete row[this._math_pref+col];
					this._remove_old_triggers(row, col);
				}
				else
					this.data.each(function(obj){
						obj[col] = this._parse_relative_expr(math, obj.id, col);
						delete obj[this._math_pref+col];
						this._remove_old_triggers(obj, col);
					}, this);
			}
		}
	},

	_parse_relative_expr: function(expr, row, col) {
		return (template(expr))({ "$r": row, "$c": col });
	},

	_get_calc_value: function(row, col) {
		var item;

		if (this.exists(row))
			item = this.getItem(row);
		else
			return "#out_of_range";

		var value = item[this._math_pref + col] || item[col] || 0;
		value = value.toString();
		if (value.substring(0, 1) !== "=")
			// it's a string
			return value;
		else {
			// TODO: check if value shouldn't be recalculated
			// and return value calculated earlier

			// calculate math expr value right now
			if (typeof(item[this._math_pref + col]) === "undefined")
				item[this._math_pref + col] = item[col];
			item[col] = this._calculate(value, row, col, true);
			return item[col];
		}
	},

	_calculate: function(value, row, col, _inner_call) {
		// add coord in math trace to detect self-references
		if (_inner_call === true) {
			if (this._in_math_trace(row, col))
				return "#selfreference";
		} else
			this._start_math_trace();
		this._to_math_trace(row, col);

		var item = this.getItem(row);
		value = value.substring(1);

		// get operations list
		var operations = this._get_operations(value);
		var triggers = this._get_refs(value, row);

		if (operations) {
			value = this._replace_refs(value, triggers);
			value = this._parse_args(value, operations);
		} else {
			value = this._replace_refs(value, triggers, true);
		}

		var exc = this._math_exception(value);
		if (exc !== false)
			return exc;

		// remove from coord from trace when calculations were finished - it's important!
		this._from_math_trace(row, col);

		// process triggers to know which cells should be recalculated when one was changed
		this._remove_old_triggers(item, col);
		for (var i = 0; i < triggers.length; i++) {
			this._add_trigger([row, col], triggers[i]);
		}
		exc = this._math_exception(value);
		if (exc !== false)
			return exc;

		// there aren't any operations here. returns number or value of another cell
		if (!value) return value;

		// process mathematical expression and getting final result
		value = this._compute(value.replace(/\$r/g, item.id));
		exc = this._math_exception(value);
		if (exc !== false)
			return exc;
		return value;
	},

	_get_operations: function(value) {
		// gettings operations list (+-*/)
		var splitter = /(\+|-|\*|\/)/g;
		var operations = value.replace(/\[[^)]*?\]/g,"").match(splitter);
		return operations;
	},

	/*! gets list of referencies in formula
	 **/
	_get_refs: function(value, id) {
		var reg = /\[([^\]]+),([^\]]+)\]/g;
		var cells = value.match(reg);
		if (cells === null) cells = [];

		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var tmp = cell;
			cell = cell.substr(1, cell.length - 2);
			cell = cell.split(",");
			cell[0] = this._trim(cell[0]);
			cell[1] = this._trim(cell[1]);
			if (cell[0].substr(0, 1) === ":")
				cell[0] = this.getIdByIndex(cell[0].substr(1));
			if (cell[0] === "$r")
				cell[0] = id;
			if (cell[1].substr(0, 1) === ":")
				cell[1] = this.columnId(cell[1].substr(1));
			cell[2] = tmp;
			cells[i] = cell;
		}

		return cells;
	},

	// replace given list of references by their values
	_replace_refs: function(value, cells, clean) {
		var dell = "(", delr = ")";
		if (clean) dell = delr = "";
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var cell_value = this._get_calc_value(cell[0], cell[1]);
			if (isNaN(cell_value))
				cell_value = "\""+cell_value+"\"";
			value = value.replace(cell[2], dell + cell_value + delr);
		}
		return value;
	},

	_parse_args: function(value, operations) {
		var args = [];
		for (let i = 0; i < operations.length; i++) {
			var op = operations[i];
			var temp = this._split_by(value, op);
			args.push(temp[0]);
			value = temp[1];
		}
		args.push(value);

		//var reg = /^(-?\d|\.|\(|\))+$/;
		for (let i = 0; i < args.length; i++) {
			var arg = this._trim(args[i]);
			//	if (reg.test(arg) === false)
			//		return ''; //error
			args[i] = arg;
		}

		var expr = "";
		for (let i = 0; i < args.length - 1; i++) {
			expr += args[i] + operations[i];
		}
		expr += args[args.length - 1];
		return expr;
	},

	_compute: function(expr) {
		var result;
		try {
			result = window.eval(expr);
		} catch(ex) {
			assert(false,"Math error in datatable<br>"+expr);
			result = "";
		}
		return result.toString();
	},

	_split_by: function(value, splitter) {
		var pos = value.indexOf(splitter);
		var before = value.substr(0, pos);
		var after = value.substr(pos + 1);
		return [before, after];
	},

	_trim: function(value) {
		value = value.replace(/^ */g, "");
		value = value.replace(/ *$/g, "");
		return value;
	},

	_start_math_trace: function() {
		this._math_trace = [];
	},
	_to_math_trace: function(row, col) {
		this._math_trace[row + "__" + col] = true;
	},
	_from_math_trace: function(row, col) {
		if (typeof(this._math_trace[row + "__" + col]) !== "undefined")
			delete this._math_trace[row + "__" + col];
	},
	_in_math_trace: function(row, col) {
		if (typeof(this._math_trace[row + "__" + col]) !== "undefined")
			return true;
		else
			return false;
	},

	_add_trigger: function(depends, from) {
		var item = this.getItem(from[0]);
		if (typeof(item.depends) === "undefined")
			item.depends = {};
		if (typeof(item.depends[from[1]]) === "undefined")
			item.depends[from[1]] = {};
		item.depends[from[1]][depends[0] + "__" + depends[1]] = depends;

		item = this.getItem(depends[0]);
		if (typeof(item.triggers) === "undefined")
			item.triggers = {};
		if (typeof(item.triggers[depends[1]]) === "undefined")
			item.triggers[depends[1]] = {};
		item.triggers[depends[1]][from[0] + "__" + from[1]] = from;
	},

	_remove_old_triggers: function(item, col) {
		if (!item) return;
		if (typeof(item.triggers) === "undefined") return;
		for (var i in item.triggers[col]) {
			var depend = item.triggers[col][i];
			var row = this.getItem(depend[0]);
			if (row)
				delete row.depends[depend[1]][item.id + "__" + col];
		}
	},

	// check if exception syntax exists and returns exception text or false
	_math_exception: function(value) {
		var reg = /#\w+/;
		var match = value.match(reg);
		if (match !== null && match.length > 0)
			return match[0];
		return false;
	}

};

export default Mixin;