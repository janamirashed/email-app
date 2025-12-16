import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private isOpenSubject = new BehaviorSubject<boolean>(true);
    isOpen$ = this.isOpenSubject.asObservable();

    constructor() {
        // Check screen size on init to set default state
        this.checkScreenSize();
        window.addEventListener('resize', () => this.checkScreenSize());
    }

    private checkScreenSize() {
        if (window.innerWidth < 1024) { // Mobile/Tablet
            this.isOpenSubject.next(false);
        } else { // Desktop
            this.isOpenSubject.next(true);
        }
    }

    toggle() {
        this.isOpenSubject.next(!this.isOpenSubject.value);
    }

    open() {
        this.isOpenSubject.next(true);
    }

    close() {
        this.isOpenSubject.next(false);
    }

    get isOpen(): boolean {
        return this.isOpenSubject.value;
    }
}
