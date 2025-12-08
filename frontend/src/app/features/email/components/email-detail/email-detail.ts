import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';
import { EmailComposeService } from '../../../../core/services/email-compose.service';

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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private composeService: EmailComposeService
  ) { }

  ngOnInit() {
    // Get messageId from route params or query params
    this.route.queryParams.subscribe(params => {
      this.messageId = params['messageId'];
      if (this.messageId) {
        this.isLoading = false; // Reset loading state
        this.email = null; // Clear previous email
        this.loadEmail();
      }
    });

    // Alternative: Get from route params
    this.route.params.subscribe(params => {
      if (params['messageId']) {
        this.messageId = params['messageId'];
        this.isLoading = false; // Reset loading state
        this.email = null; // Clear previous email
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
    this.cdr.detectChanges(); // Force change detection

    this.emailService.getEmail(this.messageId).subscribe({
      next: (response) => {
        this.email = response;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
        console.log('Email loaded:', this.email);
      },
      error: (error) => {
        console.error('Failed to load email:', error);
        this.errorMessage = 'Failed to load email. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  // Reply to email
  replyToEmail() {
    if (!this.email) return;

    // Open compose with pre-filled recipient
    this.composeService.openCompose();

    // TODO: Pre-fill compose form with email details
    // This would need to emit data to the compose component
    console.log('Reply to:', this.email.from);
    console.log('Subject: Re:', this.email.subject);
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
