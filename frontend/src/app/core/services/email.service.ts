import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}
  /* getDeletedEmails(): Observable<Email[]> {
    // http get req
  }

  restoreEmail(id: number): Observable<any> {
    //http put request
  }

  permanentlyDelete(id: number): Observable<any> {
    //http delete req
  } */
}
