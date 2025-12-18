import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Observer, retry, Subject, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from './auth-service';
import { map } from 'rxjs/operators';
import { sseEvent } from '../models/sse-event.model';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly streamUrl: string = 'http://localhost:8080/event-stream';
  private readonly reconnnectionDelay: number = 5000
  private stopStream$ = new Subject<void>();
  private inboxRefresh$ = new Subject<void>();
  private folderRefresh$ = new Subject<void>();
  router = inject(Router);
  constructor(private ngZone: NgZone, private authService: AuthService,
    private route: ActivatedRoute) {

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
      tap((payload: sseEvent) => {
        // Emit inbox refresh if current user received an email
        if ((payload.type === 'Received' || payload.type === 'Draft') && payload.to && payload.to.length > 0) {
          const currentUserEmail = localStorage.getItem('currentUser') + "@jaryn.com";
          console.log(currentUserEmail + ' ' + payload.to);
          if (payload.to.includes(currentUserEmail)) {
            if (currentUserEmail) {
              console.log('New email received for current user, refreshing inbox');
            } else if (currentUserEmail) {
              console.log('New email drafted by current user, refreshing draft');
            }
            this.folderRefresh$.next();
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
   * Sets up the EventSource connection using fetch to support Bearer auth.
   */
  private worker: Worker | null = null;

  /**
   * Sets up the EventSource connection using a Web Worker.
   */
  private createEventObservable(): Observable<string> {
    return new Observable<string>((observer: Observer<string>) => {
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(new URL('../workers/sse.worker', import.meta.url));

        this.worker.onmessage = ({ data }) => {
          if (data.type === 'EVENT') {
            this.ngZone.run(() => observer.next(data.payload));
          } else if (data.type === 'ERROR') {
            if (data.error.status === 401) {
              console.warn('SSE Unauthorized (401). Logging out.');
              this.ngZone.run(() => this.authService.logout());
            } else {
              console.error('SSE Worker Error:', data.error);
              this.ngZone.run(() => observer.error(data.error));
            }
          }
        };

        const token = this.authService.getToken();
        this.worker.postMessage({
          type: 'CONNECT',
          payload: {
            url: this.streamUrl,
            token: token
          }
        });
      } else {
        // Fallback for environments without Web Worker support (though unlikely in modern browsers)
        console.warn('Web Workers are not supported in this environment. SSE might be throttled in background.');
        // ... (Original fetch logic could go here as fallback, but for now we assume worker support)
        observer.error(new Error('Web Workers not supported'));
      }

      return () => {
        console.log('Closing SSE connection');
        this.stopEvents();
      };
    });
  }

  /**
   * Stop listening to the event stream
   */
  public stopEvents(): void {
    this.stopStream$.next();
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' });
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Observable that emits when email list should be refreshed (e.g., after drag-and-drop move)
   */
  public getEmailListRefresh(): Observable<void> {
    return this.folderRefresh$.asObservable();
  }

  /**
   * Trigger email list refresh (called after moving emails)
   */
  public triggerEmailListRefresh(): void {
    this.folderRefresh$.next();
  }



  clearEmailSelection(messageIds: string[]) {
    if (this.route.snapshot.queryParamMap.get("messageId")) {
      if (messageIds.includes(this.route.snapshot.queryParamMap.get("messageId")!.toString())) {
        this.router.navigate(
          [],
          {
            relativeTo: this.route,
            queryParams: {},
            queryParamsHandling: ''
          }
        );
      }

    }
  }


}
