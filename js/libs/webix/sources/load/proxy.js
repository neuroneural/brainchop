import {assert} from "../webix/debug";
import {extend, copy as makeCopy} from "../webix/helpers";

import binary from "./proxy/binary";
import debug from "./proxy/debug";
import json from "./proxy/json";
import post from "./proxy/post";
import rest from "./proxy/rest";
import graphql from "./proxy/graphql";

function proxy(name, source, extra){
	assert(proxy[name], "Invalid proxy name: "+name);

	var copy = makeCopy(proxy[name]);
	copy.source = source;

	if (extra)
		extend(copy, extra, true);

	if (copy.init) copy.init();
	return copy;
}

proxy.$parse = function(value){
	if (typeof value == "string" && value.indexOf("->") != -1){
		var parts = value.split("->");
		return proxy(parts[0], parts[1]);
	}
	return value;
};

proxy.binary = binary;
proxy.debug = debug;
proxy.json = json;
proxy.post = post;
proxy.rest = rest;
proxy.GraphQL = graphql;

export default proxy;