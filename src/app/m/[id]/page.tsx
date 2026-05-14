import { notFound } from 'next/navigation';
import { getMember, getGuestbookEntries, getTimeCapsuleMessages } from '@/lib/queries';
import type { Metadata } from 'next';
import { GuestbookForm } from './guestbook-form';
import { TimeCapsuleForm } from './time-capsule-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getMember(params.id);
  if (!member) return { title: 'Not Found' };
  return {
    title: `${member.name} — The Class Gazette`,
    description: member.quote || `${member.name}'s profile on The Class Gazette`,
    openGraph: {
      title: `${member.name} — The Class Gazette`,
      description: member.quote || undefined,
    },
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const member = await getMember(params.id);
  if (!member) notFound();

  const guestbookEntries = await getGuestbookEntries(member.id);
  const capsuleMessages = await getTimeCapsuleMessages(member.id);


  const isTeacher = member.member_type === 'faculty';

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      {/* Masthead mini */}
      <div className="text-center pb-3 mb-6 border-b-[3px] border-ink">
        <div className="text-[8px] font-mono text-ink-muted tracking-[3px]">SPECIAL EDITION</div>
        <div className="font-masthead text-2xl font-black text-ink">The Class Gazette</div>
        <div className="text-[8px] font-mono text-ink-muted tracking-[3px]">CLASS OF 2026 · PRIVATE NETWORK</div>
      </div>

      {/* Breaking label */}
      <div className="section-label mb-1">
        {isTeacher ? 'FACULTY SPOTLIGHT' : 'BREAKING'}
      </div>

      {/* Headline */}
      {member.quote && (
        <h1 className="font-headline text-2xl font-bold text-ink leading-snug mb-4">
          &ldquo;{member.quote}&rdquo;
        </h1>
      )}

      {/* Portrait */}
      {member.photo_url || member.avatar_url ? (
        <div className="w-full aspect-[4/3] rounded-md overflow-hidden mb-4 bg-paper-dark border border-rule-light">
          <img
            src={member.avatar_url || member.photo_url || ''}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-md mb-4 bg-paper-dark border border-rule-light flex items-center justify-center">
          <span className="text-4xl opacity-30">📸</span>
        </div>
      )}

      {/* Name + Role */}
      <h2 className="font-sans text-xl font-bold text-ink">{member.name}</h2>
      {isTeacher && (
        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gold/10 text-gold-dark text-[10px] font-mono font-bold tracking-wider">
          FACULTY
        </span>
      )}
      {member.role && (
        <p className="text-sm text-ink-muted mt-1">{member.role}</p>
      )}

      {/* Edit link */}
      <div className="text-center mt-3">
        <a href={`/m/${member.id}/edit`} className="text-xs text-gold font-sans font-semibold hover:underline">
          Edit profile →
        </a>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {member.future && (
          <div className="bg-paper-dark rounded-lg p-3 border border-rule-light">
            <div className="text-[8px] font-mono font-bold text-ink-muted tracking-widest mb-1">NEXT CHAPTER</div>
            <div className="text-sm font-semibold text-ink">{member.future}</div>
          </div>
        )}
        {member.song && (
          <div className="bg-paper-dark rounded-lg p-3 border border-rule-light">
            <div className="text-[8px] font-mono font-bold text-ink-muted tracking-widest mb-1">MY ANTHEM</div>
            <div className="text-sm font-semibold text-ink">🎵 {member.song}</div>
          </div>
        )}
      </div>

      {/* Guestbook */}
      <div className="mt-8">
        <div className="border-t-[3px] border-ink mb-1" />
        <div className="border-t border-ink mb-4" />
        <h3 className="font-mono text-xs font-bold text-ink tracking-widest mb-4">
          LETTERS TO THE EDITOR
        </h3>

        {guestbookEntries.length > 0 ? (
          <div className="space-y-2 mb-4">
            {guestbookEntries.map(entry => (
              <div key={entry.id} className="bg-paper-dark rounded-lg p-3 border border-rule-light">
                <div className="text-xs font-bold text-gold font-sans">
                  {entry.author_name || 'Anonymous'}
                </div>
                <div className="text-sm text-ink-soft mt-1 leading-relaxed">{entry.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted italic mb-4">No letters yet. Be the first to sign!</p>
        )}

        <GuestbookForm memberId={member.id} />
      </div>

      {/* Time Capsule */}
      <div className="mt-8">
        <div className="border-t border-rule mb-4" />
        <h3 className="font-mono text-xs font-bold text-ink tracking-widest mb-2">
          💊 TIME CAPSULE
        </h3>
        <p className="text-xs text-ink-muted mb-4">
          Write a message to {member.name.split(' ')[0]}'s future self. Sealed until the reunion.
        </p>

        {capsuleMessages.filter(m => !m.is_sealed).length > 0 && (
          <div className="space-y-2 mb-4">
            {capsuleMessages.filter(m => !m.is_sealed).map(msg => (
              <div key={msg.id} className="bg-gold/5 rounded-lg p-3 border border-gold/20">
                <div className="text-xs font-bold text-gold font-sans">
                  {msg.author_name || 'Someone'}
                </div>
                <div className="text-sm text-ink-soft mt-1">{msg.message}</div>
              </div>
            ))}
          </div>
        )}

        {capsuleMessages.filter(m => m.is_sealed).length > 0 && (
          <div className="bg-gold/5 rounded-lg p-4 border border-dashed border-gold/30 text-center mb-4">
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-sm font-bold text-gold">
              {capsuleMessages.filter(m => m.is_sealed).length} sealed message(s)
            </div>
            <div className="text-xs text-ink-muted mt-1">Opens at the reunion</div>
          </div>
        )}

        <TimeCapsuleForm memberId={member.id} />
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-rule-light text-center">
        <p className="font-mono text-[8px] text-ink-muted tracking-wider">
          The Class Gazette · Powered by Eventbuoy · NFC-enabled yearbook
        </p>
      </div>
    </div>
  );
}
