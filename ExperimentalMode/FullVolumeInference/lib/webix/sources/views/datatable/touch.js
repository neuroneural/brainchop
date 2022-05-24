import env from "../../webix/env";
import Touch from "../../core/touch";
import {extend, delay} from "../../webix/helpers";
import {attachEvent} from "../../webix/customevents";


attachEvent("onDataTable", function(table, config){
	if (env.touch){
		Touch.$init();
		config.scrollSize = 0;

		// needed to show datatable scroll
		if(Touch._disabled)
			Touch.limit();

		table.$ready.push(table.$touch);
	}
});

const Mixin = {
	$touch:function(){
		var config = this._settings;
		config.scrollAlignY = false;

		extend(this, (config.prerender===true)?this._touchNative:this._touch);
		
		var scrollMode = "";
		if (!config.autowidth && config.scrollX !== false)
			scrollMode += "x";
		if (!config.autoheight && config.scrollY !== false)
			scrollMode += "y";
		this._body.setAttribute("touch_scroll", scrollMode);
		
		Touch._init_scroll_node(this._body.childNodes[1].firstChild);
		Touch._set_matrix(this._body.childNodes[1].firstChild, 0,0,"0ms");
		this._sync_scroll(0,0,"0ms");
	},
	$hasYScroll(){
		return this._dtable_height - this._dtable_offset_height > 2;
	},
	_touchNative:{
		_scrollTo_touch:function(x,y){
			Touch._set_matrix(this._body.childNodes[1].firstChild, -x, -y,"0ms");
			this._sync_scroll(-x, -y,"0ms");

			this.callEvent("onAfterScroll", [{ e: -x, f: -y}]);
		},
		_getScrollState_touch:function(){
			var temp = Touch._get_matrix(this._body.childNodes[1].firstChild);
			return { x : -temp.e, y : -temp.f };
		},
		$init:function(){
			this.attachEvent("onBeforeScroll", function(){ 
				Touch._scroll_node = this._body.childNodes[1].firstChild;
				Touch._get_sizes(Touch._scroll_node);
				Touch._scroll_master = this;
			});
			this.attachEvent("onTouchEnd", function(){
				Touch._scroll_master = null;
			});
			this.attachEvent("onAfterScroll", function(result){
				//onAfterScroll may be triggered by some non-touch related logic
				if (!result) return;

				this._scrollLeft = -result.e;
				this._scrollTop = -result.f;

				if (this._x_scroll)
					this._x_scroll._settings.scrollPos = this._scrollLeft;

				if (this._y_scroll)
					this._y_scroll._settings.scrollPos = this._scrollTop;
			});
		},
		_sync_scroll:function(x,y,t){
			Touch._set_matrix(this._body.childNodes[1].firstChild, x, y, t);
			if (this._settings.leftSplit)
				Touch._set_matrix(this._body.childNodes[0].firstChild,0,y,t);
			if (this._settings.rightSplit)
				Touch._set_matrix(this._body.childNodes[2].firstChild,0,y,t);
			if (this._settings.header)
				Touch._set_matrix(this._header.childNodes[1].firstChild,x,0,t);
			if (this._settings.footer)
				Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);

			this.callEvent("onSyncScroll", [x,y,t]);
		},
		_sync_pos:function(){}
	},
	_touch:{
		_scrollTo_touch:function(x,y){
			delay(function(){
				this.callEvent("onAfterScroll", [{ e: -x, f: -y}]);	
			}, this);	
		},
		$scroll:{
			gravity:0,
			elastic:false
		},
		$init:function(){
			//if the result column's width < container's width,
			this.attachEvent("onAfterColumnHide", function(){
				this._scrollTo_touch(0, 0);
			});
			this.attachEvent("onBeforeScroll", function(){
				var t = Touch;
				t._scroll_node = this._body.childNodes[1].firstChild;
				t._get_sizes(t._scroll_node);
				t._scroll_stat.left = this._scrollLeft;
				t._scroll_stat.hidden = this._x_scroll._settings.scrollVisible || this._y_scroll._settings.scrollVisible;
				t._scroll_stat.dy = this._dtable_height;
				t._scroll_master = this;
			});
			this.attachEvent("onAfterRender", function(){
				if (this._x_scroll && this._settings.scrollX)
					this._x_scroll._fixSize();
				if (this._y_scroll && this._settings.scrollY)
					this._y_scroll._fixSize();
			});
			this.attachEvent("onAfterScroll", function(result){
				//onAfterScroll may be triggered by some non-touch related logic
				if (!result) return;

				var isScrollX = (this._scrollLeft != -result.e);
				var isScrollY = (this._scrollTop != -result.f);

				Touch._scroll_master = null;
				Touch._fix_f = null;

				this._scrollTop = 0;
				this._scrollLeft = 0;

				//ipad can delay content rendering if 3d transformation applied
				//switch back to 2d
				var temp = Touch.config.translate;
				Touch.config.translate = "translate";
				this._sync_scroll((this._x_scroll ? 0 : result.e), 0, 0);
				Touch.config.translate = temp;

				this._scrollLeft = -result.e;
				this._scrollTop = -result.f;
				this._correctScrollSize();

				this.render();

				if(isScrollX){
					if (this._x_scroll)
						this._x_scroll.scrollTo(this._scrollLeft);
					this.callEvent("onScrollX",[]);
				}
				if(isScrollY){
					if (this._y_scroll) 
						this._y_scroll.scrollTo(this._scrollTop);
					this.callEvent("onScrollY",[]);
				}

				return false;
			});
		},
		_sync_scroll:function(x,y,t){
			y += this._scrollTop;
			x += this._scrollLeft;

			Touch._set_matrix(this._body.childNodes[1].firstChild, x, y, t);
			if (this._settings.leftSplit)
				Touch._set_matrix(this._body.childNodes[0].firstChild,0,y,t);
			if (this._settings.rightSplit)
				Touch._set_matrix(this._body.childNodes[2].firstChild,0,y,t);
			if (this._settings.header)
				Touch._set_matrix(this._header.childNodes[1].firstChild,x,0,t);
			if (this._settings.footer)
				Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);

			this.callEvent("onSyncScroll", [x,y,t]);
		},
		_sync_pos:function(matrix){
			matrix.f -= this._scrollTop;
			matrix.e -= this._scrollLeft;
		}
	}
};

export default Mixin;