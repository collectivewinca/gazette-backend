import Link from 'next/link';
import { getFirstClass, getClassMembers } from '@/lib/queries';

export default async function DirectoryPage() {
  const classData = await getFirstClass();
  if (!classData) return <div className="p-8 text-center text-ink-muted">No class configured.</div>;

  const members = await getClassMembers(classData.id);
  const graduates = members.filter(m => m.member_type === 'graduate');
  const faculty = members.filter(m => m.member_type === 'faculty');

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="font-masthead text-2xl font-black text-ink hover:text-gold transition-colors">
          The Class Gazette
        </Link>
        <div className="border-t-[3px] border-ink mt-2 mb-1" />
        <div className="border-t border-ink mb-3" />
        <h1 className="font-headline text-xl font-bold text-ink">The Directory</h1>
        <p className="text-xs text-ink-muted mt-1">{members.length} members · {classData.school}</p>
      </div>

      {/* Graduates */}
      {graduates.length > 0 && (
        <div className="mb-10">
          <div className="section-label mb-4">GRADUATES ({graduates.length})</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {graduates.map(member => (
              <Link key={member.id} href={`/m/${member.id}`} className="gazette-card group">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[8px] font-mono font-bold text-gazette-red tracking-wider">BREAKING</div>
                  <span className="nfc-badge">NFC</span>
                </div>

                {member.quote && (
                  <p className="font-headline text-sm font-bold text-ink leading-snug mb-2 group-hover:text-gold transition-colors">
                    "{member.quote}"
                  </p>
                )}

                {member.avatar_url ? (
                  <div className="w-full aspect-[4/3] rounded overflow-hidden mb-2 bg-paper-dark">
                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded mb-2 bg-paper-dark border border-rule-light flex items-center justify-center text-2xl opacity-20">
                    📸
                  </div>
                )}

                <div className="font-sans text-sm font-bold text-ink">{member.name}</div>
                {member.future && (
                  <div className="text-xs text-ink-muted mt-1">→ {member.future}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Faculty */}
      {faculty.length > 0 && (
        <div>
          <div className="section-label mb-4">FACULTY ({faculty.length})</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {faculty.map(member => (
              <Link key={member.id} href={`/m/${member.id}`} className="gazette-card group text-center">
                <div className="w-12 h-12 rounded-full bg-paper-dark border border-rule-light mx-auto mb-2 flex items-center justify-center text-lg opacity-30">
                  📸
                </div>
                <div className="font-sans text-xs font-bold text-ink">{member.name}</div>
                {member.role && (
                  <div className="text-[10px] text-ink-muted mt-0.5">{member.role.split(',')[0]}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/" className="text-xs text-gold font-sans font-semibold hover:underline">
          ← Back to The Gazette
        </Link>
      </div>
    </div>
  );
}
