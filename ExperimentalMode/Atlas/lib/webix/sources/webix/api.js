import {callEvent} from "./customevents";

export function editStop(){
	callEvent("onEditEnd", []);
}
