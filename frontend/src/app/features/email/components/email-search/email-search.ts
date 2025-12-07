import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Email } from '../../../../core/models/email.model';
import { EmailService } from '../../../../core/services/email.service';

@Component({
  selector: 'app-email-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-search.html',
})
export class EmailSearchComponent {
  searchKeyword = '';
  searchBy: 'all' | 'subject' | 'sender' | 'receiver' | 'body' = 'all';
  sortBy = 'date';

  searchResults: Email[] = [];
  isSearching = false;
  hasSearched = false;
  selectedEmailId: string | null = null;

  constructor(private emailService: EmailService) {}

  performSearch() {
    if (!this.searchKeyword.trim()) {
      return;
    }

    this.isSearching = true;
    this.hasSearched = false;

    this.emailService.searchEmails(this.searchKeyword, this.searchBy, this.sortBy).subscribe({
      next: (response) => {
        this.searchResults = response.results || [];
        this.isSearching = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('Search failed:', error);
        this.isSearching = false;
        this.hasSearched = true;
      }
    });
  }

  clearSearch() {
    this.searchKeyword = '';
    this.searchResults = [];
    this.hasSearched = false;
    this.selectedEmailId = null;
  }

  selectEmail(email: Email) {
    this.selectedEmailId = email.messageId;
    // Mark as read when selected
    if (!email.isRead) {
      this.emailService.markAsRead(email.messageId).subscribe({
        next: () => {
          email.isRead = true;
        },
        error: (error) => console.error('Error marking as read:', error)
      });
    }
  }

  changeSortBy(newSortBy: string) {
    this.sortBy = newSortBy;
    if (this.hasSearched) {
      this.performSearch();
    }
  }
}
