import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Attachment } from '../models/attachment.model';

export interface ComposeData {
  recipients?: string;
  subject?: string;
  body?: string;
  draft?: boolean;
  attachments?: Attachment[];
  messageId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailComposeService {
  private composingSubject = new BehaviorSubject<boolean>(false);
  isComposing$ = this.composingSubject.asObservable();

  private composeDataSubject = new BehaviorSubject<ComposeData | null>(null);
  composeData$ = this.composeDataSubject.asObservable();

  openCompose(data?: ComposeData) {
    if (data) {
      this.composeDataSubject.next(data);
    }
    this.composingSubject.next(true);
  }

  closeCompose() {
    this.composingSubject.next(false);
    this.composeDataSubject.next(null);
  }
}
