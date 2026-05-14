'use client';

import { useEffect, useState } from 'react';
import { TagRow } from './tag-row';
import type { Member } from '@/lib/types';

export function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<{ total: number; complete: number; nfc_programmed: number; completion_pct: number } | null>(null);
  const [className, setClassName] = useState('');
  const [school, setSchool] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || '';
        
        const classRes = await fetch(`${pbUrl}/api/collections/classes/records?sort=-id&perPage=1`);
        const classData = await classRes.json();
        if (classData.items?.[0]) {
          const cls = classData.items[0];
          setClassName(cls.name);
          setSchool(cls.school || '');
          setCode(cls.code);
          
          const membersRes = await fetch(`${pbUrl}/api/collections/members/records?filter=(class_id='${cls.id}')&sort=-sort_order,name&perPage=200`);
          const membersData = await membersRes.json();
          const items = membersData.items || [];
          
          const mapped: Member[] = items.map((r: any) => ({
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
          setMembers(mapped);
          
          const total = membersData.totalItems;
          const complete = mapped.filter(m => m.is_profile_complete).length;
          const nfc = mapped.filter(m => m.nfc_programmed).length;
          setStats({
            total,
            complete,
            nfc_programmed: nfc,
            completion_pct: total > 0 ? Math.round((complete / total) * 100) : 0,
          });
        }
      } catch (e) {
        console.error('Failed to load admin data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourclass.vercel.app';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="font-mono text-sm text-ink-muted animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono font-bold text-gold tracking-[3px] mb-1">ADMIN DASHBOARD</div>
          <h1 className="font-masthead text-2xl font-black text-ink">The Class Gazette</h1>
          <p className="text-xs text-ink-muted mt-1">{school} · {className}</p>
        </div>
        <a href="/" className="text-xs text-gold font-sans font-semibold hover:underline">
          View public site →
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-lg p-4 border border-rule-light text-center">
            <div className="font-mono text-2xl font-bold text-ink">{stats.total}</div>
            <div className="text-[9px] font-mono text-ink-muted tracking-wider">TOTAL MEMBERS</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-rule-light text-center">
            <div className="font-mono text-2xl font-bold text-green-600">{stats.complete}</div>
            <div className="text-[9px] font-mono text-ink-muted tracking-wider">PROFILES DONE</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-rule-light text-center">
            <div className="font-mono text-2xl font-bold text-gazette-nfc">{stats.nfc_programmed}</div>
            <div className="text-[9px] font-mono text-ink-muted tracking-wider">TAGS PROGRAMMED</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-rule-light text-center">
            <div className="font-mono text-2xl font-bold text-gold">{stats.completion_pct}%</div>
            <div className="text-[9px] font-mono text-ink-muted tracking-wider">COMPLETION</div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {stats && (
        <div className="bg-white rounded-lg p-4 border border-rule-light mb-8">
          <div className="flex justify-between text-xs font-sans mb-2">
            <span className="font-bold text-ink">Profile Completion</span>
            <span className="text-ink-muted">{stats.complete}/{stats.total}</span>
          </div>
          <div className="h-3 bg-paper-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full transition-all"
              style={{ width: `${stats.completion_pct}%` }}
            />
          </div>
        </div>
      )}

      {/* NFC Tag Assignment Table */}
      <div className="bg-white rounded-lg border border-rule-light overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-rule-light bg-paper-dark flex justify-between items-center">
          <div>
            <div className="text-sm font-bold font-sans text-ink">NFC Tag Assignments</div>
            <div className="text-[10px] text-ink-muted font-mono">Program each tag with the URL below</div>
          </div>
          <div className="text-[10px] font-mono text-ink-muted">
            {members.filter(m => m.nfc_programmed).length}/{members.length} programmed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink text-white text-[10px] font-mono tracking-wider">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">MEMBER</th>
                <th className="px-4 py-2 text-left">TYPE</th>
                <th className="px-4 py-2 text-left">NFC URL</th>
                <th className="px-4 py-2 text-left">PROFILE</th>
                <th className="px-4 py-2 text-left">TAG</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <TagRow
                  key={member.id}
                  index={i}
                  member={member}
                  appUrl={appUrl}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Code */}
      <div className="bg-gazette-nfc/5 rounded-lg p-4 border border-gazette-nfc/20 text-center">
        <div className="text-[10px] font-mono font-bold text-gazette-nfc tracking-wider mb-1">CLASS JOIN CODE</div>
        <div className="font-mono text-2xl font-bold text-ink">{code}</div>
        <div className="text-xs text-ink-muted mt-1">
          Share this with graduates · Join URL: {appUrl}/join
        </div>
      </div>
    </div>
  );
}
