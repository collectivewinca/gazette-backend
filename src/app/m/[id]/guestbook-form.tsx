'use client';

import { useState } from 'react';
import { validateClassCode } from '@/lib/actions';
import { signGuestbook } from '@/lib/actions';

export function GuestbookForm({ memberId }: { memberId: string }) {
  const [classCode, setClassCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!message.trim() || sending) return;
    if (!classCode.trim()) { setCodeError('Enter your class code to sign.'); return; }
    setCodeError(''); setSending(true);
    const result = await signGuestbook({
      memberId,
      authorName: name.trim() || 'Anonymous',
      message: message.trim(),
      classCode: classCode.trim(),
    });
    setSending(false);
    if (result.success) {
      setMessage('');
      setName('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={classCode}
        onChange={e => { setClassCode(e.target.value.toUpperCase()); setCodeError(''); }}
        placeholder="Class code (required)"
        maxLength={20}
        className="w-full px-3 py-2 rounded-lg border border-gold/40 bg-paper/50 text-sm font-mono font-bold text-ink outline-none focus:border-gold placeholder:text-ink-muted/50"
      />
      {codeError && <p className="text-[10px] text-gazette-red">{codeError}</p>}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name (optional)"
        maxLength={100}
        className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
      />
      <div className="flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write a letter..."
          maxLength={500}
          className="flex-1 px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={sending || !message.trim()}
          className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-sans font-bold disabled:opacity-40 hover:bg-ink-soft transition-colors"
        >
          {sent ? '✓' : sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
