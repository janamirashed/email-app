import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Email, Attachment } from '../../../../core/models/email.model';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.html',
})
export class EmailDetailComponent implements OnChanges {
  // Simulating input from the list component
  @Input() emailId: number = 1;

  // Placeholder for the full email data
  email: Email | null = null;
  
  // Dummy Email Data (matches image)
  private dummyEmailData: Email[] = [
    { 
      id: 1, 
      senderName: 'Alex Johnson', 
      senderEmail: 'alex.j@example.com', 
      subject: 'Project Update & Next Steps', 
      body: "Hi team, \n\nHere's the latest update on the project. I've attached the revised timeline for your review. Please let me know if you have any feedback by EOD tomorrow.\n\nKey highlights:\n\n* Phase 1 is 90% complete.\n* User testing for Phase 2 will begin next Monday.\n* We are on track to meet the Q4 launch deadline.\n\nPlease review the attached document for a detailed breakdown of tasks and deadlines.\n\nThanks,\nAlex", 
      timestamp: 'Oct 29, 2023, 10:42 AM', 
      isRead: true, 
      isStarred: false,
      attachments: [{ name: 'Revised_Timeline.pdf', size: '2.1 MB', url: '#' }]
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['emailId']) {
      // In a real app, this would call a service to fetch the email by ID
      this.email = this.dummyEmailData.find(e => e.id === this.emailId) || null;
    }
  }

  // Helper to format the body content
  getBodyLines(body: string): string[] {
    return body ? body.split('\n') : [];
  }
}