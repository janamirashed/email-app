import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080';

  register(user: User): Observable<any> {
    console.log('Sending register request:', user);
    return this.http.post(`${this.baseUrl}/account/register`, user).pipe(
      timeout(10000) // 10 second timeout
    );
  }

  login(user: User): Observable<any> {
    console.log('Sending login request:', user);
    return this.http.post(`${this.baseUrl}/account/login`, user).pipe(
      timeout(10000) // 10 second timeout
    );
  }
}
