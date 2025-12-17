export interface sseEvent {
  type: 'Draft' | 'Received' | string;
  to: string[]; // Array of recipient emails
}
