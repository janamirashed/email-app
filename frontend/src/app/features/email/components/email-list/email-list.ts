import { Component, OnInit, inject, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';
import { EventService } from '../../../../core/services/event-service';
import { EmailDetailComponent } from '../email-detail/email-detail';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule, EmailDetailComponent],
  templateUrl: './email-list.html',
  styleUrl: './email-list.css'
})
export class EmailListComponent implements OnInit, OnDestroy {
  emails: any[] = [];
  selectedEmailId: string | null = null;
  currentFolder: string = 'inbox';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalEmails: number = 0;

  isLoading: boolean = false;
  errorMessage: string = '';

  sortBy: string = 'date';
  selectedEmails: Set<string> = new Set();
  Math = Math;

  constructor(
    private emailService: EmailService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  currentUserEmail: string = '';
  private readSubscription?: Subscription;

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser') || '';
    this.currentUserEmail = `${currentUser}@jaryn.com`;

    // Get current folder from route
    this.route.url.subscribe(urlSegments => {
      // Check if we're on a /folder/:folderName route
      if (urlSegments[0]?.path === 'folder' && urlSegments[1]) {
        this.currentFolder = urlSegments[1].path;
      } else {
        this.currentFolder = urlSegments[0]?.path || 'inbox';
      }

      this.currentPage = 1;
      this.selectedEmails.clear();
      this.errorMessage = ''; // Clear errors
      this.loadEmails();
      this.cdr.detectChanges(); // Trigger change detection after route change

      this.eventService.getInboxRefresh().subscribe(() => {
        console.log('Inbox refresh event received from SSE');
        // Only refresh if we're currently viewing the inbox
        if (this.currentFolder === 'inbox') {
          this.loadEmails();
          this.emailService.refreshUnreadCount();
          this.cdr.detectChanges();
        }
      })

    });

    // Subscribe to read events
    this.readSubscription = this.emailService.messageRead$.subscribe(messageId => {
      const email = this.emails.find(e => e.messageId === messageId);
      if (email && !email.isRead) {
        email.isRead = true;
        this.cdr.detectChanges();
      }
    });
  }
  // Get sender display name
  getParticipant(email: any): string {
    if (this.currentFolder === 'sent' || this.currentFolder === 'drafts') {
      if (email.to && email.to.length > 0) {
        return 'To: ' + email.to.map((addr: string) => addr.split('@')[0]).join(', ');
      }
      return 'To: (No Recipients)';
    }

    // Check if I am the sender (for mixed folders like Trash, Search, or custom folders)
    // Case-insensitive comparison
    const sender = email.from ? email.from.toLowerCase().trim() : '';
    const me = this.currentUserEmail.toLowerCase().trim();
    const rawUsername = (localStorage.getItem('currentUser') || '').toLowerCase().trim();

    // Check against full email, raw username, or if sender contains the username
    if (sender === me || sender === rawUsername || (rawUsername && sender.includes(rawUsername))) {
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
        this.currentPage = response.currentPage || 1;
        this.pageSize = response.pageSize || 20;
        this.totalPages = response.totalPages || 0;
        this.totalEmails = response.totalEmails || 0;

        this.emails.forEach((email: any) => {
          email.isStarred = email.isStarred !== undefined ? email.isStarred : !!email.starred;
          email.isRead = email.isRead !== undefined ? email.isRead : !!email.read;
        });

        this.isLoading = false;
        console.log('Emails loaded:', this.emails);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load emails:', error);
        this.errorMessage = 'Failed to load emails. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Load starred emails
  private loadStarredEmails() {
    this.emailService.getStarredEmails(this.currentPage, this.pageSize, this.sortBy).subscribe({
      next: (response) => {
        let allStarred = response.content || [];

        // Filter out emails that are in trash
        this.emails = allStarred.filter((email: any) => email.folder !== 'trash');

        this.currentPage = response.currentPage || 1;
        this.pageSize = response.pageSize || 20;
        this.totalPages = response.totalPages || 0;
        this.totalEmails = response.totalEmails || 0;

        this.emails.forEach((email: any) => {
          email.isStarred = email.isStarred !== undefined ? email.isStarred : !!email.starred;
          email.isRead = email.isRead !== undefined ? email.isRead : !!email.read;
        });

        this.isLoading = false;
        console.log('Starred emails loaded (filtered):', this.emails);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load starred emails:', error);
        this.errorMessage = 'Failed to load emails. Please try again.';
        this.isLoading = false;
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
          // Clear selection if any deleted email was being viewed
          if (this.selectedEmailId && messageIds.includes(this.selectedEmailId)) {
            this.selectedEmailId = null;
            // Remove messageId query param to show 'Select an email to read'
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {},
              replaceUrl: true
            }).then(() => {
              // Reload emails after navigation completes
              this.selectedEmails.clear();
              this.loadEmails();
            });
            this.cdr.detectChanges();
          } else {
            this.selectedEmails.clear();
            this.loadEmails();
          }
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

  // Toggle star for single email
  toggleStar(email: any, event: Event) {
    event.stopPropagation();

    if (email.isStarred) {
      // Unstar the email
      this.emailService.unstarEmail(email.messageId).subscribe({
        next: () => {
          console.log('Email unstarred successfully:', email.messageId);

          // If we're in the starred folder, reload to remove the email from the list
          if (this.currentFolder === 'starred') {
            // Clear selection if the unstarred email was being viewed
            if (this.selectedEmailId === email.messageId) {
              this.selectedEmailId = null;
              // Remove messageId query param to show 'Select an email to read'
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true
              }).then(() => {
                // Reload emails after navigation completes
                this.loadEmails();
              });
              this.cdr.detectChanges();
            } else {
              this.loadEmails();
            }
          } else {
            // Otherwise just update the local state
            email.isStarred = false;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Failed to unstar email:', error);
          alert('Failed to unstar email. Please try again.');
        }
      });
    } else {
      // Star the email
      this.emailService.starEmail(email.messageId).subscribe({
        next: () => {
          console.log('Email starred successfully:', email.messageId);
          email.isStarred = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to star email:', error);
          alert('Failed to star email. Please try again.');
        }
      });
    }
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



  // Check if email has attachments
  hasAttachments(email: any): boolean {
    return email.attachments && email.attachments.length > 0;
  }

  // Get priority color class based on priority level
  getPriorityColor(priority: number): string {
    // Priority
    if (priority === 1) return 'text-red-500';     // Extreme - Red
    if (priority === 2) return 'text-orange-500';  // High - Orange
    if (priority === 3) return 'text-gray-400';    // Normal - Gray
    if (priority === 4) return 'text-blue-400';    // Low - Blue
    return 'text-gray-400'; // Default
  }

  // Get priority icon type
  getPriorityIcon(priority: number): 'high' | 'medium' | 'normal' | 'low' {
    if (priority === 1) return 'high';
    if (priority === 2) return 'medium';
    if (priority === 3) return 'normal';
    if (priority >= 4) return 'low';
    return 'normal';
  }

  ngOnDestroy() {
    if (this.readSubscription) {
      this.readSubscription.unsubscribe();
    }
  }
}
