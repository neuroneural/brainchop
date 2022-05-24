import {extend} from "../webix/helpers";
import {proto} from "../ui/core";

import TreeDataLoader from "../core/treedataloader";
import DataCollection from "../core/datacollection";
import TreeStore from "../core/treestore";
import TreeDataMove from "../core/treedatamove";


const TreeCollection = proto({
	name:"TreeCollection",
	$init:function(){
		extend(this.data, TreeStore, true);
		this.data.provideApi(this,true);
		extend(this, TreeDataMove, true);
	}
}, TreeDataLoader, DataCollection);


export default TreeCollection;