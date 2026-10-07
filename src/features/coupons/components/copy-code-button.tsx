'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from '@/lib/toast';

/**
 * Copies a coupon code to the clipboard. The icon turns into a tick for a
 * moment so the click visibly did something.
 */
export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (event: React.MouseEvent) => {
    // Sits inside rows and links; copying must not also open them.
    event.preventDefault();
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy the code. Select it and copy manually.');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Code copied' : `Copy code ${code}`}
      title={copied ? 'Copied' : 'Copy code'}
      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#083F92] transition-colors hover:bg-[#083F92]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#083F92]/40"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#036B26]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
