import base from "../views/view";
import DataLoader from "../core/dataloader";
import EventSystem from "../core/eventsystem";
import {protoUI} from "../ui/core";
import template from "../webix/template";
import promise from "../thirdparty/promiz";
import {extend, bind, isUndefined} from "../webix/helpers";


var google, script;
const api = {
	name:"geochart",
	defaults:{
		chart:{
			displayMode:"auto",
			region:"world",
			resolution:"countries"
		}
	},
	$init:function(config){
		this.$view.innerHTML = "<div class='webix_map_content' style='width:100%;height:100%'></div>";
		this._contentobj = this.$view.firstChild;
		this._waitMap = promise.defer();

		config.chart = extend(config.chart||{}, this.defaults.chart);

		this.data.provideApi(this, true);
		this.$ready.push(this.render);

		this.data.attachEvent("onClearAll", bind(this._refreshColumns, this)); 
		this.data.attachEvent("onStoreUpdated", bind(this._drawData, this));
	},
	getMap:function(waitMap){
		return waitMap?this._waitMap:this._map;
	},
	_getCallBack:function(prev){
		return bind(function(){
			if (typeof prev === "function") prev();

			google = google || window.google;
			this._initMap();
		}, this);
	},
	render:function(){
		if(typeof window.google=="undefined"||typeof window.google.charts=="undefined"){
			if(!script){
				script = document.createElement("script");
				script.type = "text/javascript";

				script.src = "//www.gstatic.com/charts/loader.js";
				document.getElementsByTagName("head")[0].appendChild(script);
			}
			script.onload = this._getCallBack(script.onload);
		}
		else //there's a custom link to google api in document head
			(this._getCallBack())();
	},
	_initMap:function(){
		if(!google.visualization || !google.visualization.GeoChart){
			google.charts.load("current", {
				"packages":["geochart"],
				"mapsApiKey": this._settings.key
			});
			google.charts.setOnLoadCallback(bind(function(){
				this._initMap();
			}, this));
		}
		else{
			this._map = new google.visualization.GeoChart(this._contentobj);
			this._mapEvents();
			
			this._waitMap.resolve(this._map);
		}
	},
	$onLoad:function(obj){
		if(!this._map){
			this._waitMap.then(bind(function(){
				this.parse(obj, this._settings.datatype);
			}, this));
			return true;
		}
		return false;
	},
	_drawData:function(){
		if(!this._map){
			if(!this._map) 
				this._waitMap.then(bind(this._drawData, this));
			return;
		}
			
		var columns = this._columns&&this._columns.length?this._columns:this._defineColumns();
		var data = [];
		this.data.each(function(obj){
			var line = [];
			for(var c = 0; c<columns.length; c++){
				var value = obj[columns[c].label];
				if(columns[c].type == "number")
					value = value*1;
				else if(columns[c].role =="tooltip")
					value = this._settings.tooltip(obj);
				line.push(value);
			}
			data.push(line);
		}, this);

		if(columns.length){
			var table = new google.visualization.DataTable();
			for(var i = 0; i<columns.length; i++)
				table.addColumn(columns[i]);
			table.addRows(data);
			
			var view = new google.visualization.DataView(table);
			this._map.draw(view, this._settings.chart);
		}
		else //draw clean chart
			this._map.draw(google.visualization.arrayToDataTable([["", ""]]), {});

	},
	setDisplayMode:function(value){
		this._settings.chart.displayMode = value;
		this.refresh();
	},
	setRegion:function(value){
		this._settings.chart.region = value;
		this.refresh();
	},
	refresh:function(){
		this._map.clearChart();
		this._drawData();
	},
	tooltip_setter:function(value){
		var tooltip = this._settings.chart.tooltip;
		this._settings.chart.tooltip = extend(tooltip || {}, {isHtml:true});
		return template(value);
	},
	$setSize:function(w, h){
		if (base.api.$setSize.apply(this, arguments) && this._map){
			extend(this._settings, {width:w, height:h});
			this.refresh();
		}
	},
	_refreshColumns:function(){
		this._columns = null;
		this._drawData();
	},
	_getColumnType:function(item, key){
		if (!item || isUndefined(item[key]))
			return "string";

		var type = typeof item[key];
		if(type =="string" && !isNaN(item[key]*1)) 
			type = "number";
		return type;
	},
	_defineColumns:function(){
		var columns = this._settings.columns || [];
		var item = this.data.pull[this.data.order[0]];
		
		//auto columns
		if (!columns.length && item){
			for (var key in item)
				if (key !== "id") columns.push(key);
		}
		//["title", "area"]
		for(var i=0; i<columns.length; i++){
			if (typeof columns[i] !== "object"){
				columns[i] = {type:this._getColumnType(item, columns[i]), label:columns[i]};
			}
		}
		
		if(this._settings.tooltip)
			columns.push({type:"string", role:"tooltip", p:{"html": true}});

		this._columns  = columns;
		return columns;
	},
	_mapEvents:function(){
		google.visualization.events.addListener(this._map, "error", bind(function(){this.callEvent("onMapError", arguments);}, this));
		google.visualization.events.addListener(this._map, "ready", bind(function(){this.callEvent("onMapReady", arguments);}, this));
		google.visualization.events.addListener(this._map, "regionClick", bind(function(){this.callEvent("onRegionClick", arguments);}, this));
		google.visualization.events.addListener(this._map, "select", bind(function(){
			var selnow = this._map.getSelection()[0];
			var sel = selnow || this._selprev;
			if(sel){
				var id = this.data.order[sel.row];
				this._selprev = sel;
				this.callEvent("onItemClick", [id, !!selnow]);
			}
		}, this));
	}
};


const view = protoUI(api,  DataLoader, EventSystem, base.view);
export default {api, view};