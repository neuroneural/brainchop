import less from "rollup-plugin-less";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import license from "rollup-plugin-license";
import { uglify } from "rollup-plugin-uglify";
import { eslint } from "rollup-plugin-eslint";
import common from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

module.exports = function(cli){
	const pkg = require("./package.json");

	const name = pkg.productTag;
	const mode = cli["config-mode"] || "fast";
	const outname = cli["config-name"] || ( mode === "min" ? `${name}.min` : name );
	const skin = cli["config-skin"] || "material";

	const plugins = [
		replace({
			DEBUG: mode !== "min",
			VERSION: pkg.version
		}),
		less({
			output:`codebase/${name}.css`,
			option:{
				paths:[ `${__dirname}/sources/css/skins/${skin}` ]
			}
		}),
		license({
			sourceMap: true,
			banner: `@license
webix <%= pkg.productName %> v.<%= pkg.version %>
This software is allowed to use under GPL or you need to obtain Commercial License 
 to use it in non-GPL project. Please contact sales@webix.com for details`
		}),
		resolve({ main:true, module:false }),
		common({})
	];

	let sourcemap = false;
	let treeshake = false;


	if (mode !== "fastest"){
		plugins.push(eslint({
			
		}));
		plugins.push(babel({
			exclude: "node_modules/**",
			presets: [
				[
					"@babel/preset-env",
					{
						loose: true,
						targets: { "ie": "8" },
						exclude: [ "transform-function-name" ]				
					}
				]
			]
		}));

		if (mode !== "fast"){
			sourcemap = (mode === "normal" || mode === "min");
			treeshake = true;
		}
	}

	if (mode === "min"){
		plugins.push(uglify({
			mangle:{
				properties:{ regex:/^_(?!id$).*$/ },
				reserved:["log", "assert"]
			},
			compress: {
				pure_funcs:["log", "assert"]
			}
		}));
	}

	return {
		treeshake,
		input: `sources/${name}.js`,
		plugins,
		output: {
			file: `codebase/${outname}.js`,
			format: "umd",
			name,
			sourcemap
		},
		watch:{
			chokidar: false,
			include: "sources/**/*.js"
		}
	};
};