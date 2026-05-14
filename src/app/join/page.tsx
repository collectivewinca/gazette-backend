'use client';

import { useState, useRef, useEffect } from 'react';
import { validateClassCode, claimProfile } from '@/lib/actions';
import Link from 'next/link';

type Step = 'code' | 'draw' | 'done';

export default function JoinPage() {
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [classInfo, setClassInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState('');
  const [future, setFuture] = useState('');
  const [song, setSong] = useState('');

  // Drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{x: number; y: number} | null>(null);

  useEffect(() => {
    if (step === 'draw' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.fillStyle = '#FDF8EF';
      ctx.fillRect(0, 0, 280, 280);
      ctx.strokeStyle = '#C4B8A0';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(140, 125, 80, 95, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#C4B8A0';
      ctx.font = '12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Draw yourself here!', 140, 250);
    }
  }, [step]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (280 / rect.width),
      y: (clientY - rect.top) * (280 / rect.height),
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault(); setIsDrawing(true); lastPos.current = getPos(e);
  }
  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const pos = getPos(e);
    ctx.strokeStyle = '#1A1510'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
  }
  function endDraw() { setIsDrawing(false); lastPos.current = null; }

  async function handleCodeSubmit() {
    if (!code.trim()) return;
    setLoading(true); setError('');
    const result = await validateClassCode(code);
    setLoading(false);
    if (result.valid) {
      setClassInfo(result.class);
      setStep('draw');
    } else {
      setError('Invalid class code. Check with your yearbook committee.');
    }
  }

  async function handleProfileSubmit() {
    if (!name.trim() || !quote.trim()) { setError('Name and quote are required.'); return; }
    setLoading(true); setError('');

    let avatarDataUrl: string | undefined;
    if (canvasRef.current) {
      avatarDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const result = await claimProfile({
      classId: classInfo.id,
      name, email, quote, future, song,
      avatarDataUrl,
    });

    setLoading(false);
    if (result.success) {
      setMemberId(result.memberId!);
      setStep('done');
    } else {
      setError(result.error || 'Something went wrong.');
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* Mini masthead */}
      <div className="text-center mb-8">
        <Link href="/" className="font-masthead text-2xl font-black text-ink hover:text-gold transition-colors">
          The Class Gazette
        </Link>
      </div>

      {/* Step 1: Class Code */}
      {step === 'code' && (
        <div className="bg-white rounded-xl p-8 border border-rule-light text-center">
          <div className="section-label mb-2">JOIN THE GAZETTE</div>
          <h2 className="font-headline text-xl font-bold text-ink mb-2">Enter Your Class Code</h2>
          <p className="text-xs text-ink-muted mb-6">Ask your yearbook committee for the code.</p>

          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="GRAD2026"
            maxLength={20}
            className="w-48 text-center px-4 py-3 rounded-lg border-2 border-rule bg-paper font-mono text-lg font-bold text-ink tracking-widest outline-none focus:border-gold transition-colors"
            onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
          />

          {error && <p className="text-xs text-gazette-red mt-3">{error}</p>}

          <button
            onClick={handleCodeSubmit}
            disabled={loading || !code.trim()}
            className="block w-full mt-6 py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm disabled:opacity-40 hover:bg-ink-soft transition-colors"
          >
            {loading ? 'Checking...' : 'Enter →'}
          </button>
        </div>
      )}

      {/* Step 2: Draw Your Face + Profile */}
      {step === 'draw' && classInfo && (
        <div className="bg-white rounded-xl p-6 border border-rule-light">
          <div className="text-center mb-4">
            <div className="section-label mb-1">ARTIST WANTED</div>
            <h2 className="font-masthead text-xl font-bold text-ink">Draw Your Face</h2>
            <p className="text-xs text-ink-muted mt-1">
              for {classInfo.name} · {classInfo.school}
            </p>
          </div>

          <div className="border-t-[3px] border-ink mb-1" />
          <div className="border-t border-ink mb-4" />

          <div className="grid grid-cols-2 gap-5">
            {/* Canvas */}
            <div>
              <div className="text-[9px] font-mono font-bold text-ink-muted tracking-wider mb-2">YOUR SELF-PORTRAIT</div>
              <div className="border-2 border-rule rounded overflow-hidden">
                <canvas
                  ref={canvasRef} width={280} height={280}
                  style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', cursor: 'crosshair' }}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                />
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div className="text-[9px] font-mono font-bold text-ink-muted tracking-wider mb-1">YOUR HEADLINE</div>

              <div>
                <label className="text-[10px] font-sans font-semibold text-ink-soft block mb-1">Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Kim"
                  className="w-full px-3 py-2 rounded border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] font-sans font-semibold text-ink-soft block mb-1">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan@school.edu" type="email"
                  className="w-full px-3 py-2 rounded border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] font-sans font-semibold text-ink-soft block mb-1">Your quote (headline) *</label>
                <input value={quote} onChange={e => setQuote(e.target.value)} placeholder="We came, we saw, we graduated."
                  className="w-full px-3 py-2 rounded border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] font-sans font-semibold text-ink-soft block mb-1">Where are you headed?</label>
                <input value={future} onChange={e => setFuture(e.target.value)} placeholder="NYU — Film & Media"
                  className="w-full px-3 py-2 rounded border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] font-sans font-semibold text-ink-soft block mb-1">Your song</label>
                <input value={song} onChange={e => setSong(e.target.value)} placeholder="Cruel Summer — Taylor Swift"
                  className="w-full px-3 py-2 rounded border border-rule bg-paper text-sm font-body text-ink outline-none focus:border-gold" />
              </div>

              {error && <p className="text-xs text-gazette-red">{error}</p>}

              <button
                onClick={handleProfileSubmit}
                disabled={loading || !name.trim() || !quote.trim()}
                className="w-full py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm disabled:opacity-40 hover:bg-ink-soft transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit to the Gazette ✦'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <div className="bg-white rounded-xl p-8 border border-rule-light text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="font-headline text-xl font-bold text-ink mb-2">You're in the Gazette!</h2>
          <p className="text-sm text-ink-muted mb-6">
            Your self-portrait and headline are saved. You can edit your profile anytime before the print deadline.
          </p>
          <div className="space-y-2">
            <Link
              href={`/m/${memberId}`}
              className="block w-full py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm hover:bg-ink-soft transition-colors"
            >
              View Your Profile →
            </Link>
            <Link
              href="/directory"
              className="block w-full py-2 rounded-lg border border-rule text-ink-muted font-sans font-semibold text-sm hover:border-gold transition-colors"
            >
              Browse the Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
