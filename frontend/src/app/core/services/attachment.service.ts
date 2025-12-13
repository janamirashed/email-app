import {Injectable, signal, Signal, WritableSignal} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {finalize, forkJoin, Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';

export interface AttachmentIDResponse {
  id : string ;
}

export interface UploadProgress{
  total : number;
  completed : number
}

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {

  private attachment_id_url : string = "http://localhost:8080/api/attachments/ids"
  private attachment_upload_url : string = "http://localhost:8080/api/attachments"
  private headers = new HttpHeaders({

    'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
    'ngrok-skip-browser-warning': 'true'
  });


  public isUploading : WritableSignal<boolean> = signal(false);
  public uploadProgress : WritableSignal<UploadProgress> = signal({total : 0, completed : 0});

  constructor(private http: HttpClient) {}

    // for non-transactional optimistic uploads
    getAttachmentIds(count : number) : Observable<string[]>{

        const requests: Observable<AttachmentIDResponse>[] = [];
        for(let i = 0; i < count; i++){

          requests.push(
            this.http.get(this.attachment_id_url, {headers : this.headers}) as Observable<AttachmentIDResponse>
          );

        }
        return forkJoin(requests).pipe(
            map((responses : AttachmentIDResponse[]) => {
              return responses.map(response => response.id)
            })
        );
    }


  uploadAttachments(ids: string[] | null, files: File[]) : Observable<string[]>{
      // supports transactional and non-transactional uploads by generated ids sent from the backend
      this.uploadProgress.set({completed : 0, total : files.length});
      this.isUploading.set(true);
      let count = 0;

      const requests: Observable<any>[] = [];

      files.forEach((file , idx) => {
        let params = new HttpParams();

        params = params
          .set("fileName", file.name)
          .set("mimeType", file.type);

        // to support transactional uploads
        if (ids != null && ids.length == files.length)
          params = params.set("id" , ids[idx]);

        console.log(params.keys());
        let request =
          this.http.put(this.attachment_upload_url, file, {params : params, headers : this.headers}).pipe(
            tap(()=> {
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
        map((responses : AttachmentIDResponse[]) => {
          return responses.map(response => response.id)
        }), finalize(()=> {
          this.isUploading.set(false);
        })
      );
    }



}
