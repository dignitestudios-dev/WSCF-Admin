'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { useSendNotification } from '@/features/notifications/hooks/use-send-notification';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

/** Sentinel for the "everyone" option — the API expects no tournamentId at all. */
const ALL_USERS = 'all';

// Form validation schema with Zod
const notificationSchema = z.object({
  recipient: z.string().min(1, { message: 'Please choose who to notify' }),
  subject: z
    .string()
    .min(4, { message: 'Subject must be at least 4 characters' })
    .max(100, { message: 'Subject cannot exceed 100 characters' }),
  message: z
    .string()
    .min(4, { message: 'Message must be at least 4 characters' })
    .max(500, { message: 'Message cannot exceed 500 characters' }),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function Notifications() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      recipient: ALL_USERS,
      subject: '',
      message: '',
    },
  });

  const subjectValue = watch('subject', '');
  const messageValue = watch('message', '');
  const recipientValue = watch('recipient', ALL_USERS);

  // Searchable tournament picker — the query goes to the API, so the full list
  // is reachable rather than only the first page.
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tournamentSearch, setTournamentSearch] = useState('');
  const debouncedTournamentSearch = useDebounce(tournamentSearch, 400);

  const { data: tournamentsData, isLoading: isLoadingTournaments } = useTournaments(
    1,
    20,
    debouncedTournamentSearch
  );
  const tournaments = tournamentsData?.data?.tournaments || [];

  // Held separately so the label survives a search that no longer returns it
  const [selectedTournamentTitle, setSelectedTournamentTitle] = useState('');
  const recipientLabel =
    recipientValue === ALL_USERS ? 'All Users' : selectedTournamentTitle || 'Select a tournament';

  const { mutate: sendNotification, isPending: isSubmitting } = useSendNotification();

  const onSubmit = (data: NotificationFormValues) => {
    const { recipient, ...rest } = data;

    sendNotification(
      {
        ...rest,
        // "All Users" means no tournamentId at all
        ...(recipient === ALL_USERS ? {} : { tournamentId: recipient }),
      },
      {
        onSuccess: () => {
          // keep the chosen audience, clear only the message
          reset({ recipient, subject: '', message: '' });
        },
      }
    );
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Page Title */}
        <div className="flex flex-col">
          <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
            Push Notifications
          </h1>
        </div>

        {/* Main Content White Container */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm p-8 min-h-[500px] flex flex-col items-start">
          
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[343px] flex flex-col gap-6"
          >
            {/* Recipients: everyone, or one tournament's participants */}
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                Send To <span className="text-red-500">*</span>
              </Label>

              <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <PopoverTrigger
                  type="button"
                  disabled={isSubmitting}
                  className="w-full h-[42px] bg-white border border-[#3D3775] rounded-full px-4 font-poppins font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50 flex items-center justify-between"
                >
                  <span className="truncate">{recipientLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[343px] p-0 rounded-[12px] bg-white border-[#DADADA]"
                >
                  <div className="flex flex-col w-full">
                    <div className="px-3 py-2 border-b border-[#DADADA]/50">
                      <Input
                        placeholder="Search tournaments..."
                        value={tournamentSearch}
                        onChange={(e) => setTournamentSearch(e.target.value)}
                        className="h-8 border-none focus-visible:ring-0 shadow-none font-poppins text-sm px-0"
                      />
                    </div>

                    <div className="max-h-[240px] overflow-y-auto p-1">
                      {/* Always available, regardless of the search */}
                      <div
                        onClick={() => {
                          setValue('recipient', ALL_USERS, { shouldValidate: true });
                          setSelectedTournamentTitle('');
                          setIsPickerOpen(false);
                        }}
                        className={cn(
                          'relative flex cursor-pointer select-none items-center rounded-[8px] px-3 py-2 text-sm outline-none hover:bg-[#083F92]/10 hover:text-[#083F92] font-poppins transition-colors mb-1',
                          recipientValue === ALL_USERS
                            ? 'bg-[#083F92]/10 text-[#083F92] font-medium'
                            : 'text-[#181818]'
                        )}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            recipientValue === ALL_USERS ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        All Users
                      </div>

                      <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-[#181818]/40 font-poppins">
                        Tournaments
                      </div>

                      {isLoadingTournaments ? (
                        <div className="py-6 text-center text-sm font-poppins text-[#565656]">
                          Loading...
                        </div>
                      ) : tournaments.length === 0 ? (
                        <div className="py-6 text-center text-sm font-poppins text-[#565656]">
                          No tournament found.
                        </div>
                      ) : (
                        tournaments.map((t: { _id: string; title: string; status?: string }) => (
                          <div
                            key={t._id}
                            onClick={() => {
                              setValue('recipient', t._id, { shouldValidate: true });
                              setSelectedTournamentTitle(t.title);
                              setIsPickerOpen(false);
                            }}
                            className={cn(
                              'relative flex cursor-pointer select-none items-center rounded-[8px] px-3 py-2 text-sm outline-none hover:bg-[#083F92]/10 hover:text-[#083F92] font-poppins transition-colors mb-1 last:mb-0',
                              recipientValue === t._id
                                ? 'bg-[#083F92]/10 text-[#083F92] font-medium'
                                : 'text-[#181818]'
                            )}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                recipientValue === t._id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <span className="truncate">{t.title}</span>
                            {t.status ? (
                              <span className="ml-auto pl-2 text-[11px] text-[#181818]/45 capitalize shrink-0">
                                {t.status}
                              </span>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <p className="font-poppins text-[12px] text-[#808080]">
                {recipientValue === ALL_USERS
                  ? 'Emails every user.'
                  : 'Emails only the registered participants of this tournament.'}
              </p>

              {errors.recipient && (
                <p className="font-poppins text-[12px] text-red-500 mt-[-4px]">
                  {errors.recipient.message}
                </p>
              )}
            </div>

            {/* Subject Field Group */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <label 
                  htmlFor="subject" 
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <span className="font-poppins text-[12px] text-[#808080]">
                  {subjectValue.length}/100
                </span>
              </div>
              <div className="relative w-full">
                <input
                  id="subject"
                  type="text"
                  placeholder="Subject"
                  maxLength={100}
                  disabled={isSubmitting}
                  {...register('subject')}
                  className={`w-full h-[44px] bg-white border rounded-[24px] px-4 font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656] outline-none transition-all ${
                    errors.subject ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#3D3775] focus:ring-1 focus:ring-[#3D3775]'
                  }`}
                />
              </div>
              {errors.subject && (
                <span className="font-poppins text-[12px] text-red-500 mt-0.5 ml-2 animate-fade-in">
                  {errors.subject.message}
                </span>
              )}
            </div>

            {/* Message Field Group */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <label 
                  htmlFor="message" 
                  className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <span className="font-poppins text-[12px] text-[#808080]">
                  {messageValue.length}/500
                </span>
              </div>
              <div className="relative w-full">
                <textarea
                  id="message"
                  placeholder="Write here"
                  maxLength={500}
                  disabled={isSubmitting}
                  {...register('message')}
                  className={`w-full h-[148px] bg-white border rounded-[12px] p-4 font-poppins font-normal text-[14px] text-[#181818] placeholder:text-[#565656] outline-none resize-none transition-all ${
                    errors.message ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#3D3775] focus:ring-1 focus:ring-[#3D3775]'
                  }`}
                />
              </div>
              {errors.message && (
                <span className="font-poppins text-[12px] text-red-500 mt-0.5 ml-2 animate-fade-in">
                  {errors.message.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/95 active:bg-[#083F92]/90 disabled:bg-[#083F92]/40 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none shrink-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-white text-center capitalize">
                  Push
                </span>
              )}
            </button>
          </form>

        </div>

      </div>
    </PageTransition>
  );
}
