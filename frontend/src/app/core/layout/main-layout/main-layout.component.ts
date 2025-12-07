import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { Header } from '../../../shared/components/header/header';
import { EmailComposeComponent } from '../../../features/email/components/email-compose/email-compose';
import { EmailComposeService } from '../../services/email-compose.service';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        SidebarComponent,
        Header,
        EmailComposeComponent
    ],
    templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    isComposing = false;
    private composeSubscription?: Subscription;

    constructor(private composeService: EmailComposeService) { }

    ngOnInit() {
        this.composeSubscription = this.composeService.isComposing$.subscribe(
            isComposing => this.isComposing = isComposing
        );
    }

    ngOnDestroy() {
        this.composeSubscription?.unsubscribe();
    }
}
