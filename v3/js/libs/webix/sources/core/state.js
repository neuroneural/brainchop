import {_to_array} from "../webix/helpers";

const state = {
	top_views:[],

	_global_scope:null,
	_global_collection:null,
	_child_sizing_active:null,
	_responsive_exception:null,
	_responsive_tinkery:null,
	_freeze_resize:null,
	_parent_cell:null,
	_focus_time:null,
	_ui_creation:0,
	_edit_open_time:null,

	_final_destruction:null,
	_events:[],

	destructors:[],

	_noselect_element:null,

	_modality:[],
	_popups:_to_array(),

	_wait_animate:null
};

export default state;