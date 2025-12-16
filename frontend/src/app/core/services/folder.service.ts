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
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
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

    // Get custom folders for move-to-folder dialog (excludes system folders and contacts)
    getCustomFoldersForMove(): Observable<any[]> {
        return new Observable((observer) => {
            this.getAllFolders().subscribe({
                next: (response) => {
                    const allFolders = response.folders || [];
                    const customFolders = allFolders.filter((folder: any) =>
                        (folder.type === 'CUSTOM' || folder.type === 'custom') &&
                        folder.name.toLowerCase() !== 'contacts'
                    );
                    observer.next(customFolders);
                    observer.complete();
                },
                error: (error) => {
                    observer.error(error);
                }
            });
        });
    }

}
