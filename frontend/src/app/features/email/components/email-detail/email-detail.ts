import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Email} from '../../../../core/models/email.model';
import { Attachment } from '../../../../core/models/attachment.model';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.html',
})
export class EmailDetail implements OnChanges {
  // Simulating input from the list component
  @Input() emailId: number = 1;

  // Placeholder for the full email data
  email: Email | null = null;

  // Dummy Email Data (matches image)
  private dummyEmailData: Email[] = [
    {
      id: 1,
      senderName : 'Alex J',
      senderEmail: 'alex.j@example.com',
      subject: 'Project Update & Next Steps',
      priority : 2,
      body: "Hi team, \n\nHere's the latest update on the project. I've attached the revised timeline for your review. Please let me know if you have any feedback by EOD tomorrow.\n\nKey highlights:\n\n* Phase 1 is 90% complete.\n* User testing for Phase 2 will begin next Monday.\n* We are on track to meet the Q4 launch deadline.\n\nPlease review the attached document for a detailed breakdown of tasks and deadlines.\n\nThanks,\nAlex",
      timestamp: 'Oct 29, 2023, 10:42 AM',
      isRead: true,
      isStarred: false,
      attachments: [{id : "", fileName: 'Revised_Timeline.pdf', mimeType: 'application/json'}]
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
