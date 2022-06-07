import {offset, insertBefore, remove} from "../webix/html";
import {bind, copy, isArray, _to_array} from "../webix/helpers";
import base from "../views/view";
import {_event} from "../webix/htmlevents";

import Touch from "../core/touch";
import DragControl from "../core/dragcontrol";

/*
	Renders collection of items on demand
*/
const VRenderStack = {
	$init:function(){
		this._htmlmap = {};
		_event(this._viewobj, "scroll", bind(function(){
			this.render(null, null, "paint");
		}, this));
	},
	_sync_scroll:function(x,y,t){
		if (this._settings.footer)
			Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);
		this.callEvent("onSyncScroll", [x,y,t]);
	},
	//return html container by its ID
	//can return undefined if container doesn't exists
	getItemNode:function(search_id){
		return this._htmlmap && this._htmlmap[search_id];
	},
	/*change scrolling state of top level container, so related item will be in visible part*/
	showItem:function(id){
		const index = this.data.getIndexById(id);
		if (index > -1){
			const top = index * this.type.height;
			const bottom = top + this.type.height;
			const scroll = this.getScrollState();
			const box = offset(this.$view);
			if (top < scroll.y)
				this.scrollTo(0, top);
			else if (bottom > scroll.y+box.height)
				this.scrollTo(0, bottom-box.height);
		}
	},
	//update view after data update
	//when called without parameters - all view refreshed
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;
		
		const parent = (this._renderobj||this._dataobj);

		if (id){
			if (type == "paint" || type == "update"){
				const cont = this.getItemNode(id); //get html element of updated item
				if (cont){
					const t = this._htmlmap[id] = this._toHTMLObject(data);
					t.style.top = cont.style.top;
					t.style.position = "absolute";
					t.style.left = 0; t.style.width = "100%";

					insertBefore(t, cont); 
					remove(cont);
					return;
				}
				//updating not rendered yet item
				return;
			}
		}

		let isDrag, source, marked = this._marked_item_id;
		if (DragControl.active && type != "drag-end"){
			const context = DragControl.getContext();
			isDrag = this._init_drop_area && context.from === this;		//move and order modes
			source = isDrag && _to_array(copy(context.source||[]));
		}

		if (type != "paint" || isDrag){
			//repaint all
			this._htmlmap = {};
			parent.innerHTML = "";
		}

		//full reset
		if (this.callEvent("onBeforeRender",[this.data])){
			const count = this.data.count();
			const scroll = this.getScrollState();
			const box = offset(this._viewobj);

			let top = Math.floor(scroll.y / this.type.height)-2;
			let bottom = Math.ceil((scroll.y + box.height) / this.type.height)+2;

			top = Math.max(0, top);
			bottom = Math.min(count-1, bottom+(isDrag?source.length-1:0));

			const html = [];
			for (let i=top; i<=bottom; i++){
				const sid = this.data.order[i];
				if (isDrag && source.find(sid) !== -1){
					if (sid == marked) marked = this.data.order[i+1];
					continue;
				} else if (!this._htmlmap[sid]){
					const item = this.data.getItem(sid);
					if (!item){
						this._run_load_next({ 
							count:bottom-i+(this._settings.loadahead || 0),
							start:i 
						});
						break;
					}
					html.push(this._toHTML(item));
				} else {
					html.push(`<div webix_skip="true" ${this._id}="${sid}"></div>`);
				}
			}
			this._html.innerHTML = html.join("");

			if (this._init_drop_area && type == "drag-in"){			// can be external
				const node = this._html.querySelector(`[${this._id}="${marked}"]`);
				if (node) {
					this._html.insertBefore(DragControl._dropHTML[0], node);
				} else this._html.appendChild(DragControl._dropHTML[0]);
			}

			parent.style.position = "relative";
			parent.style.height = count*this.type.height+"px";

			const kids = this._html.childNodes;
			for (let i=kids.length-1; i>=0; i--){
				const child = kids[i];
				if (child.getAttribute("webix_skip")) continue;

				const cid = child.getAttribute(this._id);
				if (cid){
					child.style.position = "absolute";
					child.style.top = (top+i)*this.type.height+"px";
					child.style.left = 0; child.style.width = "100%";

					parent.appendChild(child);
					this._htmlmap[cid] = child;
				}
			}
			
			this.callEvent("onAfterRender",[]);
		}
	},
	$setSize:function(){
		if (base.api.$setSize.apply(this, arguments)){
			this.render(null, null, "paint");
		}
	},
	_run_load_next:function(conf){
		const count = Math.max(conf.count, (this._settings.datafetch||this._settings.loadahead||0));
		if (this._maybe_loading_already(conf.count, conf.start)) return;
		this.loadNext(count, conf.start);
	},
	_set_drop_area:function(){
		this.render(null, null, "drag-in");
	},
	_remove_drop_area:function(){
		remove(DragControl._dropHTML);
		this.render(null, null, "drag-out");
	},
	$dragDestroy: function(){
		if (this._init_drop_area) {
			const context = DragControl._drag_context;
			if (isArray(context.source))
				this._remove_css(context.source, "webix_invisible");
			this.render(null, null, "drag-end");
		}
		remove(DragControl._html);
	},
};

export default VRenderStack;