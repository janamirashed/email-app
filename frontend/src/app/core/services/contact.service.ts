import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private baseUrl = 'http://localhost:8080/api/contacts';

  constructor(private http: HttpClient) {}

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    });
  }

  // ADD CONTACT
  addContact(contact: Contact): Observable<any> {
    return this.http.post(this.baseUrl, contact, {
      headers: this.getHeaders()
    });
  }

  // UPDATE CONTACT
  updateContact(contactId: string, contact: Contact): Observable<any> {
    return this.http.put(`${this.baseUrl}/${contactId}`, contact, {
      headers: this.getHeaders()
    });
  }

  // DELETE CONTACT
  deleteContact(contactId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${contactId}`, {
      headers: this.getHeaders()
    });
  }

  // GET SINGLE CONTACT
  getContact(contactId: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${contactId}`, {
      headers: this.getHeaders()
    });
  }

  // LIST ALL CONTACTS (with optional sorting)
  listContacts(sortBy?: string): Observable<any> {
    let params = new HttpParams();
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get(this.baseUrl, {
      headers: this.getHeaders(),
      params
    });
  }

  // SEARCH CONTACTS
  searchContacts(keyword: string, searchIn: string = 'all', sortBy?: string): Observable<any> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('searchIn', searchIn);

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params
    });
  }

  // AUTOCOMPLETE (for email composition)
  autocomplete(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.baseUrl}/autocomplete`, {
      headers: this.getHeaders(),
      params
    });
  }

  // GET CONTACT COUNT
  getContactCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/count`, {
      headers: this.getHeaders()
    });
  }
}
