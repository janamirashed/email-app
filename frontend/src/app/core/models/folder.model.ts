export interface Folder {
  name: string;
  icon: string; // e.g., 'inbox', 'starred', 'trash'
  count?: number;
  type: 'system' | 'custom';
}