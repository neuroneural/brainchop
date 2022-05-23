

const TreeClick = {
	webix_tree_open:function(e, id){
		this.close(id);
		return false;
	},
	webix_tree_close:function(e, id){
		this.open(id);
		return false;
	},
	webix_tree_checkbox:function(e,id){
		this._tree_check_uncheck(id, null, e);
		return false;
	}
};

export default TreeClick;