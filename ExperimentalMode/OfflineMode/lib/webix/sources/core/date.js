import env from "../webix/env";
import i18n from "../webix/i18n";


const wDate = {
	startOnMonday:false,

	toFixed:function(num, ms){
		if( num<10)	num = "0"+num;
		if( ms && num <100 ) num = "0"+num;
		return num;
	},
	weekStart:function(date){
		date = this.copy(date);

		var shift=date.getDay();
		if (this.startOnMonday){
			if (shift===0) shift=6;
			else shift--;
		}
		return this.datePart(this.add(date,-1*shift,"day"));
	},
	monthStart:function(date){
		date = this.copy(date);

		date.setDate(1);
		return this.datePart(date);
	},
	yearStart:function(date){
		date = this.copy(date);

		date.setMonth(0);
		return this.monthStart(date);
	},
	dayStart:function(date){
		return this.datePart(date, true);
	},
	dateToStr:function(format,utc){
		if (typeof format == "function") return format;

		if(env.strict){
			return function(date){
				if (!date)
					return "";
				if (!date.getMonth)
					date = i18n.parseFormatDate(date);

				var str = "";
				var lastPos = 0;
				format.replace(/%[a-zA-Z]/g,function(s,pos){
					str += format.slice(lastPos,pos);
					var fn = function(date){
						if( s == "%d")  return wDate.toFixed(date.getDate());
						if( s == "%m")  return wDate.toFixed((date.getMonth()+1));
						if( s == "%j")  return date.getDate();
						if( s == "%n")  return (date.getMonth()+1);
						if( s == "%y")  return wDate.toFixed(date.getFullYear()%100);
						if( s == "%Y")  return date.getFullYear();
						if( s == "%D")  return i18n.calendar.dayShort[date.getDay()];
						if( s == "%l")  return i18n.calendar.dayFull[date.getDay()];
						if( s == "%M")  return i18n.calendar.monthShort[date.getMonth()];
						if( s == "%F")  return i18n.calendar.monthFull[date.getMonth()];
						if( s == "%h")  return wDate.toFixed((date.getHours()+11)%12+1);
						if( s == "%g")  return ((date.getHours()+11)%12+1);
						if( s == "%G")  return date.getHours();
						if( s == "%H")  return wDate.toFixed(date.getHours());
						if( s == "%i")  return wDate.toFixed(date.getMinutes());
						if( s == "%a")  return (date.getHours()>11?i18n.pm[0]:i18n.am[0]);
						if( s == "%A")  return (date.getHours()>11?i18n.pm[1]:i18n.am[1]);
						if( s == "%s")  return wDate.toFixed(date.getSeconds());
						if( s == "%S")	return wDate.toFixed(date.getMilliseconds(), true);
						if( s == "%W")  return wDate.toFixed(Date.getISOWeek(date));
						if( s == "%c"){
							var str = date.getFullYear();
							str += "-"+wDate.toFixed((date.getMonth()+1));
							str += "-"+wDate.toFixed(date.getDate());
							str += "T";
							str += wDate.toFixed(date.getHours());
							str += ":"+wDate.toFixed(date.getMinutes());
							str += ":"+wDate.toFixed(date.getSeconds());
							return str;
						}
						return s;
					};
					str += fn(date);
					lastPos = pos + 2;
				});
				str += format.slice(lastPos,format.length);
				return str;
			};

		}

		format=format.replace(/%[a-zA-Z]/g,function(a){
			switch(a){
				case "%d": return "\"+wDate.toFixed(date.getDate())+\"";
				case "%m": return "\"+wDate.toFixed((date.getMonth()+1))+\"";
				case "%j": return "\"+date.getDate()+\"";
				case "%n": return "\"+(date.getMonth()+1)+\"";
				case "%y": return "\"+wDate.toFixed(date.getFullYear()%100)+\""; 
				case "%Y": return "\"+date.getFullYear()+\"";
				case "%D": return "\"+i18n.calendar.dayShort[date.getDay()]+\"";
				case "%l": return "\"+i18n.calendar.dayFull[date.getDay()]+\"";
				case "%M": return "\"+i18n.calendar.monthShort[date.getMonth()]+\"";
				case "%F": return "\"+i18n.calendar.monthFull[date.getMonth()]+\"";
				case "%h": return "\"+wDate.toFixed((date.getHours()+11)%12+1)+\"";
				case "%g": return "\"+((date.getHours()+11)%12+1)+\"";
				case "%G": return "\"+date.getHours()+\"";
				case "%H": return "\"+wDate.toFixed(date.getHours())+\"";
				case "%i": return "\"+wDate.toFixed(date.getMinutes())+\"";
				case "%a": return "\"+(date.getHours()>11?i18n.pm[0]:i18n.am[0])+\"";
				case "%A": return "\"+(date.getHours()>11?i18n.pm[1]:i18n.am[1])+\"";
				case "%s": return "\"+wDate.toFixed(date.getSeconds())+\"";
				case "%S": return "\"+wDate.toFixed(date.getMilliseconds(), true)+\"";
				case "%W": return "\"+wDate.toFixed(wDate.getISOWeek(date))+\"";
				case "%c":
					var str = "\"+date.getFullYear()+\"";
					str += "-\"+wDate.toFixed((date.getMonth()+1))+\"";
					str += "-\"+wDate.toFixed(date.getDate())+\"";
					str += "T";
					str += "\"+wDate.toFixed(date.getHours())+\"";
					str += ":\"+wDate.toFixed(date.getMinutes())+\"";
					str += ":\"+wDate.toFixed(date.getSeconds())+\"";
					if(utc === true)
						str += "Z";
					return str;

				default: return a;
			}
		});
		if (utc===true) format=format.replace(/date\.get/g,"date.getUTC");
		const temp = new Function("date", "i18n", "wDate", "if (!date) return ''; if (!date.getMonth) date=i18n.parseFormatDate(date);  return \""+format+"\";");
		return function(v){ return temp(v, i18n, wDate); };
	},
	strToDate:function(format,utc){
		if (typeof format == "function") return format;

		var mask=format.match(/%[a-zA-Z]/g);
		var splt="var temp=date.split(/[\\s\\./\\-\\:\\,]+/g); if(!temp.join('')){return ''}";
		var i,t,s;

		if(!i18n.calendar.monthShort_hash){
			s = i18n.calendar.monthShort;
			t = i18n.calendar.monthShort_hash = {};
			for (i = 0; i < s.length; i++)
				t[s[i]]=i;

			s = i18n.calendar.monthFull;
			t = i18n.calendar.monthFull_hash = {};
			for (i = 0; i < s.length; i++)
				t[s[i]]=i;
		}

		if(env.strict){
			return function(date){
				if (!date) return "";
				if (typeof date == "object") return date;
				var temp=date.split(/[\s./\-:,]+/g);

				if(!temp.join(""))
					return "";

				var set=[0,0,1,0,0,0,0];
				for (i=0; i<mask.length; i++){
					var a = mask[i];
					if( a ==  "%y")
						set[0]=temp[i]*1+(temp[i]>30?1900:2000);
					else if( a ==  "%Y"){
						set[0]=(temp[i]||0)*1; if (set[0]<30) set[0]+=2000;
					}
					else if( a == "%n" || a == "%m")
						set[1]=(temp[i]||1)-1;
					else if( a ==  "%M")
						set[1]=i18n.calendar.monthShort_hash[temp[i]]||0;
					else if( a ==  "%F")
						set[1]=i18n.calendar.monthFull_hash[temp[i]]||0;
					else if( a == "%j" || a == "%d")
						set[2]=temp[i]||1;
					else if( a == "%g" || a == "%G" || a == "%h" || a == "%H")
						set[3]=temp[i]||0;
					else if( a == "%a")
						set[3]=set[3]%12+((temp[i]||"")==i18n.am[0]?0:12);
					else if( a == "%A")
						set[3]=set[3]%12+((temp[i]||"")==i18n.am[1]?0:12);
					else if( a ==  "%i")
						set[4]=temp[i]||0;
					else if( a ==  "%s")
						set[5]=temp[i]||0;
					else if( a ==  "%S")
						set[6]=temp[i]||0;
					else if( a ==  "%c"){
						var reg = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(\+.*|)/g;
						var res = reg.exec(date);
						set[0]= (res[1]||0)*1; if (set[0]<30) set[0]+=2000;
						set[1]= (res[2]||1)-1;
						set[2]= res[3]||1;
						set[3]= res[4]||0;
						set[4]= res[5]||0;
						set[5]= res[6]||0;
					}
				}
				if(utc)
					return new Date(Date.UTC(set[0],set[1],set[2],set[3],set[4],set[5], set[6]));
				return new Date(set[0],set[1],set[2],set[3],set[4],set[5], set[6]);
			};
		}

		for (i=0; i<mask.length; i++){
			switch(mask[i]){
				case "%j":
				case "%d": splt+="set[2]=temp["+i+"]||1;";
					break;
				case "%n":
				case "%m": splt+="set[1]=(temp["+i+"]||1)-1;";
					break;
				case "%y": splt+="set[0]=temp["+i+"]*1+(temp["+i+"]>30?1900:2000);";
					break;
				case "%g":
				case "%G":
				case "%h": 
				case "%H":
					splt+="set[3]=temp["+i+"]||0;";
					break;
				case "%i":
					splt+="set[4]=temp["+i+"]||0;";
					break;
				case "%Y":  splt+="set[0]=(temp["+i+"]||0)*1; if (set[0]<30) set[0]+=2000;";
					break;
				case "%a":
					splt+= "set[3]=set[3]%12+(temp["+i+"]==i18n.am[0]?0:12);";
					break;
				case "%A":
					splt+= "set[3]=set[3]%12+(temp["+i+"]==i18n.am[1]?0:12);";
					break;					
				case "%s":  splt+="set[5]=temp["+i+"]||0;";
					break;
				case "%S":  splt+="set[6]=temp["+i+"]||0;";
					break;
				case "%M":  splt+="set[1]=i18n.calendar.monthShort_hash[temp["+i+"]]||0;";
					break;
				case "%F":  splt+="set[1]=i18n.calendar.monthFull_hash[temp["+i+"]]||0;";
					break;
				case "%c":
					splt+= "var res = date.split('T');";
					splt+= "if(res[0]){ var d = res[0].split('-');";
					splt+= "set[0]= (d[0]||0)*1; if (set[0]<30) set[0]+=2000;";
					splt+= "set[1]= (d[1]||1)-1;";
					splt+= "set[2]= d[2]||1;}";
					splt+= "if(res[1]){ var t = res[1].split(':');";
					splt+= "set[3]= t[0]||0;";
					splt+= "set[4]= t[1]||0;";
					splt+= "set[5]= parseInt(t[2])||0;}";
					break;
				default:
					break;
			}
		}
		var code ="set[0],set[1],set[2],set[3],set[4],set[5],set[6]";
		if (utc) code =" Date.UTC("+code+")";
		const temp = new Function("date", "i18n", "if (!date) return ''; if (typeof date == 'object') return date; var set=[0,0,1,0,0,0,0]; "+splt+" return new Date("+code+");");
		return function(v){ return temp(v, i18n ); };
	},
		
	getISOWeek: function(ndate) {
		if(!ndate) return false;
		var nday = ndate.getDay();
		if (nday === 0) {
			nday = 7;
		}
		var first_thursday = new Date(ndate.valueOf());
		first_thursday.setDate(ndate.getDate() + (4 - nday));
		var year_number = first_thursday.getFullYear(); // year of the first Thursday
		var ordinal_date = Math.floor( (first_thursday.getTime() - new Date(year_number, 0, 1).getTime()) / 86400000); //ordinal date of the first Thursday - 1 (so not really ordinal date)
		var weekNumber = 1 + Math.floor( ordinal_date / 7);	
		return weekNumber;
	},
	
	getUTCISOWeek: function(ndate){
		return this.getISOWeek(ndate);
	},
	_correctDate: function(d,d0,inc,checkFunc){
		if(!inc)
			return;
		var incorrect = checkFunc(d,d0);
		if(incorrect){
			var i = (inc>0?1:-1);

			while(incorrect){
				d.setHours(d.getHours()+i);
				incorrect = checkFunc(d,d0);
				i += (inc>0?1:-1);
			}
		}
	},
	add:function(date,inc,mode,copy){
		if (copy) date = this.copy(date);
		var d = wDate.copy(date);
		switch(mode){
			case "day":
				date.setDate(date.getDate()+inc);
				this._correctDate(date,d,inc,function(d,d0){
					return 	wDate.datePart(d0,true).valueOf()== wDate.datePart(d,true).valueOf();
				});
				break;
			case "week":
				date.setDate(date.getDate()+7*inc);
				this._correctDate(date,d,7*inc,function(d,d0){
					return 	wDate.datePart(d0,true).valueOf()== wDate.datePart(d,true).valueOf();
				});
				break;
			case "month":
				date.setMonth(date.getMonth()+inc);
				this._correctDate(date,d,inc,function(d,d0){
					return 	d0.getMonth() == d.getMonth() && d0.getYear() == d.getYear();
				});
				break;
			case "quarter":
				date.setMonth(date.getMonth() + inc * 3);
				this._correctDate(date,d,inc,function(d,d0){
					return 	d0.getMonth() == d.getMonth() && d0.getYear() == d.getYear();
				});
				break;
			case "year":
				date.setYear(date.getFullYear()+inc);
				this._correctDate(date,d,inc,function(d,d0){
					return 	d0.getFullYear() == d.getFullYear();
				});
				break;
			case "hour":
				date.setHours(date.getHours()+inc);
				this._correctDate(date,d,inc,function(d,d0){
					return 	d0.getHours() == d.getHours() && Date.datePart(d0,true)== Date.datePart(d,true);
				});
				break;
			case "minute": 	date.setMinutes(date.getMinutes()+inc); break;
			default:
				wDate.add[mode](date, inc, mode);
				break;
		}
		return date;
	},
	datePart:function(date, copy){
		if (copy) date = this.copy(date);

		// workaround for non-existent hours
		var d = this.copy(date);
		d.setHours(0);
		if(d.getDate()!=date.getDate()){
			date.setHours(1);
		}
		else{
			date.setHours(0);
		}

		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date;
	},
	timePart:function(date, copy){
		if (copy) date = this.copy(date);
		return (date.valueOf()/1000 - date.getTimezoneOffset()*60)%86400;
	},
	copy:function(date){
		return new Date(date.valueOf());
	},
	equal:function(a,b){
		if (!a || !b) return false;
		return a.valueOf() === b.valueOf();
	},
	isHoliday:function(day){ 
		day = day.getDay();
		if (day === 0 || day==6) return "webix_cal_event"; 
	}
};

export default wDate;