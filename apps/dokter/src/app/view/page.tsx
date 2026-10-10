'use client';

import React, { useEffect } from 'react';

export default function DoctorViewFallbackPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      // Redirect to the dedicated Patient Web portal on port 3000
      window.location.href = `http://localhost:3000/view${search}${hash}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ebdccd] border-t-[#e86a28] mb-3" />
      <h2 className="text-base font-bold text-[#241a14]">Membuka Portal Pasien Web...</h2>
      <p className="text-xs text-[#716358] mt-1 font-mono">
        Mengarahkan ke http://localhost:3000/view...
      </p>
    </div>
  );
}
