import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmailComposeService } from '../../../core/services/email-compose.service';
import { EmailService } from '../../../core/services/email.service';
import { FolderService } from '../../../core/services/folder.service';
import { FormsModule } from '@angular/forms';

interface Folder {
  name: string;
  count?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {

  systemFolders = [
    { name: 'Inbox', icon: 'inbox', count: 0, path: 'inbox' },
    { name: 'Starred', icon: 'star', count: 3, path: 'starred' },
    { name: 'Sent', icon: 'send', count: null, path: 'sent' },
    { name: 'Drafts', icon: 'drafts', count: 2, path: 'drafts' },
    { name: 'Trash', icon: 'trash', count: 5, path: 'trash' }
  ];

  customFolders: Folder[] = [];

  bottomViews = [
    { name: 'Contacts', path: 'contacts' },
    { name: 'Filters & Rules', path: 'filters' }
  ];

  showFolders = true;
  showCreateFolderModal = false;
  showRenameFolderModal = false;
  newFolderName = '';
  renameFolderName = '';
  renamingFolder = '';

  constructor(
    private router: Router,
    private composeService: EmailComposeService,
    private emailService: EmailService,
    private folderService: FolderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCustomFolders();

    // Initial fetch
    this.emailService.refreshUnreadCount();

    // Subscribe to unread count updates
    this.emailService.unreadCount$.subscribe(count => {
      console.log('Sidebar received unread count update:', count);
      const inbox = this.systemFolders.find(f => f.path === 'inbox');
      if (inbox) {
        inbox.count = count;
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomFolders() {
    this.folderService.getAllFolders().subscribe({
      next: (response) => {
        console.log('Sidebar - Folders loaded:', response);
        // Filter out system folders (inbox, sent, drafts, trash) and the contacts folder
        // Only keep custom folders
        const allFolders = response.folders || [];
        this.customFolders = allFolders.filter((folder: any) =>
          (folder.type === 'CUSTOM' || folder.type === 'custom') &&
          folder.name.toLowerCase() !== 'contacts'
        );
        console.log('Sidebar - Custom folders only:', this.customFolders);
        // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Sidebar - Failed to load folders:', error);
        // Silently fail, folders section will just be empty
      }
    });
  }

  toggleFolders() {
    this.showFolders = !this.showFolders;
  }

  openCreateFolderModal() {
    this.newFolderName = '';
    this.showCreateFolderModal = true;
  }

  closeCreateFolderModal() {
    this.showCreateFolderModal = false;
    this.newFolderName = '';
  }

  createFolder() {
    if (this.newFolderName.trim()) {
      console.log('Sidebar - Creating folder:', this.newFolderName.trim());
      this.folderService.createFolder(this.newFolderName.trim()).subscribe({
        next: (response) => {
          console.log('Sidebar - Folder created:', response);
          this.closeCreateFolderModal();
          this.loadCustomFolders(); // Reload folders

          // Navigate to the new folder
          this.router.navigate(['/folder', this.newFolderName.trim()]);
        },
        error: (error) => {
          console.error('Sidebar - Failed to create folder:', error);
          alert('Failed to create folder: ' + (error.error?.error || 'Unknown error'));
          this.closeCreateFolderModal();
        }
      });
    }
  }

  navigateToFolder(folderName: string) {
    this.router.navigate(['/folder', folderName]);
  }

  deleteFolder(folderName: string) {
    if (confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
      console.log('Sidebar - Deleting folder:', folderName);
      this.folderService.deleteFolder(folderName).subscribe({
        next: (response) => {
          console.log('Sidebar - Folder deleted:', response);
          this.loadCustomFolders(); // Reload folders
          // Navigate to inbox if we're currently viewing the deleted folder
          if (this.router.url.includes(`/folder/${folderName}`)) {
            this.router.navigate(['/inbox']);
          }
        },
        error: (error) => {
          console.error('Sidebar - Failed to delete folder:', error);
          alert('Failed to delete folder: ' + (error.error?.error || 'Unknown error'));
        }
      });
    }
  }

  editFolder(folderName: string) {
    this.renamingFolder = folderName;
    this.renameFolderName = folderName;
    this.showRenameFolderModal = true;
  }

  closeRenameFolderModal() {
    this.showRenameFolderModal = false;
    this.renamingFolder = '';
    this.renameFolderName = '';
  }

  saveRenameFolder() {
    if (this.renameFolderName.trim() && this.renamingFolder) {
      console.log('Sidebar - Renaming folder from', this.renamingFolder, 'to', this.renameFolderName.trim());
      this.folderService.renameFolder(this.renamingFolder, this.renameFolderName.trim()).subscribe({
        next: (response) => {
          console.log('Sidebar - Folder renamed:', response);
          this.closeRenameFolderModal();
          this.loadCustomFolders(); // Reload folders
        },
        error: (error) => {
          console.error('Sidebar - Failed to rename folder:', error);
          alert('Failed to rename folder: ' + (error.error?.error || 'Unknown error'));
          this.closeRenameFolderModal();
        }
      });
    }
  }

  openCompose() {
    this.composeService.openCompose();
  }
}
