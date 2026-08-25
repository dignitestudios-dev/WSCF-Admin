'use client';

import { useRef } from 'react';
import { ChevronDown, ChevronUp, FileText, Upload, X } from 'lucide-react';
import type { StagedAttachment } from '../services/result.service';

/**
 * Extra pages to staple onto the back of the results document.
 *
 * Not everything the federation hands out is generated from the WinTD files —
 * a Grand Prix standings sheet or a scholarship list is written elsewhere and
 * belongs in the same document. These are appended after the standings, in the
 * order shown here, which is why they can be moved up and down.
 */
export function AttachmentBox({
  files,
  onAdd,
  onMove,
  onRemove,
  disabled,
}: {
  files: StagedAttachment[];
  onAdd: (files: File[]) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-poppins text-[16px] font-bold text-[#083F92]">
          Extra pages
          <span className="ml-1.5 font-normal text-[#8C8C8C]">(optional)</span>
        </h3>
        <span className="font-poppins text-[11px] text-[#636363]">
          added to the back of the document
        </span>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-[12px] bg-[#083F92]/10 p-5">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const chosen = Array.from(event.target.files ?? []);
            if (chosen.length > 0) onAdd(chosen);
            // Cleared so choosing the same file again still fires a change.
            if (inputRef.current) inputRef.current.value = '';
          }}
        />

        {files.map((attachment, index) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-[12px] border border-[#DADADA] bg-white p-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#083F92]/10 text-[#083F92]">
              <FileText className="h-4 w-4" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-poppins text-[13px] font-semibold text-[#151515]">
                {attachment.file.name}
              </span>
              <span className="font-poppins text-[11px] text-[#8C8C8C]">
                {(attachment.file.size / 1024).toFixed(1)} KB · position{' '}
                {index + 1}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => onMove(attachment.id, -1)}
                aria-label={`Move ${attachment.file.name} earlier`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DADADA] bg-white text-[#565656] transition-colors hover:bg-[#F3F3F3] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled || index === files.length - 1}
                onClick={() => onMove(attachment.id, 1)}
                aria-label={`Move ${attachment.file.name} later`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DADADA] bg-white text-[#565656] transition-colors hover:bg-[#F3F3F3] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(attachment.id)}
                aria-label={`Remove ${attachment.file.name}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="group flex h-[92px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#C9C9C9] bg-white transition-all hover:border-[#083F92] hover:shadow-[0px_4px_12px_rgba(8,63,146,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-6 w-6 text-[#A6A6A6] transition-all duration-200 group-hover:scale-110 group-hover:text-[#083F92]" />
          <div className="flex flex-col gap-0.5 text-center">
            <span className="font-poppins text-[13px] font-medium text-[#083F92]">
              {files.length > 0 ? 'Add more pages' : 'Attach PDFs'}
            </span>
            <span className="font-poppins text-[11px] font-normal text-[#636363]">
              PDF only — Grand Prix standings, scholarship lists, anything else
              handed out with the results
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
