import { EventEmitter } from 'events';

export const sideBarEventEmitter = new EventEmitter();

export const updateSidebarEvent = 'updateSidebar';

export function emitUpdateSidebarEvent() {
  sideBarEventEmitter.emit(updateSidebarEvent);
}

export function subscribeToUpdateSidebarEvent(callback: () => void) {
  sideBarEventEmitter.on(updateSidebarEvent, callback);
}
