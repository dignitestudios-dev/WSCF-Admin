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

const DIVISION_TYPES = ['K', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'];

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
      // Conditional is what almost every division is, so a new tournament
      // starts on it rather than on Open.
      divisions: [{ type: 'conditional', condition: 'under' }],
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
          ...d,
          // Sent back on save so the API updates the existing division
          // instead of replacing it and orphaning its participants.
          _id: d._id,
          type: d.type === 'conditional' && d.gradeRule === 'exact' ? 'exact' : d.type,
          condition: d.condition === 'above' ? 'over' : (d.condition || 'under'),
          divisionType: d.type === 'conditional' && d.divisionName ? d.divisionName : undefined,
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

        if (d.type === 'open') {
          return { ...identity, type: 'open' };
        }

        return {
          ...identity,
          type: 'conditional',
          // 'exact' is a UI type; the API models it as gradeRule.
          gradeRule: d.type === 'exact' ? 'exact' : 'upto',
          divisionName: d.divisionType || 'Unknown',
          rating: d.rating || 0,
          condition: d.condition === 'over' ? 'above' : (d.condition || 'under')
        };
      }),
    };

    onSubmitAction(payload);
  };

  // The label is the same for both grade rules — the Type field is what
  // says whether K3 means "K through 3" or "grade 3 only".
  const divisionLabel = (
    divisionType: string,
    condition: string,
    rating: number,
  ) => `${divisionType}${condition === 'over' ? 'o' : 'u'}${rating}`;

  // Helper to generate the preview string for a division
  const generateDivisionPreview = (index: number) => {
    const div = watch(`divisions.${index}`);
    if (!div) return '';
    if (div.type === 'open') return 'Open';
    if (div.divisionType && div.condition && div.rating !== undefined && !Number.isNaN(div.rating)) {
      return divisionLabel(div.divisionType, div.condition, div.rating);
    }
    return 'Incomplete condition...';
  };

  const getDuplicateIndices = () => {
    const allDivisions = watch('divisions') || [];
    const names = new Map<string, number>();
    const duplicates = new Set<number>();

    allDivisions.forEach((d, i) => {
      // Open divisions have no label of their own, so they collide by being
      // Open at all — a tournament can only have one.
      const name =
        d.type === 'open'
          ? 'Open'
          : d.divisionType && d.condition && d.rating !== undefined && !Number.isNaN(d.rating)
            ? divisionLabel(d.divisionType, d.condition, d.rating)
            : null;

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
            const divType = watch(`divisions.${index}.type`);
            // Divisions are fully editable. The API rejects a change to any
            // division that already has registered participants, and that
            // error surfaces as a toast.
            const isConditional = divType === 'conditional' || divType === 'exact';
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-5 pr-6 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label className="font-poppins font-medium text-[14px] text-[#181818]">Type</Label>
                    {/* Every division picks its own type freely. Locking the
                        dropdown once one Open division existed left the others
                        looking broken; a duplicate Open is caught on save
                        instead, where it can be explained. */}
                    <Select
                      value={divType}
                      onValueChange={(val) => {
                        if (val) setValue(`divisions.${index}.type`, val as 'open' | 'conditional' | 'exact', { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 capitalize disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="conditional">Conditional (grade range)</SelectItem>
                        <SelectItem value="exact">Exact Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isConditional && (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label className="font-poppins font-medium text-[14px] text-[#181818]">Division Type</Label>
                        <Select
                          value={watch(`divisions.${index}.divisionType`)}
                          onValueChange={(val) => {
                            if (val) setValue(`divisions.${index}.divisionType`, val as string, { shouldDirty: true, shouldValidate: true });
                          }}
                        >
                          <SelectTrigger className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 capitalize">
                            <SelectValue placeholder="e.g. K1" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            {DIVISION_TYPES.map(dt => (
                              <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.divisions?.[index]?.divisionType && (
                          <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.divisionType?.message}</p>
                        )}
                      </div>



                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-poppins font-medium text-[14px] text-[#181818]">Rating Limit</Label>
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
                          {...register(`divisions.${index}.rating` as const, { valueAsNumber: true })}
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
                          placeholder="e.g. 500"
                          className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-[#181818]/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {errors.divisions?.[index]?.rating && (
                          <p className="text-[12px] text-red-500 mt-[-6px]">{errors.divisions[index]?.rating?.message}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Live Preview Display */}
                {isConditional && (
                  <div className={cn(
                    "mt-2 border rounded-[8px] px-4 py-3 flex items-center justify-between",
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
                        ? <span className="text-red-500 font-semibold">Duplicate Division Detected</span>
                        : "Generated Name:"
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
                )}
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
          onClick={() => appendDivision({ type: 'conditional', condition: 'under' })}
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
