import {extend, _to_array, uid, isUndefined, copy, isArray, bind} from "../webix/helpers";
import {$$} from "../ui/core";
import {assert} from "../webix/debug";
import {callEvent} from "../webix/customevents";

import EventSystem from "./eventsystem";
import DataDriver from "../load/drivers/index";




/*
	DataStore is not a behavior, it standalone object, which represents collection of data.
	Call provideAPI to map data API

	@export
		exists
		getIdByIndex
		getIndexById
		get
		set
		refresh
		count
		sort
		filter
		next
		previous
		clearAll
		first
		last
*/

function DataStore(){
	this.name = "DataStore";
	
	extend(this, EventSystem);

	this.setDriver("json");	//default data source is an
	this.pull = {};						//hash of IDs
	this.order = _to_array();		//order of IDs
	this._marks = {};
}

DataStore.prototype={
	//defines type of used data driver
	//data driver is an abstraction other different data formats - xml, json, csv, etc.
	setDriver:function(type){
		assert(DataDriver[type],"incorrect DataDriver");
		this.driver = DataDriver[type];
	},
	//process incoming raw data
	_parse:function(data){
		this.callEvent("onParse", [this.driver, data]);

		if (this._filter_order)
			this.filter();
	
		//get size and position of data
		var info = this.driver.getInfo(data);

		if (info.config)
			this.callEvent("onServerConfig",[info.config]);

		var options = this.driver.getOptions(data);
		if (options)
			this.callEvent("onServerOptions", [options]);

		//get array of records
		var recs = this.driver.getRecords(data);

		this._inner_parse(info, recs);

		//in case of tree store we may want to group data
		if (this._scheme_group && this._group_processing && !this._not_grouped_order)
			this._group_processing(this._scheme_group);

		//optional data sorting
		if (this._scheme_sort){
			this.blockEvent();
			this.sort(this._scheme_sort);
			this.unblockEvent();
		}

		this.callEvent("onStoreLoad",[this.driver, data]);
		//repaint self after data loading
		this.refresh();
	},
	_inner_parse:function(info, recs){
		var from = info.from;
		var subload = true;
		var marks = false;

		//some data is loaded and new data doesn't have "pos" - assuming update
		if (!from && from !== 0 && this.order[0]){
			if (this._removeMissed){
				//update mode, create kill list
				marks = {};
				for (let i=0; i<this.order.length; i++)
					marks[this.order[i]]=true;
			}
			
			subload = false;
			from = this.order.length;
		} else 
			from = (from || 0)*1;

		var j=0;
		for (let i=0; i<recs.length; i++){
			//get hash of details for each record
			var temp = this.driver.getDetails(recs[i]);
			var id = this.id(temp); 	//generate ID for the record
			if (!this.pull[id]){		//if such ID already exists - update instead of insert
				this.order[j+from]=id;	
				j++;
			} else if (subload && this.order[j+from])
				j++;

			if(this.pull[id]){
				extend(this.pull[id],temp,true);//add only new properties
				if (this._scheme_update)
					this._scheme_update(this.pull[id]);
				//update mode, remove item from kill list
				if (marks)
					delete marks[id];
			} else{
				this.pull[id] = temp;
				if (this._scheme_init)
					this._scheme_init(temp);
			}
			
		}

		//update mode, delete items which are not existing in the new xml
		if (marks){
			this.blockEvent();
			for (var delid in marks)
				this.remove(delid);
			this.unblockEvent();
		}

		var endpos = info.size * 1;
		if (endpos) {
			if (!this.order[endpos-1])
				this.order[endpos-1] = undefined;
			if (endpos < this.order.length)
				this.order = _to_array(this.order.slice(0, endpos));
		}
	},
	//generate id for data object
	id:function(data){
		return data.id||(data.id=uid());
	},
	changeId:function(old, newid){
		//assert(this.pull[old],"Can't change id, for non existing item: "+old);
		if(old == newid) return;
		
		if(this.pull[old])
			this.pull[newid] = this.pull[old];
		
		this.pull[newid].id = newid;
		this.order[this.order.find(old)]=newid;
		if (this._filter_order)
			this._filter_order[this._filter_order.find(old)]=newid;
		if (this._marks[old]){
			this._marks[newid] = this._marks[old];
			delete this._marks[old];
		}


		this.callEvent("onIdChange", [old, newid]);
		if (this._render_change_id)
			this._render_change_id(old, newid);
		delete this.pull[old];
	},
	//get data from hash by id
	getItem:function(id){
		return this.pull[id];
	},
	//assigns data by id
	updateItem:function(id, update, mode){
		if (typeof id === "object")
			id = id.toString();

		var data = this.getItem(id);
		var old = null;

		//check is change tracking active
		var changeTrack = this.hasEvent("onDataUpdate");
	
		assert(data, "Invalid ID for updateItem");
		assert(!update || !update.id || update.id == id, "Attempt to change ID in updateItem");
		if (!isUndefined(update) && data !== update){
			//preserve original object
			if (changeTrack)
				old = copy(data);

			id = data.id;	//preserve id
			extend(data, update, true);
			data.id = id;
		}

		if (this._scheme_update)
			this._scheme_update(data);

		this.callEvent("onStoreUpdated",[id, data, (mode||"update")]);

		if (changeTrack)
			this.callEvent("onDataUpdate", [id, data, old]);
	},
	//sends repainting signal
	refresh:function(id){
		if (this._skip_refresh) return; 
		
		if (id){
			if (this.exists(id))
				this.callEvent("onStoreUpdated",[id, this.pull[id], "paint"]);
		}else
			this.callEvent("onStoreUpdated",[null,null,null]);
	},
	silent:function(code, master){
		this._skip_refresh = true;
		code.call(master||this);
		this._skip_refresh = false;
	},
	//converts range IDs to array of all IDs between them
	getRange:function(from,to){		
		//if some point is not defined - use first or last id
		//BEWARE - do not use empty or null ID
		if (from)
			from = this.getIndexById(from);
		else 
			from = (this.$min||this.startOffset)||0;
		if (to)
			to = this.getIndexById(to);
		else {
			to = this.$max === 0 ? 0 : Math.min((this.$max?this.$max-1:(this.endOffset||Infinity)),(this.count()-1));
			if (to<0) to = 0; //we have not data in the store
		}

		if (from>to){ //can be in case of backward shift-selection
			var a=to; to=from; from=a;
		}

		return this.getIndexRange(from,to);
	},
	//converts range of indexes to array of all IDs between them
	getIndexRange:function(from,to){
		to=Math.min((to === 0 ? 0 :(to||Infinity)),this.count()-1);
		
		var ret=_to_array(); //result of method is rich-array
		for (var i=(from||0); i <= to; i++)
			ret.push(this.getItem(this.order[i]));
		return ret;
	},
	//returns total count of elements
	count:function(){
		return this.order.length;
	},
	//returns truy if item with such ID exists
	exists:function(id){
		return !!(this.pull[id]);
	},
	//nextmethod is not visible on component level, check DataMove.move
	//moves item from source index to the target index
	move:function(sindex,tindex){
		assert(sindex>=0 && tindex>=0, "DataStore::move","Incorrect indexes");
		if (sindex == tindex) return;

		var id = this.getIdByIndex(sindex);
		var obj = this.getItem(id);

		if (this._filter_order)
			this._move_inner(this._filter_order, 0, 0, this.getIdByIndex(sindex), this.getIdByIndex(tindex));

		this._move_inner(this.order, sindex, tindex);
		
		
		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"move"]);
	},
	_move_inner:function(col, sindex, tindex, sid, tid){
		if (sid||tid){
			sindex = tindex = -1;
			for (var i=0; i<col.length; i++){
				if (col[i] == sid && sindex<0)
					sindex = i;
				if (col[i] == tid && tindex<0)
					tindex = i;
			}
		}
		var id = col[sindex];
		col.removeAt(sindex);	//remove at old position
		col.insertAt(id,Math.min(col.length, tindex));	//insert at new position
	},
	scheme:function(config){
		this._scheme = {};
		this._scheme_save = config.$save;
		this._scheme_init = config.$init||config.$change;
		this._scheme_update = config.$update||config.$change;
		this._scheme_serialize = config.$serialize;
		this._scheme_group = config.$group;
		this._scheme_sort = config.$sort;
		this._scheme_export = config.$export;

		//ignore $-starting properties, as they have special meaning
		for (var key in config)
			if (key.substr(0,1) != "$")
				this._scheme[key] = config[key];
	},
	importData:function(target, silent){
		var data = target ? (target.data || target) : [];
		this._filter_order = null;

		if (typeof data.serialize == "function"){
			this.order = _to_array([].concat(data.order));

			//make full copy, to preserve object properties
			//[WE-CAN-DO-BETTER]
			if (this._make_full_copy){
				this._make_full_copy = false;
				var oldpull = this.pull;
				this.pull = {};
				for (let key in data.pull){
					var old = oldpull[key];
					this.pull[key] = copy(data.pull[key]);
					if (old && old.open) this.pull[key].open = true;
				}
			} else {
				this.pull = {};
				for (let key in data.pull)
					this.pull[key] = data.pull[key];
			}

			if (data.branch && this.branch){
				this.branch = copy(data.branch);
				this._filter_branch = null;
			}

		} else {
			this.order = _to_array();
			this.pull = {};
			var id, obj;

			if (isArray(target))
				for (let key=0; key<target.length; key++){
					obj = id = target[key];
					if (typeof obj == "object")
						obj.id  = obj.id || uid();
					else
						obj = { id:id, value:id };

					this.order.push(obj.id);
					if (this._scheme_init)
						this._scheme_init(obj);
					this.pull[obj.id] = obj;
				}
			else
				for (let key in data){
					this.order.push(key);
					this.pull[key] = { id:key, value: data[key] };
				}
		}
		if (this._extraParser && !data.branch){
			this.branch = { 0:[]};
			if (!this._datadriver_child)
				this._set_child_scheme("data");

			for (var i = 0; i<this.order.length; i++){
				var key = this.order[i];
				this._extraParser(this.pull[key], 0, 0, false);
			}
		}

		this.callEvent("onStoreLoad",[]);
		if (!silent)
			this.callEvent("onStoreUpdated",[]);
	},
	sync:function(source, filter, silent){
		this.unsync();

		var type = typeof source;
		if (type == "string")
			source = $$(source);

		if (type != "function" && type != "object"){
			silent = filter;
			filter = null;
		}
		
		if (source.name != "DataStore" && source.name != "TreeStore"){
			if (source.data && (source.data.name === "DataStore" || source.data.name === "TreeStore"))
				source = source.data;
			else {
				this._sync_source = source;
				return callEvent("onSyncUnknown", [this, source, filter]);
			}
		}

		var	sync_logic = bind(function(id, data, mode){
			if (this._skip_next_sync) return;

			//sync of tree-structure with after-filtering
			//we need to make a full copy, to preserve $count
			//[WE-CAN-DO-BETTER]
			if (filter && this.branch) this._make_full_copy = true;
			this.importData(source, true);
			
			if (filter)
				this.silent(filter);
			if (this._on_sync)
				this._on_sync();

			if(!(id && data && mode) && !this.count())//clearall
				this._marks = {};
			if(mode =="delete" && this._marks[id])
				delete this._marks[id];

			this.callEvent("onSyncApply",[]);

			if (!silent) 
				this.refresh();
			else
				silent = false;
		}, this);



		this._sync_events = [
			source.attachEvent("onStoreUpdated", sync_logic),
			source.attachEvent("onIdChange", bind(function(old, nid){ this.changeId(old, nid); this.refresh(nid); }, this))
		];
		this._sync_source = source;

		//backward data saving
		this._back_sync_handler = this.attachEvent("onStoreUpdated", function(id, data, mode){
			if (mode == "update" || mode == "save"){
				this._skip_next_sync = 1;
				source.updateItem(id, data);
				this._skip_next_sync = 0;
			}
		});

		sync_logic();
	},
	unsync:function(){
		if (this._sync_source){
			var source = this._sync_source;

			if ((source.name != "DataStore" && source.name != "TreeStore") &&
					(!source.data || source.data.name != "DataStore" || source.data.name != "TreeStore")){
				//data sync with external component
				callEvent("onUnSyncUnknown", [this, source]);
			} else {
				//data sync with webix component
				for (var i = 0; i < this._sync_events.length; i++)
					source.detachEvent(this._sync_events[i]);
				this.detachEvent(this._back_sync_handler);
			}

			this._sync_source = null;
		}
	},
	destructor:function(){
		this.unsync();

		this.pull = this.order = this._marks = null;
		this._evs_events = this._evs_handlers = {};
	},
	//adds item to the store
	add:function(obj,index){
		//default values		
		if (this._scheme)
			for (var key in this._scheme)
				if (isUndefined(obj[key]))
					obj[key] = this._scheme[key];
		
		if (this._scheme_init)
			this._scheme_init(obj);
		
		//generate id for the item
		var id = this.id(obj);

		//in case of treetable order is sent as 3rd parameter
		var order = arguments[2]||this.order;
		
		//by default item is added to the end of the list
		var data_size = order.length;
		
		if (isUndefined(index) || index < 0)
			index = data_size; 
		//check to prevent too big indexes			
		if (index > data_size){
			assert(0, "Warning","DataStore:add","Index of out of bounds");
			index = Math.min(order.length,index);
		}
		if (this.callEvent("onBeforeAdd", [id, obj, index]) === false) return false;

		assert(!this.exists(id), "Not unique ID");
		
		this.pull[id]=obj;
		order.insertAt(id,index);
		if (this._filter_order){	//adding during filtering
			//we can't know the location of new item in full dataset, making suggestion
			//put at end of original dataset by default
			var original_index = this._filter_order.length;
			//if some data exists, put at the same position in original and filtered lists
			if (this.order.length)
				original_index = Math.min((index || 0), original_index);

			this._filter_order.insertAt(id,original_index);
		}
		
		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"add"]);
		this.callEvent("onAfterAdd",[id,index]);

		return obj.id;
	},
	
	//removes element from datastore
	remove:function(id){
		//id can be an array of IDs - result of getSelect, for example
		if (isArray(id)){
			for (var i=0; i < id.length; i++)
				this.remove(id[i]);
			return;
		}
		if (this.callEvent("onBeforeDelete",[id]) === false) return false;
		
		assert(this.exists(id), "Not existing ID in remove command"+id);

		var obj = this.getItem(id);	//save for later event
		//clear from collections
		this.order.remove(id);
		if (this._filter_order) 
			this._filter_order.remove(id);
			
		delete this.pull[id];
		if (this._marks[id])
			delete this._marks[id];

		//repaint signal
		this.callEvent("onStoreUpdated",[id,obj,"delete"]);
		this.callEvent("onAfterDelete",[id]);
	},
	//deletes all records in datastore
	clearAll:function(soft){
		//instead of deleting one by one - just reset inner collections
		this.pull = {};
		this._marks = {};
		this.order = _to_array();
		//this.feed = null;
		this._filter_order = null;
		if (!soft)
			this.url = null;
		this.callEvent("onClearAll",[soft]);
		this.refresh();
	},
	//converts index to id
	getIdByIndex:function(index){
		assert(index >= 0,"DataStore::getIdByIndex Incorrect index");
		return this.order[index];
	},
	//converts id to index
	getIndexById:function(id){
		if (!this.pull[id])
			return -1;
		else
			return this.order.find(id);	//slower than getIdByIndex
	},
	//returns ID of next element
	getNextId:function(id,step){
		return this.order[this.getIndexById(id)+(step||1)];
	},
	//returns ID of first element
	getFirstId:function(){
		return this.order[0];
	},
	//returns ID of last element
	getLastId:function(){
		return this.order[this.order.length-1];
	},
	//returns ID of previous element
	getPrevId:function(id,step){
		return this.order[this.getIndexById(id)-(step||1)];
	},
	/*
		sort data in collection
			by - settings of sorting

		or
			by - array of settings

		or

			by - sorting function
			dir - "asc" or "desc"

		or

			by - property
			dir - "asc" or "desc"
			as - type of sortings

		Sorting function will accept 2 parameters and must return 1,0,-1, based on desired order
	*/
	sort:function(by, dir, as){
		let parameters;
		let sort = by;

		if (isArray(sort)){
			sort = sort.map(a => this._sort_init(a));
			parameters = [sort];
		} else {
			sort = this._sort_init(by, dir, as);
			parameters = [sort.by, sort.dir, sort.as, sort];
		}

		if (!this.callEvent("onBeforeSort", parameters)) return;
		const sorter = this.sorting.create(sort);

		this.order = this._sort_core(sorter, this.order);
		if (this._filter_order)
			this._filter_order = this._sort_core(sorter, this._filter_order);

		//repaint self
		this.refresh();
		
		this.callEvent("onAfterSort", parameters);
	},
	_sort_init:function(by, dir, as){
		let sort = by;

		if (typeof by == "function")
			sort = {as:by, dir:dir};
		else if (typeof by == "string")
			sort = {by:by, dir:dir, as:as};

		if (typeof sort.by == "string")
			sort.by = sort.by.replace(/#/g,"");

		return sort;
	},
	_sort_core:function(sorter, order){
		if (this.order.length){
			var pre = order.splice(0, this.$freeze);
			//get array of IDs
			var neworder = _to_array();
			for (var i=order.length-1; i>=0; i--)
				neworder[i] = this.pull[order[i]];

			neworder.sort(sorter);
			return _to_array(pre.concat(neworder.map(function(obj){ 
				assert(obj, "Client sorting can't be used with dynamic loading");
				return this.id(obj);
			},this)));
		}
		return order;
	},
	/*
		Filter datasource
		
		text - property, by which filter
		value - filter mask
		
		or
		
		text  - filter method
		
		Filter method will receive data object and must return true or false
	*/
	_filter_reset:function(preserve){
		//remove previous filtering , if any
		if (this._filter_order && !preserve){
			this.order = this._filter_order;
			delete this._filter_order;
		}
	},
	_filter_core:function(filter, value, preserve){
		var neworder = _to_array();
		var freeze = this.$freeze || 0;
		
		for (var i=0; i < this.order.length; i++){
			var id = this.order[i];
			if (i < freeze || filter(this.getItem(id),value))
				neworder.push(id);
		}
		//set new order of items, store original
		if (!preserve ||  !this._filter_order)
			this._filter_order = this.order;
		this.order = neworder;
	},
	find:function(config, first){
		var result = [];

		for(var i in this.pull){
			var data = this.pull[i];

			var match = true;
			if (typeof config == "object"){
				for (var key in config)
					if (data[key] != config[key]){
						match = false;
						break;
					}
			} else if (!config(data))
				match = false;

			if (match)
				result.push(data);
			
			if (first && result.length)
				return result[0];
		}

		return first ? null : result;
	},
	filter:function(text,value,preserve){
		//unfilter call but we already in not-filtered state
		if (!text && !this._filter_order && !this._filter_branch) return;
		if (!this.callEvent("onBeforeFilter", [text, value])) return;
		
		this._filter_reset(preserve);
		if (!this.order.length) return;
		
		//if text not define -just unfilter previous state and exit
		if (text){
			var filter = text;
			value = value||"";
			if (typeof text == "string"){
				text = text.replace(/#/g,"");
				if (typeof value == "function")
					filter = function(obj){
						return value(obj[text]);
					};
				else{
					value = value.toString().toLowerCase();
					filter = function(obj,value){	//default filter - string start from, case in-sensitive
						assert(obj, "Client side filtering can't be used with dynamic loading");
						return (obj[text]||"").toString().toLowerCase().indexOf(value)!=-1;
					};
				}
			}
			
			this._filter_core(filter, value, preserve, this._filterMode);
		}
		//repaint self
		this.refresh();
		
		this.callEvent("onAfterFilter", []);
	},
	/*
		Iterate through collection
	*/
	_obj_array:function(){
		var data = [];
		for (var i = this.order.length - 1; i >= 0; i--)
			data[i]=this.pull[this.order[i]];

		return data;
	},
	each:function(method, master, all){
		var order = this.order;
		if (all)
			order = this._filter_order || order;

		for (var i=0; i<order.length; i++){
			if(order[i])
				method.call((master||this), this.getItem(order[i]), i);
		}
	},
	_methodPush:function(object,method){
		return function(){ return object[method].apply(object,arguments); };
	},
	/*
		map inner methods to some distant object
	*/
	provideApi:function(target,eventable){
			
		if (eventable){
			this.mapEvent({
				onbeforesort:	target,
				onaftersort:	target,
				onbeforeadd:	target,
				onafteradd:		target,
				onbeforedelete:	target,
				onafterdelete:	target,
				ondataupdate:	target/*,
				onafterfilter:	target,
				onbeforefilter:	target*/
			});
		}
			
		var list = ["sort","add","remove","exists","getIdByIndex","getIndexById","getItem","updateItem","refresh","count","filter","find","getNextId","getPrevId","clearAll","getFirstId","getLastId","serialize","sync"];
		for (var i=0; i < list.length; i++)
			target[list[i]] = this._methodPush(this,list[i]);
	},
	addMark:function(id, mark, css, value, silent){
		var obj = this._marks[id]||{};
		this._marks[id] = obj;
		if (!obj[mark]){
			obj[mark] = value||true;	
			if (css){
				var old_css = obj.$css||"";
				obj.$css = old_css+" "+mark;
			}
			if (!silent)
				this.refresh(id);
		}
		return obj[mark];
	},
	removeMark:function(id, mark, css, silent){
		var obj = this._marks[id];
		if (obj){
			if (obj[mark])
				delete obj[mark];
			if (css){
				var current_css = obj.$css;
				if (current_css){
					obj.$css = current_css.replace(mark, "").replace("  "," ");
				}
			}
			if (!silent) 
				this.refresh(id);
		}
	},
	getMark:function(id, mark){
		var obj = this._marks[id];
		return (obj?obj[mark]:false);
	},
	clearMark:function(name, css, silent){
		for (var id in this._marks){
			var obj = this._marks[id];
			if (obj[name]){
				delete obj[name];
				if (css && obj.$css)
					obj.$css = obj.$css.replace(name, "").replace("  "," ");
				if (!silent)
					this.refresh(id);
			}
		}
	},	
	/*
		serializes data to a json object
	*/
	serialize: function(all){
		var ids = this.order;
		if (all && this._filter_order)
			ids = this._filter_order;

		var result = [];
		for(var i=0; i< ids.length;i++) {
			var el = this.pull[ids[i]];
			if (this._scheme_serialize){
				el = this._scheme_serialize(el);
				if (el===false) continue;
			}
			result.push(el);
		}
		return result;
	},
	sorting:{
		create:function(config){
			if (isArray(config))
				return this._multi(config);
			return this._dir(config.dir, this._by(config.by, config.as));
		},
		as:{
			//handled by dataFeed
			"server":function(){
				return false;
			},
			"date":function(a,b){
				a = a-0; b = b-0;
				if (isNaN(b)) return 1;
				if (isNaN(a)) return -1;

				return a>b?1:(a<b?-1:0);
			},
			"int":function(a,b){
				a = a*1; b = b*1;
				if (isNaN(b)) return 1;
				if (isNaN(a)) return -1;

				return a>b?1:(a<b?-1:0);
			},
			"string_strict":function(a,b){
				if (!b) return 1;
				if (!a) return -1;

				a = a.toString(); b = b.toString();
				return a>b?1:(a<b?-1:0);
			},
			"string":function(a,b){
				if (!b) return 1;
				if (!a) return -1;

				a = a.toString().toLowerCase(); b = b.toString().toLowerCase();
				return a>b?1:(a<b?-1:0);
			},
			"raw":function(a,b){
				return a>b?1:(a<b?-1:0);
			}
		},
		_multi:function(methods){
			methods = methods.map(c => this._dir(c.dir, this._by(c.by, c.as)));

			return function(a,b){
				let result, i = 0;
				do {
					result = methods[i](a,b);
				} while(!result && methods[++i]);
				return result;
			};
		},
		_by:function(prop, method){
			if (!prop)
				return method;
			if (typeof method != "function")
				method = this.as[method||"string"];

			assert(method, "Invalid sorting method");
			return function(a,b){
				return method(a[prop],b[prop]);
			};
		},
		_dir:function(prop, method){
			if (prop == "asc" || !prop)
				return method;
			return function(a,b){
				return method(a,b)*-1;
			};
		}
	}
};


export default DataStore;