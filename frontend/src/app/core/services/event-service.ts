import {inject, Injectable, NgZone} from '@angular/core';
import { EMPTY, Observable, Observer, retry, Subject, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from './auth-service';
import { map } from 'rxjs/operators';
import { sseEvent } from '../models/sse-event.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly streamUrl: string = 'http://localhost:8080/event-stream';
  private readonly reconnnectionDelay: number = 5000
  private stopStream$ = new Subject<void>();
  private inboxRefresh$ = new Subject<void>();
  router = inject(Router);
  constructor(private ngZone: NgZone, private authService: AuthService) {

  }
  /**
   * Main method to get the stream of typed notifications.
   */
  public getEvents(): Observable<sseEvent> {
    return this.createEventObservable().pipe(
      // Parsing the json
      map((rawStringData: String) => {
        const cleanJSON = rawStringData.trim().replace(/^data:/, '').trim();
        return JSON.parse(cleanJSON) as sseEvent;
      }
      ),
      // Log out the user if their token is not valid
      tap((payload: sseEvent) => {
        if (payload.type === 'Token_Expired' && payload.token === this.authService.getToken()) {
          console.log('Token expired, logging out user');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        // Emit inbox refresh if current user received an email
        if (payload.type === 'Sent' && payload.to && payload.to.length > 0) {
          const currentUserEmail = localStorage.getItem('currentUser')+"@jaryn.com";
          console.log(currentUserEmail + ' ' + payload.to);
          if (currentUserEmail && payload.to.includes(currentUserEmail)) {
            console.log('New email received for current user, refreshing inbox');
            this.inboxRefresh$.next();
          }
        }
      }),
      takeUntil(this.stopStream$),
      retry({
        delay: (error) => {
          // For network failures, retrying after a 5s delay
          console.warn('SSE connection failed. Retrying in 5s.', error);
          return timer(this.reconnnectionDelay);
        }
      })
    )
  }

  /**
   * Sets up the EventSource connection and emits raw strings.
   */
  private createEventObservable(): Observable<string> {
    return new Observable<string>((observer: Observer<string>) => {
      let eventSource: EventSource | null = null;

      this.ngZone.runOutsideAngular(() => {
        try {
          // Create EventSource without a token (backend permits this route for now at least)
          eventSource = new EventSource(this.streamUrl);

          // Handle incoming messages
          eventSource.onmessage = (event: MessageEvent) => {
            this.ngZone.run(() => {
              observer.next(event.data);
            });
          };

          // Handle connection open
          eventSource.onopen = () => {
            console.log('SSE connection established');
          };

          // Handle errors
          eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);

            this.ngZone.run(() => {
              // Close the connection
              if (eventSource) {
                eventSource.close();
              }

              // Emit error to trigger retry logic
              observer.error(new Error('SSE connection failed'));
            });
          };
        } catch (error) {
          observer.error(error);
        }
      });

      // Cleanup function when unsubscribing
      return () => {
        if (eventSource) {
          console.log('Closing SSE connection');
          eventSource.close();
          eventSource = null;
        }
      };
    });
  }

  /**
   * Observable that emits when inbox should be refreshed (when current user receives email)
   */
  public getInboxRefresh(): Observable<void> {
    return this.inboxRefresh$.asObservable();
  }

  /**
   * Stop listening to the event stream
   */
  public stopEvents(): void {
    this.stopStream$.next();
  }
}
