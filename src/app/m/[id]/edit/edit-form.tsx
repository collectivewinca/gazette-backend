'use client';

import { useState, use } from 'react';
import { updateProfile } from '@/lib/actions';
import type { Member } from '@/lib/types';

export function EditProfileForm({ member }: { member: Member }) {
  const [classCode, setClassCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [quote, setQuote] = useState(member.quote || '');
  const [future, setFuture] = useState(member.future || '');
  const [song, setSong] = useState(member.song || '');
  const [role, setRole] = useState(member.role || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setAvatarData(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (saving) return;
    if (!classCode.trim()) { setCodeError('Enter your class code to save changes.'); return; }
    setCodeError(''); setSaving(true);
    setSaved(false);
    const result = await updateProfile(member.id, {
      quote: quote.trim() || undefined,
      future: future.trim() || undefined,
      song: song.trim() || undefined,
      role: role.trim() || undefined,
      avatarDataUrl: avatarData || undefined,
      classCode: classCode.trim(),
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <div className="text-center pb-3 mb-6 border-b-[3px] border-ink">
        <div className="text-[8px] font-mono text-ink-muted tracking-[3px]">SPECIAL EDITION</div>
        <div className="font-masthead text-2xl font-black text-ink">The Class Gazette</div>
        <div className="text-[8px] font-mono text-ink-muted tracking-[3px]">EDIT PROFILE</div>
      </div>

      <div className="section-label mb-4">EDITING: {member.name.toUpperCase()}</div>

      {/* Avatar upload */}
      <div className="text-center mb-4">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-rule bg-paper-dark flex items-center justify-center hover:border-gold transition-colors">
            {avatarPreview || member.avatar_url ? (
              <img src={avatarPreview || member.avatar_url || ''} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl opacity-30">📸</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-gold mt-1">Tap to change photo</div>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
            QUOTE / HEADLINE
          </label>
          <input
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder='"We came, we saw, we graduated."'
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
            NEXT CHAPTER (College, career, etc.)
          </label>
          <input
            value={future}
            onChange={e => setFuture(e.target.value)}
            placeholder="NYU, Stanford, Starting a company..."
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
            MY ANTHEM (Song that defines you)
          </label>
          <input
            value={song}
            onChange={e => setSong(e.target.value)}
            placeholder="Cruel Summer by Taylor Swift"
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
            ROLE / TITLE
          </label>
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Valedictorian, Class Clown, Team Captain..."
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm disabled:opacity-40 hover:bg-ink-soft transition-colors"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
          <a
            href={`/m/${member.id}`}
            className="flex-1 py-3 rounded-lg bg-paper-dark text-ink text-center font-sans font-semibold text-sm border border-rule-light hover:border-rule transition-colors"
          >
            View Profile
          </a>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t border-rule-light text-center">
        <p className="font-mono text-[8px] text-ink-muted tracking-wider">
          The Class Gazette · Powered by Eventbuoy · NFC-enabled yearbook
        </p>
      </div>
    </div>
  );
}
