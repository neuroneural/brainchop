import {create} from "../webix/html";

/*submits values*/
export default function send(url, values, method, target){
	var form = create("FORM",{
		"target":(target||"_self"),
		"action":url,
		"method":(method||"POST")
	},"");
	for (var k in values) {
		var field = create("INPUT",{"type":"hidden","name": k,"value": values[k]},"");
		form.appendChild(field);
	}
	form.style.display = "none";
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
}