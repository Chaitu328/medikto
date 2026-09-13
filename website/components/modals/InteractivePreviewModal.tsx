"use client";

import React, { useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractivePreviewModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle auto-play on open and pause on close
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="preview-dialog"
        className="relative w-full max-w-4xl rounded-3xl bg-[#09111e] text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-800/90 overflow-hidden flex flex-col"
      >
        {/* Clean Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800/80 bg-[#060c16]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center ring-1 ring-cyan-500/30">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">play_circle</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Medikto Preview</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Application Demonstration</p>
            </div>
          </div>

          <button 
            id="close-preview-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close preview modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Player Container */}
        <div className="p-3 sm:p-5 bg-black/70 flex items-center justify-center">
          <div className="w-full relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[72vh] flex items-center justify-center shadow-2xl ring-1 ring-white/10">
            <video
              ref={videoRef}
              src="/video.mp4"
              playsInline
              autoPlay
              controls
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};
