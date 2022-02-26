import {create, offset, addCss, pos as getPos, remove, removeCss} from "../webix/html";
import env from "../webix/env";
import {zIndex} from "../ui/helpers";
import {_event, event, eventRemove} from "../webix/htmlevents";


const ResizeArea = {
	resize_setter:function(value){
		if (value && !this._resizeHandlers)
			this._renderResizeHandler();

		return value;
	},
	_renderResizeHandler: function(){
		if(!this._rwHandle){
			var rp = this._viewobj;
			if (rp.firstChild){
				rp = rp.firstChild;
				rp.style.position = "relative";
			}

			this._rwHandle = create("DIV",{
				"class"	: "webix_resize_handle",
				/*@attr*/"webix_disable_drag" : "true"
			});
			rp.appendChild(this._rwHandle);
			_event(this._rwHandle, env.mouse.down, this._wrDown, {bind:this});
		}
	},
	_showResizeFrame: function(width,height){
		if(!this._resizeFrame){
			this._resizeFrame = create("div", {"class":"webix_resize_frame"},"");
			document.body.appendChild(this._resizeFrame);
			var elPos = offset(this._viewobj);
			this._resizeFrame.style.left = elPos.x+"px";
			this._resizeFrame.style.top = elPos.y+"px";
			this._resizeFrame.style.zIndex = zIndex();
		}

		this._resizeFrame.style.width = width + "px";
		this._resizeFrame.style.height = height + "px";
	},
	_wrDown:function(){
		if (this.config.resize){
			addCss(document.body,"webix_noselect webix_resize_cursor");
			this._wsReady = offset(this._viewobj);

			this._resizeHandlersMove = event(document.body, env.mouse.move, this._wrMove, {bind:this});
			this._resizeHandlersUp   = event(document.body, env.mouse.up, this._wrUp, {bind:this});
		}
	},
	_wrMove:function(e){
		if (this._wsReady !== false){
			var elPos = getPos(e);
			var progress = {x:elPos.x - this._wsReady.x, y: elPos.y - this._wsReady.y};

			if (this.$resizeMove)
				this.$resizeMove(progress);
			else {
				var config = this.config;
				var minWidth = config.minWidth||100;
				var minHeight = config.minHeight||100;

				if (progress.x < minWidth)
					progress.x = minWidth;
				else if(progress.x > config.maxWidth)
					progress.x = config.maxWidth;

				if (progress.y < minHeight)
					progress.y = minHeight;
				else if(progress.y > config.maxHeight)
					progress.y = config.maxHeight;
			}

			this._wsProgress = progress;
			this._showResizeFrame(progress.x,progress.y);
		}
	},
	_wrUp:function(){
		// remove resize frame and css styles
		if (this._resizeFrame)
			this._resizeFrame = remove(this._resizeFrame);
		
		removeCss(document.body,"webix_resize_cursor");
		removeCss(document.body,"webix_noselect");
		eventRemove(this._resizeHandlersMove);
		eventRemove(this._resizeHandlersUp);

		// set Window sizes
		if (this._wsProgress){
			if (this.$resizeEnd)
				this.$resizeEnd(this._wsProgress);
			else {
				this.config.width = this._wsProgress.x;
				this.config.height = this._wsProgress.y;
				this.resize();
			}
		}

		this._wsReady = this._wsProgress = false;
		this.callEvent("onViewResize",[]);
	}
};

export default ResizeArea;