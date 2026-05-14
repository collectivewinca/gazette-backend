import { pbFetch, getPocketBaseUrl } from '@/lib/pocketbase';
import type { Member, GuestbookEntry, TimeCapsuleMessage, Class } from '@/lib/types';

export async function getMember(id: string): Promise<Member | null> {
  try {
    const data = await pbFetch<any>(`/api/collections/members/records/${id}?expand=class_id`);
    return {
      id: data.id,
      class_id: data.class_id,
      user_id: data.user_id || null,
      name: data.name,
      email: data.email || null,
      quote: data.quote || null,
      future: data.future || null,
      song: data.song || null,
      role: data.role || null,
      avatar_url: data.avatar_url || null,
      photo_url: data.photo_url || null,
      member_type: data.member_type || 'graduate',
      is_profile_complete: data.is_profile_complete || false,
      nfc_programmed: data.nfc_programmed || false,
      sort_order: data.sort_order || 0,
      created_at: data.created || data.id,
      updated_at: data.updated || data.id,
    };
  } catch {
    return null;
  }
}

export async function getClassMembers(classId: string): Promise<Member[]> {
  const data = await pbFetch<any>(`/api/collections/members/records?filter=(class_id='${classId}')&sort=-sort_order,name&perPage=200`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    class_id: r.class_id,
    user_id: r.user_id || null,
    name: r.name,
    email: r.email || null,
    quote: r.quote || null,
    future: r.future || null,
    song: r.song || null,
    role: r.role || null,
    avatar_url: r.avatar_url || null,
    photo_url: r.photo_url || null,
    member_type: r.member_type || 'graduate',
    is_profile_complete: r.is_profile_complete || false,
    nfc_programmed: r.nfc_programmed || false,
    sort_order: r.sort_order || 0,
    created_at: r.created || r.id,
    updated_at: r.updated || r.id,
  }));
}

export async function getGuestbookEntries(memberId: string): Promise<GuestbookEntry[]> {
  const data = await pbFetch<any>(`/api/collections/guestbook_entries/records?filter=(member_id='${memberId}')&sort=-id&perPage=50`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    member_id: r.member_id,
    author_id: r.author_id || null,
    author_name: r.author_name || null,
    message: r.message,
    created_at: r.created || r.id,
  }));
}

export async function getTimeCapsuleMessages(memberId: string): Promise<TimeCapsuleMessage[]> {
  const data = await pbFetch<any>(`/api/collections/time_capsule_messages/records?filter=(member_id='${memberId}')&sort=-id`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    member_id: r.member_id,
    author_id: r.author_id || null,
    author_name: r.author_name || null,
    message: r.message,
    open_date: r.open_date,
    is_sealed: r.is_sealed || false,
    created_at: r.created || r.id,
  }));
}

export async function getClassByCode(code: string): Promise<Class | null> {
  try {
    const data = await pbFetch<any>(`/api/collections/classes/records?filter=(code='${code.toUpperCase()}')&perPage=1`);
    if (data.items && data.items.length > 0) {
      const r = data.items[0];
      return {
        id: r.id,
        name: r.name,
        code: r.code,
        school: r.school || null,
        year: r.year,
        theme: r.theme || 'gazette',
        lock_date: r.lock_date || null,
        created_at: r.created || r.id,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getFirstClass(): Promise<Class | null> {
  try {
    const data = await pbFetch<any>(`/api/collections/classes/records?sort=-id&perPage=1`);
    if (data.items && data.items.length > 0) {
      const r = data.items[0];
      return {
        id: r.id,
        name: r.name,
        code: r.code,
        school: r.school || null,
        year: r.year,
        theme: r.theme || 'gazette',
        lock_date: r.lock_date || null,
        created_at: r.created || r.id,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSeniorWills(classId: string) {
  const data = await pbFetch<any>(`/api/collections/senior_wills/records?filter=(class_id='${classId}')&sort=id&expand=from_member_id`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    class_id: r.class_id,
    from_member_id: r.from_member_id,
    to_recipient: r.to_recipient,
    item: r.item,
    created_at: r.created || r.id,
    from_member: r.expand?.from_member_id ? { id: r.expand.from_member_id.id, name: r.expand.from_member_id.name } : undefined,
  }));
}

export async function getSuperlatives(classId: string) {
  const data = await pbFetch<any>(`/api/collections/superlatives/records?filter=(class_id='${classId}')&sort=id&expand=winner_id`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    class_id: r.class_id,
    title: r.title,
    winner_id: r.winner_id || null,
    created_at: r.created || r.id,
    winner: r.expand?.winner_id ? { id: r.expand.winner_id.id, name: r.expand.winner_id.name } : undefined,
  }));
}

export async function getTimeline(classId: string) {
  const data = await pbFetch<any>(`/api/collections/timeline_events/records?filter=(class_id='${classId}')&sort=sort_order&perPage=200`);
  return (data.items || []).map((r: any) => ({
    id: r.id,
    class_id: r.class_id,
    month: r.month,
    event_name: r.event_name,
    description: r.description || null,
    event_date: r.event_date || null,
    sort_order: r.sort_order || 0,
    created_at: r.created || r.id,
  }));
}
