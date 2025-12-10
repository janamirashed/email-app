import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { AttachmentService } from '../../../../core/services/attachment.service';
import { EmailService } from '../../../../core/services/email.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { Attachment } from '../../../../core/models/attachment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-compose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-compose.html',
  styleUrl: './email-compose.css'
})
export class EmailComposeComponent implements OnInit, OnDestroy {
  // Form State
  recipients: string = '';
  subject: string = '';
  body: string = '';
  priority: number = 3;

  // Attachments
  attachments: Attachment[] = [];
  selectedFiles: File[] = [];

  // UI State
  isComposing: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private composeSubscription!: Subscription;
  private composeDataSubscription!: Subscription;

  constructor(
    private composeService: EmailComposeService,
    private attachmentService: AttachmentService,
    private emailService: EmailService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
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
        }
      }
    );
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
  }

  // Remove attachment from preview
  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  async sendMail() {
    let attachment_ids: string[] = [];
    if (this.selectedFiles.length > 0) {
      attachment_ids = await lastValueFrom(
        this.attachmentService.getAttachmentIds(this.selectedFiles.length)
      );
    }

    console.log(attachment_ids.length);
    if (this.selectedFiles.length > 0)
      this.attachmentService.uploadAttachments(attachment_ids, this.selectedFiles);

    console.log(attachment_ids.length);
    let attachments: any[] = [];
    attachment_ids.forEach((val, idx) => {
      let entry = {
        id: attachment_ids.at(idx),
        mimeType: this.selectedFiles.at(idx)?.type,
        fileName: this.selectedFiles.at(idx)?.name
      };
      attachments.push(entry);
    });

    let email: any = {
      from: localStorage.getItem("currentUser"),
      to: this.parseRecipients(this.recipients),
      subject: this.subject,
      body: this.body,
      priority: this.priority,
      attachments: attachments
    };

    await new Promise(resolve => setTimeout(resolve, 3000));
    this.emailService.sendEmail(email).subscribe({
      next: (response) => {
        console.log("Email sent successfully:", response);
        this.isLoading = false;
        this.closeCompose();
        this.notificationService.showSuccess('Email sent successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to send email:', error);
        this.errorMessage = error.error?.error || 'Failed to send email. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Save as draft
  saveDraft() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.subject.trim() && !this.body.trim() && !this.recipients.trim()) {
      this.errorMessage = 'Draft must have at least some content';
      return;
    }

    this.isLoading = true;

    const draftEmail: any = {
      to: this.parseRecipients(this.recipients),
      subject: this.subject,
      body: this.body,
      priority: this.priority,
      isDraft: true,
      attachments: this.attachments
    };

    console.log('Saving draft...', draftEmail);
    this.emailService.saveDraft(draftEmail).subscribe({
      next: (response) => {
        console.log('Draft saved successfully:', response);
        this.successMessage = 'Draft saved successfully!';
        this.isLoading = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Failed to save draft:', error);
        this.errorMessage = error.error?.error || 'Failed to save draft. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Parse recipients from comma-separated string to array
  private parseRecipients(recipientsStr: string): string[] {
    return recipientsStr
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Close compose panel
  closeCompose() {
    this.resetForm();
    this.composeService.closeCompose();
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
  }

  ngOnDestroy() {
    if (this.composeSubscription) {
      this.composeSubscription.unsubscribe();
    }
    if (this.composeDataSubscription) {
      this.composeDataSubscription.unsubscribe();
    }
  }
}
