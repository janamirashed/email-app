import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact } from '../models/contact.model';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private baseUrl = 'http://localhost:8080/api/contacts';

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

    // POST /api/contacts - Add a new contact
    addContact(contact: Contact): Observable<Contact> {
        return this.http.post<any>(`${this.baseUrl}`, contact, {
            headers: this.getHeaders()
        }).pipe(
            map(response => response.contact)
        );
    }

    // GET /api/contacts?sortBy=name - List all contacts
    listContacts(sortBy?: string): Observable<Contact[]> {
        let params = new HttpParams();
        if (sortBy) {
            params = params.set('sortBy', sortBy);
        }

        return this.http.get<any>(`${this.baseUrl}`, {
            headers: this.getHeaders(),
            params: params
        }).pipe(
            map(response => response.contacts || [])
        );
    }

    // GET /api/contacts/{contactId} - Get specific contact
    getContact(contactId: string): Observable<Contact> {
        return this.http.get<Contact>(`${this.baseUrl}/${contactId}`, {
            headers: this.getHeaders()
        });
    }

    // PUT /api/contacts/{contactId} - Update contact
    updateContact(contactId: string | null, contact: Contact): Observable<Contact> {
        if (!contactId) {
            throw new Error('Contact ID is required for update operation');
        }

        return this.http.put<any>(`${this.baseUrl}/${contactId}`, contact, {
            headers: this.getHeaders()
        }).pipe(
            map(response => response.contact)
        );
    }

    // DELETE /api/contacts/{contactId} - Delete contact
    deleteContact(contactId: string | null): Observable<any> {
        if (!contactId) {
            throw new Error('Contact ID is required for delete operation');
        }

        return this.http.delete<any>(`${this.baseUrl}/${contactId}`, {
            headers: this.getHeaders()
        });
    }

    // GET /api/contacts/search?keyword=john&searchIn=all&sortBy=name
    searchContacts(keyword: string, searchIn: string = 'all', sortBy?: string): Observable<Contact[]> {
        let params = new HttpParams()
            .set('keyword', keyword)
            .set('searchIn', searchIn);

        if (sortBy) {
            params = params.set('sortBy', sortBy);
        }

        return this.http.get<any>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: params
        }).pipe(
            map(response => response.results || [])
        );
    }

    // GET /api/contacts/autocomplete?email=john
    autocomplete(email: string): Observable<Contact[]> {
        const params = new HttpParams().set('email', email);

        return this.http.get<any>(`${this.baseUrl}/autocomplete`, {
            headers: this.getHeaders(),
            params: params
        }).pipe(
            map(response => response.matches || [])
        );
    }

    // GET /api/contacts/count - Get total contact count
    getContactCount(): Observable<number> {
        return this.http.get<any>(`${this.baseUrl}/count`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => response.count || 0)
        );
    }
}
