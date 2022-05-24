import list from "../views/list";
import {insertBefore, remove, createCss} from "../webix/html";
import {protoUI} from "../ui/core";
import {$active} from "../webix/skin";
import {_to_array} from "../webix/helpers";
import {assert} from "../webix/debug";
import template from "../webix/template";


const api = {
	name:"unitlist",
	_id:/*@attr*/"webix_item_id",
	uniteBy_setter: template,
	render: function(id,data,type){
		const config = this._settings;
		if (!this.isVisible(config.id))
			return;
		if (!config.uniteBy)
			return;

		if (id){
			const cont = this.getItemNode(id); //get html element of updated item
			if (cont && type == "update" && (this._settings.uniteBy.call(this,data) == this.getItem(id).$unitValue)){
				const t = this._htmlmap[id] = this._toHTMLObject(data);
				insertBefore(t, cont);
				remove(cont);
				return;
			}
		}
		//full reset
		if (this.callEvent("onBeforeRender", [this.data])){
			this.units = null;
			this._setUnits();
			if (this.units){
				this.callEvent("onUnits", []);
				this._dataobj.innerHTML = this._getUnitRange().map(this._toHTML, this).join("");
				this._htmlmap = null; 
			}
			this.callEvent("onAfterRender", []);
		}
	},
	getUnits: function(){
		const result = [];
		if (this.units){
			for (let b in this.units){
				result.push(b);
			}
		}
		return result;	
	},
	getUnitList: function(id){
		return (this.units ? this.units[id] : null);
	},
	_toHTML: function(obj){
		//check if related template exist
		const mark = this.data._marks[obj.id];
		assert((!obj.$template || this.type["template" + obj.$template]),"RenderStack :: Unknown template: "+obj.$template);
		this.callEvent("onItemRender", [obj]);
		if (obj.$unit){
			return this.type.templateStartHeader(obj, this.type) + this.type.templateHeader.call(this,obj.$unit) + this.type.templateEnd(obj, this.type);
		}
		return this.type.templateStart(obj, this.type, mark) + (obj.$template ? this.type["template" + obj.$template] : this.type.template)(obj, this.type) + this.type.templateEnd(obj, this.type);
	},
	_getUnitRange: function(){
		let data = [];
		const min = this.data.$min || 0;
		const max = this.data.$max || Infinity;
		let count = 0;

		for (let u in this.units){
			data.push({ $unit:u });
			const unit = this.units[u];
			for (let i = 0; i < unit.length; i++){
				if (count == min) data = [{ $unit:u }];
				data.push(this.getItem(unit[i]));
				if (count == max) return _to_array(data);
				count++;
			}
		}

		return _to_array(data);
	},
	_setUnits: function(){
		const list = this;
		this.units = {};
		this.data.each(function(obj){
			var result = list._settings.uniteBy.call(this,obj);
			obj.$unitValue = result;
			if(!list.units[result])
				list.units[result] = [];
			list.units[result].push(obj.id);
		});
	},
	type:{
		headerHeight: 20,
		classname:function(obj, type, marks){
			let css = "webix_list_item";
			if (type.css)
				css += " webix_list_"+type.css+"_item";
			if (marks && marks.$css)
				css += " "+marks.$css;
			if (obj.$css){
				if (typeof obj.$css == "object")
					obj.$css = createCss(obj.$css);
				css += " "+obj.$css;
			}
			return css;
		},
		templateHeader: function(value){
			return "<span class='webix_unit_header_inner'>"+value+"</span>";
		},
		templateStart:function(obj,type,marks){
			if(obj.$unit)
				return type.templateStartHeader.apply(this,arguments);
			const style = "width:"+type.widthSize(obj,type,marks)+"; height:"+type.heightSize(obj,type,marks)+"; overflow:hidden;"+(type.layout&&type.layout=="x"?"float:left;":"");
			return "<div "+/*@attr*/"webix_item_id"+"=\""+obj.id+"\" class=\""+type.classname(obj,type,marks)+"\" style=\""+style+"\" "+type.aria(obj, type, marks)+">";
		},
		templateStartHeader:function(obj,type,marks){
			const className = "webix_unit_header"+(type.css?" webix_unit_header_"+type.css+"_item":"");
			const style = "width:"+type.widthSize(obj,type,marks)+"; height:"+type.headerHeight+"px; overflow:hidden;";
			return "<div "+/*@attr*/"webix_unit_id"+"=\""+obj.$unit+"\" class=\""+className+"\" style=\""+style+"\">";
		}
	},
	$skin: function(){
		list.api.$skin.call(this);

		this.type.headerHeight = $active.unitHeaderHeight;
	}
};


const view = protoUI(api,  list.view);
export default {api, view};