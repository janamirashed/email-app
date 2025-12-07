import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderService } from '../../../../core/services/folder.service';

interface Folder {
  name: string;
  type: 'system' | 'custom';
  emailCount?: number;
}

@Component({
  selector: 'app-folder-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './folder-list.html',
})
export class FolderList {
  systemFolders: Folder[] = [
    { name: 'Inbox', type: 'system', emailCount: 12 },
    { name: 'Starred', type: 'system', emailCount: 3 },
    { name: 'Sent', type: 'system', emailCount: 45 },
    { name: 'Drafts', type: 'system', emailCount: 2 },
    { name: 'Trash', type: 'system', emailCount: 5 },
  ];

  customFolders: Folder[] = [];

  // Dialog states
  showCreateDialog = false;
  showRenameDialog = false;
  showDeleteDialog = false;

  newFolderName = '';
  renameFolderOldName = '';
  renameFolderNewName = '';
  deleteFolderName = '';

  formError = '';

  constructor(private folderService: FolderService) {}

  // Open create folder dialog
  openCreateDialog() {
    this.newFolderName = '';
    this.formError = '';
    this.showCreateDialog = true;
  }

  // Create new folder
  createFolder() {
    if (!this.validateFolderName(this.newFolderName)) {
      return;
    }

    // Check if folder already exists
    if (this.folderExists(this.newFolderName)) {
      this.formError = 'Folder with this name already exists';
      return;
    }

    this.folderService.createFolder(this.newFolderName).subscribe({
      next: (response) => {
        console.log('Folder created successfully');
        this.customFolders.push({
          name: this.newFolderName,
          type: 'custom',
          emailCount: 0
        });
        this.closeCreateDialog();
      },
      error: (error) => {
        console.error('Error creating folder:', error);
        this.formError = error.error?.error || 'Failed to create folder';
      }
    });
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
    this.newFolderName = '';
    this.formError = '';
  }

  // Open rename folder dialog
  openRenameDialog(folder: Folder) {
    if (folder.type === 'system') {
      alert('Cannot rename system folders');
      return;
    }

    this.renameFolderOldName = folder.name;
    this.renameFolderNewName = folder.name;
    this.formError = '';
    this.showRenameDialog = true;
  }

  // Rename folder
  renameFolder() {
    if (!this.validateFolderName(this.renameFolderNewName)) {
      return;
    }

    if (this.renameFolderOldName === this.renameFolderNewName) {
      this.formError = 'New name must be different from old name';
      return;
    }

    if (this.folderExists(this.renameFolderNewName)) {
      this.formError = 'Folder with this name already exists';
      return;
    }

    this.folderService.renameFolder(this.renameFolderOldName, this.renameFolderNewName).subscribe({
      next: () => {
        console.log('Folder renamed successfully');
        const folder = this.customFolders.find(f => f.name === this.renameFolderOldName);
        if (folder) {
          folder.name = this.renameFolderNewName;
        }
        this.closeRenameDialog();
      },
      error: (error) => {
        console.error('Error renaming folder:', error);
        this.formError = error.error?.error || 'Failed to rename folder';
      }
    });
  }

  closeRenameDialog() {
    this.showRenameDialog = false;
    this.renameFolderOldName = '';
    this.renameFolderNewName = '';
    this.formError = '';
  }

  // Open delete folder dialog
  openDeleteDialog(folder: Folder) {
    if (folder.type === 'system') {
      alert('Cannot delete system folders');
      return;
    }

    this.deleteFolderName = folder.name;
    this.showDeleteDialog = true;
  }

  // Delete folder
  deleteFolder() {
    this.folderService.deleteFolder(this.deleteFolderName).subscribe({
      next: () => {
        console.log('Folder deleted successfully');
        this.customFolders = this.customFolders.filter(f => f.name !== this.deleteFolderName);
        this.closeDeleteDialog();
      },
      error: (error) => {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder. Please try again.');
      }
    });
  }

  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.deleteFolderName = '';
  }

  // Validation
  validateFolderName(name: string): boolean {
    this.formError = '';

    if (!name.trim()) {
      this.formError = 'Folder name is required';
      return false;
    }

    if (name.length > 50) {
      this.formError = 'Folder name must be less than 50 characters';
      return false;
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9\s_-]+$/;
    if (!validNameRegex.test(name)) {
      this.formError = 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores';
      return false;
    }

    // Check for reserved system folder names
    const reservedNames = ['inbox', 'starred', 'sent', 'drafts', 'trash'];
    if (reservedNames.includes(name.toLowerCase())) {
      this.formError = 'Cannot use reserved folder name';
      return false;
    }

    return true;
  }

  folderExists(name: string): boolean {
    const allFolders = [...this.systemFolders, ...this.customFolders];
    return allFolders.some(f => f.name.toLowerCase() === name.toLowerCase());
  }
}
