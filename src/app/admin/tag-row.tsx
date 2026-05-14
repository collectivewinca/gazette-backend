'use client';

import { useState } from 'react';
import { markTagProgrammed } from '@/lib/actions';
import type { Member } from '@/lib/types';

export function TagRow({ member, index, appUrl }: { member: Member; index: number; appUrl: string }) {
  const [programmed, setProgrammed] = useState(member.nfc_programmed);

  async function handleProgram() {
    const result = await markTagProgrammed(member.id);
    if (result.success) setProgrammed(true);
  }

  const nfcUrl = `${appUrl}/m/${member.id}`;

  return (
    <tr className={`border-b border-rule-light ${index % 2 === 0 ? 'bg-paper-dark/50' : 'bg-white'}`}>
      <td className="px-4 py-2 font-mono text-xs text-ink-muted">
        {String(index + 1).padStart(2, '0')}
      </td>
      <td className="px-4 py-2 font-sans font-semibold text-ink text-sm">
        {member.name}
      </td>
      <td className="px-4 py-2">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
          member.member_type === 'faculty'
            ? 'bg-gold/10 text-gold-dark'
            : 'bg-paper-dark text-ink-muted'
        }`}>
          {member.member_type === 'faculty' ? 'FACULTY' : 'GRAD'}
        </span>
      </td>
      <td className="px-4 py-2">
        <code className="text-[10px] font-mono text-gazette-nfc bg-gazette-nfc/5 px-2 py-1 rounded">
          {nfcUrl}
        </code>
      </td>
      <td className="px-4 py-2">
        {member.is_profile_complete ? (
          <span className="text-green-600 text-xs font-bold">✓ Done</span>
        ) : (
          <span className="text-ink-muted text-xs">Pending</span>
        )}
      </td>
      <td className="px-4 py-2">
        <button
          onClick={handleProgram}
          disabled={programmed}
          className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
            programmed
              ? 'bg-green-50 text-green-600 cursor-default'
              : 'bg-paper-dark text-ink-muted hover:bg-gold/10 hover:text-gold-dark cursor-pointer'
          }`}
        >
          {programmed ? '✓ Done' : 'Program'}
        </button>
      </td>
    </tr>
  );
}
