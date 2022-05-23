import {create, insertBefore, remove} from "../webix/html";
import env from "../webix/env";
import {extend, bind} from "../webix/helpers";


const CustomPrint = {
	$customPrint:function(options, htmlOnly){
		if(this._prePrint(options, htmlOnly))
			return true;

		var tableData = this._getTableArray(options);
		var table = this._getTableHTML(tableData, options);

		if(htmlOnly)
			return table;

		var doc = create("div", { "class":"webix_ui_print"});
		doc.appendChild(table);

		insertBefore(doc, options.docFooter, document.body);
		window.print();
		
		remove(doc);
	},
	_prePrint:function(options, htmlOnly){
		if(!htmlOnly && (this.config.layout =="y" || options.scroll || this.config.prerender || this.config.autoheight)) return true;
		
		if(this.config.layout =="x")
			extend(options || {}, {xCount:this.count(), nobreaks:true}, true);
	},
	_getPageWidth:function(options){
		var size = options.size;
		var width = size[options.mode == "portrait"?"width":"height"];
		
		return Math.min(width*env.printPPI-2*env.printMargin);
	},
	_getTableArray:function(options, base, start){
		var maxWidth = options.fit =="page" ? Infinity : this._getPageWidth(options);
		var xCount = options.xCount || this._getVisibleRange()._dx;

		var tableArray = [];
		var colrow = [];
		var width = 0;
		
		var newTableStart, rownum, colnum;

		start = start || 0;
		base = base || [];

		for(var i = 0; i<this.data.order.length;){
			var obj = this.data.pull[this.data.order[i]];
			rownum = parseInt(i/xCount);
			colnum = i-(rownum*xCount);

			if(obj && colnum>=start){
				width += this.type.width;
				
				//start a new table, if cells do not fit page width
				if(width > maxWidth && colnum>start){ // 'colnum>start' ensures that a single long cell will have to fit the page
					newTableStart = colrow.length+start;
					tableArray.push(colrow);
					i = i+(xCount-colrow.length);
					colrow = [];
					width = 0;
					continue;
				}

				var cellValue = this.type.template(obj, this.type);
				var className = this._itemClassName;
				
				var style  = {
					display:"table-cell",
					height:this.type.height + "px",
					width:this.type.width + "px"
				};
				//push a cell to a row
				colrow.push({
					txt: cellValue,
					className: className+" "+(obj.$css || ""),
					style: style
				});
				//push a row to a table and start a new row
				if((i+1)%xCount === 0){
					tableArray.push(colrow);
					colrow = [];
					width = 0;
				}
			}
			i++;
		}

		base.push(tableArray);

		if(newTableStart)
			this._getTableArray(options, base, newTableStart);	

		return base;
	},
	_getTableHTML:function(tableData, options){
		
		var container = create("div");

		tableData.forEach(bind(function(table, i){

			var tableHTML = create("table", {
				"class":"webix_table_print "+this.$view.className,
				"style":"border-collapse:collapse"
			});

			table.forEach(function(row){
				var tr = create("tr");

				row.forEach(function(column){
					var td = create("td");


					if (column.txt) td.innerHTML = column.txt;
					if (column.className) td.className = column.className;
					if (column.style) {
						var keys = Object.keys(column.style);
						keys.forEach(function(key){
							if (column.style[key])
								td.style[key] = column.style[key];
						});
					}
					if(column.span){
						if(column.span.colspan > 1)
							td.colSpan = column.span.colspan;
						if(column.span.rowspan > 1)
							td.rowSpan = column.span.rowspan;
					}
					tr.appendChild(td);
				});
				tableHTML.appendChild(tr);
			});
			container.appendChild(tableHTML);

			if(!options.nobreaks && i+1 < tableData.length){
				var br = create("DIV", {"class":"webix_print_pagebreak"});
				container.appendChild(br);
			}
			
		}, this));

		return container;
	}
};

export default CustomPrint;