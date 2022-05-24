import {pos as getPos, locate} from "../webix/html";
import {delay} from "../webix/helpers";
import ready from "../webix/ready";
import {ui, $$} from "../ui/core";
import {attachEvent, blockEvent, unblockEvent} from "../webix/customevents";
import {message} from "../webix/message";


//non-direct dependency
import "./contextmenu";
import "./window";
import "./toolbar";
import "./label";
import "./button";
import "./property";
import "./layout";
import "./spacer";

/* eslint no-constant-condition: 0 */
/* eslint no-inner-declarations: 0 */

if (DEBUG){

	attachEvent("onLoadError", function(xhttp, owner){
		var text; //xhttp can be of blob or arraybuffer type, or just empty in case of no data
		try{ text = xhttp.responseText; } 
		catch(e){ text = ""; }

		text = text || "[EMPTY DATA]";
		var error_text = "Data loading error, check console for details";
		if (text.indexOf("<?php") === 0)
			error_text = "PHP support missed";
		else if (text.indexOf("WEBIX_ERROR:") === 0)
			error_text = text.replace("WEBIX_ERROR:","");

		message({
			type:"debug",
			text:error_text,
			expire:-1
		});

		if (window.console){
			var logger = window.console;
			logger.log("Data loading error");
			logger.log("Object:", owner);
			logger.log("Response:", text);
			if(xhttp) logger.log("XHTTP:", xhttp);
		}
	});

	ready(function(){
		var path = document.location.href;
		if (path.indexOf("file:")===0){
			message({
				type:"error", 
				text:"Please open sample by http,<br>not as file://",
				expire:-1
			});
		}
	});


	var ignore = {
		"_inner":true, 
		"awidth":true,
		"cheight":true,
		"bheight":true,
		"aheight":true
	};

	function get_inspector_config(view){
		var values={};
		var options=[];
		view = $$(view);

		for (var key in view.config){
			if (ignore[key]) continue;
			
			if (typeof view.config[key] == "object") continue;
			if (typeof view.config[key] == "undefined") continue;
			if (typeof view.config[key] == "function") continue;

			if (key == "view" || key == "id")
				options.push({ label:key, id:key});
			else 
				options.push({ label:key, type:"text", id:key});

			if (view.defaults[key] == view.config[key]) 
				options[options.length - 1].css = { "color" : "#888" };

			values[key] = view.config[key];
		}
		options.sort(function(a,b){
			if (!a.css && b.css) return -1;
			if (a.css && !b.css) return 1;
			return (a.id > b.id) ? 1 : ((a.id == b.id) ? 0 : -1);
		});

		return { elements:options, data:values, head:" ["+view.name+"] <strong>"+view._settings.id+"</strong>" };
	}

	function create_inspector(){
		if (!$$("webix_debug_inspector_win"))
			ui({
				id:"webix_debug_inspector_win",
				view:"window", 
				top:2, left: 0, width:350, height:350,
				head:false, autofit:false,
				body:{cols:[
					{ width:10},
					{type:"clean", rows:[
						{ view:"toolbar", elements:[
							{ view:"label", value:"", id:"webix_debug_inspector_head" },
							{ view:"button", width:100, value:"Hide", type:"custom", click:function(){
								show_inspector();
							}}
						]},
						{
							id:"webix_debug_inspector", nameWidth:150,
							view:"property", scroll:"y",
							elements:[],
							on:{
								onaftereditstop:function(state, editor){
									if (state.old == state.value) return;

									var value = state.value;
									if (value === "true" || value === "false"){
										value = (value === "true");
									} else {
										var intvalue = parseInt(value,10);
										if (intvalue == value)
											value = intvalue;
									}

									var view = $$(this.config.view);
									view.define(editor.id, value);
									if (view.refreshColumns)
										view.refreshColumns();
									else if (view.refresh)
										view.refresh();

									view.resize();
								}
							}
						}
					]
					}]
				}
			});
	}
	function show_inspector(view, ev){
		create_inspector();
		var win = $$("webix_debug_inspector_win");

		if (view){
			var config = get_inspector_config(view);
			var winx = document.body.offsetWidth;
			var winy = document.body.offsetHeight;
			var pos = ev?getPos(ev):{x:0,y:0};

			win.define("height", Math.max(350, winy-4));
			win.resize();

			var props = $$("webix_debug_inspector");
			props.define("elements", config.elements);
			props.define("view", view);

			win.show({ x:(pos.x > winx/2 )?0:(winx-370), y:0 });
			$$("webix_debug_inspector").setValues(config.data);
			$$("webix_debug_inspector_head").setValue(config.head);
		} else 
			win.hide();
	}

	function infi(value){
		if (value >= 100000)
			return "Any";
		return value;
	}
	function log_level(data, prefix, now){
		window.console.log((data == now?">>":"  ")+prefix + data.name+" / " +data.config.id);
		prefix+="  ";
		if (data._cells)
			for (var i=0; i<data._cells.length; i++){
				log_level(data._cells[i], prefix, now);
			}
		if (data._head_cell)
			log_level(data._head_cell, prefix, now);

		if (data._body_cell)
			log_level(data._body_cell, prefix, now);
	}

	const uiConfig = {
		view:"contextmenu",
		id:"webix:debugmenu",
		on:{
			onBeforeShow:function(e){
				if (!e.ctrlKey) return false;

				var view = locate(e, /*@attr*/"view_id");
				if (!view) return false;
				this.config.lastTarget = view;

				blockEvent();
				delay(function(){ unblockEvent(); });
			},
			onShow:function(){
				var view = $$(this.config.lastTarget);
				var info = "<span style='color:#888'>"+view._settings.id + "<sup style='float:right'>["+view.name+"]</sup></span>";
				document.getElementById("webix_debug_cmx").innerHTML = info;
			}
		},
		data:[
			"<div id='webix_debug_cmx'></div>",
			{ id:"inspect", value:"Inspect"},
			{ id:"docs", value:"Documentation"},
			{
				value:"Log to Console", submenu:[
					{ id:"size", value:"Sizes" },
					{ id:"tree", value:"Tree" },
					{ id:"dump", value:"Dump"}
				]
			}		
		],
		click:function(id, ev){
			//mixing two object result in confusion
			var obj = $$(this.config.lastTarget);

			if  (id == "dump"){
				window.console.info("\n"+obj.name+" / "+obj.config.id);
				window.console.log("\nView: ",obj,", Config: ", obj.config, ", Data: ", obj.data);
				window.console.log(obj.$view);
			}

			if (id == "tree"){
				
				var now = obj;
				while (obj.getParentView())
					obj = obj.getParentView();

				window.console.log("");
				log_level(obj, "", now);
			}

			if (id == "size"){
				window.console.info("");
				window.console.info("\n"+obj.name+" / "+obj.config.id);
				window.console.info("\n[min]   ", obj.config.width, " x ", obj.config.height);
				var sizes = obj.$getSize(0,0);
				window.console.info("[max]    ", infi(sizes[1]), " x ", infi(sizes[3])+(obj.config.autoheight?", auto height":""));
				window.console.info("[gravity]   ", obj.config.gravity);

				window.console.info("\n[content]    ", obj._content_width, " x ", obj._content_height);
				window.console.info("[last set]   ", obj._last_size[0], " x ", obj._last_size[1]);
				if (obj._settings._inner)
					window.console.info("\n[borders]   ", "left:", !obj._settings._inner.left,"\ttop:", !obj._settings._inner.top,  "\tright:", !obj._settings._inner.right,  "\tbottom:", !obj._settings._inner.bottom);
				else
					window.console.info("\n[borders]   none");
			}

			if (id == "docs")
				window.open("http://docs.webix.com/api__refs__ui."+obj.name+".html","__blank");

			if (id == "inspect"){
				show_inspector(this.config.lastTarget, ev);
			}
		}
	};

	ready(function(){
		uiConfig.master = document.body;
		ui(uiConfig);
	});

}