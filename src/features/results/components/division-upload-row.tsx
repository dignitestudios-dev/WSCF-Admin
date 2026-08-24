'use client';

import { useRef } from 'react';
import { FileSpreadsheet, Trash2, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DivisionUploadEntry } from '../services/result.service';

export interface DivisionOption {
  _id: string;
  label: string;
}

/**
 * One division's row: which division, its two files, and its trophy counts.
 *
 * A chosen file shows its name with a way to swap it out — the commonest
 * mistake here is attaching the individual file where the team one belongs,
 * and that is only catchable if the filename stays visible.
 */
export function DivisionUploadRow({
  index,
  entry,
  divisions,
  usedDivisionIds,
  onChange,
  onRemove,
  canRemove,
  disabled,
}: {
  index: number;
  entry: DivisionUploadEntry;
  divisions: DivisionOption[];
  usedDivisionIds: string[];
  onChange: (next: Partial<DivisionUploadEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}) {
  const individualRef = useRef<HTMLInputElement>(null);
  const teamRef = useRef<HTMLInputElement>(null);

  const fileButton = (
    label: string,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement | null>,
    onPick: (file: File | null) => void
  ) => (
    <div className="flex flex-col gap-2">
      <Label className="font-poppins text-[13px] font-medium text-[#181818]">{label}</Label>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex h-11 items-center gap-2 rounded-full border border-[#083F92] bg-[#083F92]/5 px-4">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#083F92]" />
          <span className="min-w-0 flex-1 truncate font-poppins text-[13px] text-[#181818]">
            {file.name}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onPick(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label={`Remove ${file.name}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#8C8C8C] transition-colors hover:bg-[#083F92]/10 hover:text-[#083F92] disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-[#3D3775]/50 bg-white px-4 font-poppins text-[13px] text-[#565656] transition-colors hover:border-[#083F92] hover:bg-[#083F92]/5 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Choose CSV
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#DADADA] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-poppins text-[13px] font-semibold text-[#8C8C8C]">
          Division {index + 1}
        </span>

        {canRemove ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="flex items-center gap-1.5 font-poppins text-[12px] font-medium text-[#CE2D32] transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label className="font-poppins text-[13px] font-medium text-[#181818]">Division</Label>
          <Select
            value={entry.divisionId}
            disabled={disabled}
            onValueChange={(value) => {
              if (!value) return;
              const division = divisions.find((d) => d._id === value);
              onChange({ divisionId: value, divisionLabel: division?.label ?? '' });
            }}
          >
            <SelectTrigger className="h-11! w-full rounded-full border border-[#3D3775] px-4 font-poppins text-[14px]">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((division) => (
                <SelectItem
                  key={division._id}
                  value={division._id}
                  // Each division takes one row; picking it twice would upload
                  // two sets of standings for the same section.
                  disabled={
                    division._id !== entry.divisionId &&
                    usedDivisionIds.includes(division._id)
                  }
                >
                  {division.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-poppins text-[13px] font-medium text-[#181818]">
            Individual trophies
          </Label>
          <Input
            type="number"
            min={0}
            disabled={disabled}
            value={entry.individualTrophyCount}
            onChange={(event) =>
              onChange({ individualTrophyCount: Math.max(0, Number(event.target.value) || 0) })
            }
            className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-poppins text-[13px] font-medium text-[#181818]">
            Team trophies
          </Label>
          <Input
            type="number"
            min={0}
            disabled={disabled}
            value={entry.teamTrophyCount}
            onChange={(event) =>
              onChange({ teamTrophyCount: Math.max(0, Number(event.target.value) || 0) })
            }
            className="h-11 rounded-full border-[#3D3775] px-4 font-poppins"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fileButton('Individual results file', entry.individualFile, individualRef, (file) =>
          onChange({ individualFile: file })
        )}
        {fileButton('Team results file', entry.teamFile, teamRef, (file) =>
          onChange({ teamFile: file })
        )}
      </div>
    </div>
  );
}
