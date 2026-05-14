export interface Class {
  id: string;
  name: string;
  code: string;
  school: string | null;
  year: number;
  theme: string;
  lock_date: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  class_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  quote: string | null;
  future: string | null;
  song: string | null;
  role: string | null;
  avatar_url: string | null;
  photo_url: string | null;
  member_type: 'graduate' | 'faculty';
  is_profile_complete: boolean;
  nfc_programmed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GuestbookEntry {
  id: string;
  member_id: string;
  author_id: string | null;
  author_name: string | null;
  message: string;
  created_at: string;
}

export interface TimeCapsuleMessage {
  id: string;
  member_id: string;
  author_id: string | null;
  author_name: string | null;
  message: string;
  open_date: string;
  is_sealed: boolean;
  created_at: string;
}

export interface SeniorWill {
  id: string;
  class_id: string;
  from_member_id: string;
  to_recipient: string;
  item: string;
  created_at: string;
  from_member?: Member;
}

export interface Superlative {
  id: string;
  class_id: string;
  title: string;
  winner_id: string | null;
  created_at: string;
  winner?: Member;
}

export interface TimelineEvent {
  id: string;
  class_id: string;
  month: string;
  event_name: string;
  description: string | null;
  event_date: string | null;
  sort_order: number;
  created_at: string;
}

export interface ClassStats {
  total: number;
  complete: number;
  nfc_programmed: number;
  completion_pct: number;
}
