'use client';

import { useRef } from 'react';
import { Check, FileSpreadsheet, Upload, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StagedFile } from '../services/result.service';

export interface DivisionOption {
  _id: string;
  label: string;
}

/**
 * One of the two upload boxes — individual results, or team results.
 *
 * Several files go in at once, since a tournament produces one per division.
 * Each then names the division it belongs to: the filename usually says so
 * ("Fond du Lac K3 Individual"), so the division is guessed from it and the
 * admin only has to correct the ones that guessed wrong.
 */
export function ResultFileBox({
  title,
  hint,
  files,
  divisions,
  onAdd,
  onAssign,
  onRemove,
  disabled,
}: {
  title: string;
  hint: string;
  files: StagedFile[];
  divisions: DivisionOption[];
  onAdd: (files: File[]) => void;
  onAssign: (id: string, divisionId: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // A division already spoken for in this box cannot take a second file: two
  // sets of standings for one section is not a thing.
  const takenDivisionIds = files.map((staged) => staged.divisionId).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-poppins text-[16px] font-bold text-[#083F92]">{title}</h3>
        <span className="font-poppins text-[11px] text-[#636363]">{hint}</span>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-[12px] bg-[#083F92]/10 p-5">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".csv,.txt"
          className="hidden"
          onChange={(event) => {
            const chosen = Array.from(event.target.files ?? []);
            if (chosen.length > 0) onAdd(chosen);
            // Cleared so choosing the same file again still fires a change.
            if (inputRef.current) inputRef.current.value = '';
          }}
        />

        {files.map((staged) => (
          <div
            key={staged.id}
            className="flex flex-col gap-3 rounded-[12px] border border-[#DADADA] bg-white p-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  staged.divisionId
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#083F92]/10 text-[#083F92]'
                }`}
              >
                {staged.divisionId ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="truncate font-poppins text-[13px] font-semibold text-[#151515]">
                  {staged.file.name}
                </span>
                <span className="font-poppins text-[11px] text-[#8C8C8C]">
                  {(staged.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:w-[200px] sm:shrink-0">
              <Select
                value={staged.divisionId}
                disabled={disabled}
                onValueChange={(value) => {
                  if (!value) return;
                  onAssign(staged.id, value);
                }}
              >
                <SelectTrigger className="h-10! w-full rounded-full border border-[#3D3775] px-3 font-poppins text-[13px]">
                  {/* The select's value is the division's id, and base-ui
                      renders that raw unless told otherwise — which put a
                      Mongo id in the trigger instead of "K10". */}
                  <SelectValue placeholder="Division">
                    {(value: unknown) =>
                      divisions.find((division) => division._id === value)
                        ?.label ?? "Division"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem
                      key={division._id}
                      value={division._id}
                      disabled={
                        division._id !== staged.divisionId &&
                        takenDivisionIds.includes(division._id)
                      }
                    >
                      {division.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(staged.id)}
                aria-label={`Remove ${staged.file.name}`}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
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
              {files.length > 0 ? 'Add more files' : 'Upload files'}
            </span>
            <span className="font-poppins text-[11px] font-normal text-[#636363]">
              CSV — select several at once
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
