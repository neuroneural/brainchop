import i18n from "./i18n";

const csv = {
	escape:true,
	delimiter:{
		rows: "\n",
		cols: "\t"
	},
	parse:function(text, sep){
		sep = sep||this.delimiter;
		if (!this.escape)
			return this._split_clip_data(text, sep);

		var lines = text.replace(/\n$/,"").split(sep.rows);

		var i = 0;
		while (i < lines.length - 1) {
			if (this._substr_count(lines[i], "\"") % 2 === 1) {
				lines[i] += sep.rows + lines[i + 1];
				delete lines[i + 1];
				i++;
			}
			i++;
		}
		var csv = [];

		for (i = 0; i < lines.length; i++) {
			if (typeof(lines[i]) !== "undefined") {
				var tline = lines[i];
				var start = 0;
				var line = [];
				var quoted = false;
				for (var j=0; j<=tline.length; j++){
					if (!quoted && tline[j] === sep.cols || j === tline.length){
						var chunk = tline.substr(start, j-start);
						if (chunk[0] === chunk[chunk.length-1] && chunk[0] === "\""){
							chunk = chunk.substr(1, chunk.length-2).replace("\"\"", "\"");
						}
						line.push(chunk);
						start = j+1;
					}

					if (tline[j] === "\"") {
						quoted = !quoted;
						continue;
					}
				}
				csv.push(line);
			}
		}
		return csv;
	},
	_split_clip_data: function(text, sep) {
		var lines = text.split(sep.rows);
		for (var i = 0; i < lines.length; i++) {
			lines[i] = lines[i].split(sep.cols);
		}
		return lines;
	},
	/*! counts how many occurances substring in string **/
	_substr_count: function(string, substring) {
		var arr = string.split(substring);
		return arr.length - 1;
	},
	stringify:function(data, sep){
		sep = sep||this.delimiter;

		if (!this.escape){
			for (let i = 0; i < data.length; i++)
				data[i] = data[i].join(sep.cols);
			return data.join(sep.rows);
		}

		var reg = /\n|"|;|,/;
		for (let i = 0; i < data.length; i++) {
			for (var j = 0; j < data[i].length; j++) {
				var chunk = data[i][j];
				if (chunk instanceof Date)
					data[i][j] = i18n.parseFormatStr(chunk);
				else if (reg.test(chunk))
					data[i][j] = "\"" + chunk.toString().replace(/"/g, "\"\"") + "\"";
			}
			data[i] = data[i].join(sep.cols);
		}
		data = data.join(sep.rows);
		return data;
	}
};

export default csv;