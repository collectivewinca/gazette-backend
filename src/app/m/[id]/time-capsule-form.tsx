'use client';

import { useState } from 'react';
import { sealTimeCapsule } from '@/lib/actions';

export function TimeCapsuleForm({ memberId }: { memberId: string }) {
  const [classCode, setClassCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sealed, setSealed] = useState(false);
  const [sealing, setSealing] = useState(false);

  async function handleSeal() {
    if (!message.trim() || sealing) return;
    if (!classCode.trim()) { setCodeError('Enter your class code to seal.'); return; }
    setCodeError(''); setSealing(true);
    const result = await sealTimeCapsule({
      memberId,
      authorName: name.trim() || 'Anonymous',
      message: message.trim(),
      openDate: '2036-06-01',
      classCode: classCode.trim(),
    });
    setSealing(false);
    if (result.success) {
      setMessage('');
      setName('');
      setSealed(true);
    }
  }

  if (sealed) {
    return (
      <div className="bg-gold/5 rounded-xl p-6 border border-dashed border-gold/30 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-sm font-bold text-gold">Sealed!</div>
        <div className="text-xs text-ink-muted mt-1">Opens June 2036 · 10 Year Reunion</div>
      </div>
    );
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
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Dear future self..."
        maxLength={2000}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors resize-y"
      />
      <button
        onClick={handleSeal}
        disabled={sealing || !message.trim()}
        className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-white text-sm font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {sealing ? 'Sealing...' : '🔒 Seal Until 2036'}
      </button>
    </div>
  );
}
