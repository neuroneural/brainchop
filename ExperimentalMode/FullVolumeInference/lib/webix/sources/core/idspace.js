import {bind} from "../webix/helpers";
import {ui} from "../ui/core";
import state from "./state";

const IdSpace = {
	$init:function(){
		this._elements = {};
		this._translate_ids = {};
		this.getTopParentView = this._get_self = bind(function(){ return this;}, this);

		this._run_inner_init_logic();
		this.$ready.push(this._run_after_inner_init_logic);
	},
	$$:function(id){
		return this._elements[id];
	},
	innerId:function(id){
		return this._translate_ids[id];
	},
	_run_inner_init_logic:function(){
		this._prev_global_col = state._global_collection;
		state._global_collection = this;
	},
	_run_after_inner_init_logic:function(){
		for (var name in this._elements){
			var input = this._elements[name];
			if (this.callEvent && input.mapEvent && !input._evs_map.onitemclick)
				input.mapEvent({
					onitemclick:this
				});
			input.getTopParentView = this._get_self;
		}

		state._global_collection = this._prev_global_col;
		this._prev_global_col = 0;
	},
	_destroy_child:function(id){
		delete this._elements[id];
	},
	ui:function(){
		this._run_inner_init_logic();
		var temp = ui.apply(this, arguments);
		this._run_after_inner_init_logic();
		return temp;
	}
};


export default IdSpace;