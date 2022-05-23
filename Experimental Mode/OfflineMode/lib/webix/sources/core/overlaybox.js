import {create, insertBefore, remove} from "../webix/html";


const OverlayBox = {
	showOverlay:function(message){
		if (!this._overlay){
			this._overlay = create("DIV",{ "class":"webix_overlay" },(message||""));
			insertBefore(this._overlay, this._viewobj.firstChild, this._viewobj);
			this._viewobj.style.position = "relative";
		} else 
			this._overlay.innerHTML = message;
	},
	hideOverlay:function(){
		if (this._overlay){
			remove(this._overlay);
			this._overlay = null;
		}
	}
};

export default OverlayBox;