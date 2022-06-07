import {delay} from "../webix/helpers";
import {ui, $$} from "../ui/core";


const PagingAbility = {
	pager_setter:function(pager){
		if (typeof pager == "string"){
			var ui_pager = $$(pager);
			if (!ui_pager){
				this.$blockRender = true;
				delay(function(){
					var obj = $$(pager);

					this._settings.pager = this.pager_setter(obj);
					var s = obj._settings;
					s.count = this.data._count_pager_total(s.level);
					obj.refresh();

					this.$blockRender = false;
					this.render();
				}, this);
				return null;
			}
			pager = ui_pager;
		}

		function check_pager_sizes(repeat){
			// reset topSplit - since now the pager is responsible for rendering
			if (this.config.topSplit)
				this.config.topSplit = 0;

			if (pager.config.autosize && this.getVisibleCount){
				var count = this.getVisibleCount();
				if (isNaN(count)){
					pager.config.size = 1;
					delay(check_pager_sizes, this, [true]);
				} else if (count != pager.config.size){
					pager.config.size = count;
					pager.refresh();
					if (repeat === true)
						this.refresh();
				}
			}
			
			var s = this._settings.pager;
			//initial value of pager = -1, waiting for real value
			if (s.page == -1) return false;	
			
			this.data.$min = this._count_pager_index(0, s.page*s.size);	//affect data.getRange
			this.data.$max = this._count_pager_index(this.data.$min, s.size);
			this.data.$pagesize = this.data.$max - this.data.$min;

			return true;
		}

		this.attachEvent("onBeforeRender",check_pager_sizes);

		if (!pager.$view){
			pager.view = "pager";
			pager = ui(pager);
		}
		this._pager = pager;
		pager.$master = this;

		this.data.attachEvent("onStoreUpdated", function(){
			var s = pager._settings;
			s.count = this._count_pager_total(s.level);
			pager.refresh();
		});
		this.data._count_pager_total = this._count_pager_total;

		return pager._settings;
	},
	_count_pager_total:function(level){
		if (level && level !== 0){
			var count = 0; 
			this.each(function(obj){
				if (obj.$level == level) count++;
			});
			return count;
		} else
			return this.count();
	},
	_count_pager_index:function(start, count){
		var s = this._settings.pager;

		if (s.level && s.level !== 0){
			var end = start;
			var max = this.data.order.length;

			if (count)
				while (end < max){
					if (this.data.order[end] && this.data.getItem(this.data.order[end]).$level == s.level){
						if (count === 0)
							break;
						else
							count--;
					}
					end++;
				}

			return end;
		} else
			return start+count;
	},
	setPage:function(value){
		if (this._pager)
			this._pager.select(value);
	},
	getPage:function(){
		return this._pager._settings.page;
	},
	getPager:function(){
		return this._pager;
	}
};

export default PagingAbility;