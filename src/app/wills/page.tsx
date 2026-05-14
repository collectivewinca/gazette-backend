import { getFirstClass, getSeniorWills, getClassMembers } from '@/lib/queries';
import Link from 'next/link';
import { WillForm } from './will-form';

export const dynamic = 'force-dynamic';

export default async function WillsPage() {
  const classData = await getFirstClass();
  if (!classData) return <div className="p-8 text-center text-ink-muted">No class configured.</div>;

  const wills = await getSeniorWills(classData.id);
  const members = await getClassMembers(classData.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="font-masthead text-2xl font-black text-ink hover:text-gold transition-colors">
          The Class Gazette
        </Link>
        <div className="border-t-[3px] border-ink mt-2 mb-1" />
        <div className="border-t border-ink mb-3" />
        <h1 className="font-headline text-xl font-bold text-ink">Senior Wills</h1>
        <p className="text-xs text-ink-muted mt-1">"I leave my best memories to..."</p>
      </div>

      {/* Wills list */}
      {wills.length > 0 ? (
        <div className="space-y-3 mb-10">
          {wills.map((will: { id: string; from_member?: { name: string }; item: string; to_recipient: string }) => (
            <div key={will.id} className="bg-paper-dark rounded-lg p-4 border border-rule-light">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-ink font-sans">
                  {will.from_member?.name || 'Anonymous'}
                </span>
                <span className="text-[10px] font-mono text-gold tracking-wider">WILLS</span>
              </div>
              <div className="text-sm text-ink-soft mt-1 leading-relaxed">
                I leave my <span className="font-bold text-ink">{will.item}</span> to <span className="font-bold text-gold-dark">{will.to_recipient}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-paper-dark rounded-lg p-8 border border-rule-light text-center mb-10">
          <div className="text-3xl mb-3">📜</div>
          <div className="text-sm text-ink-muted">No wills yet. Be the first to declare!</div>
        </div>
      )}

      {/* Write a will */}
      <div className="border-t-[3px] border-ink mb-1" />
      <div className="border-t border-ink mb-4" />
      <h3 className="font-mono text-xs font-bold text-ink tracking-widest mb-4">WRITE YOUR WILL</h3>
      <WillForm classId={classData.id} members={members} />

      <div className="mt-12 pt-4 border-t border-rule-light text-center">
        <Link href="/" className="text-xs text-gold font-sans font-semibold hover:underline">
          &larr; Back to The Gazette
        </Link>
      </div>
    </div>
  );
}
