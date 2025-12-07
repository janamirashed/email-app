import { Component, OnInit, inject , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';
import { EmailDetailComponent } from '../email-detail/email-detail';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule, EmailDetailComponent],
  templateUrl: './email-list.html',
  styleUrl: './email-list.css'
})
export class EmailListComponent implements OnInit {
  emails: any[] = [];
  selectedEmailId: string | null = null;
  currentFolder: string = 'inbox';
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 0;
  totalEmails: number = 0;

  isLoading: boolean = false;
  errorMessage: string = '';

  sortBy: string = 'date';
  selectedEmails: Set<string> = new Set();
  Math = Math;

  constructor(
    private emailService: EmailService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get current folder from route
    this.route.url.subscribe(urlSegments => {
      this.currentFolder = urlSegments[0]?.path || 'inbox';
      this.currentPage = 1;
      this.selectedEmails.clear();
      this.loadEmails();
    });
  }

  // Load emails for current folder
  loadEmails() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.currentFolder === 'starred') {
      this.loadStarredEmails();
    } else {
      this.loadFolderEmails();
    }
  }

  // Load emails from specific folder
  private loadFolderEmails() {
    this.emailService.getEmailsInFolder(
      this.currentFolder,
      this.currentPage,
      this.pageSize,
      this.sortBy
    ).subscribe({
      next: (response) => {
        this.emails = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalEmails = response.totalEmails || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('Emails loaded:', this.emails);
      },
      error: (error) => {
        console.error('Failed to load emails:', error);
        this.errorMessage = 'Failed to load emails. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Load starred emails
  private loadStarredEmails() {
    this.emailService.getStarredEmails(this.sortBy).subscribe({
      next: (response) => {
        this.emails = response.emails || [];
        this.totalEmails = response.totalStarred || 0;
        this.totalPages = 1; // Starred emails not paginated
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('Starred emails loaded:', this.emails);
      },
      error: (error) => {
        console.error('Failed to load starred emails:', error);
        this.errorMessage = 'Failed to load emails. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Select/deselect email
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

  // Select all emails on page
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

  // Bulk move selected emails
  bulkMove(toFolder: string) {
    if (this.selectedEmails.size === 0) {
      alert('Please select emails to move');
      return;
    }

    const messageIds = Array.from(this.selectedEmails);
    this.emailService.bulkMove(messageIds, toFolder).subscribe({
      next: () => {
        console.log(`Moved ${messageIds.length} emails to ${toFolder}`);
        this.selectedEmails.clear();
        this.loadEmails();
      },
      error: (error) => {
        console.error('Failed to move emails:', error);
        this.errorMessage = 'Failed to move emails';
      }
    });
  }

  // Bulk delete selected emails
  bulkDelete() {
    if (this.selectedEmails.size === 0) {
      alert('Please select emails to delete');
      return;
    }

    if (confirm(`Delete ${this.selectedEmails.size} email(s)?`)) {
      const messageIds = Array.from(this.selectedEmails);
      this.emailService.bulkDelete(messageIds).subscribe({
        next: () => {
          console.log(`Deleted ${messageIds.length} emails`);
          this.selectedEmails.clear();
          this.loadEmails();
        },
        error: (error) => {
          console.error('Failed to delete emails:', error);
          this.errorMessage = 'Failed to delete emails';
        }
      });
    }
  }

  // Star selected emails
  starSelected() {
    if (this.selectedEmails.size === 0) return;

    this.selectedEmails.forEach(messageId => {
      this.emailService.starEmail(messageId).subscribe({
        next: () => {
          const email = this.emails.find(e => e.messageId === messageId);
          if (email) email.isStarred = true;
        },
        error: (error) => console.error('Failed to star email:', error)
      });
    });

    this.selectedEmails.clear();
  }

  // Mark selected as read
  markSelectedAsRead() {
    if (this.selectedEmails.size === 0) return;

    this.selectedEmails.forEach(messageId => {
      this.emailService.markAsRead(messageId).subscribe({
        next: () => {
          const email = this.emails.find(e => e.messageId === messageId);
          if (email) email.isRead = true;
        },
        error: (error) => console.error('Failed to mark as read:', error)
      });
    });

    this.selectedEmails.clear();
  }

  // Sort emails
  changeSortBy(newSort: string) {
    this.sortBy = newSort;
    this.currentPage = 1;
    this.loadEmails();
  }

  // Pagination - Next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.selectedEmails.clear();
      this.loadEmails();
    }
  }

  // Pagination - Previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.selectedEmails.clear();
      this.loadEmails();
    }
  }

  // Format date
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' });
    }
  }

  // Get sender display name
  getParticipant(email: any): string {
    if (this.currentFolder === 'sent' || this.currentFolder === 'drafts') {
      if (email.to && email.to.length > 0) {
        return 'To: ' + email.to.map((addr: string) => addr.split('@')[0]).join(', ');
      }
      return 'To: (No Recipients)';
    }

    if (email.from) {
      return email.from.split('@')[0];
    }
    return 'Unknown';
  }

  // Check if email has attachments
  hasAttachments(email: any): boolean {
    return email.attachments && email.attachments.length > 0;
  }
}
