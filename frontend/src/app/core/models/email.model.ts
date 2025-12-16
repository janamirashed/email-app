import { Attachment } from './attachment.model';

// Main Email interface - matches backend Email model exactly
export interface Email {
  messageId?: string;
  from?: string;
  to: string[];
  subject: string;
  body: string;
  timestamp?: string;
  priority?: number; // 1-4 (1=Highest, 4=Lowest)
  read?: boolean;
  starred?: boolean;
  draft?: boolean;
  folder?: string;
  attachments?: Attachment[];
  deletedAt?: string;
}
