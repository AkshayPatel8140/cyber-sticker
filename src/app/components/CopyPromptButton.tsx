'use client';

import { useState } from 'react';

interface CopyPromptButtonProps {
  promptText: string;
}

export default function CopyPromptButton({ promptText }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative px-8 py-4 font-mono text-lg font-bold text-black bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-95"
    >
      <span className="relative z-10">
        {copied ? '✓ COPIED!' : 'COPY PROMPT'}
      </span>
      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 to-magenta-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></span>
    </button>
  );
}

