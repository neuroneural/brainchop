import {create, preventEvent} from "../webix/html";
import {bind, extend} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import {assert} from "../webix/debug";
import {callEvent} from "../webix/customevents";

import env from "../webix/env";
import DataDriver from "../load/drivers/index";


const UploadDriver = {
	$render: function() {
		if (this._upload_area){
			//firstChild is webix_el_box container, which have relative position
			//as result, file control is placed under the button and not in the top corner
			this._contentobj.firstChild.appendChild(this._upload_area);
			return;
		}
		this.files.attachEvent("onBeforeDelete", this._stop_file);

		var input_config =  {
			"type": "file",
			"class": "webix_hidden_upload",
			tabindex:-1
		};

		if (this._settings.accept)
			input_config.accept = this._settings.accept;

		if (this._settings.multiple)
			input_config.multiple = "true";

		if (this._settings.directory) {
			input_config.webkitdirectory = "true";
			input_config.mozdirectory = "true";
			input_config.directory = "true";
		}

		var f = create("input", input_config);
		this._upload_area = this._contentobj.firstChild.appendChild(f);

		_event(this._viewobj, "drop", bind(function(e) {
			this.$drop(e);
			preventEvent(e);
		}, this));
		_event(f, "change", bind(function() {
			this._add_files(f.files);

			if (env.isIE) {
				var t = document.createElement("form");
				t.appendChild(this._upload_area);
				t.reset();
				this._contentobj.firstChild.appendChild(f);
			} else
				f.value = "";
		}, this));
		_event(this._viewobj, "click", bind(function() {
			var now_date = new Date();
			if (now_date - (this._upload_timer_click || 0) > 250) {
				this.fileDialog();
			}
		}, this));

		_event(this._viewobj, "dragenter", preventEvent);
		_event(this._viewobj, "dragexit", preventEvent);
		_event(this._viewobj, "dragover", preventEvent);
	},
	_directoryEntry: function(value) {
		return value.isDirectory;
	},
	_directoryDrop: function(item, state, path) {
		if (item.isFile){
			item.file(function(file){
				state.addFile(file, null, null, { name : path+"/"+file.name });
			});
		} else if (item.isDirectory) {
			// Get folder contents
			var dirReader = item.createReader();
			dirReader.readEntries(function(entries){
				for (var i = 0; i < entries.length; i++){
					state._directoryDrop(entries[i], state, (path ? (path + "/") : "") + item.name);
				}
			});
		}
	},
	// adding files by drag-n-drop
	$drop: function(e) {
		var files = e.dataTransfer.files;
		var items = e.dataTransfer.items;

		// non-file drop
		if (!files.length) return;

		if (this.callEvent("onBeforeFileDrop", [files, e])) {
			items = items || files; //IE10+
			for (var i = 0; i < items.length; i++) {
				//https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
				var item = items[i];
				if (item.webkitGetAsEntry){
					item = item.webkitGetAsEntry();
					if (item.isDirectory){
						this._directoryDrop(item, this, "");
						continue;
					}
				}
				this.addFile(files[i]);
			}
		}
		this.callEvent("onAfterFileDrop", [files, e]);
	},
	fileDialog:function(context){
		this._upload_timer_click = new Date();
		this._last_file_context = context;
		var inputs = this._viewobj.getElementsByTagName("INPUT");
		inputs[inputs.length-1].click();
	},
	send: function(id){
		//alternative syntx send(callback)
		if (typeof id == "function"){
			this._last_assigned_upload_callback = id;
			id = 0;
		}

		if (!id){
			var order = this.files.data.order;
			var complete = true;

			if (order.length)
				for (var i=0; i<order.length; i++)
					complete = (!this.send(order[i])) && complete;

			if (complete)
				this._upload_complete();

			return;
		}

		var item = this.files.getItem(id);
		if (item.status !== "client") return false;

		assert(this._settings.upload, "You need to define upload url for uploader component");
		item.status = "transfer";

		var formData = new FormData();

		formData.append(this.config.inputName, item.file, item.name);
		formData.append(this.config.inputName+"_fullpath", item.name);

		var headers = {};
		var globalData = this._settings.formData || {};
		if (typeof globalData === "function")
			globalData = globalData.call(this);
		var details = extend(item.formData||{} , globalData);

		var xhr = new XMLHttpRequest();
		var url = this._get_active_url(item);
		if(callEvent("onBeforeAjax",["POST", url, details, xhr, headers, formData])){
			for (let key in details)
				formData.append(key, details[key]);

			item.xhr = xhr;

			xhr.upload.addEventListener("progress", bind(function(e){ this.$updateProgress(id, e.loaded/e.total*100); }, this), false);
			xhr.onload = bind(function(){ if (!xhr.aborted) this._file_complete(id); }, this);
			xhr.open("POST", url, true);

			for (let key in headers)
				xhr.setRequestHeader(key, headers[key]);

			xhr.send(formData);
		}

		this.$updateProgress(id, 0);
		return true;
	},

	
	_file_complete: function(id) {
		var item = this.files.getItem(id);
		if (item){
			var response = null;
			if(item.xhr.status < 400){
				var driver = DataDriver[this._settings.datatype||"json"];
				response = driver.toObject(item.xhr.responseText);
				if (response)
					response = driver.getDetails(response);
			}
			if (!response || response.status == "error"){
				// file upload error
				item.status = "error";
				delete item.percent;
				this.files.updateItem(id);
				this.callEvent("onFileUploadError", [item, response]);
			} else {
				// file upload complete
				assert(
					(!response.status || response.status == "server"),
					"Not supported status value, use 'error' or 'server'"
				);
				this._complete(id, response);
			}
			delete item.xhr;
		}
	},
	stopUpload: function(id){
		bind(this._stop_file,this.files)(id);
	},
	_stop_file: function(id) {
		var item = this.getItem(id);
		if (typeof(item.xhr) !== "undefined"){
			item.xhr.aborted = true;
			item.xhr.abort();
			delete item.xhr;
			item.status = "client";
		}
	}

};

export default UploadDriver;