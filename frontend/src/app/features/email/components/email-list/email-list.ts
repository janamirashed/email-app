import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Email } from '../../../../core/models/email.model';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-list.html',
})
export class EmailListComponent implements OnInit {
  emails: Email[] = [];
  totalEmails = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  currentFolder = 'inbox';
  sortBy = 'date';
  selectedEmailId: string | null = null;
  isLoading = false;

  // For bulk operations
  selectedEmails = new Set<string>();

  @Output() emailSelected = new EventEmitter<Email>();

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    // Get the current route to determine folder
    this.route.url.subscribe(urlSegments => {
      this.currentFolder = urlSegments[0]?.path || 'inbox';
      this.currentPage = 1; // Reset to first page when folder changes
      this.loadEmails();
    });
  }

  loadEmails() {
    this.isLoading = true;

    // Determine which API endpoint to call based on folder
    const apiCall = this.currentFolder === 'inbox'
      ? this.emailService.getInboxEmails(this.currentPage, this.pageSize, this.sortBy)
      : this.currentFolder === 'starred'
        ? this.emailService.getStarredEmails(this.sortBy)
        : this.emailService.getEmailsInFolder(this.currentFolder, this.currentPage, this.pageSize, this.sortBy);

    apiCall.subscribe({
      next: (response) => {
        if (this.currentFolder === 'starred') {
          // Starred endpoint returns array directly
          this.emails = response.emails || [];
          this.totalEmails = response.totalStarred || 0;
          this.totalPages = 1;
        } else {
          // Other endpoints return paginated response
          this.emails = response.content || [];
          this.totalEmails = response.totalEmails || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = response.currentPage || 1;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading emails:', error);
        this.isLoading = false;
      }
    });
  }

  selectEmail(email: Email) {
    this.selectedEmailId = email.messageId;
    this.emailSelected.emit(email);

    // Mark as read when opened
    if (!email.isRead) {
      this.emailService.markAsRead(email.messageId).subscribe({
        next: () => {
          email.isRead = true;
        },
        error: (error) => console.error('Error marking as read:', error)
      });
    }
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEmails();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  // Sorting
  changeSortBy(newSortBy: string) {
    this.sortBy = newSortBy;
    this.currentPage = 1;
    this.loadEmails();
  }

  // Bulk selection
  toggleEmailSelection(emailId: string, event: Event) {
    event.stopPropagation();
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.emails.forEach(email => this.selectedEmails.add(email.messageId));
    } else {
      this.selectedEmails.clear();
    }
  }

  // Bulk operations
  bulkArchive() {
    const ids = Array.from(this.selectedEmails);
    this.emailService.bulkMove(ids, 'archive').subscribe({
      next: () => {
        this.selectedEmails.clear();
        this.loadEmails();
      },
      error: (error) => console.error('Error archiving emails:', error)
    });
  }

  bulkDelete() {
    const ids = Array.from(this.selectedEmails);
    this.emailService.bulkDelete(ids).subscribe({
      next: () => {
        this.selectedEmails.clear();
        this.loadEmails();
      },
      error: (error) => console.error('Error deleting emails:', error)
    });
  }

  // Email actions
  starEmail(email: Email, event: Event) {
    event.stopPropagation();
    const action = email.isStarred
      ? this.emailService.unstarEmail(email.messageId)
      : this.emailService.starEmail(email.messageId);

    action.subscribe({
      next: () => {
        email.isStarred = !email.isStarred;
      },
      error: (error) => console.error('Error toggling star:', error)
    });
  }

  deleteEmail(email: Email, event: Event) {
    event.stopPropagation();
    this.emailService.deleteEmail(email.messageId).subscribe({
      next: () => {
        this.loadEmails();
      },
      error: (error) => console.error('Error deleting email:', error)
    });
  }

  // Refresh emails
  refresh() {
    this.loadEmails();
  }
}
