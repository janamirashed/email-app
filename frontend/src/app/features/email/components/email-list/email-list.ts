import { Component , OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    { id: 5, senderName: 'Yousef Walid', senderEmail: 'newsletter@design.com', subject: 'clipBorad isn\'t clipboarding', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 6, senderName: 'Nour Atawy', senderEmail: 'newsletter@design.com', subject: 'did you see that database performance?, i was salivating brotha', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 7, senderName: 'Saudox', senderEmail: 'newsletter@design.com', subject: 'My name is skyler white yo', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 8, senderName: 'Saudox', senderEmail: 'newsletter@design.com', subject: 'My husband name is walter white YO', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 9, senderName: 'jana rashed', senderEmail: 'newsletter@design.com', subject: 'sheet 7 is online 😁', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
    { id: 10, senderName: 'ismael yamany', senderEmail: 'newsletter@design.com', subject: 'ngl gmail is overrated af', body: '', timestamp: 'Yesterday', isRead: true, isStarred: true },
  ];

  selectedEmailId: number = 1; // Default selected email
   currentFolder = 'inbox';
   
  selectEmail(email: Email) {
    this.selectedEmailId = email.id;
    // call a service to load detail component
    console.log('Selected email:', email.id);
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the current route to determine which folder we're in
    this.route.url.subscribe(urlSegments => {
      this.currentFolder = urlSegments[0]?.path || 'inbox';
      this.loadEmailsForFolder();
    });
  }

  loadEmailsForFolder() {
    // Load emails based on this.currentFolder
    // This is where you'd filter your emails based on the folder
    console.log('Loading emails for:', this.currentFolder);
  }
}