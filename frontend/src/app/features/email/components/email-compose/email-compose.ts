import { Component, OnInit, OnDestroy, ChangeDetectorRef, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { AttachmentService, UploadProgress } from '../../../../core/services/attachment.service';
import { EmailService } from '../../../../core/services/email.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ContactService } from '../../../../core/services/contact.service';
import { Subscription, lastValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Attachment } from '../../../../core/models/attachment.model';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { EventService } from '../../../../core/services/event-service';
import { CodeEditorComponent } from '../../../../shared/components/code-editor/code-editor.component';

@Component({
  selector: 'app-email-compose',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule, CodeEditorComponent],
  templateUrl: './email-compose.html',
  styleUrl: './email-compose.css'
})
export class EmailComposeComponent implements OnInit, OnDestroy {
  // Form State
  recipients: string = '';
  subject: string = '';
  body: string = '';
  priority: number = 3;
  draft: boolean = false;
  messageId: string = '';
  // Editor
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['blockquote'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  // Attachments
  attachments: Attachment[] = [];
  selectedFiles: File[] = [];
  filesUpdated: boolean = false;

  isUploading: Signal<boolean>;
  uploadProgress: Signal<UploadProgress>;

  // UI State
  isComposing: boolean = false;
  isLoading: boolean = false;
  isSending: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Contact Autocomplete
  filteredContacts: any[] = [];
  showContactDropdown: boolean = false;
  selectedContactIndex: number = -1;
  private contactSearch$ = new Subject<string>();

  // HTML Source Mode
  showHtmlSource: boolean = false;
  showHtmlWarningModal: boolean = false;
  showDiscardWarningModal: boolean = false;

  private composeSubscription!: Subscription;
  private composeDataSubscription!: Subscription;
  private contactSearchSubscription!: Subscription;

  constructor(
    private composeService: EmailComposeService,
    private attachmentService: AttachmentService,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private contactService: ContactService,
    private eventService: EventService,
  ) {

    this.isUploading = this.attachmentService.isUploading;
    this.uploadProgress = this.attachmentService.uploadProgress;
    // to bind and use for the loading bar
  }

  ngOnInit() {
    this.editor = new Editor();

    this.composeSubscription = this.composeService.isComposing$.subscribe(
      (isVisible) => {
        this.isComposing = isVisible;
        if (!isVisible) {
          this.resetForm();
        }
      }
    );

    // Subscribe to compose data to pre-fill form
    this.composeDataSubscription = this.composeService.composeData$.subscribe(
      (data) => {
        if (data) {
          if (data.recipients) {
            this.recipients = data.recipients;
          }
          if (data.subject) {
            this.subject = data.subject;
          }
          if (data.body) {
            this.body = data.body;
          }
          if (data.draft) {
            this.draft = data.draft;
          }
          if (data.messageId) {
            this.messageId = data.messageId;
          }
          if (data.attachments) {
            this.attachments = data.attachments;
            this.filesUpdated = false;
            //we must have this to not reupload the files that the user uploaded before
            //to make the ux better
            //and it's secure enough since to get valid attachment ids we need to upload the files first
          }
        }
      }
    );

    // Setup contact search with debouncing
    this.contactSearchSubscription = this.contactSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          this.filteredContacts = [];
          this.showContactDropdown = false;
          return [];
        }
        return this.contactService.searchContacts(term);
      })
    ).subscribe(contacts => {
      this.filteredContacts = contacts.slice(0, 5); // Limit to 5 results
      this.showContactDropdown = this.filteredContacts.length > 0;
      this.selectedContactIndex = -1;
      this.cdr.detectChanges();
    });
  }

  updateFiles(event: any) {
    const fileList: FileList = event.target.files;
    this.selectedFiles = Array.from(fileList);

    // Create attachment objects for UI display
    this.attachments = this.selectedFiles.map((file, index) => ({
      id: '', // Will be populated when sending
      fileName: file.name,
      mimeType: file.type,
      size: file.size
    }));
    this.filesUpdated = true;
  }

  // Remove attachment from preview
  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  async sendMail(transactional: boolean) {

    // clearing error if in case it was there
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.subject.trim()) {
      this.errorMessage = 'Subject cannot be empty';
      this.cdr.detectChanges();
      return;
    }

    if (!this.recipients.trim()) {
      this.errorMessage = 'Please add at least one recipient';
      this.cdr.detectChanges();
      return;
    }
    const recipientArr = this.parseRecipients(this.recipients);
    const validEmails = this.emailService.ensureValidRecipients(recipientArr);
    if (!validEmails) {
      this.errorMessage = 'One or more of the given emails are invalid';
      this.cdr.detectChanges();
      return;
    }


    this.isSending = true;
    console.log("isSending : " + this.isSending);
    // let attachment_ids: string[] = [];
    // if (this.selectedFiles.length > 0 && !transactional) {

    //   attachment_ids = await lastValueFrom(
    //     this.attachmentService.getAttachmentIds(this.selectedFiles.length)
    //   );
    // }

    // if (this.selectedFiles.length > 0){
    //   if(transactional){
    //     attachment_ids = await lastValueFrom(this.attachmentService.uploadAttachments(null, this.selectedFiles));
    //     console.log(attachment_ids.length);
    //     console.log(attachment_ids.at(0));
    //   }
    //   else{
    //     this.attachmentService.uploadAttachments(attachment_ids, this.selectedFiles).subscribe({
    //       next : () => {
    //         console.log("non-transactional uploads complete");
    //       }
    //     });
    //     //no need to await if it's not transactional
    //   }
    // }

    // let attachments: any[] = [];
    // attachment_ids.forEach((val, idx) => {
    //   let entry = {
    //     id: val,
    //     mimeType: this.selectedFiles.at(idx)?.type,
    //     fileName: this.selectedFiles.at(idx)?.name
    //   };
    //   attachments.push(entry);
    // });
    if (this.filesUpdated)
      this.attachments = await this.uploadFiles(transactional);

    let email: any = {
      from: localStorage.getItem("currentUser"),
      to: this.parseRecipients(this.recipients),
      subject: this.subject,
      body: this.body,
      priority: this.priority,
      attachments: this.attachments,
      draft: this.draft,
      messageId: this.messageId
    };

    if (!transactional)
      await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Sending:", email)
    this.emailService.sendEmail(email).subscribe({
      next: (response) => {
        console.log("Email sent successfully:", response);
        this.isLoading = false;
        this.closeCompose(true);
        this.notificationService.showSuccess('Email sent successfully!');
        this.isSending = false;
        console.log("isSending : " + this.isSending);
        this.eventService.triggerEmailListRefresh();
        let messageIds: string[] = new Array(email.messageId);
        this.eventService.clearEmailSelection(messageIds);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to send email:', error);
        this.errorMessage = error.error?.error || 'Failed to send email. Please try again.';
        this.isLoading = false;
        this.isSending = false;
        this.cdr.detectChanges();
      }
    });
  }

  async uploadFiles(transactional: boolean) {
    let attachment_ids: string[] = [];
    if (this.selectedFiles.length > 0 && !transactional) {

      attachment_ids = await lastValueFrom(
        this.attachmentService.getAttachmentIds(this.selectedFiles.length)
      );
    }

    if (this.selectedFiles.length > 0) {
      if (transactional) {
        attachment_ids = await lastValueFrom(this.attachmentService.uploadAttachments(null, this.selectedFiles, this.recipients + "," + localStorage.getItem("currentUser")));
        console.log(attachment_ids.length);
        console.log(attachment_ids.at(0));
      }
      else {
        this.attachmentService.uploadAttachments(attachment_ids, this.selectedFiles, this.recipients + "," + localStorage.getItem("currentUser")).subscribe({
          next: () => {
            console.log("non-transactional uploads complete");
          }
        });
        //no need to await if it's not transactional
      }
    }

    let attachments: Attachment[] = [];
    attachment_ids.forEach((val, idx) => {
      let entry: Attachment = new Attachment(val, this.selectedFiles.at(idx)?.type, this.selectedFiles.at(idx)?.name, this.parseRecipients(this.recipients));
      attachments.push(entry);
    });
    return attachments;
  }

  sendMailHelper(email: any) {

  }

  // Save as draft
  // saveDraft() {
  //   this.errorMessage = '';
  //   this.successMessage = '';

  //   if (!this.subject.trim() && !this.body.trim() && !this.recipients.trim()) {
  //     this.errorMessage = 'Draft must have at least some content';
  //     return;
  //   }

  //   this.isLoading = true;

  //   const draftEmail: any = {
  //     to: this.parseRecipients(this.recipients),
  //     subject: this.subject,
  //     body: this.body,
  //     priority: this.priority,
  //     draft: true,
  //     attachments: this.attachments
  //   };

  //   console.log('Saving draft...', draftEmail);
  //   this.emailService.saveDraft(draftEmail).subscribe({
  //     next: (response) => {
  //       console.log('Draft saved successfully:', response);
  //       this.successMessage = 'Draft saved successfully!';
  //       this.isLoading = false;
  //       this.successMessage = '';
  //       this.closeCompose();
  //       this.notificationService.showWarning('Email drafted!');

  //       this.cdr.detectChanges();
  //     },
  //     error: (error) => {
  //       console.error('Failed to save draft:', error);
  //       this.errorMessage = error.error?.error || 'Failed to save draft. Please try again.';
  //       this.isLoading = false;
  //     }
  //   });
  // }
  async saveDraft(transactional: boolean) {
    this.errorMessage = '';
    this.successMessage = '';


    if (!this.subject.trim()) {
      this.errorMessage = 'Subject cannot be empty';
      this.cdr.detectChanges();
      return;
    }

    if (!this.recipients.trim()) {
      this.errorMessage = 'Please add at least one recipient';
      this.cdr.detectChanges();
      return;
    }

    const recipientArr = this.parseRecipients(this.recipients);
    const validEmails = this.emailService.ensureValidRecipients(recipientArr);
    if (!validEmails) {
      this.errorMessage = 'One or more of the given emails are invalid';
      this.cdr.detectChanges();
      return;
    }


    // if (!this.subject.trim() || !this.body.trim() || !this.recipients.trim()) {
    //   this.errorMessage = 'Draft must have at least some content';
    //   this.cdr.detectChanges();
    //   return;
    // }

    this.isLoading = true;

    if (this.filesUpdated)
      this.attachments = await this.uploadFiles(transactional);

    const draftEmail: any = {
      to: recipientArr,
      subject: this.subject,
      body: this.body,
      priority: this.priority,
      draft: true,
      attachments: this.attachments
    };

    console.log('Saving draft...', draftEmail);
    this.emailService.saveDraft(draftEmail).subscribe({
      next: (response) => {
        console.log('Draft saved successfully:', response);
        this.successMessage = 'Draft saved successfully!';
        this.isLoading = false;
        this.errorMessage = '';
        this.closeCompose(true);
        this.notificationService.showWarning('Email drafted!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to save draft:', error);
        this.errorMessage = error.error?.error || 'Failed to save draft. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editingIsDisabled() {
    return this.isSending || this.isLoading;
  }
  // Parse recipients from comma-separated string to array
  private parseRecipients(recipientsStr: string): string[] {
    return recipientsStr
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }


  // Close compose panel
  closeCompose(force: boolean = false) {
    if (!force && this.hasContent()) {
      this.showDiscardWarningModal = true;
      return;
    }
    this.resetForm();
    this.composeService.closeCompose();
  }

  hasContent(): boolean {
    return !!(this.recipients || this.subject || this.body || this.attachments.length > 0);
  }

  confirmDiscard() {
    this.closeCompose(true);
    this.showDiscardWarningModal = false;
  }

  cancelDiscard() {
    this.showDiscardWarningModal = false;
  }

  // Reset form to initial state
  private resetForm() {
    this.recipients = '';
    this.subject = '';
    this.body = '';
    this.priority = 3;
    this.attachments = [];
    this.selectedFiles = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
    this.showContactDropdown = false;
    this.filteredContacts = [];
    this.showHtmlSource = false;
    this.showDiscardWarningModal = false;
  }

  toggleHtmlSource() {
    if (this.showHtmlSource) {
      // Switching back to visual editor - show warning
      this.showHtmlWarningModal = true;
    } else {
      // Switching to HTML source - safe
      this.showHtmlSource = true;
    }
  }

  confirmSwitchToVisual() {
    this.showHtmlSource = false;
    this.showHtmlWarningModal = false;
  }

  cancelSwitchToVisual() {
    this.showHtmlWarningModal = false;
  }

  // Contact autocomplete handlers
  onRecipientInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    // Get the last email being typed (after last comma)
    const emails = input.split(',');
    const currentEmail = emails[emails.length - 1].trim();

    if (currentEmail.length >= 2) {
      this.contactSearch$.next(currentEmail);
    } else {
      this.showContactDropdown = false;
      this.filteredContacts = [];
    }
  }

  selectContact(contact: any) {
    // Get current recipients and split by comma
    const emails = this.recipients.split(',').map(e => e.trim()).filter(e => e);

    // Remove the last partial email (the one being typed)
    emails.pop();

    // Add the selected contact's email
    emails.push(contact.email);

    // Join and add trailing comma for next recipient
    this.recipients = emails.join(', ') + ', ';

    // Close dropdown
    this.showContactDropdown = false;
    this.filteredContacts = [];
    this.selectedContactIndex = -1;

    this.cdr.detectChanges();
  }

  handleContactKeyDown(event: KeyboardEvent) {
    if (!this.showContactDropdown || this.filteredContacts.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedContactIndex = Math.min(
          this.selectedContactIndex + 1,
          this.filteredContacts.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedContactIndex = Math.max(this.selectedContactIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedContactIndex >= 0) {
          this.selectContact(this.filteredContacts[this.selectedContactIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showContactDropdown = false;
        this.filteredContacts = [];
        break;
    }
    this.cdr.detectChanges();
  }

  closeContactDropdown() {
    setTimeout(() => {
      this.showContactDropdown = false;
      this.filteredContacts = [];
      this.cdr.detectChanges();
    }, 200);
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
    if (this.composeSubscription) {
      this.composeSubscription.unsubscribe();
    }
    if (this.composeDataSubscription) {
      this.composeDataSubscription.unsubscribe();
    }
    if (this.contactSearchSubscription) {
      this.contactSearchSubscription.unsubscribe();
    }
  }
}
