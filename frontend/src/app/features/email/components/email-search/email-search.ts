import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';
import { EmailDetailComponent } from '../email-detail/email-detail';

@Component({
  selector: 'app-email-search',
  standalone: true,
  imports: [CommonModule, EmailDetailComponent],
  templateUrl: './email-search.html',
  styleUrl: './email-search.css',
})
export class EmailSearch implements OnInit {
  emails: any[] = [];
  selectedEmailId: string | null = null;
  keyword: string = '';
  searchBy: string = 'all';
  sortBy: string = 'date';
  sender: string = '';
  receiver: string = '';
  subject: string = '';
  body: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  folder: string = '';
  priority: number | null = null;
  hasAttachment: boolean | null = null;
  startDate: string = '';
  endDate: string = '';

  selectedEmails: Set<string> = new Set();
  Math = Math;

  constructor(
    private emailService: EmailService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  currentUserEmail: string = '';

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser') || '';
    this.currentUserEmail = `${currentUser}@jaryn.com`;

    this.route.queryParams.subscribe(params => {
      this.sender = params['sender'];
      this.receiver = params['receiver'];
      this.subject = params['subject'];
      this.body = params['body'];
      this.folder = params['folder'];
      this.keyword = params['keyword'];
      this.priority = params['priority'] ? Number(params['priority']) : null;
      this.hasAttachment = params['hasAttachment'] === 'true';
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';
      if (this.sender || this.receiver || this.subject || this.body ||
          this.keyword || this.folder || this.priority || this.hasAttachment || this.startDate || this.endDate) {
        setTimeout(() => {
          this.searchEmails();
        }, 0);
      }
    });
  }

  // Get sender display name
  getParticipant(email: any): string {
    // Check if I am the sender
    const sender = email.from ? email.from.toLowerCase().trim() : '';
    const me = this.currentUserEmail.toLowerCase().trim();
    const rawUsername = (localStorage.getItem('currentUser') || '').toLowerCase().trim();

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

  searchEmails() {
    this.isLoading = true;
    this.errorMessage = '';
    this.emails = [];

    const searchParams = {
      sender: this.sender,
      receiver: this.receiver,
      subject: this.subject,
      body: this.body,
      folder: this.folder,
      keyword: this.keyword,
      priority: this.priority ? String(this.priority) : undefined,
      hasAttachment: this.hasAttachment !== null ? this.hasAttachment : undefined,
      startDate: this.route.snapshot.queryParams['startDate'],
      endDate: this.route.snapshot.queryParams['endDate'],
      sortBy: this.sortBy
    };

    this.emailService.searchEmails(searchParams).subscribe({
      next: (response) => {
        // The backend returns a map with "results" key containing the list
        const rawResults = response.results || [];

        // Deduplicate based on messageId
        const uniqueEmails = new Map();
        rawResults.forEach((email: any) => {
          if (email.messageId && !uniqueEmails.has(email.messageId)) {
            uniqueEmails.set(email.messageId, email);
          }
        });

        this.emails = Array.from(uniqueEmails.values());

        this.emails.forEach((email: any) => {
          email.starred = email.starred !== undefined ? email.starred : !!email.starred;
          email.read = email.read !== undefined ? email.read : !!email.read;
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Search failed:', error);
        this.errorMessage = 'Search failed. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Select/deselect email
  selectEmail(email: any) {
    this.selectedEmailId = email.messageId;
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

  // Toggle star for single email
  toggleStar(email: any, event: Event) {
    event.stopPropagation();

    if (email.starred) {
      this.emailService.unstarEmail(email.messageId).subscribe({
        next: () => {
          email.starred = false;
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Failed to unstar email:', error)
      });
    } else {
      this.emailService.starEmail(email.messageId).subscribe({
        next: () => {
          email.starred = true;
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Failed to star email:', error)
      });
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
}
