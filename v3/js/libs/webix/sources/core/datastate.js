import {isArray, _to_array} from "../webix/helpers";

const DataState = {
	getState:function(){
		var cols_n = this.config.columns.length;
		var columns = this.config.columns;
		var settings = { 
			ids:[],
			size:[],
			select:this.getSelectedId(true),
			scroll:this.getScrollState()
		};
		for(var i = 0; i < cols_n; i++){
			var col = columns[i];
			settings.ids.push(col.id);
			settings.size.push((col.fillspace || col.adjust) ? -1 : col.width);
		}

		settings.order = [].concat(this._hidden_column_order.length ? this._hidden_column_order : settings.ids);

		if (this._last_order.length){
			var sort = this._last_order.map(id => {
				return { id:id, dir:this._last_sorted[id].dir };
			});
			settings.sort = (sort.length == 1) ? sort[0] : sort;
		}

		//this method will try to access the rendered values
		//just ignore it if grid is not rendered yet
		if (this._filter_elements && this._dtable_fully_ready) {
			var filter = {};
			var any_filter = 0;
			for (let key in this._filter_elements) {
				if (this._hidden_column_hash[key]) continue;

				var f = this._filter_elements[key];
				f[1].value = filter[key] = f[2].getValue(f[0]);
				any_filter = 1;
			}
			if (any_filter)
				settings.filter=filter;
		}

		settings.hidden = [];
		for (let key in this._hidden_column_hash)
			settings.hidden.push(key);
		
		return settings;
	},
	setState:function(obj){
		const columns = this.config.columns;
		if(!obj) return;

		this.markSorting();
		this._last_order = [];
		this._last_sorted = {};

		this.blockEvent();

		if (obj.order && obj.order.length){
			this._hidden_column_order = _to_array([].concat(obj.order));
			const rs = obj.order.length - this._settings.rightSplit;
			this._hidden_split = [this._settings.leftSplit, rs, this._settings.rightSplit];
		}

		if (obj.hidden){
			const hihash = {};
			for (let i=0; i<obj.hidden.length; i++){
				hihash[obj.hidden[i]] = true;
				if(!this._hidden_column_order.length)
					this.hideColumn(obj.hidden[i]);
			}

			if(this._hidden_column_order.length){
				for (let i=0; i<this._hidden_column_order.length; i++){
					const hikey = this._hidden_column_order[i];
					if (!!hihash[hikey] == !this._hidden_column_hash[hikey])
						this.hideColumn(hikey, {}, false, !!hihash[hikey]);
				}
			}
		}

		if (obj.ids){
			let reorder = false;
			for (let i=0; i<columns.length; i++)
				if (columns[i].id != obj.ids[i])
					reorder = true;
			if (reorder){
				for (let i=0; i<obj.ids.length; i++)
					columns[i] = this.getColumnConfig(obj.ids[i]) || columns[i];
				this.refreshColumns();
			}
		}

		if (obj.size){
			const cols_n = Math.min(obj.size.length, columns.length);
			for (let i = 0; i < cols_n; i++){
				const col = columns[i];
				if(col && obj.size[i] > 0 && col.width != obj.size[i]){
					delete col.fillspace;
					delete col.adjust;
					this._setColumnWidth( i, obj.size[i], true);
				}
			}
		}
		
		this.unblockEvent();

		const silent = !(this._settings.leftSplit || this._settings.rightSplit);
		this._updateColsSizeSettings(silent);
		this.callEvent("onStructureUpdate", []);

		const server = this._skip_server_op = { };
		if (obj.sort){
			let sort = obj.sort, multi = true;
			if (!isArray(sort)){
				sort = [sort]; multi = false;
			}
			for (let i=0; i<sort.length; i++){
				const col = this.getColumnConfig(sort[i].id);
				if (col) {
					this._sort(col.id, sort[i].dir, col.sort, multi);
					if (col.sort == "server") server.sort = true;
				}
			}
		}

		if (obj.filter){
			//temporary disable filtering 
			let temp = this.filterByAll;
			this.filterByAll = function(){};

			//apply defined filters
			for (let key in obj.filter) {
				const value = obj.filter[key];
				const f = this._filter_elements[key];
				if (!value || !f) continue;

				f[2].setValue(f[0], value);
				let contentid = f[1].contentId;
				if (contentid)
					this._active_headers[contentid].value = value;
			}

			//remove old filters
			for (let key in this._filter_elements){
				if (!obj.filter[key]){
					let f = this._filter_elements[key];
					f[2].setValue(f[0], "");
				}
			}
		
			//restore and apply filtering
			this.filterByAll = temp;
			this.filterByAll();
		}

		// apply server filter\sort once
		delete this._skip_server_op;
		if (server.sort || server.filter)
			this.loadNext(0, 0, 0, 0, true, true).then(() => {
				if (server.sort)
					this._on_after_sort(server.$params);
				if (server.filter)
					this._on_after_filter();
			});

		if (obj.select && this.select){
			let select = obj.select;
			this.unselect();
			for (let i = 0; i < select.length; i++)
				if (!select[i].row || this.exists(select[i].row))
					this._select(select[i], true);
		}

		if (obj.scroll)
			this.scrollTo(obj.scroll.x, obj.scroll.y);
	}
};

export default DataState;