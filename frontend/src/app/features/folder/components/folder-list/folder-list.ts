import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

interface Folder {
  id: number;
  name: string;
  color: string;
  emailCount: number;
}

@Component({
  selector: 'app-folder-list',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './folder-list.html',
  styleUrl: './folder-list.css',
})
export class FolderListComponent {
  showAddDialog = false;
  showEditDialog = false;
  editingFolder: Folder | null = null;
  newFolderName = '';

  folders: Folder[] = [
    { id: 1, name: 'Work', color: 'indigo', emailCount: 24 },
    { id: 2, name: 'Personal', color: 'green', emailCount: 12 },
    { id: 3, name: 'Projects', color: 'purple', emailCount: 8 }
  ];

  createFolder() {
    this.newFolderName = '';
    this.showAddDialog = true;
  }

  saveNewFolder() {
    if (this.newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now(),
        name: this.newFolderName.trim(),
        color: 'blue',
        emailCount: 0
      };
      this.folders.push(newFolder);
      this.showAddDialog = false;
      this.newFolderName = '';
      console.log('Created folder:', newFolder);
    }
  }

  editFolder(folder: Folder) {
    this.editingFolder = { ...folder };
    this.newFolderName = folder.name;
    this.showEditDialog = true;
  }

  saveEditFolder() {
    if (this.editingFolder && this.newFolderName.trim()) {
      const index = this.folders.findIndex(f => f.id === this.editingFolder!.id);
      if (index !== -1) {
        this.folders[index].name = this.newFolderName.trim();
        this.showEditDialog = false;
        this.editingFolder = null;
        this.newFolderName = '';
        console.log('Updated folder');
      }
    }
  }

  deleteFolder(folder: Folder) {
    if (confirm(`Delete folder "${folder.name}"?`)) {
      this.folders = this.folders.filter(f => f.id !== folder.id);
      console.log('Deleted folder:', folder.name);
    }
  }

  cancelDialog() {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.editingFolder = null;
    this.newFolderName = '';
  }

  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'indigo': 'bg-indigo-100 text-indigo-600',
      'green': 'bg-green-100 text-green-600',
      'purple': 'bg-purple-100 text-purple-600',
      'blue': 'bg-blue-100 text-blue-600',
      'red': 'bg-red-100 text-red-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  }
}
