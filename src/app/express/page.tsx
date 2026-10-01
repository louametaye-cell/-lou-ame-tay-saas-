'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Store, ArrowRight, Loader2 } from 'lucide-react';

export default function ExpressRedirectPage() {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = "Borne Express — Lou Ame Tay?";
    }

    const storedSub = localStorage.getItem('current_restaurant_subdomain');
    const storedId = localStorage.getItem('current_restaurant_id');
    const target = storedSub || storedId || 'anima-pizzeria';
    setSubdomain(target);

    // Rediriger vers l'URL express du restaurant
    router.replace(`/r/${target}/express`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
          <Zap className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black">Borne Express — Lou Ame Tay?</h1>
        <p className="text-xs text-slate-400">Redirection vers la borne de commande express au comptoir...</p>
        <div className="flex justify-center pt-2">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      </div>
    </div>
  );
}
