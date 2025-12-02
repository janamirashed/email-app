import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attachment } from '../../../../core/models/email.model';
import { FormsModule } from '@angular/forms';
import { EmailComposeService } from '../../../../core/services/email-compose.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-email-compose',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './email-compose.html',
})
export class EmailComposeComponent {
  
  isComposing: boolean = true; // Simulates the visibility

  recipients: string = '';
  subject: string = '';
  priority: string = 'Normal';
  
  // Dummy attachments shown in the image
  attachments: Attachment[] = [
    //{}, {}
  ];

  private composeSubscription!: Subscription ; 

  
  constructor(private composeService: EmailComposeService) {}


  ngOnInit() {
    
    this.composeSubscription = this.composeService.isComposing$.subscribe(
      (isVisible) => {
        this.isComposing = isVisible;
        
      }
    );
  }

  closeCompose() {
    this.isComposing = false;
    
  }

  ngOnDestroy() {
    
    this.composeSubscription.unsubscribe();
  }
}