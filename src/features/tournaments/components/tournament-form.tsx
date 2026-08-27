'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tournamentSchema, TournamentFormData } from '../schema/tournament.schema';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getLocalDateFromUtcString = (utcString: string) => {
  if (!utcString) return undefined;
  const date = new Date(utcString);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const getUtcStringFromLocalDate = (localDate: Date) => {
  if (!localDate) return '';
  return new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())).toISOString();
};

export interface TournamentFormProps {
  initialData?: any;
  onSubmitAction: (data: any) => void;
  isPending: boolean;
  submitButtonText?: string;
}

/**
 * Grades as the API stores them: 0 is kindergarten through 12. The label is
 * what a person reads, the value is what is sent.
 */
const GRADE_OPTIONS = [
  { value: 0, label: 'K' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
];

const gradeLabel = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return null;
  return GRADE_OPTIONS.find(g => g.value === value)?.label ?? null;
};

/** How a grade is spelled in the dropdown and on the closed trigger. */
const gradeOptionLabel = (value: number) =>
  value === 0 ? 'Kindergarten (K)' : `Grade ${value}`;

/**
 * Base UI's Select.Value renders the raw value unless it is given a formatter,
 * so a grade select left to itself shows "0" for kindergarten. Every grade
 * dropdown here passes this.
 */
const renderGradeValue = (placeholder: string) => (value: unknown) => {
  if (value === null || value === undefined || value === '') return placeholder;
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? placeholder : gradeOptionLabel(asNumber);
};

/** A blank division, ready for the admin to name. */
const emptyDivision = () => ({
  name: '',
  gradeMode: 'single' as const,
  gradeMin: undefined,
  gradeMax: undefined,
  rating: undefined,
  condition: undefined,
});

