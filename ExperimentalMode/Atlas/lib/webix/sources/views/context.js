import popup from "../views/popup";
import ContextHelper from "../core/contexthelper";
import {protoUI} from "../ui/core";


const api = {
	name:"context"
};


const view = protoUI(api,  ContextHelper, popup.view);
export default {api, view};