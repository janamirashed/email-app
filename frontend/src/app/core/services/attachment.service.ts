import { Injectable, signal, Signal, WritableSignal } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, forkJoin, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Attachment } from "../models/attachment.model";

export interface AttachmentIDResponse {
  id: string;
}

export interface UploadProgress {
  total: number;
  completed: number
}

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {

  private attachment_id_url: string = "http://localhost:8080/api/attachments/ids"
  private attachment_access_url: string = "http://localhost:8080/api/attachments"

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }

  public isUploading: WritableSignal<boolean> = signal(false);
  public uploadProgress: WritableSignal<UploadProgress> = signal({ total: 0, completed: 0 });

  constructor(private http: HttpClient) { }

  // for non-transactional optimistic uploads
  getAttachmentIds(count: number): Observable<string[]> {

    const requests: Observable<AttachmentIDResponse>[] = [];
    for (let i = 0; i < count; i++) {

      requests.push(
        this.http.get(this.attachment_id_url, { headers: this.getHeaders() }) as Observable<AttachmentIDResponse>
      );

    }
    return forkJoin(requests).pipe(
      map((responses: AttachmentIDResponse[]) => {
        return responses.map(response => response.id)
      })
    );
  }


  uploadAttachments(ids: string[] | null, files: File[], accessors: string): Observable<string[]> {
    // supports transactional and non-transactional uploads by generated ids sent from the backend
    this.uploadProgress.set({ completed: 0, total: files.length });
    this.isUploading.set(true);
    let count = 0;

    

    const requests: Observable<any>[] = [];

    files.forEach((file, idx) => {
      let params = new HttpParams();

      params = params
        .set("fileName", file.name)
        .set("accessors", accessors);

      // to support transactional uploads
      if (ids != null && ids.length == files.length)
        params = params.set("id", ids[idx]);


      let headers = this.getHeaders();
      headers = headers.set('Content-Type', file.type);
    

      console.log(params.keys());
      let request =
        this.http.put(this.attachment_access_url, file, { params: params, headers: headers }).pipe(
          tap(() => {
            this.uploadProgress.update(state => ({
              ...state,
              completed: ++count
            }))
          })
        );

      requests.push(request);

      // .subscribe({
      //   // @ts-ignore
      //   next: (response: AttachmentIDResponse) => {
      //     console.log('generated id for Attachment fetched successfully! ');
      //     result_ids.push(response.id);
      //   },
      //   error: (error: any) => {
      //     console.error('generated ids for Attachment fetching failed! Response:', error);
      //   }
      // });
    });
    return forkJoin(requests).pipe(
      map((responses: AttachmentIDResponse[]) => {
        return responses.map(response => response.id)
      }), finalize(() => {
        this.isUploading.set(false);
      })
    );
  }


  downloadAttachment(id: string, attachment: Attachment): void {
    this.http.get(this.attachment_access_url + '/' + id, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        console.log('SUCCESS: Download completed');
        console.log('Blob size:', blob.size, 'bytes');
        console.log('Blob type:', blob.type);

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = attachment.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the temporary URL
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      },
      error: (error) => {
        console.error('=== DOWNLOAD ERROR ===');
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error object:', error);
        console.error('Error body:', error.error);

        let errorMsg = `Failed to download attachment.\nStatus: ${error.status}`;
        if (error.status === 404) {
          errorMsg += '\nAttachment not found on server.';
        } else if (error.status === 401 || error.status === 403) {
          errorMsg += '\nAuthentication error.';
        }
        alert(errorMsg + '\n\nCheck browser console for details.');
      }
    });
  }


}