export function TournamentForm({ initialData, onSubmitAction, isPending, submitButtonText = "Save" }: TournamentFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      date: '',
      location: '',
      entryFee: '',
      divisions: [emptyDivision()],
    },
  });

  const { fields: divisionFields, append: appendDivision, remove: removeDivision } = useFieldArray({
    control,
    name: 'divisions'
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '';

      reset({
        title: initialData.title || '',
        date: formattedDate,
        location: initialData.location || '',
        entryFee: initialData.entryFee?.toString() || '',
        divisions: (initialData.divisions || []).map((d: any) => ({
          // Sent back on save so the API updates the existing division
          // instead of replacing it and orphaning its participants.
          _id: d._id,
          name: d.name || '',
          // A division covering one grade stores the same number twice, which
          // is exactly what the Single toggle means - so the mode is read back
          // off the values rather than stored alongside them.
          gradeMode: d.gradeMin === d.gradeMax ? 'single' : 'range',
          gradeMin: typeof d.gradeMin === 'number' ? d.gradeMin : undefined,
          gradeMax: typeof d.gradeMax === 'number' ? d.gradeMax : undefined,
          rating: typeof d.rating === 'number' ? d.rating : undefined,
          condition: d.condition === 'above' ? 'over' : (d.condition || undefined),
        })),
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: TournamentFormData) => {

    const payload = {
      title: data.title,
      date: new Date(data.date).toISOString(),
      location: data.location,
      entryFee: parseFloat(data.entryFee || '0') || 0,
      isPaid: true,
      divisions: (data.divisions || []).map((d: any) => {
        // Only send _id for divisions that already exist server-side.
        const identity = d._id ? { _id: d._id } : {};

        // gradeMode is a form control, not part of the API shape. A single
        // grade is sent as the same number twice.
        const gradeMin = d.gradeMin;
        const gradeMax = d.gradeMode === 'single' ? d.gradeMin : d.gradeMax;

        const hasRating = d.rating !== undefined && !Number.isNaN(d.rating);

        return {
          ...identity,
          name: (d.name || '').trim(),
          gradeMin,
          gradeMax,
          // null, not 0 - a division with no rating limit is not one that caps
          // ratings at zero.
          rating: hasRating ? d.rating : null,
          condition: hasRating
            ? (d.condition === 'over' ? 'above' : 'under')
            : null,
        };
      }),
    };

    onSubmitAction(payload);
  };

  /**
   * The rules under the name, worded the way the player app words them. The
   * name itself is free text, so this is what tells the admin - and later the
   * parent - who the division actually admits.
   */
  const generateDivisionPreview = (index: number) => {
    const div = watch(`divisions.${index}`);
    if (!div) return '';

    const min = gradeLabel(div.gradeMin);
    if (min === null) return 'Choose a grade';

    const parts: string[] = [];

    if (div.gradeMode === 'single') {
      parts.push(`Grade ${min}`);
    } else {
      const max = gradeLabel(div.gradeMax);
      if (max === null) return 'Choose an end grade';
      parts.push(`Grades ${min}\u2013${max}`);
    }

    if (div.rating !== undefined && !Number.isNaN(div.rating)) {
      // Which side of the limit qualifies decides who may enter, so the
      // preview must not assume a direction that has not been chosen.
      parts.push(
        div.condition
          ? `Rating ${div.condition === 'over' ? 'over' : 'under'} ${div.rating}`
          : `Rating ${div.rating} — choose Under or Over`
      );
    }

    return parts.join(' \u00b7 ');
  };

  const getDuplicateIndices = () => {
    const allDivisions = watch('divisions') || [];
    const names = new Map<string, number>();
    const duplicates = new Set<number>();

    // Names are what a division is known by now, so that is what collides.
    // Compared case-insensitively: two divisions differing only in case would
    // be indistinguishable on the registration screen.
    allDivisions.forEach((d, i) => {
      const name = (d.name || '').trim().toLowerCase();
      if (!name) return;

      if (names.has(name)) {
        duplicates.add(i);
        duplicates.add(names.get(name)!);
      } else {
        names.set(name, i);
      }
    });
    return duplicates;
  };

  const duplicateIndices = getDuplicateIndices();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px] w-full">
        {/* Locked while the request is in flight: disabling only the
            submit button leaves every field editable after the values
            have already been sent. `contents` keeps the fieldset out
            of the layout. */}
        <fieldset disabled={isPending} className="contents">

      {/* Main Grid for Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px] w-full">

        {/* Tournament Title */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="title"
            className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
          >
            Tournament Title <span className="text-red-500">*</span>
          </Label>
          <div className="relative h-[42px]! w-full">
            <Input
              id="title"
              maxLength={100}
              placeholder="Enter Title"
              className="w-full h-full bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
              {...register('title')}
            />
          </div>
          {errors.title && (
            <p className="text-[12px] text-red-500 mt-[-6px]">{errors.title.message}</p>
          )}
        </div>

        {/* Date of Tournament */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="date"
            className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
          >
            Date Of Tournament <span className="text-red-500">*</span>
          </Label>
          <div className="relative h-[42px]! w-full">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger className={"w-full h-full"}>
                <button
                  type="button"
                  className={cn(
                    "flex h-full w-full items-center justify-between bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 transition-colors",
                    !watch('date') && "text-[#181818]/40"
                  )}
                >
                  {watch('date') ? format(getLocalDateFromUtcString(watch('date'))!, "PPP") : <span className="font-normal text-[#181818]/40">Pick a date</span>}
                  <CalendarIcon className="h-4 w-4 text-[#083F92] opacity-80" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={watch('date') ? getLocalDateFromUtcString(watch('date')) : undefined}
                  onSelect={(date) => {
                    setValue('date', date ? getUtcStringFromLocalDate(date) : '', { shouldValidate: true, shouldDirty: true });
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date <= today;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.date && (
            <p className="text-[12px] text-red-500 mt-[-6px]">{errors.date.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="location"
            className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
          >
            Location <span className="text-red-500">*</span>
          </Label>
          <div className="relative h-[42px]! w-full">
            <Input
              id="location"
              maxLength={100}
              placeholder="Enter location"
              className="w-full h-full bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
              {...register('location')}
            />
          </div>
          {errors.location && (
            <p className="text-[12px] text-red-500 mt-[-6px]">{errors.location.message}</p>
          )}
        </div>

        {/* Entry Fees */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="entryFee"
            className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
          >
            Entry Fees <span className="text-red-500">*</span>
          </Label>
          <div className="relative h-[42px]! w-full">
            <Input
              id="entryFee"
              type="text"
              maxLength={10}
              placeholder="Enter Amount"
              className={cn(
                "w-full h-full bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40",
                !!initialData && "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 opacity-70"
              )}
              readOnly={!!initialData}
              {...register('entryFee', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }
              })}
            />
          </div>
          {errors.entryFee && (
            <p className="text-[12px] text-red-500 mt-[-6px]">{errors.entryFee.message}</p>
          )}
        </div>

      </div>

      {/* Divisions */}
      <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between">
          <Label className="font-poppins font-medium text-[16px] leading-[21px] text-[#083F92] capitalize m-0">
            Divisions
          </Label>
        </div>

        {divisionFields.length === 0 && (
          <p className="text-[14px] text-[#181818]/60 text-center py-2">No divisions added.</p>
        )}

        <div className="flex flex-col gap-4">
          {divisionFields.map((field, index) => {
            // Divisions are fully editable. The API rejects a change to the
            // grade span or rating of a division that already has registered
            // participants, and that error surfaces as a toast. Renaming is
            // always allowed - the name is display text that eligibility
            // never reads.
            const gradeMode = watch(`divisions.${index}.gradeMode`) ?? 'single';
            const isRange = gradeMode === 'range';
            return (
              <div key={field.id} className="flex flex-col gap-4 p-5 bg-white border border-[#DADADA]/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-[24px] relative overflow-hidden group transition-all hover:border-[#083F92]/30">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#083F92] opacity-80" />
                {divisionFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDivision(index)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors z-10"
                    title="Remove Division"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="flex flex-col gap-4 gap-y-5 pr-6 mt-2">
                  {/* Name. Free text, and the only thing a player is shown
                      by name - so it comes first. */}
                  <div className="flex flex-col gap-2">
                    <Label className="font-poppins font-medium text-[14px] text-[#181818]">Division Name</Label>
                    <Input
                      {...register(`divisions.${index}.name` as const)}
                      type="text"
                      maxLength={40}
                      placeholder="e.g. Rookie, Championship, Grade 5 Section"
                      className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-[#181818]/40"
                    />
                    {errors.divisions?.[index]?.name && (
                      <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.name?.message}</p>
                    )}
                  </div>

                  {/* Grades. One grade or a span, chosen the way a date
                      picker chooses a day or a date range. */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label className="font-poppins font-medium text-[14px] text-[#181818]">Grades</Label>
                      <div className="inline-flex items-center p-1 bg-[#F1F5F9] rounded-full">
                        {(['single', 'range'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setValue(`divisions.${index}.gradeMode`, mode, { shouldDirty: true, shouldValidate: true });
                              // Leaving a stale end grade behind would submit
                              // a span the admin can no longer see.
                              if (mode === 'single') {
                                setValue(`divisions.${index}.gradeMax`, undefined, { shouldDirty: true, shouldValidate: true });
                              }
                            }}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[13px] font-poppins font-medium transition-colors disabled:cursor-not-allowed",
                              gradeMode === mode
                                ? "bg-white text-[#083F92] shadow-sm"
                                : "text-[#181818]/60 hover:text-[#083F92]"
                            )}
                          >
                            {mode === 'single' ? 'Single grade' : 'Grade range'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={cn("grid gap-4", isRange ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                      <div className="flex flex-col gap-2">
                        {isRange && (
                          <Label className="font-poppins font-normal text-[13px] text-[#181818]/60">From</Label>
                        )}
                        <Select
                          value={
                            watch(`divisions.${index}.gradeMin`) !== undefined && !Number.isNaN(watch(`divisions.${index}.gradeMin`))
                              ? String(watch(`divisions.${index}.gradeMin`))
                              : undefined
                          }
                          onValueChange={(val) => {
                            if (val !== undefined && val !== '') {
                              setValue(`divisions.${index}.gradeMin`, Number(val), { shouldDirty: true, shouldValidate: true });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed">
                            <SelectValue placeholder={isRange ? "Start grade" : "Select grade"}>
                              {renderGradeValue(isRange ? "Start grade" : "Select grade")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            {GRADE_OPTIONS.map(g => (
                              <SelectItem key={g.value} value={String(g.value)}>
                                {gradeOptionLabel(g.value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.divisions?.[index]?.gradeMin && (
                          <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.gradeMin?.message}</p>
                        )}
                      </div>

                      {isRange && (
                        <div className="flex flex-col gap-2">
                          <Label className="font-poppins font-normal text-[13px] text-[#181818]/60">To</Label>
                          <Select
                            value={
                              watch(`divisions.${index}.gradeMax`) !== undefined && !Number.isNaN(watch(`divisions.${index}.gradeMax`))
                                ? String(watch(`divisions.${index}.gradeMax`))
                                : undefined
                            }
                            onValueChange={(val) => {
                              if (val !== undefined && val !== '') {
                                setValue(`divisions.${index}.gradeMax`, Number(val), { shouldDirty: true, shouldValidate: true });
                              }
                            }}
                          >
                            <SelectTrigger className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed">
                              <SelectValue placeholder="End grade">
                                {renderGradeValue("End grade")}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              {GRADE_OPTIONS.map(g => (
                                <SelectItem key={g.value} value={String(g.value)}>
                                  {gradeOptionLabel(g.value)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.divisions?.[index]?.gradeMax && (
                            <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.gradeMax?.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating. Optional - leaving it blank means the division
                      has no rating restriction at all. */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Label className="font-poppins font-medium text-[14px] text-[#181818]">
                        Rating Limit <span className="font-normal text-[#181818]/50">(optional)</span>
                      </Label>
                      <div className="flex items-center gap-4 pr-1">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            value="under"
                            checked={watch(`divisions.${index}.condition`) === 'under'}
                            onChange={() => setValue(`divisions.${index}.condition`, 'under', { shouldDirty: true, shouldValidate: true })}
                            className="w-4 h-4 text-[#083F92] accent-[#083F92] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span className="text-[13px] font-poppins font-medium text-[#181818] group-hover:text-[#083F92] transition-colors">Under (U)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            value="over"
                            checked={watch(`divisions.${index}.condition`) === 'over'}
                            onChange={() => setValue(`divisions.${index}.condition`, 'over', { shouldDirty: true, shouldValidate: true })}
                            className="w-4 h-4 text-[#083F92] accent-[#083F92] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <span className="text-[13px] font-poppins font-medium text-[#181818] group-hover:text-[#083F92] transition-colors">Over (O)</span>
                        </label>
                      </div>
                    </div>
                    <Input
                      {...register(`divisions.${index}.rating` as const, { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) })}
                      type="number"
                      min={0}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        if (e.currentTarget.value.length > 5) {
                          e.currentTarget.value = e.currentTarget.value.slice(0, 5);
                        }
                      }}
                      placeholder="Leave blank for no rating limit"
                      className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-[#181818]/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {errors.divisions?.[index]?.rating && (
                      <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.rating?.message}</p>
                    )}
                    {errors.divisions?.[index]?.condition && (
                      <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.condition?.message}</p>
                    )}
                  </div>
                </div>

                {/* What this division admits, in the same words the player
                    app puts under the name on the registration screen. */}
                <div className={cn(
                  "mt-2 border rounded-[8px] px-4 py-3 flex items-center justify-between flex-wrap gap-2",
                  duplicateIndices.has(index)
                    ? "bg-red-50 border-red-200"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                )}>
                  <span className="text-[13px] font-poppins font-medium text-[#181818]/70 flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full inline-block",
                      duplicateIndices.has(index)
                        ? "bg-red-500"
                        : "bg-[#083F92]"
                    )} />
                    {duplicateIndices.has(index)
                      ? <span className="text-red-500 font-semibold">Duplicate Division Name</span>
                      : "Players eligible:"
                    }
                  </span>
                  <span className={cn(
                    "text-[14px] font-poppins font-semibold px-3 py-1 rounded-[6px] border shadow-sm",
                    duplicateIndices.has(index)
                      ? "text-red-600 bg-white border-red-200"
                      : "text-[#083F92] bg-white border-[#083F92]/20"
                  )}>
                    {generateDivisionPreview(index)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center md:justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendDivision(emptyDivision())}
          className="border-[#083F92] text-[#083F92] h-[48px] px-8 hover:bg-[#083F92]/5 rounded-full"
        >
          <Plus className="w-5 h-5 mr-2 stroke-[2.5]" /> Add Division
        </Button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending || !isValid || duplicateIndices.size > 0 || (!!initialData && !isDirty)}
        className="w-full h-[52px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-full mt-8 disabled:opacity-50 shadow-md"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        <span className="font-poppins font-semibold text-[14px] leading-[19px] text-white capitalize">
          {submitButtonText}
        </span>
      </Button>
    </fieldset>
        </form>
  );
}
