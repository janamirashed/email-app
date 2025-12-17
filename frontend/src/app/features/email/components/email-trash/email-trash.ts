import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../../../core/services/email.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailDetailComponent } from '../email-detail/email-detail';
import { EventService } from '../../../../core/services/event-service';

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

  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuEmail: any = null;

  constructor(
    private emailService: EmailService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
  ) { }

  currentUserEmail: string = '';

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser') || '';
    this.currentUserEmail = `${currentUser}@jaryn.com`;
    // Defer loading to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadTrashEmails();
    });
  }
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
    this.isLoading = true;
    this.emailService.bulkRestoreFromTrash(messageIds).subscribe({
      next: () => {
        this.successMessage = `Restored ${messageIds.length} email(s) to original folder(s)`;
        console.log('Emails restored to their original folders');
        this.isLoading = false;
        this.selectedEmails.clear();
        this.eventService.clearEmailSelection(messageIds);
        this.loadTrashEmails();
        this.cdr.detectChanges()
        // this.successMessage = '';
      },
      error: (error) => {
        console.error('Failed to restore emails:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to restore emails';
        this.cdr.detectChanges();
      }
    });
  }

  // Permanently delete selected emails
  async permanentlyDeleteSelected() {
    if (this.selectedEmails.size === 0) {
      alert('Please select emails to delete');
      return;
    }

    const confirmed = await this.confirmationService.confirm({
      title: 'Permanently Delete Emails',
      message: `Permanently delete ${this.selectedEmails.size} email(s)? This cannot be undone.`,
      confirmText: 'Delete Forever',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      const messageIds = Array.from(this.selectedEmails);
      this.isLoading = true;

      this.emailService.permanentlyDeleteEmails(messageIds).subscribe({
        next: () => {
          this.successMessage = `Permanently deleted ${messageIds.length} email(s)`;
          console.log('Emails permanently deleted');
          this.isLoading = false;
          this.selectedEmails.clear();
          this.eventService.clearEmailSelection(messageIds);
          this.loadTrashEmails();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to delete emails:', error);
          this.errorMessage = 'Failed to delete emails';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async emptyTrash() {
    if (this.emails.length === 0) {
      alert('Trash is already empty');
      return;
    }

    const confirmed = await this.confirmationService.confirm({
      title: 'Empty Trash',
      message: 'Permanently delete all emails in trash? This cannot be undone.',
      confirmText: 'Empty Trash',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      const allMessageIds = this.emails.map(e => e.messageId);
      this.isLoading = true;

      this.emailService.permanentlyDeleteEmails(allMessageIds).subscribe({
        next: () => {
          this.successMessage = 'Trash emptied successfully';
          console.log('Trash emptied');
          this.selectedEmails.clear();
          this.isLoading = false;
          this.cdr.detectChanges();
          this.loadTrashEmails();
          this.eventService.clearEmailSelection(allMessageIds);
          this.successMessage = '';
        },
        error: (error) => {
          console.error('Failed to empty trash:', error);
          this.errorMessage = 'Failed to empty trash';
          this.isLoading = false;
          this.cdr.detectChanges();
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

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): boolean {
    const target = event.target as HTMLElement;
    const emailRow = target.closest('[data-email-id]');

    if (emailRow) {
      event.preventDefault();
      const emailId = emailRow.getAttribute('data-email-id');
      this.contextMenuEmail = this.emails.find(e => e.messageId === emailId);

      if (this.contextMenuEmail) {
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.showContextMenu = true;
        this.cdr.detectChanges();
      }
    }
    return false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.context-menu') && this.showContextMenu) {
      this.showContextMenu = false;
      this.cdr.detectChanges();
    }
  }

  closeContextMenu() {
    this.showContextMenu = false;
    this.contextMenuEmail = null;
    this.cdr.detectChanges();
  }

// Context menu actions
  contextRestore() {
    if (this.contextMenuEmail) {
      this.emailService.bulkRestoreFromTrash([this.contextMenuEmail.messageId]).subscribe({
        next: () => {
          this.successMessage = 'Email restored to original folder';
          this.selectedEmails.delete(this.contextMenuEmail.messageId);
          this.loadTrashEmails();
          this.cdr.detectChanges();
          this.closeContextMenu();
        },
        error: (error) => {
          console.error('Failed to restore email:', error);
          this.errorMessage = 'Failed to restore email';
          this.cdr.detectChanges();
        }
      });
    }
  }

  async contextDelete() {
    if (this.contextMenuEmail) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Permanently Delete Email',
        message: 'This email will be permanently deleted and cannot be recovered.',
        confirmText: 'Delete Forever',
        cancelText: 'Cancel',
        type: 'danger'
      });

      if (confirmed) {
        this.emailService.permanentlyDeleteEmails([this.contextMenuEmail.messageId]).subscribe({
          next: () => {
            this.successMessage = 'Email permanently deleted';
            this.selectedEmails.delete(this.contextMenuEmail.messageId);
            this.eventService.clearEmailSelection([this.contextMenuEmail.messageId]);
            this.loadTrashEmails();
            this.cdr.detectChanges();
            this.closeContextMenu();
          },
          error: (error) => {
            console.error('Failed to delete email:', error);
            this.errorMessage = 'Failed to delete email';
            this.cdr.detectChanges();
          }
        });
      }
    }
  }
}
