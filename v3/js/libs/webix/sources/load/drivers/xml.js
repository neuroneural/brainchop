import { assert } from "../../webix/debug";

const xml={
	_isValidXML:function(data){
		if (!data || !data.documentElement)
			return null;
		if (data.getElementsByTagName("parsererror").length)
			return null;
		return data;
	},
	//convert xml string to xml object if necessary
	toObject:function(text, response){
		var data = response ? (response.rawxml ? response.rawxml() : response) :null;
		if (this._isValidXML(data))
			return data;
		if (typeof text == "string")
			data = this.fromString(text.replace(/^[\s]+/,""));
		else
			data = text;

		if (this._isValidXML(data))
			return data;
		return null;
	},
	//get array of records
	getRecords:function(data){
		return this.xpath(data,this.records);
	},
	records:"/*/item",
	child:"item",
	config:"/*/config",
	//get hash of properties for single record
	getDetails:function(data){
		return this.tagToObject(data,{});
	},
	getOptions:function(){ 
		return false;
	},
	//get count of data and position at which new data_loading need to be inserted
	getInfo:function(data){
		
		var config = this.xpath(data, this.config);
		if (config.length)
			config = this.assignTypes(this.tagToObject(config[0],{}));
		else 
			config = null;

		return {
			size:(data.documentElement.getAttribute("total_count")||0),
			from:data.documentElement.getAttribute("pos"),
			parent:(data.documentElement.getAttribute("parent")||0),
			config:config
		};
	},
	//xpath helper
	xpath:function(xml,path){
		if (window.XPathResult){	//FF, KHTML, Opera
			var node=xml;
			if(xml.nodeName.indexOf("document")==-1)
				xml=xml.ownerDocument;

			var res = [];
			var col = xml.evaluate(path, node, null, XPathResult.ANY_TYPE, null);
			var temp = col.iterateNext();
			while (temp){ 
				res.push(temp);
				temp = col.iterateNext();
			}
			return res;
		}
		else {
			var test = true;
			try {
				if (typeof(xml.selectNodes)=="undefined")
					test = false;
			} catch(e){ /*IE7 and below can't operate with xml object*/ }
			//IE
			if (test)
				return xml.selectNodes(path);
			else {
				//there is no interface to do XPath
				//use naive approach
				var name = path.split("/").pop();

				return xml.getElementsByTagName(name);
			}
		}
	},
	assignTypes:function(obj){
		for (var k in obj){
			var test = obj[k];
			if (typeof test == "object")
				this.assignTypes(test);
			else if (typeof test == "string"){
				if (test === "") 
					continue;
				if (test == "true")
					obj[k] = true;
				else if (test == "false")
					obj[k] = false;
				else if (test == test*1)
					obj[k] = obj[k]*1;
			}
		}
		return obj;
	},
	//convert xml tag to js object, all subtags and attributes are mapped to the properties of result object
	tagToObject:function(tag,z){
		var isArray = tag.nodeType == 1 && tag.getAttribute("stack");
		var hasSubTags = 0;

		if (!isArray){
			z=z||{};
			

			//map attributes
			let a=tag.attributes;
			if(a && a.length)
				for (let i=0; i<a.length; i++){
					z[a[i].name]=a[i].value;
					hasSubTags = 1;
				}

			//map subtags
			let b=tag.childNodes;
			for (let i=0; i<b.length; i++)
				if (b[i].nodeType==1){
					const name = b[i].tagName;
					if (z[name]){
						if (typeof z[name].push != "function")
							z[name] = [z[name]];
						z[name].push(this.tagToObject(b[i],{}));
					} else
						z[name]=this.tagToObject(b[i],{});	//sub-object for complex subtags
					hasSubTags = 2;
				}

			if (!hasSubTags)
				return this.nodeValue(tag);
			//each object will have its text content as "value" property
			//only if has not sub tags
			if (hasSubTags < 2)
				z.value = z.value||this.nodeValue(tag);

		} else {
			z = [];
			let b=tag.childNodes;
			for (let i=0; i<b.length; i++)
				if (b[i].nodeType==1)
					z.push(this.tagToObject(b[i],{}));
		}

		return z;
	},
	//get value of xml node 
	nodeValue:function(node){
		if (node.firstChild){
			return node.firstChild.wholeText || node.firstChild.data;
		}
		return "";
	},
	//convert XML string to XML object
	fromString:function(xmlString){
		try{
			if (window.DOMParser)		// FF, KHTML, Opera
				return (new DOMParser()).parseFromString(xmlString,"text/xml");
			/* global ActiveXObject */
			if (window.ActiveXObject){	// IE, utf-8 only 
				var temp=new ActiveXObject("Microsoft.xmlDOM");
				temp.loadXML(xmlString);
				return temp;
			}
		} catch(e){
			assert(0, e);
			return null;
		}
		assert(0, "Load from xml string is not supported");
	}
};

export default xml;