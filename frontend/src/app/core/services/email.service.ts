import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, tap } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:8080/api/email';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private messageReadSubject = new Subject<string>();
  public messageRead$ = this.messageReadSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }

  // POST /api/email/send
  sendEmail(email: Email): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, email, {
      headers: this.getHeaders()
    });
  }

  // POST /api/email/draft
  saveDraft(email: Email): Observable<any> {
    return this.http.post(`${this.baseUrl}/draft`, email, {
      headers: this.getHeaders()
    });
  }

  // POST /api/email/{messageId}/send-draft
  sendDraft(messageId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${messageId}/send-draft`, {}, {
      headers: this.getHeaders()
    });
  }

  // POST /api/email/forward
  forwardEmail(email: Email, newRecipients: string[]): Observable<any> {
    const params = new HttpParams().set('newRecipients', newRecipients.join(','));
    return this.http.post(`${this.baseUrl}/forward`, email, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // GET /api/email/inbox?page=1&limit=20&sortBy=date
  getInboxEmails(page: number = 1, limit: number = 10, sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/inbox`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // GET /api/email/folder/{folder}?page=1&limit=20&sortBy=date
  getEmailsInFolder(folder: string, page: number = 1, limit: number = 10, sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/folder/${folder}`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // GET /api/email/{messageId}
  getEmail(messageId: string): Observable<Email> {
    return this.http.get<Email>(`${this.baseUrl}/${messageId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        console.log('Email fetched, triggering unread count refresh and read event');
        // Since backend marks as read on fetch, we should update the count
        this.refreshUnreadCount();
        this.messageReadSubject.next(messageId);
      })
    );
  }

  // GET /api/email/starred?sortBy=date
  getStarredEmails(page: number = 1, limit: number = 10, sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/starred`, {
      headers: this.getHeaders(),
      params: params  // ADD THIS
    });
  }

  // GET /api/email/unread-count
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread-count`, {
      headers: this.getHeaders()
    });
  }

  refreshUnreadCount() {
    console.log('Refreshing unread count...');
    this.getUnreadCount().subscribe({
      next: (response: any) => {
        // Backend returns { success: true, unreadCount: number }
        const count = typeof response === 'number' ? response : (response.unreadCount || 0);
        console.log('Unread count refreshed:', count);
        this.unreadCountSubject.next(count);
      },
      error: (err) => console.error('Failed to refresh unread count', err)
    });
  }

  // PUT /api/email/{messageId}/read
  markAsRead(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/read`, {}, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/email/{messageId}/unread
  markAsUnread(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/unread`, {}, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/email/{messageId}/star
  starEmail(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/star`, {}, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/email/{messageId}/unstar
  unstarEmail(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/unstar`, {}, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/email/{messageId}/move?toFolder=work
  moveEmail(messageId: string, toFolder: string): Observable<any> {
    const params = new HttpParams().set('toFolder', toFolder);

    return this.http.put(`${this.baseUrl}/${messageId}/move`, {}, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // DELETE /api/email/{messageId}
  deleteEmail(messageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${messageId}`, {
      headers: this.getHeaders()
    });
  }


  // POST /api/email/bulk-move?toFolder=work
  bulkMove(messageIds: string[], toFolder: string): Observable<any> {
    const params = new HttpParams().set('toFolder', toFolder);

    return this.http.post(`${this.baseUrl}/bulk-move`, messageIds, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // POST /api/email/bulk-delete
  bulkDelete(messageIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-delete`, messageIds, {
      headers: this.getHeaders()
    });
  }

  permanentlyDeleteEmails(messageIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/permanent-delete`, messageIds, {
      headers: this.getHeaders()
    });
  }

  restoreEmailFromTrash(messageId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${messageId}/restore`, {}, {
      headers: this.getHeaders()
    });
  }

  bulkRestoreFromTrash(messageIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-restore`, messageIds, {
      headers: this.getHeaders()
    });
  }

  // GET /api/email/search?keyword=test&searchIn=all
  searchEmails(parameters: { sender?: string, receiver?: string, subject?: string, body?: string, folder?: string, keyword?: string, priority?: string, hasAttachment?: boolean, sortBy?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (parameters.sender) httpParams = httpParams.set('sender', parameters.sender);
    if (parameters.receiver) httpParams = httpParams.set('receiver', parameters.receiver);
    if (parameters.subject) httpParams = httpParams.set('subject', parameters.subject);
    if (parameters.body) httpParams = httpParams.set('body', parameters.body);
    if (parameters.folder) httpParams = httpParams.set('folder', parameters.folder);
    if (parameters.keyword) httpParams = httpParams.set('keyword', parameters.keyword);
    if (parameters.sortBy) httpParams = httpParams.set('sortBy', parameters.sortBy);
    if (parameters.priority) httpParams = httpParams.set('priority', parameters.priority.toString());
    if (parameters.hasAttachment !== null && parameters.hasAttachment !== undefined) {
      httpParams = httpParams.set('hasAttachment', parameters.hasAttachment.toString());
    }
    return this.http.get(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  ensureValidEmails(emails: string[]): boolean {
    let validEmails = true;
    emails.forEach(email => {
      if (!this.isValidEmail(email)) {
        validEmails = false;
        return;
      }
    });
    return validEmails;
  }

  ensureValidRecipients(recipients: string[]): boolean {
    let validEmails = true;
    recipients.forEach(recipient => {
      if (!this.isValidEmail(recipient) || recipient == localStorage.getItem("currentUser") + "@jaryn.com") {
        validEmails = false;
        return;
      }
    });
    return validEmails;
  }
}
