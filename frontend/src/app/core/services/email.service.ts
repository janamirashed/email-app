import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Email} from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private email_send_url = "http://localhost:8080/api/email/send"
  private headers = new HttpHeaders({

    'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
  });

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
  sendMail(email : any) {
    this.http.post(this.email_send_url, email, {headers : this.headers})
      .subscribe({
        next : () => {
          console.log("email sent successfully");
        },
        error : (err : any) => {
          console.error("error occurred while trying to send email", err);
        }
      })
  }
}
