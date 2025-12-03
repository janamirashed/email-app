import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { HeaderComponent } from './shared/components/header/header';
import { EmailComposeComponent } from './features/email/components/email-compose/email-compose';
import { EmailComposeService } from './core/services/email-compose.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    EmailComposeComponent
  ],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit, OnDestroy {
  isComposing = false;
  private composeSubscription?: Subscription;

  constructor(private composeService: EmailComposeService) {}

  ngOnInit() {
    this.composeSubscription = this.composeService.isComposing$.subscribe(
      isComposing => this.isComposing = isComposing
    );
  }

  ngOnDestroy() {
    this.composeSubscription?.unsubscribe();
  }
}