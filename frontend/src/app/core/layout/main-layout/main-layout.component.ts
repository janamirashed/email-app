import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/header/header';
import { EmailComposeComponent } from '../../../features/email/components/email-compose/email-compose';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { EmailComposeService } from '../../services/email-compose.service';
import { EventService } from '../../services/event-service';
import { sseEvent } from '../../models/sse-event.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    EmailComposeComponent,
    ToastComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isComposing = false;
  private composeSubscription?: Subscription;
  private eventSubscription?: Subscription;
  constructor(private composeService: EmailComposeService, private eventService: EventService, private authService: AuthService) { }

  ngOnInit() {
    this.composeSubscription = this.composeService.isComposing$.subscribe(
      isComposing => this.isComposing = isComposing
    );
    this.eventSubscription = this.eventService.getEvents()
      .subscribe({
        next: (notification: sseEvent) => {
          console.log('SSE Event received in layout:', notification);
          // Handle valid events here
        },
        error: (err) => {
          console.error('SSE subscription error:', err);

          if (err && err.status === 401) {
            console.warn('SSE Unauthorized (401) detected in component. Logging out.');
            this.authService.logout();
          }
        },
        complete: () => console.log('SSE stream completed')
      });


  }
  ngOnDestroy() {
    this.composeSubscription?.unsubscribe();
    this.eventSubscription?.unsubscribe();
    this.eventService.stopEvents();
  }
}
