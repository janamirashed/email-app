import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { AttachmentService } from '../../../../core/services/attachment.service';
import { Subscription } from 'rxjs';
import { Output,EventEmitter } from '@angular/core';
import {Attachment} from '../../../../core/models/attachment.model';
import {EmailService} from '../../../../core/services/email.service';
import {Email} from '../../../../core/models/email.model';
@Component({
  selector: 'app-email-compose',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './email-compose.html',
})
export class EmailComposeComponent {

  isComposing: boolean = true; // Simulates the visibility

  recipients: string = '';
  subject: string = '';
  priority: string = 'Normal';

  @Output() composeChange = new EventEmitter<boolean>();

  // Dummy attachments shown in the image
  attachments: Attachment[] = [
    //{}, {}
  ];

  selectedFiles : File[] = [];

  private composeSubscription!: Subscription ;


   constructor(private composeService: EmailComposeService,
               private attachmentService : AttachmentService,
               private emailService : EmailService) {}


  ngOnInit() {

    this.composeSubscription = this.composeService.isComposing$.subscribe(
      (isVisible) => {
        this.isComposing = isVisible;

      }
    );
  }

  updateFiles(event : any){
    const fileList : FileList = event.target.files;
    this.selectedFiles = Array.from(fileList);
  }

  sendMail(){
      let attachment_ids = this.attachmentService.getAttachmentIds(this.selectedFiles.length);
      this.attachmentService.uploadAttachments(attachment_ids, this.selectedFiles);

      let email = {
        from : localStorage.getItem("currentUser"),
        to : this.recipients.split(","),
        subject : this.subject,
        body : "test_body",
        attachments : this.attachments
      }
      attachment_ids.forEach( (val,idx) => {
        email.attachments[idx].id = val;
      });
      // this.emailService.sendMail(email);
      console.log("message sent");
  }

  closeCompose() {
    this.isComposing = false;
    this.composeChange.emit(this.isComposing);
  }

  ngOnDestroy() {

    this.composeSubscription.unsubscribe();
  }
}
