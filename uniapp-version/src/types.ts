export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  isBig?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}
