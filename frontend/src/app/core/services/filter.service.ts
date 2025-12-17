import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Filter } from '../models/filter.model';

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private baseUrl = 'http://localhost:8080/api/filters';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        });
    }

    // Get all filters
    getFilters(): Observable<Filter[]> {
        return this.http.get<any>(this.baseUrl, { headers: this.getHeaders() })
            .pipe(map(response => response.filters || []));
    }

    // Add a new filter
    addFilter(filter: Filter): Observable<Filter> {
        return this.http.post<{ success: boolean; message: string; filter: Filter }>(this.baseUrl, filter, { headers: this.getHeaders() })
            .pipe(map(response => response.filter));
    }

    // Update an existing filter
    updateFilter(filterId: string, filter: Filter): Observable<Filter> {
      console.log("Sent this",filter);
        return this.http.put<any>(`${this.baseUrl}/${filterId}`, filter, { headers: this.getHeaders() })
            .pipe(map(response => response.filter || response['filter updated successfully']));
    }

    // Delete a filter
    deleteFilter(filterId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${filterId}`, { headers: this.getHeaders() });
    }
}
