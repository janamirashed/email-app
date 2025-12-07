import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

class AttachmentIDResponse {
  id : string = "";
}


@Injectable({
  providedIn: 'root',
})
export class AttachmentService {

  private attachment_id_url : string = "http://localhost:8080/attachments/ids"
  private attachment_upload_url : string = "http://localhost:8080/attachments"
  private headers = new HttpHeaders({

    'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
  });

  constructor(private http: HttpClient) {}


    getAttachmentIds(count : number) : Observable<string[]>{

        let ids : string[] = [];
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

    uploadAttachments(ids : string[], files : File[]){
      files.forEach((file , idx) => {
        let params = new HttpParams();

        params = params
          .set("id", ids[idx])
          .set("fileName", file.name)
          .set("mimeType", file.type);

        console.log(params.keys());
        this.http.put(this.attachment_upload_url, file, {params : params, headers : this.headers})
          .subscribe({
            // @ts-ignore
            next: (response: AttachmentIDResponse) => {
              console.log('generated id for Attachment fetched successfully! ');
              ids.push(response.id);
            },
            error: (error: any) => {
              console.error('generated ids for Attachment fetching failed! Response:', error);
            }
          });
      });
    }

}
