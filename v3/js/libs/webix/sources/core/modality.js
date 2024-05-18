import {create, remove} from "../webix/html";
import {zIndex} from "../ui/helpers";
import {bind} from "../webix/helpers";
import {_event} from "../webix/htmlevents";

import state from "./state";

const Modality = {
	_modal_set:function(value){
		if (value){
			if (!this._modal_cover){
				this._modal_cover = create("div",{
					"class":"webix_modal"
				});
				/*	with below code we will have the same zIndex for modal layer as for the previous 
					abs positioned element, but because of attaching order modal layer will be on top anyway
				*/
				const index = this._modality = zIndex(this._settings.zIndex);
				state._modality.push(index);

				this._modal_cover.style.zIndex = index-1;
				this._viewobj.style.zIndex = index;
				document.body.appendChild(this._modal_cover);
				document.body.style.overflow = "hidden";
				_event( this._modal_cover, "click", bind(this._ignore_clicks, this));
			}
		}
		else {
			if (this._modal_cover){
				remove(this._modal_cover);
				this._modal_cover = null;

				const modality = state._modality;
				modality.splice(modality.indexOf(this._modality), 1);

				if (!modality.length)
					document.body.style.overflow = "";
			}
		}
		return value;
	}
};


export default Modality;