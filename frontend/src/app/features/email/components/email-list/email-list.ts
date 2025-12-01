import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Email } from '../../../../core/models/email.model';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-list.html',
})
export class EmailListComponent {
  totalEmails = 2345;
  
  // Dummy data 
  emails: Email[] = [
    { id: 1, senderName: 'Yousef Walid', senderEmail: 'ledo.@example.com', subject: 'i am an addict', body: 'cannot stop playing fc 25 ', timestamp: '10:42 AM', isRead: false, isStarred: false },
    { id: 2, senderName: 'Nour Atawy', senderEmail: 'nelatawy.@example.com', subject: 'my life is a mess', body: 'welcome to team ?', timestamp: '3:15 AM', isRead: true, isStarred: false },
    { id: 3, senderName: 'jana Rashed', senderEmail: 'newsletter@design.com', subject: 'maybe something nice ??', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 4, senderName: 'Saudox', senderEmail: 'newsletter@design.com', subject: 'get a life brother', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
  ];

  selectedEmailId: number = 1; // Default selected email

  selectEmail(email: Email) {
    this.selectedEmailId = email.id;
    // call a service to load detail component
    console.log('Selected email:', email.id);
  }
}