const Mixin = {
	clearValidation:function(){
		for(var i in this.data._marks)
			this._clear_invalid_css(i);
		this.data.clearMark("webix_invalid", true);
	},
	_mark_invalid:function(id, details){
		this._clear_invalid_css(id);
		for (var key in details)
			this.addCellCss(id, key, "webix_invalid_cell");

		this.addCss(id, "webix_invalid");
	},
	_clear_invalid:function(id){
		this._clear_invalid_css(id);
		this.removeCss(id, "webix_invalid");
	},
	_clear_invalid_css:function(id){
		var mark = this.data.getMark(id, "$cellCss");
		if (mark){
			for (var key in mark)
				mark[key] = mark[key].replace("webix_invalid_cell", "").replace("  "," ");
		}
	},

	addRowCss:function(id, css, silent){
		this.addCss(id, css, silent);
	},
	removeRowCss:function(id, css, silent){
		this.removeCss(id, css, silent);
	},
	addCellCss:function(id, name, css, silent){
		var mark = this.data.getMark(id, "$cellCss");
		var newmark = mark || {};

		var style = newmark[name]||"";
		newmark[name] = style.replace(css, "").replace("  "," ")+" "+css;

		if (!mark) this.data.addMark(id, "$cellCss", false, newmark, true);
		if (!silent)
			this.refresh(id);
	},
	removeCellCss:function(id, name, css, silent){
		var mark = this.data.getMark(id, "$cellCss");
		if (mark){
			var style = mark[name]||"";
			if (style)
				mark[name] = style.replace(css, "").replace("  "," ");
			if (!silent)
				this.refresh(id);
		}
	}
};

export default Mixin;