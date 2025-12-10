import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:8080/api/email';

  constructor(private http: HttpClient) {}

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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

  // GET /api/email/inbox?page=1&limit=20&sortBy=date
  getInboxEmails(page: number = 1, limit: number = 20, sortBy: string = 'date'): Observable<any> {
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
  getEmailsInFolder(folder: string, page: number = 1, limit: number = 20, sortBy: string = 'date'): Observable<any> {
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
    });
  }

  // GET /api/email/starred?sortBy=date
  getStarredEmails(sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams().set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/starred`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // GET /api/email/unread-count
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread-count`, {
      headers: this.getHeaders()
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
}
