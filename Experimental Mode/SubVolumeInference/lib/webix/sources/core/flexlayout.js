import {debug_size_box_start, debug_size_box_end} from "../webix/debug";


const FlexLayout = {
	$init:function(){
		this.$view.className += " webix_flexlayout";
	},
	_fix_vertical_layout:function(){

	},
	_beforeResetBorders:function(){

	},
	_afterResetBorders:function(){

	},
	$getSize:function(){
		if (DEBUG) debug_size_box_start(this, true);
		
		var w=0, h=0, g = this._settings.gravity;
		this._sizes = [];

		for (var i=0; i<this._cells.length; i++){
			var size = this._cells[i].$getSize(0,0);
			this._sizes.push(size);

			w = Math.max(w, size[0]);
			h = Math.max(h, size[2]);
		}

		w += this._padding.left + this._padding.right;
		h += this._padding.top + this._padding.bottom;

		if (this._settings.width)
			w = Math.max(w, this._settings.width);
		if (this._settings.height)
			h = Math.max(h, this._settings.height);

		var self_size = [w, 100000, h, 100000, g];
		if (DEBUG) debug_size_box_end(this, self_size);
		return self_size;
	},
	render:function(){ this.resize(); },
	_set_child_size:function(){
		if (!this.isVisible(this._settings.id)) return;
		var st = this.$view.style;
		var margin = Math.round(this._margin/2);
		st.paddingTop = this._padding.top-margin + "px";
		st.paddingBottom = this._padding.bottom-margin + "px";
		st.paddingLeft = this._padding.left-margin + "px";
		st.paddingRight = this._padding.right-margin + "px";

		for (let i=0; i<this._cells.length; i++){
			if (this._cells[i]._settings.hidden) continue;
			let view = this._cells[i].$view;
			let size = this._sizes[i];
			let config = this._cells[i]._settings;

			if (view){
				view.style.minWidth = size[0]+"px";
				if (size[1] < 100000 && size[1] != size[0])
					view.style.maxWidth = size[1]+"px";

				view.style.flexBasis = config.flexBasis || (size[0])+"px";
				view.style.flexGrow = config.flexGrow || ((size[1] != size[0]) ? size[4] : 0);
				view.style.height = (size[3] != size[2]) ? "auto" : (size[2] + "px");

				view.style.minHeight = size[2]+"px";
				if (size[3] < 100000 && size[3] != size[2])
					view.style.maxHeight = size[3]+"px";

				view.style.margin = margin + "px";
			}
		}

		var whs = [];
		for (let i=0; i<this._cells.length; i++){
			if (this._cells[i]._settings.hidden) continue;
			let view = this._cells[i].$view;
			whs[i] = [view.offsetWidth, view.offsetHeight];
		}
		
		for (let i=0; i<this._cells.length; i++){
			if (this._cells[i]._settings.hidden) continue;
			let cell = this._cells[i];
			let view = cell.$view;
			if (view){
				cell._settings.flex = true;
				let size = this._sizes[i];
				var h = size[2] == size[3] ? size[2] : whs[i][1];
				cell.$setSize(whs[i][0], h);
				cell._settings.flex = false;
			}
		}

		this.$view.style.height = "";
		this.$height = this._content_height = this.$view.scrollHeight;
		this.$view.style.height = this._content_height+"px";
	}
};

export default FlexLayout;