// resolves circular dependencies
// quick solution, must be removed in the next versions

const services = {};
export function define(name, value){
	services[name] = value;
}

export function use(name){
	return services[name];
}