'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tournamentSchema, TournamentFormData } from '../schema/tournament.schema';
import { useCreateTournament } from '../hooks/use-create-tournament';
import { useUpdateTournament } from '../hooks/use-update-tournament';
import { useFormFields } from '@/features/forms/hooks/use-form-fields';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function CreateTournamentDialog({ open, onOpenChange, initialData }: CreateTournamentDialogProps) {
  const [customFields, setCustomFields] = useState<Record<string, string[]>>({});
  const [customFieldInputs, setCustomFieldInputs] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  const [isFree, setIsFree] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: formFieldsData } = useFormFields(true);
  const tournamentSpecificFields = formFieldsData?.data?.fields || [];

  const { mutate: createTournament, isPending: isCreating } = useCreateTournament();
  const { mutate: updateTournament, isPending: isUpdating } = useUpdateTournament();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      title: '',
      date: '',
      location: '',
      entryFee: '',
      isFree: false,
      director: '',
      host: '',
      divisions: [],
    },
  });

  useEffect(() => {
    if (open && initialData) {
      const initCustomFields: Record<string, string[]> = {};
      if (initialData.customDropdownOptions) {
        initialData.customDropdownOptions.forEach((opt: any) => {
          initCustomFields[opt.fieldId] = opt.values || [];
        });
      }
      setCustomFields(initCustomFields);
      setCustomFieldInputs({});
      setCustomFieldErrors({});
      setIsFree(initialData.isPaid === false);

      const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '';

      reset({
        title: initialData.title || '',
        date: formattedDate,
        location: initialData.location || '',
        entryFee: initialData.entryFee?.toString() || '',
        isFree: initialData.isPaid === false,
        director: initialData.tournamentDirector || '',
        host: initialData.tournamentHost || '',
        divisions: [],
      });
    } else if (open && !initialData) {
      reset({
        title: '',
        date: '',
        location: '',
        entryFee: '',
        isFree: false,
        director: '',
        host: '',
        divisions: [],
      });
      setCustomFields({});
      setCustomFieldInputs({});
      setCustomFieldErrors({});
      setIsFree(false);
    }
  }, [open, initialData, reset]);

  const handleAddCustomField = (fieldId: string) => {
    const input = customFieldInputs[fieldId] || '';
    const trimmed = input.trim();
    if (!trimmed) return;
    
    setCustomFields(prev => {
      const current = prev[fieldId] || [];
      return { ...prev, [fieldId]: [...current, trimmed] };
    });
    setCustomFieldInputs(prev => ({ ...prev, [fieldId]: '' }));
    setCustomFieldErrors(prev => ({ ...prev, [fieldId]: '' }));
  };

  const handleRemoveCustomField = (fieldId: string, index: number) => {
    setCustomFields(prev => {
      const current = prev[fieldId] || [];
      return { ...prev, [fieldId]: current.filter((_, i) => i !== index) };
    });
  };

  const handleCustomFieldInput = (fieldId: string, value: string) => {
    setCustomFieldInputs(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleToggleFree = () => {
    const next = !isFree;
    setIsFree(next);
    setValue('isFree', next);
    if (next) setValue('entryFee', '');
  };

  const onSubmit = (data: TournamentFormData) => {
    let hasError = false;
    const newErrors: Record<string, string> = {};
    
    tournamentSpecificFields.forEach(field => {
      if (field.nature === 'mandatory') {
        const values = customFields[field._id] || [];
        if (values.length === 0) {
          hasError = true;
          newErrors[field._id] = `${field.fieldName} is mandatory. Please add at least one option.`;
        }
      }
    });

    if (hasError) {
      setCustomFieldErrors(newErrors);
      return;
    }

    const payload = {
      title: data.title,
      date: new Date(data.date).toISOString(),
      location: data.location,
      entryFee: data.isFree ? 0 : (parseFloat(data.entryFee || '0') || 0),
      isPaid: !data.isFree,
      tournamentDirector: data.director,
      tournamentHost: data.host,
      customDropdownOptions: Object.keys(customFields).map(fieldId => ({
        fieldId,
        values: customFields[fieldId]
      })).filter(opt => opt.values.length > 0)
    };

    const actionOptions = {
      onSuccess: () => {
        reset();
        setCustomFields({});
        setCustomFieldInputs({});
        setCustomFieldErrors({});
        setIsFree(false);
        onOpenChange(false);
        setShowSuccess(true);
      }
    };

    if (initialData?._id) {
      updateTournament({ id: initialData._id, data: payload }, actionOptions);
    } else {
      createTournament(payload, actionOptions);
    }
  };

  const handleClose = () => {
    reset();
    setCustomFields({});
    setCustomFieldInputs({});
    setCustomFieldErrors({});
    setIsFree(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[90vw]! sm:w-[589px]! max-w-[589px]! max-h-[90vh]! overflow-y-auto no-scrollbar bg-white rounded-[12px] p-0 border-none shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-8 pb-0">
            <h2 className="font-poppins font-semibold text-[32px] leading-[43px] text-[#181818]">
              {initialData ? 'Edit Tournament' : 'Create Tournament'}
            </h2>
            <button
              onClick={handleClose}
              className="text-[#181818]/60 hover:text-[#181818] transition-colors mt-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 px-8 pb-8 pt-4 overflow-y-auto no-scrollbar max-h-[80vh]">
            <div className="flex flex-col gap-[22px]">

              {/* Tournament Title */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="title"
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Tournament Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="title"
                    placeholder="Enter Title"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
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
                <div className="relative h-[44px]">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger className={"w-full h-full"} >
                      <button
                        type="button"
                        className={cn(
                          "flex h-full w-full! items-center  justify-between bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 transition-colors",
                          !watch('date') && "text-[#181818]/40"
                        )}
                      >
                        {watch('date') ? format(new Date(watch('date')), "PPP") : <span className="font-normal text-[#181818]/40">Pick a date</span>}
                        <CalendarIcon className="h-4 w-4 text-[#083F92] opacity-80" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={watch('date') ? new Date(watch('date')) : undefined}
                        onSelect={(date) => {
                          setValue('date', date ? date.toISOString() : '', { shouldValidate: true });
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
                <div className="relative h-[44px]">
                  <Input
                    id="location"
                    maxLength={100}
                    placeholder="Enter location"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
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
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Entry Fees
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Amount Input */}
                  <div className="relative h-[44px] flex-1">
                    <Input
                      id="entryFee"
                      type="text"
                      placeholder="Enter Amount"
                      disabled={isFree}
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40 disabled:opacity-40"
                      {...register('entryFee', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                        }
                      })}
                    />
                  </div>

                  {/* Free Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFree}
                    className={`h-[44px] w-full sm:w-[189px] shrink-0 border rounded-[24px] flex items-center justify-between px-4 transition-colors ${
                      isFree ? 'border-[#083F92] bg-[#083F92]/5' : 'border-[#3D3775] bg-white'
                    }`}
                  >
                    <span className="font-normal text-[14px] text-[#181818]">Free</span>
                    {/* Radio visual */}
                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors ${
                      isFree ? 'border-[#083F92]' : 'border-[#666666]'
                    }`}>
                      {isFree && (
                        <div className="w-[10px] h-[10px] rounded-full bg-[#083F92]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Tournament Director + Host (Side by side) */}
              <div className="flex flex-col sm:flex-row items-start gap-[22px]">
                {/* Director */}
                <div className="flex flex-col gap-2 flex-1 w-full">
                  <Label
                    htmlFor="director"
                    className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                  >
                    Tournament Director <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="director"
                      placeholder="Enter name"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('director')}
                    />
                  </div>
                  {errors.director && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.director.message}</p>
                  )}
                </div>

                {/* Host */}
                <div className="flex flex-col gap-2 flex-1 w-full">
                  <Label
                    htmlFor="host"
                    className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                  >
                    Tournament Host <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="host"
                      placeholder="Enter name"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('host')}
                    />
                  </div>
                  {errors.host && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.host.message}</p>
                  )}
                </div>
              </div>

              {/* Dynamic Tournament Specific Fields */}
              {tournamentSpecificFields.map(field => (
                <div key={field._id} className="flex flex-col gap-2">
                  <Label
                    className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                  >
                    Add {field.fieldName} {field.nature === 'mandatory' ? <span className="text-red-500">*</span> : '(Optional)'}
                  </Label>

                  {/* Field Input Row */}
                  <div className="relative h-[44px] flex items-center w-full bg-white border border-[#3D3775] rounded-[24px] overflow-hidden">
                    <Input
                      placeholder={`Write ${field.fieldName.toLowerCase()}!`}
                      value={customFieldInputs[field._id] || ''}
                      onChange={(e) => handleCustomFieldInput(field._id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomField(field._id); } }}
                      className="h-full flex-1 bg-transparent border-none pl-4 pr-[80px] font-general-sans text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomField(field._id)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[92px] h-[92px] bg-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/95 transition-colors shrink-0 z-10 focus:outline-none"
                    >
                      <Plus className="w-[28px] h-[28px] text-white stroke-[2.5]" />
                    </button>
                  </div>
                  {customFieldErrors[field._id] && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{customFieldErrors[field._id]}</p>
                  )}

                  {/* Tags */}
                  {customFields[field._id]?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {customFields[field._id].map((div, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 h-[44px] px-4 pr-2.5 bg-white border border-[#3D3775] rounded-[24px]"
                        >
                          <span className="font-general-sans font-medium text-[14px] text-[#181818]">{div}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(field._id, i)}
                            className="w-[24px] h-[24px] rounded-full bg-[#083F92] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none"
                          >
                            <Minus className="w-[14px] h-[14px] stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[12px] mt-8 disabled:opacity-50 shadow-md"
            >
              <span className="font-poppins font-semibold text-[14px] leading-[19px] text-white capitalize">
                {isPending || isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
              </span>
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          showCloseButton={false}
          className="w-[90vw]! sm:w-[515px]! max-w-[515px]! h-auto py-8 bg-white rounded-[12px] p-10 border-none shadow-2xl flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-[90%]">
            {/* Circle with check */}
            <div className="w-[120px] h-[120px] rounded-full bg-[#083F92] flex items-center justify-center text-white relative shadow-md">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            {/* Header texts */}
            <div className="flex flex-col items-center gap-2 w-full text-center">
              <h2 className="text-[32px] leading-[43px] font-semibold font-poppins text-[#181818] tracking-[-0.008em] capitalize m-0">
                {initialData ? 'Updated Successfully!' : 'Created Successfully!'}
              </h2>
              <p className="text-[18px] leading-[28px] font-normal font-poppins text-[#565656] tracking-[-0.014em] m-0">
                {initialData ? 'Tournament has been updated!' : 'New Tournament has been added to you upcoming list!'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
