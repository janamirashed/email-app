import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailComposeService {
  private composingSubject = new BehaviorSubject<boolean>(false);
  isComposing$ = this.composingSubject.asObservable();

  openCompose() {
    this.composingSubject.next(true);
  }

  closeCompose() {
    this.composingSubject.next(false);
  }
}