import {pos as getPos, offset, addCss, removeCss} from "../webix/html";
import {ui, protoUI} from "../ui/core";
import env from "../webix/env";

import MouseEvents from "../core/mouseevents";
import Destruction from "../core/destruction";

import base from "./view";

//used inderectly through ui
import "./resizearea";

import {bind} from "../webix/helpers";
import {_event, event, eventRemove} from "../webix/htmlevents";
import {assert} from "../webix/debug";
import {callEvent} from "../webix/customevents";


const api = {
	name:"resizer",
	defaults:{
		width:7, height:7
	},
	$init:function(config){
		assert(this.getParentView(), "Resizer can't be initialized outside a layout");
		this._viewobj.className += " webix_resizer";
		var space = this.getParentView()._margin;
		
		_event(this._viewobj, env.mouse.down, this._rsDown, {bind:this});
		var dir = this._getResizeDir();

		this._rs_started = false;
		this._resizer_dir = dir;

		this._resizer_dim = (dir=="x"?"width":"height");
		
		if (dir=="x")
			config.height = 0;
		else 
			config.width = 0;

		if (space>0){
			this._viewobj.className += " webix_resizer_v"+dir;
			this._viewobj.style.marginRight = "-"+space+"px";
			if (dir == "x")	
				config.width = space;
			else
				config.height = space;
			this.$nospace = true;
		} else
			this._viewobj.className += " webix_resizer_"+dir;
		
		this._viewobj.innerHTML = "<div class='webix_resizer_content'></div>";
		if (dir == "y" && space>0) this._viewobj.style.marginBottom = "-"+(config.height||this.defaults.height)+"px";
		this._viewobj.setAttribute(/*@attr*/"webix_disable_drag", "true");
		this._viewobj.setAttribute("tabindex", "-1");
		this._viewobj.setAttribute("aria-grabbed", "false");

	},
	_rsDown:function(e){
		var cells = this._getResizerCells();
		//some sibling can block resize
		if(cells && !this._settings.disabled){
			e = e||window.event;
			this._rs_started = true;
			this._rs_process = getPos(e);
			this._rsLimit = [];
			this._viewobj.setAttribute("aria-grabbed", "true");
			
			for(var i=0; i<2; i++)
				cells[i].$view.setAttribute("aria-dropeffect", "move");
			this._viewobj.setAttribute("aria-dropeffect", "move");
			
			this._rsStart(e, cells[0]);
			const handler = event(document.body, env.mouse.up, e => {
				eventRemove(handler);
				return this._rsUp(e);
			});
		}
	},
	_rsUp:function(){
		this._rs_started = false;
		this._rs_process = false;
	},
	_rsStart:function(e, cell){

		var dir, cellOffset, pos,posParent,start;
		e = e||window.event;
		dir = this._resizer_dir;

		/*layout position:relative to place absolutely positioned elements in it*/
		this.getParentView()._viewobj.style.position = "relative";
		pos = offset(this._viewobj);
		posParent = offset(this.getParentView()._viewobj);
		start = pos[dir]-posParent[dir];
		cellOffset = offset(cell.$view)[dir]- offset(this.getParentView().$view)[dir];

		this._rs_progress = [dir, cell, start, cellOffset];
		/*resizer stick (resizerea ext)*/

		this._resizeStick = new ui.resizearea({
			container:this.getParentView()._viewobj,
			dir:dir,
			eventPos:this._rs_process[dir],
			start:start-1,
			height: this.$height,
			width: this.$width,
			border: 1,
			margin: this.getParentView()._padding[dir === "x"? "left" : "top"]
		});

		/*stops resizing on stick mouseup*/
		this._resizeStick.attachEvent("onResizeEnd", bind(this._rsEnd, this));
		/*needed to stop stick moving when the limit for dimension is reached*/
		this._resizeStick.attachEvent("onResize", bind(this._rsResizeHandler, this));

		addCss(document.body,"webix_noselect",1);
	},
	_getResizeDir: function(){
		return this.getParentView()._vertical_orientation?"y":"x";
	},
	_rsResizeHandler:function(){
		let cells,cDiff,diff,dir,i,limits,limitSizes,sizes,totalSize;
		if(this._rs_progress){
			cells = this._getResizerCells();
			dir = this._rs_progress[0];
			/*vector distance between resizer and stick*/
			diff = this._resizeStick._last_result -this._rs_progress[2];
			/*new sizes for the resized cells, taking into account the stick position*/
			sizes = this._rsGetDiffCellSizes(cells,dir,diff);
			/*sum of cells dimensions*/
			totalSize = cells[0]["$"+this._resizer_dim]+cells[1]["$"+this._resizer_dim];
			for(i=0;i<2;i++){
				cDiff = (i?-diff:diff);/*if cDiff is positive, the size of i cell is increased*/

				/*max and min limits*/
				limits = cells[i].$getSize(0,0);
				/*if size is bigger than max limit or size is smaller than min limit*/
				let min = (dir=="y")?limits[2]:limits[0];
				let max = (dir=="y")?limits[3]:limits[1];

				//if size is fixed, treat it as responsive (default behavior)
				if (min === max){
					min = cells[i]._settings[ (dir=="y")?"minHeight":"minWidth" ]||3;
					max = cells[i]._settings[ (dir=="y")?"maxHeight":"maxWidth" ]||100000;
				}

				if(cDiff>0&&max&&max<=sizes[i] || cDiff<0&&min&&min>=sizes[i]){
					this._rsLimit[i] = (cDiff>0?max:min);
					/*new sizes, taking into account max and min limits*/
					limitSizes = this._rsGetLimitCellSizes(cells,dir);
					/*stick position*/
					this._resizeStick._dragobj.style[(dir=="y"?"top":"left")] = this._rs_progress[3] + limitSizes[0]+"px";
					return;
				}else if(sizes[i]<3){/*cells size can not be less than 1*/
					this._resizeStick._dragobj.style[(dir=="y"?"top":"left")] = this._rs_progress[3] + i*totalSize+1+"px";
				}else{
					this._rsLimit[i] = null;
				}
			}
		}
	},
	_getResizerCells:function(){
		var cells,i,res;
		cells = this.getParentView()._cells;
		for(i=0; i< cells.length;i++){
			if(cells[i]==this){
				res = [this._getRsCell(cells, i, 1, -1), this._getRsCell(cells, i, 1, 1)];
				if (!res[0] || !res[1])
					res = null;
				return res;
			}
		}
	},
	_getRsCell:function(cells, i, step, dir){
		var cell = cells[i+(dir*step)];
		if(cell && cell._settings.hidden)
			return this._getRsCell(cells, i, step+1, dir);
		else if(cell && cell._settings.$noresize)
			return null;
		else
			return cell;
	},
	_rsEnd:function(result){
		if (typeof result == "undefined") return;

		var cells,dir,diff,size;
		var vertical = this.getParentView()._vertical_orientation;
		this._resizerStick = null;
		if (this._rs_progress){
			dir = this._rs_progress[0];
			diff = result-this._rs_progress[2];
			cells = this._getResizerCells();
			if(cells[0]&&cells[1]){
				/*new cell sizes*/
				size = this._rsGetCellSizes(cells,dir,diff);

				for (let i=0; i<2; i++){
					//cell has not fixed size, of fully fixed layout
					var cell_size = cells[i].$getSize(0,0);
					if (vertical?(cell_size[2] == cell_size[3]):(Math.abs(cell_size[1]-cell_size[0])<3)){
						/*set fixed sizes for both cells*/
						cells[i]._settings[this._resizer_dim]=size[i];
						if (cells[i]._bubble_size)
							cells[i]._bubble_size(this._resizer_dim, size[i], vertical);
					} else {
						var actualSize = cells[i].$view[vertical?"offsetHeight":"offsetWidth"];//cells[i]["$"+this._resizer_dim];
						cells[i]._settings.gravity = size[i]/actualSize*cells[i]._settings.gravity;
					}
				}

				cells[0].resize();

				for (let i = 0; i < 2; i++){
					if (cells[i].callEvent)
						cells[i].callEvent("onViewResize",[]);
					cells[i].$view.removeAttribute("aria-dropeffect");
				}
				callEvent("onLayoutResize", [cells]);
			}
			this._rs_progress = false;
		}
		this._rs_progress = false;
		this._rs_started = false;
		this._rsLimit = null;
		removeCss(document.body,"webix_noselect");

		this._viewobj.setAttribute("aria-grabbed", "false");
		this._viewobj.removeAttribute("aria-dropeffect");
	},
	_rsGetLimitCellSizes: function(cells){
		var size1,size2,totalSize;
		totalSize = cells[0]["$"+this._resizer_dim]+cells[1]["$"+this._resizer_dim];
		if(this._rsLimit[0]){
			size1 = this._rsLimit[0];
			size2 = totalSize-size1;
		}
		else if(this._rsLimit[1]){
			size2 = this._rsLimit[1];
			size1 = totalSize-size2;
		}
		return [size1,size2];
	},
	_rsGetDiffCellSizes:function(cells,dir,diff){
		var sizes =[];
		var styleDim = this._resizer_dim=="height"?"offsetHeight":"offsetWidth";
		for(var i=0;i<2;i++)
			sizes[i] = cells[i].$view[styleDim]+(i?-1:1)*diff;
		return sizes;
	},
	_rsGetCellSizes:function(cells,dir,diff){
		var i,sizes,totalSize;
		/*if max or min dimentsions are set*/
		if(this._rsLimit[0]||this._rsLimit[1]){
			sizes = this._rsGetLimitCellSizes(cells,dir);
		}
		else{
			sizes = this._rsGetDiffCellSizes(cells,dir,diff);
			for(i =0; i<2;i++ ){
				/*if stick moving is stopped outsize cells borders*/
				if(sizes[i]<0){
					totalSize = sizes[0]+sizes[1];
					sizes[i] =1;
					sizes[1-i] = totalSize-1;
				}
			}

		}
		return sizes;
	}
};

const view = protoUI(api, MouseEvents, Destruction, base.view);
export default {api, view};