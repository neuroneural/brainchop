import {extend} from "../webix/helpers";
import GroupStore from "../core/groupstore";


const Group = {
	$init:function(){
		extend(this.data, GroupStore);
	},
	group:function(config, target){
		if (!target && target !== 0){
			this.$blockRender=true;
			this.data.ungroup();
			this.$blockRender=false;
		}
		this.data.group(config, target);
	},
	ungroup:function(target){
		this.data.ungroup(target);
	}
};

export default Group;