export interface sseEvent {
  type: 'Token_Expired' | 'Sent' | string;
  token: string;
  to: string[]; // Array of recipient emails
}
