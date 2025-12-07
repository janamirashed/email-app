import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Email } from '../../../../core/models/email.model';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.html',
})
export class EmailDetailComponent implements OnChanges {
  @Input() emailId: string = '';

  email: Email | null = null;
  isLoading = false;
  error = '';

  constructor(private emailService: EmailService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emailId'] && this.emailId) {
      this.loadEmail();
    }
  }

  loadEmail() {
    this.isLoading = true;
    this.error = '';

    this.emailService.getEmail(this.emailId).subscribe({
      next: (email) => {
        this.email = email;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading email:', error);
        this.error = 'Failed to load email';
        this.isLoading = false;
      }
    });
  }

  // Email actions
  replyEmail() {
    // TODO: Implement reply functionality
    console.log('Reply to:', this.email);
  }

  forwardEmail() {
    // TODO: Implement forward functionality
    console.log('Forward:', this.email);
  }

  archiveEmail() {
    if (this.email) {
      this.emailService.moveEmail(this.email.messageId, 'archive').subscribe({
        next: () => {
          console.log('Email archived');
          // Emit event to parent component to refresh list
        },
        error: (error) => console.error('Error archiving email:', error)
      });
    }
  }

  deleteEmail() {
    if (this.email && confirm('Move this email to trash?')) {
      this.emailService.deleteEmail(this.email.messageId).subscribe({
        next: () => {
          console.log('Email moved to trash');
          // Emit event to parent component to refresh list
        },
        error: (error) => console.error('Error deleting email:', error)
      });
    }
  }

  starEmail() {
    if (this.email) {
      const action = this.email.isStarred
        ? this.emailService.unstarEmail(this.email.messageId)
        : this.emailService.starEmail(this.email.messageId);

      action.subscribe({
        next: () => {
          if (this.email) {
            this.email.isStarred = !this.email.isStarred;
          }
        },
        error: (error) => console.error('Error toggling star:', error)
      });
    }
  }

  downloadAttachment(attachment: any) {
    // Download attachment
    const url = `http://localhost:8080/attachments/${attachment.id}`;
    window.open(url, '_blank');
  }

  // Helper to format the body content
  getBodyLines(body: string): string[] {
    return body ? body.split('\n') : [];
  }
}
