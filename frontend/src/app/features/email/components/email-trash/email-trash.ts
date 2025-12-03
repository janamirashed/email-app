import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../../../core/services/email.service';
import { Email } from '../../../../core/models/email.model';

@Component({
  selector: 'app-email-trash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-trash.html',
  styleUrls: ['./email-trash.css']
})
export class EmailTrashComponent implements OnInit {
  emails: Email[] = [];
  selectedEmailId: number | null = null;
  totalEmails: number = 0;
  selectedEmails: Set<number> = new Set();

  constructor(private emailService: EmailService) {}

  ngOnInit() {
    this.loadTrashEmails();
  }

  loadTrashEmails() {
    //
  }

  selectAll(){
    //
  }

  selectEmail(email: Email) {
    this.selectedEmailId = email.id;
  }

  toggleEmailSelection(emailId: number, event: Event) {
    event.stopPropagation();
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  restoreSelected() {
    //
  }

  permanentlyDeleteSelected() {
    //
  }

  emptyTrash() {
    //
  }
}