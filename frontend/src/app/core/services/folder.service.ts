import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FolderService {
    private baseUrl = 'http://localhost:8080/api/folders';

    constructor(private http: HttpClient) { }

    // Get authorization headers
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // GET /api/folders - Get all folders
    getAllFolders(): Observable<any> {
        return this.http.get(this.baseUrl, {
            headers: this.getHeaders()
        });
    }

    // POST /api/folders - Create new folder
    createFolder(name: string): Observable<any> {
        return this.http.post(this.baseUrl, { name }, {
            headers: this.getHeaders()
        });
    }

    // PUT /api/folders/{folderName} - Rename folder
    renameFolder(oldName: string, newName: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/${oldName}`, { newName }, {
            headers: this.getHeaders()
        });
    }

    // DELETE /api/folders/{folderName} - Delete folder
    deleteFolder(name: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${name}`, {
            headers: this.getHeaders()
        });
    }
}
