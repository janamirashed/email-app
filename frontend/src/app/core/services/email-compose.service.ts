import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailComposeService {
  
  private composeOpenedSource = new Subject<void>();

  
  private isComposingSource = new Subject<boolean>();

  
  composeOpened$ = this.composeOpenedSource.asObservable();

  
  isComposing$ = this.isComposingSource.asObservable();

 
  openCompose() {
    this.composeOpenedSource.next();
    this.isComposingSource.next(true); 
  }

  
  closeCompose() {
    this.isComposingSource.next(false); 
  }
}