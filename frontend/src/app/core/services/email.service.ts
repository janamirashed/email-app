import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    });
  }

  // GET INBOX - with pagination and sorting
  getInboxEmails(page: number = 1, limit: number = 20, sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/inbox`, {
      headers: this.getHeaders(),
      params
    });
  }

  // GET EMAILS FROM SPECIFIC FOLDER
  getEmailsInFolder(folder: string, page: number = 1, limit: number = 20, sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    return this.http.get(`${this.baseUrl}/folder/${folder}`, {
      headers: this.getHeaders(),
      params
    });
  }

  // GET SINGLE EMAIL
  getEmail(messageId: string): Observable<Email> {
    return this.http.get<Email>(`${this.baseUrl}/${messageId}`, {
      headers: this.getHeaders()
    });
  }

  // SEARCH EMAILS
  searchEmails(keyword: string, searchBy: string = 'all', sortBy?: string): Observable<any> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('searchBy', searchBy);

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params
    });
  }

  // GET STARRED EMAILS
  getStarredEmails(sortBy: string = 'date'): Observable<any> {
    const params = new HttpParams().set('sortBy', sortBy);
    return this.http.get(`${this.baseUrl}/starred`, {
      headers: this.getHeaders(),
      params
    });
  }

  // GET UNREAD COUNT
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread-count`, {
      headers: this.getHeaders()
    });
  }

  // SEND EMAIL
  sendEmail(email: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, email, {
      headers: this.getHeaders()
    });
  }

  // SAVE DRAFT
  saveDraft(email: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/draft`, email, {
      headers: this.getHeaders()
    });
  }

  // SEND DRAFT
  sendDraft(messageId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${messageId}/send-draft`, {}, {
      headers: this.getHeaders()
    });
  }

  // MARK AS READ
  markAsRead(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/read`, {}, {
      headers: this.getHeaders()
    });
  }

  // MARK AS UNREAD
  markAsUnread(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/unread`, {}, {
      headers: this.getHeaders()
    });
  }

  // STAR EMAIL
  starEmail(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/star`, {}, {
      headers: this.getHeaders()
    });
  }

  // UNSTAR EMAIL
  unstarEmail(messageId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${messageId}/unstar`, {}, {
      headers: this.getHeaders()
    });
  }

  // MOVE EMAIL TO FOLDER
  moveEmail(messageId: string, toFolder: string): Observable<any> {
    const params = new HttpParams().set('toFolder', toFolder);
    return this.http.put(`${this.baseUrl}/${messageId}/move`, {}, {
      headers: this.getHeaders(),
      params
    });
  }

  // DELETE EMAIL (move to trash)
  deleteEmail(messageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${messageId}`, {
      headers: this.getHeaders()
    });
  }

  // BULK MOVE EMAILS
  bulkMove(messageIds: string[], toFolder: string): Observable<any> {
    const params = new HttpParams().set('toFolder', toFolder);
    return this.http.post(`${this.baseUrl}/bulk-move`, messageIds, {
      headers: this.getHeaders(),
      params
    });
  }

  // BULK DELETE EMAILS
  bulkDelete(messageIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk-delete`, messageIds, {
      headers: this.getHeaders()
    });
  }
}
