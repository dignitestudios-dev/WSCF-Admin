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

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function CreateTournamentDialog({ open, onOpenChange, initialData }: CreateTournamentDialogProps) {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionInput, setDivisionInput] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
      const initDivisions = initialData.customDropdownOptions?.find((opt: any) => opt.fieldId)?.values || [];
      setDivisions(initDivisions);
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
        divisions: initDivisions,
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
      setDivisions([]);
      setIsFree(false);
    }
  }, [open, initialData, reset]);

  const handleAddDivision = () => {
    const trimmed = divisionInput.trim();
    if (!trimmed) return;
    const next = [...divisions, trimmed];
    setDivisions(next);
    setValue('divisions', next);
    setDivisionInput('');
  };

  const handleRemoveDivision = (index: number) => {
    const next = divisions.filter((_, i) => i !== index);
    setDivisions(next);
    setValue('divisions', next);
  };

  const handleToggleFree = () => {
    const next = !isFree;
    setIsFree(next);
    setValue('isFree', next);
    if (next) setValue('entryFee', '');
  };

  const onSubmit = (data: TournamentFormData) => {
    const payload = {
      title: data.title,
      date: new Date(data.date).toISOString(),
      location: data.location,
      entryFee: data.isFree ? 0 : (parseFloat(data.entryFee || '0') || 0),
      isPaid: !data.isFree,
      tournamentDirector: data.director,
      tournamentHost: data.host,
      customDropdownOptions: divisions.length > 0 ? [
        {
          fieldId: 'division',
          values: divisions
        }
      ] : []
    };

    const actionOptions = {
      onSuccess: () => {
        reset();
        setDivisions([]);
        setDivisionInput('');
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
    setDivisions([]);
    setDivisionInput('');
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
                  Tournament Title
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
                  Date Of Tournament
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="date"
                    type="date"
                    placeholder="Enter date"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('date')}
                  />
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
                  Location
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="location"
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
                      placeholder="Enter Amount"
                      disabled={isFree}
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40 disabled:opacity-40"
                      {...register('entryFee')}
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
                    Tournament Director
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
                    Tournament Host
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

              {/* Add Divisions */}
              <div className="flex flex-col gap-2">
                <Label
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Add Divisions
                </Label>

                {/* Division Input Row */}
                <div className="relative h-[44px] flex items-center w-full bg-white border border-[#3D3775] rounded-[24px] overflow-hidden">
                  <Input
                    placeholder="Write divisions!"
                    value={divisionInput}
                    onChange={(e) => setDivisionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDivision(); } }}
                    className="h-full flex-1 bg-transparent border-none pl-4 pr-[80px] font-general-sans text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]"
                  />
                  {/* Add circle button (Figma Ellipse 9290 + Icon) */}
                  <button
                    type="button"
                    onClick={handleAddDivision}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[92px] h-[92px] bg-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/95 transition-colors shrink-0 z-10 focus:outline-none"
                  >
                    <Plus className="w-[28px] h-[28px] text-white stroke-[2.5]" />
                  </button>
                </div>

                {/* Division tags */}
                {divisions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {divisions.map((div, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 h-[44px] px-4 pr-2.5 bg-white border border-[#3D3775] rounded-[24px]"
                      >
                        <span className="font-general-sans font-medium text-[14px] text-[#181818]">{div}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDivision(i)}
                          className="w-[24px] h-[24px] rounded-full bg-[#083F92] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none"
                        >
                          <Minus className="w-[14px] h-[14px] stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
