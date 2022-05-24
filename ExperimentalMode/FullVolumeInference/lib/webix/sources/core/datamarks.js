const DataMarks = {
	addCss:function(id, css, silent){
		if (!this.addRowCss && !silent){
			if (!this.hasCss(id, css)){
				var node = this.getItemNode(id);
				if (node){
					node.className += " "+css;
					silent = true;
				}
			}
		}
		return this.data.addMark(id, css, 1, 1, silent);
	},
	removeCss:function(id, css, silent){
		if (!this.addRowCss && !silent){
			if (this.hasCss(id, css)){
				var node = this.getItemNode(id);
				if (node){
					node.className = node.className.replace(css,"").replace("  "," ");
					silent = true;
				}
			}
		}
		return this.data.removeMark(id, css, 1, silent);
	},
	hasCss:function(id, mark){
		return this.data.getMark(id, mark);
	},
	clearCss:function(css, silent){
		return this.data.clearMark(css, 1, silent);
	}
};

export default DataMarks;