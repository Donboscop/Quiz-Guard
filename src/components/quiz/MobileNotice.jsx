import React, { useEffect, useState } from 'react';
import { Smartphone, Info } from 'lucide-react';

export const MobileNotice = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const small = window.innerWidth < 768;
      setIsMobile(touch || small);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="mb-4 p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-3 text-indigo-200 text-xs">
      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
        <Smartphone className="w-4 h-4" />
      </div>
      <div>
        <span className="font-semibold text-white">Mobile Device Detected: </span>
        Pointer boundary proctoring is relaxed for touch viewports to ensure fair testing. Tab visibility rules remain active.
      </div>
    </div>
  );
};
