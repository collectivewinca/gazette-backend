'use client';

import { useState } from 'react';
import { createWill } from '@/lib/actions';
import type { Member } from '@/lib/types';

export function WillForm({ classId, members }: { classId: string; members: Member[] }) {
  const [classCode, setClassCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [fromMemberId, setFromMemberId] = useState('');
  const [toRecipient, setToRecipient] = useState('');
  const [item, setItem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!fromMemberId || !toRecipient.trim() || !item.trim() || submitting) return;
    if (!classCode.trim()) { setCodeError('Enter your class code to record a will.'); return; }
    setCodeError(''); setSubmitting(true);
    const result = await createWill({
      classId,
      fromMemberId,
      toRecipient: toRecipient.trim(),
      item: item.trim(),
      classCode: classCode.trim(),
    });
    setSubmitting(false);
    if (result.success) {
      setFromMemberId('');
      setToRecipient('');
      setItem('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  }

  if (submitted) {
    return (
      <div className="bg-gold/5 rounded-xl p-6 border border-dashed border-gold/30 text-center">
        <div className="text-2xl mb-2">📜</div>
        <div className="text-sm font-bold text-gold">Your will has been recorded!</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
          CLASS CODE
        </label>
        <input
          value={classCode}
          onChange={e => { setClassCode(e.target.value.toUpperCase()); setCodeError(''); }}
          placeholder="GRAD2026"
          maxLength={20}
          className="w-full px-3 py-2 rounded-lg border border-gold/40 bg-paper/50 text-sm font-mono font-bold text-ink outline-none focus:border-gold placeholder:text-ink-muted/50"
        />
        {codeError && <p className="text-[10px] text-gazette-red mt-1">{codeError}</p>}
      </div>
      <div>
        <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
          WHO ARE YOU?
        </label>
        <select
          value={fromMemberId}
          onChange={e => setFromMemberId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
        >
          <option value="">Select your name...</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
          I LEAVE MY... (What are you passing down?)
        </label>
        <input
          value={item}
          onChange={e => setItem(e.target.value)}
          placeholder="lucky calculator, best parking spot, collection of memes..."
          maxLength={200}
          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono font-bold text-ink-muted tracking-widest block mb-1">
          TO... (Who gets it?)
        </label>
        <input
          value={toRecipient}
          onChange={e => setToRecipient(e.target.value)}
          placeholder="the next class president, my lab partner, anyone who needs it..."
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold transition-colors"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !fromMemberId || !toRecipient.trim() || !item.trim()}
        className="w-full py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm disabled:opacity-40 hover:bg-ink-soft transition-colors"
      >
        {submitting ? 'Recording...' : 'Record My Will'}
      </button>
    </div>
  );
}
