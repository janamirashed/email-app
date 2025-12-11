export interface Filter {
  id?: string;
  name?: string;
  property: string;  // 'subject', 'body', 'from'
  value: string;
  matcher: string;   // 'contains', 'is exactly', 'starts with'
  action: string;    // 'move', 'star', 'delete', 'markread'
  newFolder?: string; // Only used when action is 'move'
}
