import {remove, removeCss, addCss} from "../webix/html";
import UIManager from "../core/uimanager";
import {extend, bind, delay, isUndefined} from "../webix/helpers";
import {ui, $$} from "../ui/core";
import {_event} from "../webix/htmlevents";
import {assert} from "../webix/debug";
import {attachEvent, callEvent, detachEvent} from "../webix/customevents";
import Undo from "../core/undo";


import globalState from "../core/state";
import editors from "../webix/editors";
/*
	Behavior:EditAbility - enables item operation for the items
	
	@export
		edit
		stopEdit
*/

const EditAbility ={
	defaults:{
		editaction:"click"
	},
	$init:function(config){
		this._editors = {};
		this._in_edit_mode = 0;
		this._edit_open_time = 0;
		this._contentobj.style.position = "relative";
		if (config)
			config.onDblClick = config.onDblClick || {};

		this.attachEvent("onAfterRender", this._refocus_inline_editor);

		//when we call extend the editable prop can be already set
		if (this._settings.editable)
			this._init_edit_events_once();

		extend(this,Undo);
	},
	_refocus_try:function(newnode){
		try{ //Chrome throws an error if selectionStart is not accessible
			if (typeof newnode.selectionStart == "number") {
				newnode.selectionStart = newnode.selectionEnd = newnode.value.length;
			} else if (typeof newnode.createTextRange != "undefined") {
				var range = newnode.createTextRange();
				range.collapse(false);
				range.select();
			}
		} catch(e){} // eslint-disable-line
	},
	_refocus_inline_editor:function(){
		var editor = this.getEditor();
		if (editor && editor.$inline && !editor.getPopup){
			var newnode = this._locateInput(editor);
			if (newnode && newnode != editor.node){
				var text = editor.node.value;
				editor.node = newnode;
				newnode.value = text;
				newnode.focus();

				this._refocus_try(newnode);
			} else 
				this.editStop();
		}
	},
	editable_setter:function(value){
		if (value)
			this._init_edit_events_once();
		return value;
	},
	_init_edit_events_once:function(){
		//will close editor on any click outside
		const e1 = attachEvent("onEditEnd", bind(function(){
			if (this._in_edit_mode)
				this.editStop();
		}, this));
		const e2 = attachEvent("onClick", bind(function(e){
			//but ignore click which opens editor
			if (this._in_edit_mode && (new Date())-this._edit_open_time > 200){
				if (!this._last_editor || this._last_editor.popupType || !e || ( !this._last_editor.node || !this._last_editor.node.contains(e.target)))
					this.editStop();
			}
		}, this));

		this.attachEvent("onDestruct", function(){ detachEvent(e1); detachEvent(e2); });
		
		//property sheet has simple data object, without events
		if (this.data.attachEvent)
			this.data.attachEvent("onIdChange", bind(function(oldid, newid){
				this._changeEditorId(oldid, newid);
			}, this));

		//when clicking on row - will start editor
		this.attachEvent("onItemClick", function(id){
			if (this._settings.editable && this._settings.editaction == "click")
				this.edit(id);
		});
		this.attachEvent("onItemDblClick", function(id){
			if (this._settings.editable && this._settings.editaction == "dblclick")
				this.edit(id);
		});
		//each time when we clicking on input, reset timer to prevent self-closing
		this._reset_active_editor = bind(function(){
			this._edit_open_time = new Date();
		},this);

		this._init_edit_events_once = function(){};

		if (this._component_specific_edit_init)
			this._component_specific_edit_init();
	},
	_handle_live_edits:function(){
		delay(function(){
			var editor = this.getEditor();
			if (editor && editor.config.liveEdit){
				var state = { value:editor.getValue(), old: editor.value };
				if (state.value == state.old) return;

				editor.value = state.value;
				this._set_new_value(editor, state.value, false);
				this.callEvent("onLiveEdit", [state, editor]);
			}
		}, this);
	},
	_show_editor_form:function(id){
		var form = this._settings.form;
		if (typeof form != "string")
			this._settings.form = form = ui(form).config.id;

		form = $$(form);
		var realform = form.setValues?form:form.getChildViews()[0];
		
		realform.setValues(this.getItem(id.row || id), false, "auto");
		form.config.master = this.config.id;
		form.show( this.getItemNode(id) );

		var first = realform.getChildViews()[0];
		if (first.focus)
			first.focus();
	},
	edit:function(id, preserve, show){
		if (!this._settings.editable || !this.callEvent("onBeforeEditStart", [id])) return;
		if (this._settings.form)
			return this._show_editor_form(id);

		var editor = this._get_editor_type(id);
		if (editor){
			if (this.getEditor(id)) return;
			if (!preserve) this.editStop();

			//render html input
			assert(editors[editor], "Invalid editor type: "+editor);
			var type = extend({}, editors[editor]);

			var node = this._init_editor(id, type, show);
			if (type.config.liveEdit)
				this._live_edits_handler = this.attachEvent("onKeyPress", this._handle_live_edits);

			var area = type.getPopup?type.getPopup(node)._viewobj:node;

			if (area)
				_event(area, "click", this._reset_active_editor);
			if (node)
				_event(node, "change", this._on_editor_change, { bind:{ view:this, id:id }});
			if (show !== false)
				type.focus();

			if (this.$fixEditor)
				this.$fixEditor(type);

			//save time of creation to prevent instant closing from the same click
			this._edit_open_time = globalState.edit_open_time = new Date();

			UIManager.setFocus(this, true);
			this.callEvent("onAfterEditStart", [id]);
			return type;
		}
		return null;
	},
	getEditor:function(id){
		if (!id)
			return this._last_editor;

		return this._editors[id];
	},
	_changeEditorId:function(oldid, newid)	{
		var editor = this._editors[oldid];
		if (editor){
			this._editors[newid] = editor;
			editor.id = newid;
			delete this._editors[oldid];
		}
	},
	_on_editor_change:function(){
		if (this.view.hasEvent("onEditorChange"))
			this.view.callEvent("onEditorChange", [this.id, this.view.getEditorValue(this.id) ]);
	},
	_get_edit_config:function(){
		return this._settings;
	},
	_init_editor:function(id, type, show){
		type.config = this._get_edit_config(id);
		var node = type.render();

		if (type.$inline)
			node = this._locateInput(id);
		type.node = node;

		var item = this.getItem(id);
		//value can be configured by editValue option
		var value = item[this._settings.editValue||"value"];
		//if property was not defined - use empty value
		if (isUndefined(value))
			value = "";

		type.setValue(value, item);
		type.value = value;

		this._addEditor(id, type);

		//show it over cell
		if (show !== false)
			this.showItem(id);
		if (!type.$inline)
			this._sizeToCell(id, node, true);

		if (type.afterRender)
			type.afterRender();

		return node;
	},
	_locate_cell:function(id){
		return this.getItemNode(id);
	},
	_locateInput:function(id){
		var cell = this._locate_cell(id);
		if (cell)
			cell = cell.getElementsByTagName("input")[0] || cell;

		return cell;
	},
	_get_editor_type:function(){
		return this._settings.editor;
	},
	_addEditor:function(id, type){
		type.id = id;
		this._editors[id]= this._last_editor = type;
		this._in_edit_mode++;
	},
	_removeEditor:function(editor){
		if (this._last_editor == editor)
			this._last_editor = 0;
		
		if (editor.destroy)
			editor.destroy();

		delete editor.popup;
		delete editor.node;

		delete this._editors[editor.id];
		this._in_edit_mode--;
	},
	focusEditor:function(){
		var editor = this.getEditor.apply(this, arguments);
		if (editor && editor.focus)
			editor.focus();
	},
	editCancel:function(){
		this.editStop(null, null, true);
	},
	_applyChanges: function(el){
		if (el){
			var ed = this.getEditor();
			if (ed && ed.getPopup && ed.getPopup() == el.getTopParentView()) return;
		}
		this.editStop();
	},
	editStop:function(id){
		if (this._edit_stop) return;
		this._edit_stop = 1;


		var cancel = arguments[2];
		var result = 1;
		if (!id){
			this._for_each_editor(function(editor){
				result = result * this._editStop(editor, cancel);
			});
		} else 
			result = this._editStop(this._editors[id], cancel);

		this._edit_stop = 0;
		return result;
	},
	_cellPosition:function(id){
		var html = this.getItemNode(id);
		return {
			left:html.offsetLeft, 
			top:html.offsetTop,
			height:html.offsetHeight,
			width:html.offsetWidth,
			parent:this._contentobj
		};
	},
	_sizeToCell:function(id, node, inline){
		//fake inputs
		if (!node.style) return;

		var pos = this._cellPosition(id, null, true);

		node.style.top = pos.top + "px";
		node.style.left = pos.left + "px";

		node.style.width = pos.width-1+"px";
		node.style.height = pos.height-1+"px";

		node.top = pos.top; //later will be used during y-scrolling

		if (inline) pos.parent.appendChild(node);
		return pos;
	},
	_for_each_editor:function(handler){
		for (var editor in this._editors)
			handler.call(this, this._editors[editor]);
	},
	_editStop:function(editor, ignore){
		if (!editor || globalState._final_destruction) return;
		var state = { 
			value : this._get_new_value(editor), 
			old : editor.value
		};
		if (this.callEvent("onBeforeEditStop", [state, editor, ignore])){
			if (!ignore){
				//special case, state.old = 0, state.value = ""
				//we need to state.old to string, to detect the change
				var old = state.old;
				if (typeof state.value == "string") old += "";

				if (old != state.value || editor.config.liveEdit){
					var item = this._set_new_value(editor, state.value, true);	
					this.updateItem(editor.row || editor.id, item);
				}
			}
			if (editor.$inline)
				editor.node = null;
			else
				remove(editor.node);

			var popup = editor.config.suggest;
			if (popup && typeof popup == "string")
				$$(popup).hide();

			this._removeEditor(editor);
			if (this._live_edits_handler)
				this.detachEvent(this._live_edits_handler);

			this.callEvent("onAfterEditStop", [state, editor, ignore]);
			return 1;
		}
		return 0;
	},
	validateEditor:function(id){
		let result = true;
		if (this._settings.rules){
			const editor = this.getEditor(id);
			const key = editor.column||this._settings.editValue||"value";
			const rule = this._settings.rules[key];
			const all = this._settings.rules.$all;
			const input = editor.getInputNode();

			if ((rule || all) && !input._viewobj){ //only for html inputs
				const obj = this.data.getItem(editor.row||editor.id);
				const value = editor.getValue();

				if (rule)
					result = rule.call(this, value, obj, key);
				if (all)
					result = all.call(this, value, obj, key) && result;
			
				if (result)
					removeCss(input, "webix_invalid");
				else
					addCss(input, "webix_invalid");

				callEvent("onLiveValidation", [editor, result, obj, value]);
			}
		}
		return result;
	},
	getEditorValue:function(id){
		var editor;
		if (arguments.length === 0)
			editor = this._last_editor;
		else
			editor = this.getEditor(id);

		if (editor)
			return editor.getValue();
	},
	getEditState:function(){
		return this._last_editor || false;
	},
	editNext:function(next, from){ 
		next = next !== false; //true by default
		if (this._in_edit_mode == 1 || from){
			//only if one editor is active
			var editor_next = this._find_cell_next((this._last_editor || from), function(id){
				if (this._get_editor_type(id))
					return true;
				return false;
			}, next);

			if (this.editStop()){	//if we was able to close previous editor
				if (editor_next){	//and there is a new target
					this.edit(editor_next);	//init new editor
					this._after_edit_next(editor_next);
				}
				return false;
			}
		}
	},
	//stab, used in datatable
	_after_edit_next:function(){},
	_find_cell_next:function(start, check, direction){
		var row = this.getIndexById(start.id);
		var order = this.data.order;
		
		if (direction){
			for (let i=row+1; i<order.length; i++){
				if (check.call(this, order[i]))
					return order[i];
			}
		} else {
			for (let i=row-1; i>=0; i--){
				if (check.call(this, order[i]))
					return order[i];
			}
		}

		return null;
	},
	_get_new_value(editor){
		return editor.getValue();
	},
	_set_new_value:function(editor, new_value, copy){
		var item = copy ? {} : this.getItem(editor.id);
		item[this._settings.editValue||"value"] = new_value;
		return item;
	}
};

export default EditAbility;