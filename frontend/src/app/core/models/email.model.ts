export interface Email {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestamp: string; // e.g., '10:42 AM' or 'Oct 29, 2023'
  isRead: boolean;
  isStarred: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  size: string; // e.g., '2.1 MB'
  url: string;
}