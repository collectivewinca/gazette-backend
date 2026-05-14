import Link from 'next/link';
import { getFirstClass, getClassMembers, getSuperlatives } from '@/lib/queries';

export default async function HomePage() {
  const classData = await getFirstClass();
  const members = classData ? await getClassMembers(classData.id) : [];
  const superlatives = classData ? await getSuperlatives(classData.id) : [];
  const completedCount = members.filter(m => m.is_profile_complete).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Masthead */}
      <div className="text-center mb-8">
        <div className="flex justify-between text-[10px] font-mono text-ink-muted tracking-widest mb-1">
          <span>Vol. LXXV</span>
          <span>Est. 2026</span>
        </div>
        <div className="border-t-[3px] border-ink mb-1" />
        <div className="border-t border-ink mb-3" />
        <h1 className="font-masthead text-5xl font-black text-ink leading-none mb-1">
          The Class Gazette
        </h1>
        <p className="font-mono text-[10px] text-ink-muted tracking-[4px] uppercase">
          {classData?.school || 'The Official Record'} · Class of {classData?.year || 2026}
        </p>
        <div className="border-t-[3px] border-ink mt-3 mb-1" />
        <div className="border-t border-ink" />
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <p className="font-headline text-lg text-ink-soft italic leading-relaxed max-w-md mx-auto">
          Every portrait in this yearbook has a hidden NFC tag. Tap it with your phone to visit that person's private digital profile.
        </p>
      </div>

      {/* Stats */}
      {classData && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-paper-dark rounded-lg p-4 text-center border border-rule-light">
            <div className="font-mono text-2xl font-bold text-ink">{members.length}</div>
            <div className="text-[10px] font-mono text-ink-muted tracking-wider">MEMBERS</div>
          </div>
          <div className="bg-paper-dark rounded-lg p-4 text-center border border-rule-light">
            <div className="font-mono text-2xl font-bold text-gold">{completedCount}</div>
            <div className="text-[10px] font-mono text-ink-muted tracking-wider">PROFILES DONE</div>
          </div>
          <div className="bg-paper-dark rounded-lg p-4 text-center border border-rule-light">
            <div className="font-mono text-2xl font-bold text-gazette-nfc">
              {members.length > 0 ? Math.round((completedCount / members.length) * 100) : 0}%
            </div>
            <div className="text-[10px] font-mono text-ink-muted tracking-wider">COMPLETE</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/join"
          className="block w-full bg-ink text-paper text-center py-4 rounded-lg font-sans font-bold text-sm tracking-wide hover:bg-ink-soft transition-colors"
        >
          Draw Your Face & Join the Gazette ✦
        </Link>
        <Link
          href="/directory"
          className="block w-full bg-paper-dark text-ink text-center py-3 rounded-lg font-sans font-semibold text-sm border border-rule-light hover:border-rule transition-colors"
        >
          Browse the Directory →
        </Link>
      </div>

      {/* Superlatives */}
      {classData && (
        <div className="mb-10">
          <div className="text-center mb-4">
            <div className="section-label">CLASS SUPERLATIVES</div>
          </div>
          {superlatives.slice(0, 8).map((sup: { id: string; title: string; winner?: { name: string } }) => (
            <div key={sup.id} className="flex justify-between items-center py-2 border-b border-rule-light last:border-0">
              <div className="font-headline text-sm font-bold text-ink">{sup.title}</div>
              <div className="font-sans text-sm font-semibold text-gold-dark">
                {sup.winner?.name || '???'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <Link
          href="/wills"
          className="bg-paper-dark rounded-lg p-4 text-center border border-rule-light hover:border-gold transition-colors"
        >
          <div className="text-2xl mb-1">📜</div>
          <div className="font-sans text-sm font-bold text-ink">Senior Wills</div>
          <div className="text-[10px] font-mono text-ink-muted mt-1">I leave my...</div>
        </Link>
        <Link
          href="/directory"
          className="bg-paper-dark rounded-lg p-4 text-center border border-rule-light hover:border-gold transition-colors"
        >
          <div className="text-2xl mb-1">📖</div>
          <div className="font-sans text-sm font-bold text-ink">Directory</div>
          <div className="text-[10px] font-mono text-ink-muted mt-1">Browse all members</div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-rule-light text-center">
        <p className="font-mono text-[9px] text-ink-muted tracking-wider">
          Powered by Eventbuoy · Open-source NFC yearbook platform
        </p>
      </div>
    </div>
  );
}
