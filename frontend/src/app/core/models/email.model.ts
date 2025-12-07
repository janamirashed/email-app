import {Attachment} from './attachment.model';

// export interface Email {
//   id: number;
//   senderName : string
//   senderEmail : string
//   subject: string;
//   body: string;
//   priority? : number;
//   timestamp: string; // e.g., '10:42 AM' or 'Oct 29, 2023'
//   isRead: boolean;
//   isStarred: boolean;
//   attachments?: Attachment[];
// }

export interface Email {
  messageId: string;
  senderName: string;
  senderEmail: string;
  to?: string[];
  subject: string;
  body: string;
  priority?: number;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isDraft?: boolean;
  folder?: string;
  attachments?: Attachment[];
}
