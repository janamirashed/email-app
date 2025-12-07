import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

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


    getAttachmentIds(count : number){

        let ids : string[] = [];
        for(let i = 0; i < count; i++){

          this.http.get(this.attachment_id_url, {headers : this.headers})
          .subscribe({
            // @ts-ignore
              next: (response: AttachmentIDResponse) => {
              console.log('generated id for Attachment fetched successfully! Response:', response.id);
              ids.push(response.id);
              },
              error: (error: any) => {
              console.error('generated ids for Attachment fetching failed! Response:', error);
              }
          });
        }
        return ids;
    }

    uploadAttachments(ids : string[], files : File[]){
      files.forEach((file , idx) => {
        let params = new HttpParams();
        params.set("id", ids[idx]);
        params.set("fileName", file.name);
        params.set("mimeType", file.type);
        this.http.put(this.attachment_upload_url, file, {params : params, headers : this.headers})
          .subscribe({
            // @ts-ignore
            next: (response: AttachmentIDResponse) => {
              console.log('generated id for Attachment fetched successfully! Response:', response.id);
              ids.push(response.id);
            },
            error: (error: any) => {
              console.error('generated ids for Attachment fetching failed! Response:', error);
            }
          });
      });
    }

}
