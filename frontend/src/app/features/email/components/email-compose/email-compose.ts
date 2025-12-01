import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attachment } from '../../../../core/models/email.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-email-compose',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './email-compose.html',
})
export class EmailComposeComponent {
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  isComposing: boolean = true; // Simulates the visibility

  recipients: string = '';
  subject: string = '';
  priority: string = 'Normal';
  
  // Dummy attachments shown in the image
  attachments: Attachment[] = [
    //{}, {}
  ];

  closeCompose() {
    this.isComposing = false;
    // Logic to save draft
  }
}