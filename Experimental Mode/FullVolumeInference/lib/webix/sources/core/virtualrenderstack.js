import {insertBefore, remove} from "../webix/html";
import env from "../webix/env";
import {bind} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import {assert} from "../webix/debug";


/*
	Renders collection of items
	Always shows y-scroll
	Can be used with huge datasets
	
	@export
		show
		render
*/

const VirtualRenderStack ={
	$init:function(){
		assert(this.render,"VirtualRenderStack :: Object must use RenderStack first");

		this._htmlmap={}; //init map of rendered elements

		//we need to repaint area each time when view resized or scrolling state is changed
		_event(this._viewobj,"scroll",bind(this._render_visible_rows,this));

		//here we store IDs of elemenst which doesn't loadede yet, but need to be rendered
		this._unrendered_area=[];
	},
	//return html object by item's ID. Can return null for not-rendering element
	getItemNode:function(search_id){
		//collection was filled in _render_visible_rows
		return this._htmlmap[search_id];
	},
	//adjust scrolls to make item visible
	showItem:function(id){
		var range = this._getVisibleRange();
		var ind = this.data.getIndexById(id);
		//we can't use DOM method for not-rendered-yet items, so fallback to pure math
		var dy = Math.floor(ind/range._dx)*range._y;
		var state = this.getScrollState();
		if (dy<state.y || dy + this._settings.height >= state.y + this._content_height)
			this.scrollTo(0, dy);
	},
	//repain self after changes in DOM
	//for add, delete, move operations - render is delayed, to minify performance impact
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;
		
		if (id){
			var cont = this.getItemNode(id);	//old html element
			switch(type){
				case "update":
					if (!cont) return;
					//replace old with new
					var t = this._htmlmap[id] = this._toHTMLObject(data);
					insertBefore(t, cont); 
					remove(cont);
					break;
				default: // "move", "add", "delete"
					/*
						for all above operations, full repainting is necessary
						but from practical point of view, we need only one repainting per thread
						code below initiates double-thread-rendering trick
					*/
					this._render_delayed();
					break;
			}
		} else {
			//full repainting
			if (this.callEvent("onBeforeRender",[this.data])){
				this._htmlmap = {}; 					//nulify links to already rendered elements
				this._render_visible_rows(null, true);	
				// clear delayed-rendering, because we already have repaint view
				this._wait_for_render = false;			
				this.callEvent("onAfterRender",[]);
			}
		}
	},
	//implement double-thread-rendering pattern
	_render_delayed:function(){
		//this flag can be reset from outside, to prevent actual rendering 
		if (this._wait_for_render) return;
		this._wait_for_render = true;	
		
		window.setTimeout(bind(function(){
			this.render();
		},this),1);
	},
	//create empty placeholders, which will take space before rendering
	_create_placeholder:function(height){
		if(env.maxHTMLElementSize)
			height = Math.min(env.maxHTMLElementSize, height);
		var node = document.createElement("DIV");
		node.style.cssText = "height:"+height+"px; width:100%; overflow:hidden;";
		return node;
	},
	/*
		Methods get coordinatest of visible area and checks that all related items are rendered
		If, during rendering, some not-loaded items was detected - extra data loading is initiated.
		reset - flag, which forces clearing of previously rendered elements
	*/
	_render_visible_rows:function(e,reset){
		this._unrendered_area=[]; //clear results of previous calls
		
		var viewport = this._getVisibleRange();	//details of visible view

		if (!this._dataobj.firstChild || reset){	//create initial placeholder - for all view space
			this._dataobj.innerHTML="";
			this._dataobj.appendChild(this._create_placeholder(viewport._max));
			//register placeholder in collection
			this._htmlrows = [this._dataobj.firstChild];
		}
		
		/*
			virtual rendering breaks all view on rows, because we know widht of item
			we can calculate how much items can be placed on single row, and knowledge 
			of that, allows to calculate count of such rows
			
			each time after scrolling, code iterate through visible rows and render items 
			in them, if they are not rendered yet
			
			both rendered rows and placeholders are registered in _htmlrows collection
		*/

		//position of first visible row
		var t = viewport._from;
			
		while(t<=viewport._height){	//loop for all visible rows
			//skip already rendered rows
			while(this._htmlrows[t] && this._htmlrows[t]._filled && t<=viewport._height){
				t++; 
			}
			//go out if all is rendered
			if (t>viewport._height) break;
			
			//locate nearest placeholder
			var holder = t;
			while (!this._htmlrows[holder]) holder--;
			var holder_row = this._htmlrows[holder];
			
			//render elements in the row			
			var base = t*viewport._dx+(this.data.$min||0);	//index of rendered item
			if (base > (this.data.$max||Infinity)) break;	//check that row is in virtual bounds, defined by paging
			var nextpoint =  Math.min(base+viewport._dx-1,(this.data.$max?this.data.$max-1:Infinity));
			var node = this._create_placeholder(viewport._y);
			//all items in rendered row
			var range = this.data.getIndexRange(base, nextpoint);
			if (!range.length) break; 
			
			var loading = { $template:"Loading" };
			for (let i=0; i<range.length; i++){
				if (!range[i])
					this._unrendered_area.push(base+i);
				range[i] = this._toHTML(range[i]||loading);
			}

			node.innerHTML=range.join(""); 	//actual rendering
			for (let i=0; i < range.length; i++)					//register all new elements for later usage in getItemNode
				this._htmlmap[this.data.getIdByIndex(base+i)]=node.childNodes[i];
			
			//correct placeholders
			var h = parseFloat(holder_row.style.height,10);
			var delta = (t-holder)*viewport._y;
			var delta2 = (h-delta-viewport._y);
			
			//add new row to the DOOM
			insertBefore(node,delta?holder_row.nextSibling:holder_row,this._dataobj);
			this._htmlrows[t]=node;
			node._filled = true;
			
			/*
				if new row is at start of placeholder - decrease placeholder's height
				else if new row takes whole placeholder - remove placeholder from DOM
				else 
					we are inserting row in the middle of existing placeholder
					decrease height of existing one, and add one more, 
					before the newly added row
			*/
			if (delta <= 0 && delta2>0){
				holder_row.style.height = delta2+"px";
				this._htmlrows[t+1] = holder_row;
			} else {
				if (delta<0)
					remove(holder_row);
				else
					holder_row.style.height = delta+"px";
				if (delta2>0){ 
					var new_space = this._htmlrows[t+1] = this._create_placeholder(delta2);
					insertBefore(new_space,node.nextSibling,this._dataobj);
				}
			}
			
			
			t++;
		}
		
		//when all done, check for non-loaded items
		if (this._unrendered_area.length){
			//we have some data to load
			//detect borders
			var from = this._unrendered_area[0];
			var to = this._unrendered_area.pop()+1;
			if (to>from){
				//initiate data loading
				var count = to - from;
				if (this._maybe_loading_already(count, from)) return;

				count = Math.max(count, (this._settings.datafetch||this._settings.loadahead||0));
				this.loadNext(count, from);
			}
		}
	},
	//calculates visible view
	_getVisibleRange:function(){
		var state = this.getScrollState();
		var top = Math.max(0, state.y);
		var tpadding = this._tilesPadding||0;
		var width = this._content_width - tpadding; 
		var height = this._content_height - tpadding/2;

		//size of single item
		var t = this.type;

		var dx = Math.floor(width/t.width)||1; //at least single item per row
		
		var min = Math.floor(top/t.height);				//index of first visible row
		var dy = Math.ceil((height+top)/t.height)-1;		//index of last visible row
		//total count of items, paging can affect this math
		var count = this.data.$max?(this.data.$max-this.data.$min):this.data.count();
		var max = Math.ceil(count/dx)*t.height;			//size of view in rows

		return { _from:min, _height:dy, _top:top, _max:max, _y:t.height, _dx:dx};
	},
	_cellPosition:function(id){
		var html = this.getItemNode(id);
		if (!html){
			this.showItem(id);
			this._render_visible_rows();
			html = this.getItemNode(id);
		}
		return {
			left:html.offsetLeft, 
			top:html.offsetTop,
			height:html.offsetHeight,
			width:html.offsetWidth,
			parent:this._contentobj
		};
	}
};

export default VirtualRenderStack;