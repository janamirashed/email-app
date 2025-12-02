import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { EmailListComponent } from './features/email/components/email-list/email-list';
import { EmailDetailComponent } from './features/email/components/email-detail/email-detail';
import { ContactListComponent } from './features/contact/components/contact-list/contact-list';
import { FilterListComponent } from './features/filter/components/filter-list/filter-list';
import { EmailComposeComponent } from './features/email/components/email-compose/email-compose';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    SidebarComponent, 
    EmailListComponent,
    EmailDetailComponent,
    ContactListComponent,
    FilterListComponent,
    EmailComposeComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  activeRoute: string = 'inbox'; 

  // This method handles the view change event from the sidebar
  onViewChange(view: string) {
    this.activeRoute = view;
    console.log('Active route changed to:', view);
  }
}