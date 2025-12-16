export interface sseEvent {
  type: 'Draft' | 'Sent' | string;
  to: string[]; // Array of recipient emails
}
