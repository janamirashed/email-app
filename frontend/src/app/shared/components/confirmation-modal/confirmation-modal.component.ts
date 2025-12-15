import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService, ConfirmationOptions } from '../../../core/services/confirmation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styles: []
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  currentConfirmation: ConfirmationOptions | null = null;
  private subscription!: Subscription;

  constructor(
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscription = this.confirmationService.confirmation$.subscribe(confirmation => {
      this.currentConfirmation = confirmation;
      this.cdr.detectChanges();
    });
  }

  confirm() {
    this.confirmationService.handleResponse(true);
  }

  cancel() {
    this.confirmationService.handleResponse(false);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
