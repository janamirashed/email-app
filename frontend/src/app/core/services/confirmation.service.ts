import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    private confirmationSubject = new BehaviorSubject<ConfirmationOptions | null>(null);
    public confirmation$ = this.confirmationSubject.asObservable();

    private resolveCallback: ((value: boolean) => void) | null = null;

    confirm(options: ConfirmationOptions): Promise<boolean> {
        return new Promise((resolve) => {
            this.resolveCallback = resolve;
            this.confirmationSubject.next({
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                type: 'warning',
                ...options
            });
        });
    }

    handleResponse(confirmed: boolean) {
        if (this.resolveCallback) {
            this.resolveCallback(confirmed);
            this.resolveCallback = null;
        }
        this.confirmationSubject.next(null);
    }

    hide() {
        this.handleResponse(false);
    }
}
