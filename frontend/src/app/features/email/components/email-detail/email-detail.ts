import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmailService } from '../../../../core/services/email.service';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { FolderService } from '../../../../core/services/folder.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.html',
  styleUrl: './email-detail.css'
})
export class EmailDetailComponent implements OnInit {
  email: any = null;
  messageId: string | null = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Move to folder
  showMoveDialog = false;
  folders: any[] = [];
  isLoadingFolders = false;
  moveSuccessMessage = '';
  moveErrorMessage = '';

  constructor(
    private emailService: EmailService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private composeService: EmailComposeService,
    private folderService: FolderService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private location: Location
  ) { }

  ngOnInit() {
    // Get messageId from route params or query params
    this.route.queryParams.subscribe(params => {
      this.messageId = params['messageId'];
      if (this.messageId) {
        this.isLoading = false; // Reset loading state
        this.email = null; // Clear previous email
        this.loadEmail();
      } else {
        // No messageId - clear the email display
        this.email = null;
        this.messageId = null;
        this.errorMessage = '';
        this.isLoading = false;
        this.cdr.detectChanges();
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

    // Open compose with pre-filled recipient and subject
    this.composeService.openCompose({
      recipients: this.email.from,
      subject: `Re: ${this.email.subject}`,
      body: ''
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
          this.location.back();
          this.cdr.detectChanges()
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

  // Open move to folder dialog
  openMoveDialog() {
    this.showMoveDialog = true;
    this.moveSuccessMessage = '';
    this.moveErrorMessage = '';
    this.loadFolders();
  }

  // Load available folders
  loadFolders() {
    this.isLoadingFolders = true;
    console.log('Loading folders for move dialog...');
    this.folderService.getAllFolders().subscribe({
      next: (response) => {
        console.log('Move dialog - Folders API response:', response);
        // Backend returns { success: true, totalFolders: N, folders: [...] }
        // Filter to show only custom folders (system folders are already shown separately)
        // Also exclude the 'contacts' folder
        const allFolders = response.folders || [];
        this.folders = allFolders.filter((folder: any) =>
          (folder.type === 'CUSTOM' || folder.type === 'custom') &&
          folder.name.toLowerCase() !== 'contacts'
        );
        this.isLoadingFolders = false;
        this.cdr.detectChanges()
        console.log('Move dialog - Custom folders loaded:', this.folders);
      },
      error: (error) => {
        console.error('Move dialog - Failed to load folders:', error);
        console.error('Move dialog - Error details:', error.error);
        this.moveErrorMessage = 'Failed to load folders';
        this.isLoadingFolders = false;
        this.cdr.detectChanges()
      }
    });
  }

  // Move email to selected folder
  moveToFolder(folderName: string) {
    if (!this.messageId) return;

    this.emailService.moveEmail(this.messageId, folderName).subscribe({
      next: () => {
        console.log('Email moved to', folderName);

        this.showMoveDialog = false;
        this.location.back();
        this.notificationService.showSuccess(`Email moved to ${folderName}`);
        this.cdr.detectChanges();

      },
      error: (error) => {
        console.error('Failed to move email:', error);
        this.notificationService.showError('Failed to move email');
      }
    });
  }

  closeMoveDialog() {
    this.showMoveDialog = false;
    this.moveSuccessMessage = '';
    this.moveErrorMessage = '';
  }

  // Download attachment
  downloadAttachment(attachment: any) {
    console.log('=== DOWNLOAD ATTACHMENT DEBUG ===');
    console.log('Full attachment object:', attachment);

    // Try multiple possible ID field names
    const attachmentId = attachment.id || attachment.attachmentId || attachment.attachmentID || attachment.fileId;

    console.log('Extracted attachmentId:', attachmentId);
    console.log('Available attachment fields:', Object.keys(attachment));

    if (!attachmentId) {
      console.error('ERROR: Attachment ID not found in any expected field');
      alert('Cannot download: Attachment ID is missing. Check console for details.');
      return;
    }

    const token = localStorage.getItem('authToken');
    const url = `http://localhost:8080/api/attachments/${attachmentId}`;

    console.log('Request URL:', url);
    console.log('Has token:', !!token);

    // Fetch the file as a blob
    this.http.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        console.log('SUCCESS: Download completed');
        console.log('Blob size:', blob.size, 'bytes');
        console.log('Blob type:', blob.type);

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = attachment.fileName || attachment.filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the temporary URL
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      },
      error: (error) => {
        console.error('=== DOWNLOAD ERROR ===');
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error object:', error);
        console.error('Error body:', error.error);

        let errorMsg = `Failed to download attachment.\nStatus: ${error.status}`;
        if (error.status === 404) {
          errorMsg += '\nAttachment not found on server.';
        } else if (error.status === 401 || error.status === 403) {
          errorMsg += '\nAuthentication error.';
        }
        alert(errorMsg + '\n\nCheck browser console for details.');
      }
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Check if the current user is a recipient (not the sender)
  isReceivedEmail(): boolean {
    if (!this.email || !this.email.to) return false;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;

    const currentUserEmail = `${currentUser}@jaryn.com`;

    // Check if current user is in the recipients list
    return this.email.to.some((recipient: string) =>
      recipient.toLowerCase() === currentUserEmail.toLowerCase()
    );
  }

  protected readonly localStorage = localStorage;
}
