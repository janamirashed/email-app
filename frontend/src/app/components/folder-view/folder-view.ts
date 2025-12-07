import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  FolderDialogComponent } from '../../features/folder/components/folder-dialog/folder-dialog';
import { FolderList } from '../../features/folder/components/folder-list/folder-list';

@Component({
  selector: 'app-folder-view',
  standalone: true,
  imports: [CommonModule,FolderList, FolderDialogComponent],
  templateUrl: './folder-view.html'
})
export class FolderViewComponent {}
