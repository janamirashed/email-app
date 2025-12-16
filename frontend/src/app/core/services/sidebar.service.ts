import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private isOpenSubject = new BehaviorSubject<boolean>(true);
    isOpen$ = this.isOpenSubject.asObservable();

    constructor() {
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
