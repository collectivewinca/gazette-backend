'use server';

import { pbFetch, getPocketBaseUrl } from '@/lib/pocketbase';
import { revalidatePath } from 'next/cache';

export async function validateClassCode(code: string) {
  try {
    const data = await pbFetch<any>(`/api/collections/classes/records?filter=(code='${code.toUpperCase()}')&perPage=1`);
    if (data.items && data.items.length > 0) {
      const r = data.items[0];
      return { valid: true, class: { id: r.id, name: r.name, code: r.code, school: r.school, year: r.year } };
    }
    return { valid: false, class: null };
  } catch {
    return { valid: false, class: null };
  }
}


async function requireClassCode(classCode: string): Promise<string> {
  const result = await validateClassCode(classCode);
  if (!result.valid || !result.class) {
    throw new Error('Invalid class code. Please enter your class code to continue.');
  }
  return result.class.id;
}

export async function claimProfile(data: {
  classId: string;
  name: string;
  email: string;
  quote: string;
  future: string;
  song: string;
  role?: string;
  avatarDataUrl?: string;
}) {
  try {
    const record: any = {
      class_id: data.classId,
      name: data.name,
      email: data.email || '',
      quote: data.quote,
      future: data.future || '',
      song: data.song || '',
      role: data.role || '',
      member_type: 'graduate',
      is_profile_complete: true,
    };

    if (data.avatarDataUrl) {
      const formData = new FormData();
      Object.entries(record).forEach(([k, v]) => formData.append(k, String(v)));
      const base64 = data.avatarDataUrl.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64}`).then(r => r.blob());
      formData.append('avatar_url', blob, 'avatar.png');

      const result = await pbFetch<any>('/api/collections/members/records', {
        method: 'POST',
        body: formData,
      });
      return { success: true, memberId: result.id };
    }

    const result = await pbFetch<any>('/api/collections/members/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    return { success: true, memberId: result.id };
  } catch (e: any) {
    return { success: false, error: e.message || 'Something went wrong.' };
  }
}

export async function updateProfile(memberId: string, updates: {
  quote?: string;
  future?: string;
  song?: string;
  role?: string;
  avatarDataUrl?: string;
  classCode?: string;
}) {
  try {
    if (updates.classCode) {
      await requireClassCode(updates.classCode);
    }
    if (updates.avatarDataUrl) {
      const formData = new FormData();
      if (updates.quote !== undefined) formData.append('quote', updates.quote);
      if (updates.future !== undefined) formData.append('future', updates.future);
      if (updates.song !== undefined) formData.append('song', updates.song);
      if (updates.role !== undefined) formData.append('role', updates.role);
      formData.append('is_profile_complete', 'true');
      const base64 = updates.avatarDataUrl.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64}`).then(r => r.blob());
      formData.append('avatar_url', blob, 'avatar.png');

      await pbFetch<any>(`/api/collections/members/records/${memberId}`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      const patch: Record<string, string> = {};
      if (updates.quote !== undefined) patch.quote = updates.quote;
      if (updates.future !== undefined) patch.future = updates.future;
      if (updates.song !== undefined) patch.song = updates.song;
      if (updates.role !== undefined) patch.role = updates.role;
      patch.is_profile_complete = 'true';

      await pbFetch<any>(`/api/collections/members/records/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    }
    revalidatePath(`/m/${memberId}`);
    revalidatePath(`/m/${memberId}/edit`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function signGuestbook(data: {
  memberId: string;
  authorName: string;
  message: string;
  classCode: string;
}) {
  try {
    await requireClassCode(data.classCode);
    await pbFetch<any>('/api/collections/guestbook_entries/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: data.memberId,
        author_name: data.authorName,
        message: data.message,
      }),
    });
    revalidatePath(`/m/${data.memberId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function sealTimeCapsule(data: {
  memberId: string;
  authorName: string;
  message: string;
  openDate: string;
  classCode: string;
}) {
  try {
    await requireClassCode(data.classCode);
    await pbFetch<any>('/api/collections/time_capsule_messages/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: data.memberId,
        author_name: data.authorName,
        message: data.message,
        open_date: data.openDate,
        is_sealed: true,
      }),
    });
    revalidatePath(`/m/${data.memberId}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createWill(data: {
  classId: string;
  fromMemberId: string;
  toRecipient: string;
  item: string;
  classCode: string;
}) {
  try {
    const verifiedClassId = await requireClassCode(data.classCode);
    await pbFetch<any>('/api/collections/senior_wills/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_id: verifiedClassId,
        from_member_id: data.fromMemberId,
        to_recipient: data.toRecipient,
        item: data.item,
      }),
    });
    revalidatePath('/wills');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function markTagProgrammed(memberId: string) {
  try {
    await pbFetch<any>(`/api/collections/members/records/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfc_programmed: true }),
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getClassStats(classId: string) {
  try {
    const members = await pbFetch<any>(`/api/collections/members/records?filter=(class_id='${classId}')&perPage=500`);
    const total = members.totalItems;
    const complete = members.items.filter((m: any) => m.is_profile_complete).length;
    const nfcProgrammed = members.items.filter((m: any) => m.nfc_programmed).length;
    return {
      total,
      complete,
      nfc_programmed: nfcProgrammed,
      completion_pct: total > 0 ? Math.round((complete / total) * 100) : 0,
    };
  } catch {
    return null;
  }
}

export async function uploadRoster(classId: string, members: { name: string; email?: string; member_type: string }[]) {
  try {
    let count = 0;
    for (let i = 0; i < members.length; i++) {
      await pbFetch<any>('/api/collections/members/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          name: members[i].name,
          email: members[i].email || '',
          member_type: members[i].member_type || 'graduate',
          sort_order: i,
        }),
      });
      count++;
    }
    revalidatePath('/admin');
    return { success: true, count };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
