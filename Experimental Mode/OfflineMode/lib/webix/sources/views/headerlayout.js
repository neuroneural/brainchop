import {protoUI} from "../ui/core";
import base from "./accordion";


const api = {
	name:"headerlayout",
	defaults:{
		type: "accordion",
		multi:"mixed",
		collapsed:false
	}
};

const view = protoUI(api, base.view);
export default {api, view};