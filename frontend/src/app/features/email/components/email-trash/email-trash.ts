import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../../../core/services/email.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailDetailComponent } from '../email-detail/email-detail';

@Component({
  selector: 'app-email-trash',
  standalone: true,
  imports: [CommonModule, EmailDetailComponent],
  templateUrl: './email-trash.html',
  styleUrl: './email-trash.css'
})
export class EmailTrashComponent implements OnInit {
  emails: any[] = [];
  selectedEmailId: string | null = null;
  selectedEmails: Set<string> = new Set();

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private emailService: EmailService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadTrashEmails();
  }

  // Load all emails from trash folder
  loadTrashEmails() {
    this.isLoading = true;
    this.errorMessage = '';

    this.emailService.getEmailsInFolder('trash', 1, 100, 'date').subscribe({
      next: (response) => {
        this.emails = response.content || [];
        this.isLoading = false;
        console.log('Trash emails loaded:', this.emails);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load trash emails:', error);
        this.errorMessage = 'Failed to load trash emails';
        this.isLoading = false;
        this.cdr.detectChanges()
      }
    });
  }

  // Select email to view
  selectEmail(email: any) {
    this.selectedEmailId = email.messageId;
    // Navigate to detail view with messageId as query param
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { messageId: email.messageId },
      queryParamsHandling: 'merge'
    });
  }

  // Toggle email selection (checkbox)
  toggleEmailSelection(emailId: string, event: Event) {
    event.stopPropagation();
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  // Select all emails in trash
  selectAllEmails(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.emails.forEach(email => {
        this.selectedEmails.add(email.messageId);
      });
    } else {
      this.selectedEmails.clear();
    }
  }

  // Check if all emails are selected
  areAllSelected(): boolean {
    return this.emails.length > 0 && this.selectedEmails.size === this.emails.length;
  }

  // Restore selected emails to inbox
  restoreSelected() {
    if (this.selectedEmails.size === 0) {
      alert('Please select emails to restore');
      return;
    }

    const messageIds = Array.from(this.selectedEmails);
    this.emailService.bulkMove(messageIds, 'inbox').subscribe({
      next: () => {
        this.successMessage = `Restored ${messageIds.length} email(s) to inbox`;
        console.log('Emails restored to inbox');
        this.selectedEmails.clear();
        this.loadTrashEmails();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Failed to restore emails:', error);
        this.errorMessage = 'Failed to restore emails';
      }
    });
  }

  // Permanently delete selected emails
  permanentlyDeleteSelected() {
    if (this.selectedEmails.size === 0) {
      alert('Please select emails to delete');
      return;
    }

    if (confirm(`Permanently delete ${this.selectedEmails.size} email(s)? This cannot be undone.`)) {
      const messageIds = Array.from(this.selectedEmails);
      this.emailService.bulkDelete(messageIds).subscribe({
        next: () => {
          this.successMessage = `Permanently deleted ${messageIds.length} email(s)`;
          console.log('Emails permanently deleted');
          this.selectedEmails.clear();
          this.loadTrashEmails();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to delete emails:', error);
          this.errorMessage = 'Failed to delete emails';
        }
      });
    }
  }

  // Empty entire trash
  emptyTrash() {
    if (this.emails.length === 0) {
      alert('Trash is already empty');
      return;
    }

    if (confirm('Permanently delete all emails in trash? This cannot be undone.')) {
      const allMessageIds = this.emails.map(e => e.messageId);
      this.emailService.bulkDelete(allMessageIds).subscribe({
        next: () => {
          this.successMessage = 'Trash emptied successfully';
          console.log('Trash emptied');
          this.selectedEmails.clear();
          this.emails = [];

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to empty trash:', error);
          this.errorMessage = 'Failed to empty trash';
        }
      });
    }
  }

  // Format date
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
    });
  }

  // Get sender name from email
  getSenderName(email: any): string {
    if (email.from) {
      return email.from.split('@')[0];
    }
    return 'Unknown';
  }
}
