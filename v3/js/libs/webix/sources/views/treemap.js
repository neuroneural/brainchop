import proto from "../views/proto";
import Group from "../core/group";
import TreeAPI from "../core/treeapi";
import SelectionModel from "../core/selectionmodel";
import KeysNavigation from "../core/keysnavigation";
import MouseEvents from "../core/mouseevents";
import Scrollable from "../core/scrollable";
import TreeDataLoader from "../core/treedataloader";
import TreeRenderStack from "../core/treerenderstack";
import CopyPaste from "../core/copypaste";
import EventSystem from "../core/eventsystem";
import {insertBefore, remove, locate, createCss} from "../webix/html";
import {protoUI} from "../ui/core";
import template from "../webix/template";
import {extend, bind, copy} from "../webix/helpers";
import i18n from "../webix/i18n";
import TreeStore from "../core/treestore";


const api = {
	name: "treemap",
	defaults: {
		activeItem: false,
		subRender: true,
		header: true,
		headerHeight: 35,
		value: template("#value#"),
		headerTemplate: "",
		navigation:true
	},
	value_setter: template,
	headerTemplate_setter: template,
	header_setter: function(value){
		if(value && value !== true){
			this.type.header = value;
		}
		return value;
	},
	$init: function(){
		this.$view.className += " webix_treemap";
		this._viewobj.setAttribute("role", "tree");

		this._htmlElement = document.createElement("DIV");

		extend(this.data, TreeStore, true);
		this.data.provideApi(this,true);

		this.data.attachEvent("onClearAll", bind(function(){
			this._html = "";
			this.$values = {};
			this.$xy = {};
		},this));

		this.attachEvent("onKeyPress", this._onKeyPress);
	},
	_toHTMLItem:function(obj){
		var mark = this.data._marks[obj.id];
		this.callEvent("onItemRender",[obj]);
		var template = (obj.$template?this.type["template"+obj.$template].call(this,obj,this.type,mark):this.type.template.call(this,obj,this.type,mark));
		return this.type.templateStart.call(this,obj,this.type,mark) + template + this.type.templateEnd.call(this);
	},
	_renderHeader: function(id){
		var item = this.getItem(id);
		var height = this._settings.headerHeight;
		var html = "<div class='webix_treemap_header' style='height:"+height+"px;line-height:"+height+"px;'>";
		html += this.type.header.call(this, item, this.type);
		html += "</div>";
		return html;
	},
	_renderBranch:function(pId){
		var sizes, row, value, sum,
			leaves = [];

		if(!this.$width || !this.count()){
			this._html = "";
			return false;
		}

		if(!pId){
			pId = this.config.branch||0;
			this._html = "";
			this.$values = {};
			this.$xy = {};
			this.$xy[pId] = {
				width: this.$width,
				height: this.$height,
				top: 0,
				left: 0
			};
			// header
			if(pId && this._settings.header){
				this.$xy[pId].height -= this._settings.headerHeight;
				this.$xy[pId].top = this._settings.headerHeight;
				this._html += this._renderHeader(pId);
			}

			// values calculation
			sum = 0;
			this.data.each(function(item){
				var parentId = this.getParentId(item.id);
				if(!this.data.branch[item.id]){
					value = this.config.value.call(this,item)*1;
					if(!isNaN(value) && value){
						this.$values[item.id] = value;
						sum += value;
						while(parentId){
							if(!this.$values[parentId])
								this.$values[parentId] = 0;
							this.$values[parentId] +=  value;
							parentId = this.getParentId(parentId);
						}

					}
				}
			}, this, false, pId);
		}

		this.data.eachChild(pId, function(item){
			if(this.$values[item.id])
				leaves.push(copy(item));
		}, this);

		sum = sum || this.$values[pId];

		if(leaves.length && sum){
			sizes = this.$xy[pId];
			row ={ top: sizes.top, left:sizes.left, dx: sizes.width, dy: sizes.height, set:[], sum:0 };
			row.dim = Math.min(row.dx,row.dy);
			let delta = row.dx*row.dy/sum; //total area
			for (let i=0; i< leaves.length; i++)
				leaves[i].$value = this.$values[leaves[i].id]*delta; //normalized value


			leaves.sort(function(a,b){
				return a.$value >b.$value?-1:1;
			});

			var bad = Infinity;
			let i = 0;
			while(leaves[i]){
				var check=this._worst(row, leaves[i]);
				if (check<bad){
					row.sum += leaves[i].$value;
					row.set.push(leaves[i]);
					bad=check;
					i++;
				} else {
					this._renderRow(row);
					var r = { top:row.top, left:row.left, dx:row.dx, dy:row.dy, set:[], sum:0 };
					let delta = row.sum/row.dim;
					if (row.dx > row.dy){
						r.left += delta;
						r.dx -= delta;
					} else {
						r.top += delta;
						r.dy -= delta;
					}
					row=r;
					row.dim = Math.min(row.dx,row.dy);
					bad=Infinity;
				}
			}
		}
		if(row)
			this._renderRow(row);
	},
	_renderRow:function(row){
		var i, id, x, y,
			top=row.top,
			left=row.left;

		row.mode=(row.dy<row.dx);
		row.contra=(row.sum/row.dim);

		for (i=0; i<row.set.length; i++){
			id=row.set[i].id;
			if (row.mode){
				x=row.contra;
				y=row.set[i].$value/row.contra;
			} else {
				x=row.set[i].$value/row.contra;
				y=row.contra;
			}
			this.$xy[id] = {};
			this.$xy[id].top = top;
			this.$xy[id].left = left;
			if (row.mode)
				top += y;
			else
				left += x;

			this.$xy[id].width = x;
			this.$xy[id].height = y;

			this._html += this._toHTMLItem(this.getItem(id));
			if(this._settings.subRender && this.data.branch[id])
				this._renderBranch(id);
		}
	},
	_worst:function(row, add){
		var s = row.sum + add.$value;
		var a = (s*s) /( row.dim*row.dim*add.$value);
		if (row.set.length){
			a=Math.max(row.dim*row.dim*row.set[0].$value/(s*s),a);
		}
		return a>1?a:(1/a);
	},
	_toHTMLObject:function(obj){
		this._htmlElement.innerHTML = this._toHTMLItem(obj);
		return this._htmlElement.firstChild;
	},
	showBranch: function(id){
		this._settings.branch = id;
		this.refresh();
	},
	render:function(id,data,type){
		if (!this.isVisible(this._settings.id) || this.$blockRender)
			return;

		if(type == "update"){
			var cont = this.getItemNode(id); //get html element of updated item
			if(cont){
				var t = this._htmlmap[id] = this._toHTMLObject(data);
				insertBefore(t, cont);
				remove(cont);
			}
		}
		else if(this.data.branch && (!this._settings.branch || this.data.branch[this._settings.branch])){
			this._htmlmap = null;
			this.callEvent("onBeforeRender",[]);
			this._renderBranch();
			this._dataobj.innerHTML = this._html;
			this.callEvent("onAfterRender",[]);
		}
		return true;
	},
	_id:/*@attr*/"webix_dm_id",
	on_click:{
		webix_treemap_item:function(e,id){
			if (this._settings.select){
				if (this._settings.select=="multiselect"  || this._settings.multiselect)
					this.select(id, false, (e.ctrlKey || e.metaKey || (this._settings.multiselect == "touch")), e.shiftKey);
				else
					this.select(id);
			}
			if(this._settings.activeItem && this.isBranch(id)){
				this.showBranch(id);
			}
		},
		webix_treemap_header_item: function(e){
			var id = locate(e, /*@attr*/"webix_dm_header_id");
			this.define("branch", id);
			this.refresh();
		},
		webix_treemap_reset: function(){
			this.define("branch", 0);
			this.refresh();
		}
	},
	on_dblclick:{
	},
	on_mouse_move:{
	},
	_getCssText: function(style){
		var css = "";
		for(var property in style){
			css += property+":"+style[property]+";";
		}
		return css;
	},
	type:{
		//normal state of item
		template:template("#value#"),
		header: function(obj, common){
			var id = obj.id;
			var resetIcon = "<div role='button' tabindex='0' aria-label='"+i18n.aria.resetTreeMap+"' class='webix_treemap_reset'></div>";
			var arr = [];
			while(id){
				obj = this.getItem(id);
				arr.push(common.headerItem.call(this, obj, common));
				id = this.getParentId(id);
			}
			arr.reverse();
			return resetIcon + arr.join("<span class='webix_icon wxi-angle-right webix_treemap_path_icon'></span>");
		},
		headerItem: function(obj){
			var template = this.config.headerTemplate(obj);
			var html = "<a role=\"button\" tabindex=\"0\" aria-label=\""+template+"\" "+/*@attr*/"webix_dm_header_id"+"=\""+obj.id+"\" class=\"webix_treemap_header_item\">";
			html += template;
			html += "</a>";
			return html;
		},
		classname:function(obj, common, marks){
			var css = "webix_treemap_item";

			if (common.css) css += " "+common.css;

			if (obj.$css){
				if (typeof obj.$css == "object")
					obj.$css = createCss(obj.$css);
				css +=" "+obj.$css;
			}

			var xy = this.$xy[obj.id];

			if (marks && marks.$css) css +=" "+marks.$css;

			css += " webix_treemap_level_" + this.getItem(obj.id).$level;

			var parentId = this.getParentId(obj.id);

			if(!parentId || parentId == this._settings.branch)
				css += " webix_treemap_level_top";

			if(this.$height - xy.top - xy.height < 1)
				css += " webix_treemap_item_bottom";

			if(this.$width - xy.left - xy.width   < 1)
				css += " webix_treemap_item_right";

			if(common.cssClass){
				var cssClass = common.cssClass.call(this, obj, common, marks);
				if(cssClass){
					if(typeof cssClass == "object"){
						css += " "+ createCss(cssClass);
					}
					else
						css += " "+cssClass;
				}
			}
			return css;
		},
		templateStart:function(obj,type,marks){
			var style="";
			if(this.$xy){
				var xy = this.$xy[obj.id];
				style += "width: "+ xy.width +"px; height: " + xy.height+"px;";
				style += "top: "+ xy.top+"px; left: " + xy.left+"px;";
			}
			return "<div role=\"treeitem\" aria-level=\""+obj.$level+"\" "+(marks && marks.webix_selected?"aria-selected=\"true\" tabindex=\"0\"":"")+" "+/*@attr*/"webix_dm_id"+"=\""+obj.id+"\" class=\""+type.classname.call(this,obj,type,marks)+"\" style=\""+style+"\">";
		},
		templateEnd:template("</div>")
	}
};


const view = protoUI(api, Group, TreeAPI, SelectionModel, KeysNavigation, MouseEvents, Scrollable, TreeDataLoader, proto.view, TreeRenderStack, CopyPaste, EventSystem);
export default {api, view};