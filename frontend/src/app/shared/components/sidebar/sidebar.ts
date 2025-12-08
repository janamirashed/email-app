import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EmailComposeService } from '../../../core/services/email-compose.service';
import {FormsModule} from '@angular/forms';

interface Folder {
  id: number;
  name: string;
  color: string;
  emailCount: number;
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
    { name: 'Inbox', icon: 'inbox', count: 12, path: 'inbox' },
    { name: 'Starred', icon: 'star', count: 3, path: 'starred' },
    { name: 'Sent', icon: 'send', count: null, path: 'sent' },
    { name: 'Drafts', icon: 'drafts', count: 2, path: 'drafts' },
    { name: 'Trash', icon: 'trash', count: 5, path: 'trash' }
  ];

  customFolders: Folder[] = [
    { id: 1, name: 'Work', color: 'indigo', emailCount: 24 },
    { id: 2, name: 'Personal', color: 'green', emailCount: 12 }
  ];

  bottomViews = [
    { name: 'Contacts', path: 'contacts' },
    { name: 'Filters & Rules', path: 'filters' }
  ];

  showFolders = true;
  showCreateFolderModal = false;
  newFolderName = '';

  constructor(private router: Router, private composeService: EmailComposeService) { }

  ngOnInit() { }

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
      const newFolder: Folder = {
        id: Date.now(),
        name: this.newFolderName.trim(),
        color: 'blue',
        emailCount: 0
      };
      this.customFolders.push(newFolder);
      this.closeCreateFolderModal();
      console.log('Created folder:', newFolder);

      // Navigate to the new folder
      this.router.navigate(['/folder', newFolder.name.toLowerCase()]);
    }
  }

  openCompose() {
    this.composeService.openCompose();
  }
}
