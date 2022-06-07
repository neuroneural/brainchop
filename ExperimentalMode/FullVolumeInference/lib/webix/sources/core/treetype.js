

const TreeType ={
	space:function(obj){
		var html = "";
		for (var i=1; i<obj.$level; i++)
			html += "<div class='webix_tree_none'></div>";
		return html;
	},
	icon:function(obj){
		if (obj.$count){
			if (obj.open)
				return "<div class='webix_tree_open'></div>";
			else
				return "<div class='webix_tree_close'></div>";
		} else
			return "<div class='webix_tree_none'></div>";
	},
	checkbox:function(obj){
		if(obj.nocheckbox)
			return "";
		return "<input type='checkbox' class='webix_tree_checkbox' "+(obj.checked?"checked":"")+(obj.disabled?" disabled":"")+">";
	},	
	folder:function(obj){
		if (obj.icon)
			return "<div class='webix_tree_file webix_tree_"+obj.icon+"'></div>";

		if (obj.$count){
			if (obj.open)
				return "<div class='webix_tree_folder_open'></div>";
			else
				return "<div class='webix_tree_folder'></div>";
		}
		return "<div class='webix_tree_file'></div>";
	}
};

export default TreeType;