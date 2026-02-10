import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // false = sidebar dang mo (mac dinh cho desktop)
  // true = sidebar dang dong 

  isCollapsed = signal<boolean>(true);

  toggle() {
    this.isCollapsed.update(v => !v);
  }

  // fun open sidebar (set false)
  open() {
    this.isCollapsed.set(true);
  }

  // fun close sidebar (set true)
  close() {
    this.isCollapsed.set(false);
  }
  constructor() { }
}
