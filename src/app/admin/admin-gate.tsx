'use client';

import { useState } from 'react';

const ADMIN_PASSWORD = 'gazette2026';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);

  if (authorized) return <>{children}</>;

  return (
    <div className="max-w-sm mx-auto px-6 py-20 text-center">
      <div className="font-masthead text-2xl font-black text-ink mb-2">The Class Gazette</div>
      <div className="text-[10px] font-mono text-ink-muted tracking-[3px] mb-8">ADMIN ACCESS</div>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && password === ADMIN_PASSWORD) setAuthorized(true); }}
        placeholder="Admin password"
        className="w-full px-4 py-3 rounded-lg border-2 border-rule bg-paper font-mono text-center text-lg tracking-widest outline-none focus:border-gold transition-colors mb-4"
      />
      <button
        onClick={() => { if (password === ADMIN_PASSWORD) setAuthorized(true); }}
        disabled={!password}
        className="w-full py-3 rounded-lg bg-ink text-paper font-sans font-bold text-sm disabled:opacity-40 hover:bg-ink-soft transition-colors"
      >
        Enter Dashboard
      </button>
      {password && password !== ADMIN_PASSWORD && (
        <p className="text-xs text-gazette-red mt-3">Incorrect password</p>
      )}
    </div>
  );
}
