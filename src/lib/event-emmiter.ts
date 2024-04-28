import { EventEmitter } from "events";

export const sideBarEventEmitter = new EventEmitter();

export const updateSidebarEvent = "updateSidebar";

export function emitUpdateSidebarEvent() {
  sideBarEventEmitter.emit(updateSidebarEvent);
}

export function subscribeToUpdateSidebarEvent(callback: () => void) {
  sideBarEventEmitter.on(updateSidebarEvent, callback);
}

export const evalEventEmitter = new EventEmitter();

export const evalEvent = "updateEval";

export function emitUpdateEvalEvent() {
  evalEventEmitter.emit(evalEvent);
}

export function subscribeToUpdateEvalEvent(callback: () => void) {
  evalEventEmitter.on(evalEvent, callback);
}
