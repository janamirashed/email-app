import { inject, Injectable, NgZone } from '@angular/core';
import {Observable, Observer, retry, Subject, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from './auth-service';
import { map } from 'rxjs/operators';
import { sseEvent } from '../models/sse-event.model';
import {ActivatedRoute, Router} from '@angular/router';

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
  constructor(private ngZone: NgZone, private authService: AuthService ,
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
        if ((payload.type === 'Sent' || payload.type === 'Draft' )&& payload.to && payload.to.length > 0) {
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
  private createEventObservable(): Observable<string> {
    return new Observable<string>((observer: Observer<string>) => {
      const controller = new AbortController();
      const signal = controller.signal;

      this.ngZone.runOutsideAngular(async () => {
        try {
          const token = this.authService.getToken();
          const headers: HeadersInit = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(this.streamUrl, {
            headers,
            signal
          });

          if (!response.ok) {
            if (response.status === 401) {
              console.warn('SSE Unauthorized (401). Logging out.');
              this.ngZone.run(() => this.authService.logout());
              return; // Stop further processing
            }
            throw new Error(`SSE connection failed: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const parts = buffer.split('\n\n');
            buffer = parts.pop() || ''; // Keep the incomplete part

            for (const part of parts) {
              const lines = part.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.substring(5).trim();
                  if (data) {
                    this.ngZone.run(() => observer.next(data));
                  }
                }
              }
            }
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('SSE error:', error);
            this.ngZone.run(() => observer.error(error));
          }
        }
      });

      return () => {
        console.log('Closing SSE connection');
        controller.abort();
      };
    });
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

  /**
   * Stop listening to the event stream
   */
  public stopEvents(): void {
    this.stopStream$.next();
  }

clearEmailSelection(messageIds: string[]) {
  if(this.route.snapshot.queryParamMap.get("messageId")){
    if (messageIds.includes(this.route.snapshot.queryParamMap.get("messageId")!.toString())){
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
