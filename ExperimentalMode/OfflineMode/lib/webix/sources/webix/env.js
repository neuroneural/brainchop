const env = {};

env.cdn = "//cdn.webix.com";
env.codebase = "";
env.zIndexBase = 100;
env.scrollSize = 17;
env.strict = !!window.webix_strict;
env.https = document.location.protocol === "https:";

var agent = navigator.userAgent;
env.isMac = agent.indexOf("Mac")!=-1;
if (agent.indexOf("Mobile")!=-1 || agent.indexOf("Windows Phone")!=-1)
	env.mobile = true;
if (env.mobile || agent.indexOf("iPad")!=-1 || agent.indexOf("Android")!=-1)
	env.touch = true;
if (!env.touch && (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
	env.touch = true;
if (agent.indexOf("Opera")!=-1)
	env.isOpera=true;
else{
	//very rough detection, but it is enough for current goals
	env.isIE=!!document.all || (agent.indexOf("Trident") !== -1);
	if (env.isIE){
		var version = parseFloat(navigator.appVersion.split("MSIE")[1]);
		if (version == 8)
			env.isIE8 = true;
	}
	env.isEdge=(agent.indexOf("Edge")!=-1);
	env.isFF=(agent.indexOf("Firefox")!=-1);
	env.isWebKit=(agent.indexOf("KHTML")!=-1);
	env.isSafari=env.isWebKit && env.isMac && (agent.indexOf("Chrome")==-1);

	//maximum height/width for HTML elements in pixels (rough), bigger values will be ignored by browser
	if(env.isIE || env.isEdge || env.isFF)
		env.maxHTMLElementSize = 10000000;
	if(env.isSafari)
		env.maxHTMLElementSize = 100000000;
}

if(agent.toLowerCase().indexOf("android")!=-1){
	env.isAndroid = true;
	if(agent.toLowerCase().indexOf("trident")!=-1){
		env.isAndroid = false;
		env.isIEMobile = true;
	}
}

env.transform = false;
env.transition = false;

var found_index = -1;
var js_list =  ["", "webkit", "Moz", "O", "ms"];
var css_list = ["", "-webkit-", "-Moz-", "-o-", "-ms-"];


var d = document.createElement("DIV");
for (var j=0; j < js_list.length; j++) {
	var name = js_list[j] ? (js_list[j]+"Transform") : "transform";
	if(typeof d.style[name] != "undefined"){
		found_index = j;
		break;
	}
}


if (found_index > -1){
	env.cssPrefix = css_list[found_index];
	var jp = env.jsPrefix = js_list[found_index];

	env.transform = jp ? jp+"Transform" : "transform";
	env.transition = jp ? jp+"Transition" : "transition";
	env.transitionDuration = jp ? jp+"TransitionDuration" : "transitionDuration";

	d.style[env.transform] = "translate3d(0,0,0)";
	env.translate = (d.style[env.transform])?"translate3d":"translate";
	env.transitionEnd = ((env.cssPrefix == "-Moz-")?"transitionend":(jp ? jp+"TransitionEnd" : "transitionend"));
}

env.pointerevents = (!env.isIE ||(new RegExp("Trident/.*rv:11")).exec(agent) !== null);

//touch events that can be prevented
env.passiveEventListeners = false;
try {
	var opts = Object.defineProperty({}, "passive", {
		get: function() { // eslint-disable-line
			env.passiveEventListeners = true;
		}
	});
	window.addEventListener("testPassive", null, opts);
	window.removeEventListener("testPassive", null, opts);
} catch (e) {} // eslint-disable-line

env.svg = (function(){
	return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
})();

env.svganimation = (function(){
	return document.implementation.hasFeature("https://www.w3.org/TR/SVG11/feature#SVG-animation", "1.1");
})();

export default env;