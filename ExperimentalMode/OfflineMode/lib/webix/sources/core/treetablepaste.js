import {isUndefined, uid} from "../webix/helpers";


const TreeTablePaste = {
	insert: function(data) {
		var parent = this.getSelectedId(true, true);
		for (var i = 0; i < data.length; i++) {
			var item = {};
			for (var j = 0; j < this._settings.columns.length; j++) {
				item[this._settings.columns[j].id] = data[i][j] || "";
			}
			if (!isUndefined(item.id) && this.exists(item.id))
				item.id = uid();
			this.add(item, null, parent[0]);
		}
	}
};

export default TreeTablePaste;