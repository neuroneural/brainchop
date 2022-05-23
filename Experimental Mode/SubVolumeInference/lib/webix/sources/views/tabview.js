import layout from "../views/layout";
import {protoUI, $$} from "../ui/core";
import {uid, extend} from "../webix/helpers";
import {assert} from "../webix/debug";


const api = {
	name:"tabview",
	setValue:function(val, config){
		this._cells[0].setValue(val, config);
	},
	getValue:function(){
		return this._cells[0].getValue();
	},
	getTabbar:function(){
		return this._cells[0];
	},
	getMultiview:function(){
		return this._cells[1];
	},
	addView:function(obj){
		var nid = this.getMultiview().addView(obj.body);

		obj.id = nid;
		obj.value = obj.header;
		delete obj.body;
		delete obj.header;

		var t = this.getTabbar();
		t.addOption(obj);

		return nid;
	},
	removeView:function(id){
		var t = this.getTabbar();
		t.removeOption(id);
		t.refresh();
	},
	$init:function(config){
		this.$ready.push(this._init_tabview_handlers);

		var cells = config.cells;
		var tabs = [];

		assert(cells && cells.length, "tabview must have cells collection");

		for (var i = cells.length - 1; i >= 0; i--){
			var view = cells[i].body||cells[i];
			if (!view.id) view.id = "view"+uid();
			tabs[i] = { value:cells[i].header, id:view.id, close:cells[i].close, width:cells[i].width, hidden:  !!cells[i].hidden};
			cells[i] = view;
		}

		var tabbar = { view:"tabbar", multiview:true };
		var mview = { view:"multiview", cells:cells, animate:(!!config.animate) };

		if (config.value)
			tabbar.value = config.value;

		if (config.tabbar)
			extend(tabbar, config.tabbar, true);
		if (config.multiview)
			extend(mview, config.multiview, true);
		
		tabbar.options = tabbar.options || tabs;

		config.rows = [
			tabbar, mview
		];

		delete config.cells;
		delete config.tabs;
	},
	_init_tabview_handlers:function(){
		this.getTabbar().attachEvent("onOptionRemove", function(id){
			var view = $$(id);
			if (view){
				var parent = view.getParentView();
				if(parent)
					parent.removeView(view);
			}
		});
	}
};


const view = protoUI(api,  layout.view);
export default {api, view};