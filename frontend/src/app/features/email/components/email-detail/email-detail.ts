import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.html',
  styleUrl: './email-detail.css'
})
export class EmailDetailComponent implements OnInit {
  email: any = null;
  messageId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private emailService: EmailService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get messageId from route params or query params
    this.route.queryParams.subscribe(params => {
      this.messageId = params['messageId'];
      if (this.messageId) {
        this.loadEmail();
      }
    });

    // Alternative: Get from route params
    this.route.params.subscribe(params => {
      if (params['messageId']) {
        this.messageId = params['messageId'];
        this.loadEmail();
      }
    });
  }

  // Load email from backend
  loadEmail() {
    if (!this.messageId) {
      this.errorMessage = 'No email selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.emailService.getEmail(this.messageId).subscribe({
      next: (response) => {
        this.email = response;
        this.isLoading = false;
        console.log('Email loaded:', this.email);
      },
      error: (error) => {
        console.error('Failed to load email:', error);
        this.errorMessage = 'Failed to load email. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Mark email as read
  markAsRead() {
    if (!this.messageId) return;

    this.emailService.markAsRead(this.messageId).subscribe({
      next: () => {
        this.email.isRead = true;
        console.log('Email marked as read');
      },
      error: (error) => {
        console.error('Failed to mark as read:', error);
      }
    });
  }

  // Mark email as unread
  markAsUnread() {
    if (!this.messageId) return;

    this.emailService.markAsUnread(this.messageId).subscribe({
      next: () => {
        this.email.isRead = false;
        console.log('Email marked as unread');
      },
      error: (error) => {
        console.error('Failed to mark as unread:', error);
      }
    });
  }

  // Star email
  starEmail() {
    if (!this.messageId) return;

    this.emailService.starEmail(this.messageId).subscribe({
      next: () => {
        this.email.isStarred = true;
        console.log('Email starred');
      },
      error: (error) => {
        console.error('Failed to star email:', error);
      }
    });
  }

  // Unstar email
  unstarEmail() {
    if (!this.messageId) return;

    this.emailService.unstarEmail(this.messageId).subscribe({
      next: () => {
        this.email.isStarred = false;
        console.log('Email unstarred');
      },
      error: (error) => {
        console.error('Failed to unstar email:', error);
      }
    });
  }

  // Move email to folder
  moveToFolder(folderName: string) {
    if (!this.messageId) return;

    this.emailService.moveEmail(this.messageId, folderName).subscribe({
      next: () => {
        this.email.folder = folderName;
        console.log('Email moved to:', folderName);
      },
      error: (error) => {
        console.error('Failed to move email:', error);
      }
    });
  }

  // Delete email
  deleteEmail() {
    if (!this.messageId) return;

    if (confirm('Are you sure you want to delete this email?')) {
      this.emailService.deleteEmail(this.messageId).subscribe({
        next: () => {
          console.log('Email deleted');
          // Navigate back or close detail view
          window.history.back();
        },
        error: (error) => {
          console.error('Failed to delete email:', error);
          this.errorMessage = 'Failed to delete email';
        }
      });
    }
  }

  // Format body text (split by newlines)
  getBodyLines(body: string): string[] {
    return body ? body.split('\n') : [];
  }

  // Format timestamp
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Get sender initials for avatar
  getSenderInitials(): string {
    if (!this.email?.from) return 'N/A';
    const parts = this.email.from.split('@')[0].split('.');
    return parts.map((p: string) => p[0].toUpperCase()).join('').substring(0, 2);
  }
  getRecipients(): string {
    if (!this.email || !this.email.to || this.email.to.length === 0) {
      return 'Unknown';
    }
    return this.email.to.join(', ');
  }
}
