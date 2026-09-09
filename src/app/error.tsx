'use client';

import React, { useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Hit Announcer error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4 text-amber-400">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        An issue occurred while rendering the card display. Tap below to reload.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 hover:scale-105 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reload Display</span>
      </button>
    </div>
  );
}
