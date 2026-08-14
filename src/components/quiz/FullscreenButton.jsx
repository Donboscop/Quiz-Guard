import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../common/Button';

export const FullscreenButton = ({ onExitFullscreen }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active && onExitFullscreen) {
        onExitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onExitFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen request denied:", err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn("Fullscreen exit error:", err);
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFullscreen}
      icon={isFullscreen ? Minimize2 : Maximize2}
      className="text-slate-400 hover:text-white"
    >
      {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    </Button>
  );
};
