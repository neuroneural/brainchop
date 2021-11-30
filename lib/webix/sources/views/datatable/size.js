import {getTextSize, create, remove} from "../../webix/html";
import {$active} from "../../webix/skin";
import env from "../../webix/env";
import {bind} from "../../webix/helpers";


const Mixin = {
	$init:function(){
		this.data.attachEvent("onStoreUpdated", bind(function(id){
			if (!id) this._adjustColumns();
		}, this));
		this.attachEvent("onStructureLoad", this._adjustColumns);

		this.attachEvent("onStructureUpdate", this._resizeColumns);
		this.attachEvent("onColumnResize", function(a,b,c,user){
			if (user)
				this._resizeColumns();
		});
		this.attachEvent("onResize", this._resizeColumns);
	},
	_adjustColumns:function(){
		var resize = false;
		var cols = this._columns;
		for (var i = 0; i < cols.length; i++)
			if (cols[i].adjust && ( cols[i].adjust =="header" || this.count() ))
				resize = this._adjustColumn(i, cols[i].adjust, true) || resize;

		if (resize){
			this._updateColsSizeSettings(true);
			this._resizeColumns();
		}
	},
	_resizeColumns:function(){
		var cols = this._settings.columns;
		var fill = [];
		var summ = 0;

		if (cols && !this._settings.autowidth)
			for (var i = 0; i < cols.length; i++){
				var colfil = cols[i].fillspace;
				if (colfil){
					fill[i] = colfil;
					summ += colfil*1 || 1;
				}
			}

		if (summ)
			this._fillColumnSize(fill, summ);
	},
	_fillColumnSize:function(fill, summ){
		var cols = this._settings.columns;
		if (!cols) return;

		var width = this._content_width - this._scrollSizeY;
		var resize = false;

		if (width>0){
			for (let i=0; i<cols.length; i++)
				if (!fill[i]) width -= (cols[i].width || this._settings.columnWidth);

			for (let i = 0; i < fill.length; i++)
				if (fill[i]){
					var request = Math.min(width, Math.round(width * fill[i]/summ));
					resize = this._setColumnWidth(i, request, true) || resize;
					width = width - cols[i].width;
					summ = summ - fill[i];
				}

			if (resize) 
				this._updateColsSizeSettings(true);
		}
	},
	_getColumnConfigSize:function(ind, headers){
		var config = this._settings.columns[ind];
		var max = config.minWidth || this._settings.minColumnWidth;

		//get max data width
		if (headers != "header"){
			var count = this.data.order.length;
			if (config.adjustBatch && config.adjustBatch < count)
				count = config.adjustBatch;
			var order = this.data.order.slice(0, count);

			for (let i = 0; i < count; i++)
				order[i] = order[i] ? this._getValue(this.getItem(order[i]), config, 0) : "";
			max = Math.max(max, getTextSize(order, "webix_table_cell webix_cell").width);
		}

		//get max header width
		if (headers != "data"){
			for (let i=0; i<config.header.length; i++){
				var header = config.header[i];
				if (header){
					var width = 0;
					if(header.rotate)
						for(var h = 0; h<(header.rowspan || 1); h++)
							width += this._headers[h];
					var css = "webix_table_cell webix_cell "+(header.css||"") + (header.rotate?"webix_measure_rotate":"");
					var size = getTextSize([header.text], css, width);
					max = Math.max(max, header.rotate?size.height:size.width);
				}
			}
			if (config.sort) max += 10;  // add 10px for sort marker
		}

		max = max+(env.isIE?$active.layoutPadding.space:0);

		return Math.min(max, config.maxWidth||this._settings.maxColumnWidth||100000);
	},
	_adjustColumn:function(ind, headers, ignore){
		if (ind >= 0){
			var width = this._getColumnConfigSize(ind, headers);
			return this._setColumnWidth(ind, width, ignore);
		}
	},
	adjustColumn:function(id, headers){
		this._adjustColumn(this.getColumnIndex(id), headers);
	},
	adjustRowHeight:function(id, silent){
		if (id)
			this._adjustRowHeight(id);
		else {
			const heights = {};
			const cols = this._settings.columns;

			for (let i = 0; i < cols.length; i++)
				this._adjustRowHeight(cols[i].id, heights);			//adjust size for single columns

			this.data.each(function(obj){
				obj.$height = heights[obj.id];
			});
		}

		if (!silent)
			this.refresh();
	},
	_adjustRowHeight:function(id, size){
		const config = this.getColumnConfig(id);
		let container;
		let d = create("DIV",{"class":"webix_table_cell webix_measure_size webix_cell"},"");
		d.style.cssText = "width:"+config.width+"px; height:1px; visibility:hidden; position:absolute; top:0px; left:0px; overflow:hidden;";
		this.$view.appendChild(d);

		if (d.offsetHeight < 1){
			//hidden container, height detection is broken
			//reattach to the body
			container = this.$view.cloneNode(true);
			document.body.appendChild(container);
			container.appendChild(d);
		}

		this.data.each(function(obj){
			let height;

			d.innerHTML = this._getValue(obj, config, 0);
			height = Math.max(d.scrollHeight, this._settings.rowHeight, this._settings.minRowHeight||0);
			height = Math.min(height, this._settings.maxRowHeight||100000);

			if (size)
				size[obj.id] = Math.max(height, size[obj.id]||0);
			else obj.$height = height;
		}, this);

		d = remove(d);
		if (container)
			remove(container);
	}
};

export default Mixin;