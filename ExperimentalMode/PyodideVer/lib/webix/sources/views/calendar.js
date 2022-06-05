import {index} from "../webix/html";
import {protoUI, $$} from "../ui/core";
import {$active} from "../webix/skin";
import env from "../webix/env";
import {bind, isUndefined, extend, copy, toFunctor, isArray} from "../webix/helpers";
import {_event} from "../webix/htmlevents";
import template from "../webix/template";

import i18n from "../webix/i18n";
import UIManager from "../core/uimanager";
import MouseEvents from "../core/mouseevents";
import EventSystem from "../core/eventsystem";
import base from "../views/view";
import DateHelper from "../core/date";
import KeysNavigation from "../core/keysnavigation";


const api = {
	name:"calendar",

	defaults:{
		date: new Date(), //selected date, not selected by default
		navigation: true,
		monthSelect: true,
		weekHeader: true,
		monthHeader: true,
		weekNumber: false,
		skipEmptyWeeks: false,
		calendarHeader: "%F %Y",
		//calendarTime: "%H:%i",
		events:DateHelper.isHoliday,
		minuteStep: 5,
		timeIcon:"wxi-clock",
		icons: false,
		timepickerHeight: 30,
		headerHeight: 30,
		dayTemplate: function(d){
			return d.getDate();
		},
		width: 260,
		height: 250
	},

	dayTemplate_setter: template,
	calendarHeader_setter:DateHelper.dateToStr,
	calendarTime_setter:function(format){
		this._calendarTime = format;
		return DateHelper.dateToStr(format);
	},
	date_setter:function(date){
		return this._string_to_date(date);
	},
	maxDate_setter:function(date){
		return this._string_to_date(date);
	},
	minDate_setter:function(date){
		return this._string_to_date(date);
	},
	minTime_setter:function(time){
		if(typeof(time) == "string"){
			time = i18n.parseTimeFormatDate(time);
			time = [time.getHours(),time.getMinutes()];

		}

		return time;
	},
	maxTime_setter:function(time){
		if(typeof(time) == "string"){
			time = i18n.parseTimeFormatDate(time);
			time = [time.getHours(),time.getMinutes()];
		}
		return time;
	},
	_ariaFocus:function(){
		var ev = "focus"+(env.isIE?"in":"");
		
		if(!env.touch){
			_event(this.$view, ev, bind(function(e){
				var t = e.target.className;
				var css = t.indexOf("webix_cal_day")!==-1 ? "webix_cal_day" : (t.indexOf("webix_cal_block")!==-1?"webix_cal_block":"");

				if(new Date() - UIManager._tab_time > 300 && new Date() - UIManager._mouse_time >100 && css){
					var prev = e.relatedTarget;
					if(prev && !isUndefined(prev.className)){
						var date = (css=="webix_cal_day")?
							this._locate_day(e.target):
							this._locate_date(e.target);
						this._moveSelection(date);
					}
				}
			}, this), {capture:!env.isIE});
		}
	},
	$init: function() {
		this._viewobj.className += " webix_calendar";
		this._viewobj.setAttribute("role", "region");
		this._viewobj.setAttribute("aria-label", i18n.aria.calendar);

		//special dates
		this._special_dates = {};
		this._selected_days = {};
		this._zoom_level = 0;

		//navigation and aria
		this._ariaFocus();
		this.attachEvent("onKeyPress", this._onKeyPress);
	},
	minuteStep_setter(value){
		return Math.max( Math.min(value, 60), this.defaults.minuteStep );
	},
	type_setter: function(value){
		if(value == "time"){
			this._zoom_in = true;
			this._zoom_level = -1;
		}
		else if(value == "year"){
			this._fixed = true;
		}
		return value;
	},
	$setSize:function(x,y){

		if(base.api.$setSize.call(this,x,y)){
			//repaint calendar when size changed
			this.render();
		}
	},
	$getSize:function(dx, dy){
		const s = this._settings;
		if (s.cellHeight && !s.type){
			const state = this._getDateBoundaries(s.date);
			s.height = s.cellHeight * state._rows + s.headerHeight + (s.weekHeader?$active.calendarWeekHeaderHeight:0) +
				(s.timepicker||this._icons?s.timepickerHeight:0) + (this._content_padding+$active.borderWidth)*2;
		}
		return base.api.$getSize.call(this, dx,dy);
	},
	moveSelection:function(mode, details, focus){
		if(this.config.master) return; //in daterange
		var start = this.getSelectedDate();
		if (this.config.multiselect)
			start = start[0];
		var date = DateHelper.copy(start || this.getVisibleDate());
		this._moveSelection(date, mode, focus);
		
	},
	_moveSelection:function(date, mode, focus){
		var css = this._zoom_logic[this._zoom_level]._keyshift(date, mode, this);
		
		if(focus !==false){
			var sel = this._viewobj.querySelector("."+css+"[tabindex='0']");
			if(sel) sel.focus();
		}
	},
	_getDateBoundaries: function(date, reset) {
		// addition information about rendering event:
		// how many days from the previous month,
		// next,
		// number of weeks to display and so on
		
		if (!this._set_date_bounds || reset){
			var month = date.getMonth();
			var year = date.getFullYear();

			var next = new Date(year, month+1, 1);
			var start = DateHelper.weekStart(new Date(year, month, 1));

			var days = Math.round((next.valueOf() - start.valueOf())/(60*1000*60*24));
			var rows = this._settings.skipEmptyWeeks?Math.ceil(days/7):6;

			this._set_date_bounds = { _month: month, _start:start, _next:next, _rows: rows};
		}

		return this._set_date_bounds;
	},
	$skin:function(){
		if($active.calendar){
			if( $active.calendar.width)
				this.defaults.width = $active.calendar.width;
			if( $active.calendar.height)
				this.defaults.height = $active.calendar.height;
			if( $active.calendar.headerHeight)
				this.defaults.headerHeight = $active.calendar.headerHeight;
			if( $active.calendar.timepickerHeight)
				this.defaults.timepickerHeight = $active.calendar.timepickerHeight;
		}
		this._content_padding = $active.layoutPadding.form;
	},
	_getColumnConfigSizes: function(date){ 
		var bounds = this._getDateBoundaries(date);

		var s = this._settings;
		var _columnsHeight = [];
		var _columnsWidth = [];
		var min = Infinity;

		var containerWidth = this._content_width - (this._content_padding+$active.borderWidth)*2;

		var containerHeight = this._content_height - (s.monthHeader?s.headerHeight:0) - (s.weekHeader?$active.calendarWeekHeaderHeight:0) -
			(s.timepicker||this._icons?s.timepickerHeight:0) - (this._content_padding+$active.borderWidth)*2;

		var columnsNumber = (s.weekNumber)?8:7;
		for(var i=0; i<columnsNumber; i++) {
			_columnsWidth[i] = Math.ceil(containerWidth/(columnsNumber-i));
			containerWidth -= _columnsWidth[i];
			min = Math.min(min, _columnsWidth[i]);
		}

		var rowsNumber = bounds._rows;
		for (var k = 0; k < rowsNumber; k++) {
			_columnsHeight[k] = Math.ceil(containerHeight/(rowsNumber-k) );
			containerHeight -= _columnsHeight[k];
			min = Math.min(min, _columnsHeight[k]);
		}
		return [_columnsWidth, _columnsHeight, min];
	},
	icons_setter: function(value){
		if(!value)
			this._icons = null;
		else if(typeof value == "object")
			this._icons = value;
		else
			this._icons = this._icons2;
	},
	_icons: [],
	_icons2: [

		{
			template: function(){
				return "<span role='button' tabindex='0' class='webix_cal_icon_today webix_cal_icon'>"+i18n.calendar.today+"</span>";
			},
			on_click:{
				"webix_cal_icon_today": function(){
					var date = new Date();
					if(!this._settings.timepicker)
						date = DateHelper.datePart(date);
					this.setValue(date, "user");
					this.callEvent("onTodaySet",[this.getSelectedDate()]);
				}
			}
		},
		{
			template: function(){
				return "<span role='button' tabindex='0' class='webix_cal_icon_clear webix_cal_icon'>"+i18n.calendar.clear+"</span>";
			},
			on_click:{
				"webix_cal_icon_clear": function(){
					this.setValue("", "user");
					this.callEvent("onDateClear",[this.getSelectedDate()]);
				}
			}
		}
	],
	refresh:function(){ this.render(); },
	render: function() {
		//reset zoom level
		this._zoom_level = 0;
		this._zoom_size = false;

		var s = this._settings;

		if (!this.isVisible(s.id)) return;
		this._current_time = DateHelper.datePart(new Date());

		this.callEvent("onBeforeRender",[]);

		var date = this._settings.date;

		var bounds = this._getDateBoundaries(date, true);
		var sizes = this._getColumnConfigSizes(date);
		var cpad = this._content_padding + "px";
		var width = sizes[0];
		var height = sizes[1];

		var html = "";
		if (s.monthHeader){
			html += "<div class='webix_cal_month' style='margin:0 "+cpad+"'><span aria-live='assertive' aria-atomic='true' class='webix_cal_month_name"+((!s.monthSelect || !s.navigation)?" webix_readonly'":"' role='button' tabindex='0'")+">"+s.calendarHeader(date)+"</span>";
			if (s.navigation)
				html += "<div role='button' tabindex='0' aria-label='"+i18n.aria.navMonth[0]+"' class='webix_cal_prev_button'></div><div role='button' tabindex='0' aria-label='"+i18n.aria.navMonth[1]+"' class='webix_cal_next_button'></div>";
			html += "</div>";
		}

		if(s.weekHeader)
			html += "<div class='webix_cal_header' style='margin:0 "+cpad+"' aria-hidden='true'>"+this._week_template(width)+"</div>";
		html += "<div class='webix_cal_body' style='margin:0 "+cpad+"'>"+this._body_template(width, height, bounds, sizes[2])+"</div>";

		if (this._settings.timepicker || this._icons){
			html += "<div class='webix_cal_footer' style='margin:0 "+cpad+"'>";
			if(this._settings.timepicker)
				html += this._timepicker_template(date);

			if(this._icons)
				html += this._icons_template();
			html += "</div>";
		}

		this._contentobj.innerHTML = html;
		this._contentobj.firstChild.style.marginTop = cpad;

		if(this._settings.type == "time"){
			var time = this._settings.date;
			if(time){
				if(typeof(time) == "string"){
					date = i18n.parseTimeFormatDate(time);
				}
				else if(isArray(time)){
					date.setHours(time[0]);
					date.setMinutes(time[1]);
				}
			}
			this._changeZoomLevel(-1,date);
		}
		else if(this._settings.type == "month"){
			this._changeZoomLevel(1,date);
		}
		else if(this._settings.type == "year"){
			this._changeZoomLevel(2,date);
		}

		this._fix_cover();
		this.callEvent("onAfterRender",[]);
	},
	_icons_template: function(date){
		var html =	"<div class='webix_cal_icons'>";
		var icons = this._icons;

		for(var i=0; i < icons.length; i++){
			if(icons[i].template){
				var template = (typeof(icons[i].template) == "function"?icons[i].template: template(icons[i].template));
				html += template.call(this,date);
			}
			if(icons[i].on_click){
				extend(this.on_click,icons[i].on_click);
			}
		}
		html += "</div>";
		return html;
	},
	_timepicker_template:function(date){
		var timeFormat = this._settings.calendarTime||i18n.timeFormatStr;
		var clock = this._settings.timeIcon;
		var tpl = "";

		if(!this._settings.master)
			tpl = "<div role='button' tabindex='0' class='webix_cal_time"+(this._icons?" webix_cal_time_icons":"")+"'><span class='webix_icon "+clock+"'></span> "+timeFormat(date)+"</div>";
		else{
			//daterange needs two clocks
			var range_date = copy($$(this._settings.master)._settings.value);
			if(DateHelper.equal(range_date.end, date))
				range_date.start = range_date.end;
				
			for(var i in range_date){
				tpl += "<div role='button' tabindex='0' class='webix_range_time_"+i+" webix_cal_time'><span class='webix_icon "+clock+"'></span> "+timeFormat(range_date[i])+"</div>";
			}
		}
		return tpl;
	},
	_week_template: function(widths){
		var s = this._settings;
		var week_template = "";
		var correction = 0;

		if(s.weekNumber) {
			correction = 1;
			week_template += "<div class='webix_cal_week_header' style='width: "+widths[0]+"px;' >"+(s.calendarWeekHeader||"")+"</div>";
		}
		
		var k = (DateHelper.startOnMonday)?1:0;
		for (var i=0; i<7; i++){ // 7 days total
			var day_index = (k + i) % 7; // 0 - Sun, 6 - Sat as in Locale.date.day_short
			var day = i18n.calendar.dayShort[day_index]; // 01, 02 .. 31
			week_template += "<div day='"+day_index+"' style='width: "+widths[i+correction]+"px;' >"+day+"</div>";
		}
		
		return week_template;
	},
	blockDates_setter:function(value){
		return toFunctor(value, this.$scope);
	},
	_day_css:function(day, bounds){
		var css = "", isOutside = false;
		if (DateHelper.equal(day, this._current_time))
			css += " webix_cal_today";
		if (!this._checkDate(day))
			css+= " webix_cal_day_disabled";
		if (day.getMonth() != bounds._month){
			isOutside = true;
			css += " webix_cal_outside";
		}
		if (!isOutside && this._selectedDay(day))
			css += " webix_cal_select";
		if (this._settings.events)
			css+=" "+(this._settings.events(day, isOutside) || "");
		css += " webix_cal_day";
		return css;
	},
	_body_template: function(widths, heights, bounds, sqSize){
		var s = this._settings;
		var html = "";
		var day = DateHelper.datePart(DateHelper.copy(bounds._start));
		var start = s.weekNumber?1:0;
		var weekNumber = DateHelper.getISOWeek(DateHelper.add(day,2,"day", true));

		for (var y=0; y<heights.length; y++){
			html += "<div class='webix_cal_row' style='height:"+heights[y]+"px;line-height:"+heights[y]+"px'>";

			if (start){
				// recalculate week number for the first week of a year
				if(!day.getMonth() && day.getDate()<7)
					weekNumber =  DateHelper.getISOWeek(DateHelper.add(day,2,"day", true));
				html += "<div class='webix_cal_week_num' aria-hidden='true' style='width:"+widths[0]+"px'>"+weekNumber+"</div>";
			}

			for (var x=start; x<widths.length; x++){
				var css = this._day_css(day, bounds);
				var d = this._settings.dayTemplate.call(this,day);
				var sel = this._selectedDay(day);
				var alabel = "";
				var isOutside = day.getMonth() != bounds._month;

				if(typeof d == "object"){
					alabel = d.aria || alabel;
					d = d.text;
				}
				else
					alabel = DateHelper.dateToStr(i18n.aria.dateFormat)(day);

				html += "<div day='"+x+"' role='gridcell' "+(isOutside?"aria-hidden='true'":"")+" aria-label='"+alabel+
					"' tabindex='"+(sel && !isOutside?"0":"-1")+"' aria-selected='"+(sel && !isOutside?"true":"false")+"' class='"+css+"' style='text-align:center; width:"+widths[x]+
					"px'><span aria-hidden='true' class='webix_cal_day_inner' style='display:inline-block; "+this._getCalSizesString(sqSize,sqSize)+"'>"+d+"</span></div>";
				day = DateHelper.add(day, 1, "day");

				if(day.getHours()){
					day = DateHelper.datePart(day);
				}
			}

			html += "</div>";
			weekNumber++;
		}
		return html;
	},
	_changeDate:function(dir, step){
		var now = this._settings.date;
		if(!step) { step = this._zoom_logic[this._zoom_level]._changeStep; }
		if(!this._zoom_level){
			now = DateHelper.copy(now);
			now.setDate(1);
		}
		var next = DateHelper.add(now, dir*step, "month", true);
		this._changeDateInternal(now, next);
	},
	_changeDateInternal:function(now, next){
		if(this.callEvent("onBeforeMonthChange", [now, next])){
			if (this._zoom_level){
				this._update_zoom_level(next);
			}
			else{
				this.showCalendar(next);
			}
			this.callEvent("onAfterMonthChange", [next, now]);
		}
	},
	_zoom_logic:{
		"-2":{
			_isBlocked: function(i){
				var config = this._settings,
					date = config.date,
					isBlocked = false;

				var minHour = (config.minTime ? config.minTime[0] : 0);
				var maxHour = (config.maxTime ? (config.maxTime[0] + ( config.maxTime[1] ? 1 : 0 )) : 24);

				var minMinute = (config.minTime && (date.getHours()==minHour) ? config.minTime[1] : 0);
				var maxMinute = (config.maxTime && config.maxTime[1] && (date.getHours()==(maxHour-1)) ? config.maxTime[1] : 60);

				if(this._settings.blockTime){
					var d = DateHelper.copy(date);
					d.setMinutes(i);
					isBlocked = this._settings.blockTime(d);
				}
				return (i < minMinute || i >= maxMinute || isBlocked);

			},
			_setContent:function(next, i){ next.setMinutes(i); },
			_findActive:function(date, mode, calendar){
				if(!this._isBlocked.call(calendar, date.getMinutes()))
					return date;
				else{
					var step = calendar._settings.minuteStep;
					var newdate = DateHelper.add(date, mode =="right"?step:-step, "minute", true);
					if(date.getHours() === newdate.getHours())
						return  this._findActive(newdate, mode, calendar);
				}
			}
		},
		"-1":{
			_isBlocked: function(i){
				var config = this._settings,
					date = config.date;

				var minHour = (config.minTime? config.minTime[0]:0);
				var maxHour = (config.maxTime? config.maxTime[0]+(config.maxTime[1]?1:0):24);

				if (i < minHour || i >= maxHour) return true;

				if(config.blockTime){
					var d = DateHelper.copy(date);
					d.setHours(i);
					
					var minMinute = (config.minTime && (i==minHour) ? config.minTime[1] : 0);
					var maxMinute = (config.maxTime && config.maxTime[1] && (i==(maxHour-1)) ? config.maxTime[1] : 60);

					for (var j=minMinute; j<maxMinute; j+= config.minuteStep){
						d.setMinutes(j);
						if (!config.blockTime(d))
							return false;
					}
					return true;
				}
			},
			_setContent:function(next, i){ next.setHours(i); },
			_keyshift:function(date, mode, calendar){
				var newdate, inc, step = calendar._settings.minuteStep;
				
				if(mode === "bottom" || mode === "top"){
					date.setHours(mode==="bottom"?23:0);
					date.setMinutes(mode==="bottom"?55:0);
					date.setSeconds(0);
					date.setMilliseconds(0);
					newdate = date;
				}
				else if(mode === "left" || mode === "right"){//minutes

					inc = (mode==="right"?step:-step);
					if(mode === "left" && date.getMinutes() < step ) inc = 60-step;
					if(mode === "right" && date.getMinutes() >= (60-step)) inc = step-60;
					inc -= date.getMinutes()%step;
					newdate = calendar._zoom_logic["-2"]._findActive(DateHelper.add(date, inc, "minute"), mode, calendar);
				}
				else if(mode === "up" || mode === "down"){ //hours
					inc = mode==="down"?1:-1;
					if(mode === "down" && date.getHours() === 23) inc = -23;
					if(mode === "up" && date.getHours() === 0) inc = 23;
					newdate = this._findActive(DateHelper.add(date, inc, "hour"), mode, calendar);
				}
				else if(mode === false)
					newdate = this._findActive(date, mode, calendar);

				calendar.selectDate(newdate, false, false, "user");

				if(newdate){
					calendar._update_zoom_level(newdate);
					calendar.selectDate(newdate, false, false, "user");
				}

				return "webix_cal_block"+(mode === "left" || mode === "right"?"_min":"");
			},
			_findActive:function(date, mode, calendar){
				if(!this._isBlocked.call(calendar, date.getHours()))
					return date;
				else{
					var newdate = DateHelper.add(date, mode =="down"?1:-1, "hour", true);
					if(date.getDate() === newdate.getDate())
						return  this._findActive(newdate, mode, calendar);
				}
			}
		},
		"0":{//days
			_changeStep:1,
			_keyshift:function(date, mode, calendar){
				var newdate = date;
				if(mode === "pgup" || mode === "pgdown")
					newdate = DateHelper.add(date, (mode==="pgdown"?1:-1), "month");
				else if(mode === "bottom")
					newdate = new Date(date.getFullYear(), date.getMonth()+1, 0);
				else if(mode === "top")
					newdate = new Date(date.setDate(1));
				else if(mode === "left" || mode === "right")
					newdate = DateHelper.add(date, (mode==="right"?1:-1), "day");
				else if(mode === "up" || mode === "down")
					newdate = DateHelper.add(date, (mode==="down"?1:-1), "week");
				
				if(!calendar._checkDate(newdate))
					newdate = calendar._findActive(date, mode);
				
				if(newdate)
					calendar.selectDate(newdate, true, false, "user");
				return "webix_cal_day";
			},
			
		},
		"1":{	//months
			_isBlocked: function(i,calendar){
				var blocked = false,
					min = calendar._settings.minDate,
					max = calendar._settings.maxDate,
					year = calendar._settings.date.getFullYear();

				if (min){
					var minYear = min.getFullYear();
					blocked = year<minYear || (year==minYear&&min.getMonth()>i);
				}

				if (max && !blocked){
					var maxYear = max.getFullYear();
					blocked = year>maxYear || (year==maxYear&&max.getMonth()<i);
				}

				return blocked;
			},
			_correctDate: function(date,calendar){
				date = DateHelper.monthStart(date);

				if (date < calendar._settings.minDate){
					date = DateHelper.copy(calendar._settings.minDate);
				}
				else if (date > calendar._settings.maxDate){
					date = DateHelper.copy(calendar._settings.maxDate);
				}

				return date;
			},
			_getTitle:function(date){ return date.getFullYear(); },
			_getContent:function(i){ return i18n.calendar.monthShort[i]; },
			_setContent:function(next, i){ if(i!=next.getMonth()) next.setDate(1);next.setMonth(i); },
			_changeStep:12,
			_keyshift:function(date, mode, calendar){
				var newdate = date;
				if(mode === "pgup" || mode === "pgdown")
					newdate = DateHelper.add(date, (mode==="pgdown"?1:-1), "year");
				else if(mode === "bottom")
					newdate = new Date(date.setMonth(11));
				else if(mode === "top")
					newdate = new Date(date.setMonth(0));
				else if(mode === "left" || mode === "right")
					newdate = DateHelper.add(date, (mode==="right"?1:-1), "month");
				else if(mode === "up" || mode === "down")
					newdate = DateHelper.add(date, (mode==="down"?4:-4), "month");

				newdate = calendar._correctDate(newdate);

				if(!calendar._checkDate(newdate)){
					newdate = calendar._findActive(date, mode);
				}
				
				if(newdate){
					calendar._update_zoom_level(newdate);
					calendar.selectDate(newdate, false, false, "user");
				}
				
				return "webix_cal_block";
			}
		},
		"2":{	//years
			_isBlocked: function(i,calendar){
				i += calendar._zoom_start_date;
				var min = calendar._settings.minDate;
				var max = calendar._settings.maxDate;

				if ((min && min.getFullYear() > i) || (max && max.getFullYear()<i))
					return true;
				return false;
			},
			_correctDate: function(date,calendar){
				date = DateHelper.yearStart(date);
				if (date < calendar._settings.minDate){
					date = DateHelper.copy(calendar._settings.minDate);
				}
				else if (date > calendar._settings.maxDate){
					date = DateHelper.copy(calendar._settings.maxDate);
				}
				return date;
			},
			_getTitle:function(date, calendar){
				var start = date.getFullYear();
				calendar._zoom_start_date = start = start - start%10 - 1;
				return start+" - "+(start+10 + 1);
			},
			_getContent:function(i, calendar){ return calendar._zoom_start_date+i; },
			_setContent:function(next, i, calendar){ next.setFullYear(calendar._zoom_start_date+i); },
			_changeStep:12*10,
			_keyshift:function(date, mode, calendar){
				var newdate = date;
				if(mode === "pgup" || mode === "pgdown")
					newdate = DateHelper.add(date, (mode==="pgdown"?10:-10), "year");
				else if(mode === "bottom")
					newdate = new Date(date.setYear(calendar._zoom_start_date+10));
				else if(mode === "top")
					newdate = new Date(date.setYear(calendar._zoom_start_date));
				else if(mode === "left" || mode === "right")
					newdate = DateHelper.add(date, (mode==="right"?1:-1), "year");
				else if(mode === "up" || mode === "down")
					newdate = DateHelper.add(date, (mode==="down"?4:-4), "year");

				newdate = calendar._correctDate(newdate);

				if(!calendar._checkDate(newdate))
					newdate = calendar._findActive(date, mode);
				
				if(newdate){
					calendar._update_zoom_level(newdate);
					calendar.selectDate(newdate, false, false, "user");
				}

				return "webix_cal_block";
			}
		}
	},
	_correctBlockedTime: function(){
		var i, isDisabledHour, isDisabledMinutes;
		isDisabledHour = this._zoom_logic[-1]._isBlocked.call(this,this._settings.date.getHours());
		if(isDisabledHour){
			for (i= 0; i< 24; i++){
				if(!this._zoom_logic[-1]._isBlocked.call(this,i)){
					this._settings.date.setHours(i);
					break;
				}
			}
		}
		isDisabledMinutes = this._zoom_logic[-2]._isBlocked.call(this,this._settings.date.getMinutes());
		if(isDisabledMinutes){
			for (i=0; i<60; i+=this._settings.minuteStep){
				if(!this._zoom_logic[-2]._isBlocked.call(this,i)){
					this._settings.date.setMinutes(i);
					break;
				}
			}
		}
	},
	_update_zoom_level:function(date){
		var config, css, height, i, index,  sections, selected, type, width, zlogic, temp, sqSize;
		var html = "";
		var cpad = this._content_padding + "px";

		config = this._settings;
		index = 2 - (config.weekHeader?0:1) - (config.monthHeader?0:1);
		zlogic = this._zoom_logic[this._zoom_level];
		sections  = this._contentobj.childNodes;

		if (date){
			config.date = date;
		}

		type = config.type;



		//store width and height of draw area
		if (!this._zoom_size){

			this._reserve_box_height = this._contentobj.offsetHeight - (config.monthHeader||this._zoom_in?config.headerHeight:0) -
				(this._content_padding+$active.borderWidth)*2;
			if(type != "year" && type != "month")
				this._reserve_box_height -= config.timepickerHeight;

			this._reserve_box_width = sections[index].offsetWidth;
			this._zoom_size = 1;
		}

		//main section
		if (this._zoom_in){
			//hours and minutes
			height = this._reserve_box_height/6;
			var timeColNum = 6;
			var timeFormat = this._calendarTime||i18n.timeFormat;
			var enLocale = timeFormat.match(/%([a,A])/);
			if(enLocale)
				timeColNum++;
			width = parseInt((this._reserve_box_width-3)/timeColNum,10);
			sqSize = Math.min(width,height);

			html += "<div class='webix_time_header' style='margin:0 "+cpad+"'>"+this._timeHeaderTemplate(width,enLocale)+"</div>";
			html += "<div  class='webix_cal_body' style='height:"+this._reserve_box_height+"px; margin:0 "+cpad+";'>";

			// check and change blocked selected time
			this._correctBlockedTime();

			html += "<div class='webix_hours'>";
			selected = config.date.getHours();
			temp = DateHelper.copy(config.date);

			for (i= 0; i< 24; i++){
				css="";
				if(enLocale){
					if(i%4===0){
						var label = (!i ? i18n.am[0] : (i==12?i18n.pm[0]:""));
						html += "<div class='webix_cal_block_empty"+css+"' style='"+this._getCalSizesString(width,height)+"clear:both;"+"'>"+label+"</div>";
					}
				}
				if(this._zoom_logic[-1]._isBlocked.call(this,i)){
					css += " webix_cal_day_disabled";
				}
				else if(selected ==  i)
					css += " webix_selected";

				
				temp.setHours(i);

				html += "<div aria-label='"+DateHelper.dateToStr(i18n.aria.hourFormat)(temp)+"' role='gridcell'"+
					" tabindex='"+(selected==i?"0":"-1")+"' aria-selected='"+(selected==i?"true":"false")+
					"' class='webix_cal_block"+css+"' data-value='"+i+"' style='"+this._getCalSizesString(width,height)+(i%4===0&&!enLocale?"clear:both;":"")+
					"'><span style='display:inline-block; "+this._getCalSizesString(sqSize,sqSize)+"'>"+DateHelper.toFixed(enLocale?(!i||i==12?12:i%12):i)+"</span></div>";
			}
			html += "</div>";

			html += "<div class='webix_minutes'>";
			selected = config.date.getMinutes();
			temp = DateHelper.copy(config.date);


			for (i=0; i<60; i+=config.minuteStep){
				css = "";
				if(this._zoom_logic[-2]._isBlocked.call(this,i)){
					css = " webix_cal_day_disabled";
				}
				else if(selected ==  i)
					css = " webix_selected";

				temp.setMinutes(i);

				html += "<div aria-label='"+DateHelper.dateToStr(i18n.aria.minuteFormat)(temp)+"' role='gridcell' tabindex='"+(selected==i?"0":"-1")+
					"' aria-selected='"+(selected==i?"true":"false")+"' class='webix_cal_block webix_cal_block_min"+css+"' data-value='"+i+"' style='"+
					this._getCalSizesString(width,height)+((i/config.minuteStep)%2===0?"clear:both;":"")+"'><span style='display:inline-block; "+
					this._getCalSizesString(sqSize,sqSize)+"'>"+DateHelper.toFixed(i)+"</span></div>";
			}
			html += "</div>";

			html += "</div>";
			html += "<div class='webix_time_footer' style='margin:0 "+cpad+"'>"+this._timeButtonsTemplate()+"</div>";
			this._contentobj.innerHTML = html;
			this._contentobj.firstChild.style.marginTop = cpad;
		} else {
			//years and months
			
			//reset header
			if (config.monthHeader){
				var header = sections[0].childNodes;
				var labels = i18n.aria["nav"+(this._zoom_level==1?"Year":"Decade")];
				header[0].innerHTML = zlogic._getTitle(config.date, this);
				header[0].blur();
				if (config.navigation){
					header[1].setAttribute("aria-label", labels[0]);
					header[2].setAttribute("aria-label", labels[1]);
				}
			} else	//needed for "year" to set start value
				zlogic._getTitle(config.date, this);

			height = Math.floor(this._reserve_box_height/3);
			width = Math.floor(this._reserve_box_width/4);
			sqSize = Math.min(height, width);

			if (this._checkDate(config.date))
				selected = (this._zoom_level==1?config.date.getMonth():config.date.getFullYear());
			for (i=0; i<12; i++){
				css = (selected == (this._zoom_level==1?i:zlogic._getContent(i, this)) ? " webix_selected" : "");
				if(zlogic._isBlocked(i,this)){
					css += " webix_cal_day_disabled";
				}

				var format = i18n.aria[(this._zoom_level==1?"month":"year")+"Format"];
				html+="<div role='gridcell' aria-label='"+DateHelper.dateToStr(format)(config.date)+
					"' tabindex='"+(css.indexOf("selected")!==-1?"0":"-1")+
					"' aria-selected='"+(css.indexOf("selected")!==-1?"true":"false")+
					"' class='webix_cal_block"+css+"' data-value='"+i+"' style='"+this._getCalSizesString(width,height)+
                    "'><span style='display:inline-block; "+this._getCalSizesString(sqSize,sqSize)+"'>"+zlogic._getContent(i, this)+"</span></div>";
			}
			if (config.weekHeader){
				sections[index-1].style.display = "none";
				if (index === 1) sections[index].style.marginTop = cpad;
			}
			sections[index].innerHTML = html;
			if (type != "year" && type != "month"){
				if(!sections[index+1])
					this._contentobj.innerHTML += "<div class='webix_time_footer' style='margin:0 "+cpad+"'>"+this._timeButtonsTemplate()+"</div>";
				else
					sections[index+1].innerHTML = this._timeButtonsTemplate();
			} else if (sections[index+1]){
				sections[index+1].style.display = "none";
			}
			sections[index].style.height = this._reserve_box_height+"px";
		}
	},
	_getCalSizesString: function(width,height){
		return "width:"+width+"px; height:"+height+"px; line-height:"+height+"px;";
	},
	_timeButtonsTemplate: function(){
		return "<input type='button' style='width:100%' class='webix_cal_done' value='"+i18n.calendar.done+"'>";
	},
	_timeHeaderTemplate: function(width,enLocale){
		var w1 = width*(enLocale?5:4);
		var w2 = width*2;
		return "<div class='webix_cal_hours' style='width:"+w1+"px'>"+i18n.calendar.hours+"</div><div class='webix_cal_minutes' style='width:"+w2+"px'>"+i18n.calendar.minutes+"</div>";
	},
	_changeZoomLevel: function(zoom,date){
		var oldzoom = this._zoom_level;
		if(this.callEvent("onBeforeZoom",[zoom, oldzoom])){
			this._zoom_level = zoom;

			if(zoom)
				this._update_zoom_level(date);
			else
				this.showCalendar(date);
			this.callEvent("onAfterZoom",[zoom, oldzoom]);
		}
	},
	_correctDate:function(date){
		if(!this._checkDate(date) && this._zoom_logic[this._zoom_level]._correctDate)
			date = this._zoom_logic[this._zoom_level]._correctDate(date,this);
		return date;
	},
	_mode_selected:function(target, config){
		var next = this._locate_date(target);
		var zoom = this._zoom_level-(this._fixed?0:1);

		next = this._correctDate(next);
		if(this._checkDate(next)){
			this._changeZoomLevel(zoom, next);
			var type = this._settings.type;
			if(type == "month" || type == "year")
				this._selectDate(next, false, config);
		}
	},
	// selects date and redraw calendar
	_selectDate: function(date, add, config){
		if(this.callEvent("onBeforeDateSelect", [date])){
			this.selectDate(date, true, add, config);
			this.callEvent("onAfterDateSelect", [date]);
		}
	},
	_locate_day:function(target){
		var cind = index(target) - (this._settings.weekNumber?1:0);
		var rind = index(target.parentNode);
		var date = DateHelper.add(this._getDateBoundaries()._start, cind + rind*7, "day", true);
		if (this._settings.timepicker){
			date.setHours(this._settings.date.getHours());
			date.setMinutes(this._settings.date.getMinutes());
		}
		return date;
	},
	_locate_date:function(target){
		var value = target.getAttribute("data-value")*1;
		var level = (target.className.indexOf("webix_cal_block_min")!=-1?this._zoom_level-1:this._zoom_level);
		var now = this._settings.date;
		var next = DateHelper.copy(now);

		this._zoom_logic[level]._setContent(next, value, this);

		return next;
	},
	on_click:{
		webix_cal_prev_button: function(){
			this._changeDate(-1);
		},
		webix_cal_next_button: function(){
			this._changeDate(1);
		},
		webix_cal_day_disabled: function(){
			return false;
		},
		webix_cal_outside: function(){
			if(!this._settings.navigation)
				return false;
		},
		webix_cal_day: function(e, id, target){
			var date = this._locate_day(target);
			var add = this._settings.multiselect === "touch"  || (e.ctrlKey || e.metaKey);
			this._selectDate(date, add, "user");
		},
		webix_cal_time:function(){
			if(this._zoom_logic[this._zoom_level-1]){
				this._zoom_in = true;
				var zoom = this._zoom_level - 1;
				this._changeZoomLevel(zoom);
			}
		},
		webix_range_time_start:function(){
			$$(this._settings.master)._time_mode = "start";
		},
		webix_range_time_end:function(){
			$$(this._settings.master)._time_mode = "end";
		},
		webix_cal_done:function(){
			var date = DateHelper.copy(this._settings.date);
			date = this._correctDate(date);
			this._selectDate(date, false, "user");
		},
		webix_cal_month_name:function(){
			if (!this._settings.navigation) return;

			this._zoom_in = false;
			//maximum zoom reached
			if (this._zoom_level == 2 || !this._settings.monthSelect) return;

			var zoom = Math.max(this._zoom_level, 0) + 1;
			this._changeZoomLevel(zoom);
		},
		webix_cal_block:function(e, id, trg){
			if(this._zoom_in){
				if(trg.className.indexOf("webix_cal_day_disabled")!==-1)
					return false;
				var next = this._locate_date(trg);
				this._update_zoom_level(next);
			}
			else{
				if(trg.className.indexOf("webix_cal_day_disabled")==-1)
					this._mode_selected(trg, "user");
			}
		}
	},
	_string_to_date: function(date, format){
		if (!date){
			return DateHelper.datePart(new Date());
		}
		if(typeof date == "string"){
			if (format)
				date = DateHelper.strToDate(format)(date);
			else
				date=i18n.parseFormatDate(date);
		}

		return date;
	},
	_checkDate: function(date){
		var blockedDate = (this._settings.blockDates && this._settings.blockDates.call(this,date));
		var minDate = this._settings.minDate;
		var maxDate = this._settings.maxDate;
		var outOfRange = (date < minDate || date > maxDate);
		return !blockedDate &&!outOfRange;
	},
	_findActive:function(date, mode){
		var dir = (mode === "top" || mode ==="left" || mode === "pgup" || mode === "up") ? -1 : 1;
		var newdate = DateHelper.add(date, dir, "day", true);
		if(this._checkDate(newdate))
			return newdate;
		else{
			var compare;
			if(this._zoom_level === 0) compare = (date.getMonth() === newdate.getMonth());
			else if(this._zoom_level === 1 ) compare = (date.getFullYear() === newdate.getFullYear());
			else if(this._zoom_level === 2) compare = (newdate.getFullYear() > this._zoom_start_date && newdate.getFullYear() < this._zoom_start_date+10);

			if(compare)
				return this._findActive(newdate, mode);
		}
	},
	showCalendar: function(date) {
		date = this._string_to_date(date);
		this._settings.date = date;
		this.render();
		this.resize();
	},
	_selectedDay: function(day){
		return day && this._selected_days[day.valueOf()];
	},
	getSelectedDate: function() {
		const result = [];
		for (let key in this._selected_days)
			result.push(DateHelper.copy(this._selected_days[key]));

		return this.config.multiselect ? result : (result[0] || null);
	},
	getVisibleDate: function() {
		return DateHelper.copy(this._settings.date);
	},
	setValue: function(date, config){
		this.selectDate(date, true, false, config);
	},
	getValue: function(format){
		var date = this.getSelectedDate();
		if (format)
			date = DateHelper.dateToStr(format)(date);
		return date;
	},
	selectDate: function(date, show, add, config){
		if (!date || !add || !this.config.multiselect)
			this._selected_days = {};

		if (date){
			if (!isArray(date)) date = [date];
			for (let i=0; i<date.length; i++){
				const days = this._string_to_date(date[i]);
				const key = DateHelper.datePart(DateHelper.copy(days)).valueOf();
				if (this._selected_days[key] && add)
					delete this._selected_days[key];
				else
					this._selected_days[key] = days;

				if (!this.config.multiselect)
					break;
			}
			
			if (date.length && show)
				this.showCalendar(date[0]);
		}

		if (show !== false)
			this.render();

		this.callEvent("onChange",[date,config]);
	}, 
	locate:function(){ return null; }
};


const view = protoUI(api, KeysNavigation, MouseEvents, base.view, EventSystem);
export default {api, view};