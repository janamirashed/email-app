import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private baseUrl = 'http://localhost:8080/api/folders';

  constructor(private http: HttpClient) {}

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    });
  }

  // CREATE FOLDER
  createFolder(folderName: string): Observable<any> {
    return this.http.post(this.baseUrl, { name: folderName }, {
      headers: this.getHeaders()
    });
  }

  // RENAME FOLDER
  renameFolder(oldName: string, newName: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${oldName}`, { newName }, {
      headers: this.getHeaders()
    });
  }

  // DELETE FOLDER
  deleteFolder(folderName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${folderName}`, {
      headers: this.getHeaders()
    });
  }
}
