import {extend} from "./helpers";
import EventSystem from "../core/eventsystem";

var evs = {};
extend(evs, EventSystem, true);

export const callEvent = (a,b) => evs.callEvent(a, b);
export const attachEvent = (a,b,c,d) => evs.attachEvent(a, b, c, d);
export const detachEvent = (a) => evs.detachEvent(a);
export const blockEvent = () => evs.blockEvent();
export const unblockEvent = () => evs.unblockEvent();
export const mapEvent = map => evs.mapEvent(map);
export const hasEvent = type => evs.hasEvent(type);
