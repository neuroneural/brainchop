import {assert} from "../webix/debug";
import {ui} from "../ui/core";

import material from "../css/skins/material/config";
import mini from "../css/skins/mini/config";
import flat from "../css/skins/flat/config";
import compact from "../css/skins/compact/config";
import contrast from "../css/skins/contrast/config";

export var $active, $name;

export function set(name){
	assert(skin[name], "Incorrect skin name: "+name);
	if ($name === name) return;

	skin.$active = $active = skin[name];
	skin.$name = $name = name;

	if (ui){
		for (var key in ui){
			var view = ui[key];
			if (view && view.prototype && view.prototype.$skin)
				view.prototype.$skin(view.prototype);
		}
	}		
}

const skin = { set, material, mini, flat, compact, contrast };

set(window.webix_skin || "material");

//necessary for skin builder
export { skin };