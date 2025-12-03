import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css' // Assuming basic styles for width/flex
})
export class HeaderComponent {
  // Placeholder for current users initials
  userInitials: string = 'MR';
  // Placeholder for search term
  searchTerm: string = '';

  onSearch() {
    console.log('Searching for:', this.searchTerm);
    // Logic to trigger global search
  }
}
