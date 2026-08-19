'use client';

import { useEffect, useState } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAssignUserToSchool } from '../hooks/use-schools';
import { School } from '../services/school.service';
import { useUsers } from '@/features/users/hooks/use-users';
import { useDebounce } from '@/hooks/use-debounce';

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}

export function AssignUserDialog({ open, onOpenChange, school }: AssignUserDialogProps) {
  const { mutateAsync: assignUser, isPending } = useAssignUserToSchool();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [error, setError] = useState('');

  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: usersData, isFetching: isUsersPending } = useUsers(page, 10, debouncedSearch);
  const users = usersData?.data?.users || [];
  const totalPages = usersData?.data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (open) {
      setSelectedUserId('');
      setSelectedUserName('');
      setError('');
      setSearchQuery('');
      setPage(1);
    }
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }
    
    try {
      await assignUser({ id: school._id, userId: selectedUserId });
      onOpenChange(false);
    } catch (err) {
      // Error is handled by react-query hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[480px]! max-w-[480px]! bg-white rounded-[12px] p-0 border-none shadow-2xl"
      >
        <div className="flex items-start justify-between px-8 pt-8 pb-0">
          <DialogTitle className="font-poppins font-semibold text-[24px] text-[#181818]">
            Assign User to School
          </DialogTitle>
          <button
            onClick={handleClose}
            className="text-[#181818]/60 hover:text-[#181818] transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 mt-2">
          <p className="text-[14px] text-[#565656] font-poppins">
            Assigning to: <span className="font-semibold text-[#181818]">{school?.name}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 px-8 pb-8 pt-4">
          <div className="flex flex-col gap-2">
            <Label className="font-poppins font-medium text-[14px] text-[#181818]">
              Select User <span className="text-red-500">*</span>
            </Label>
            
            <div className="relative w-full h-[44px]">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger 
                  className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-poppins font-normal text-[14px] text-[#181818] outline-none disabled:opacity-60 focus:ring-0 focus-visible:ring-0 flex items-center justify-between" 
                  disabled={isPending}
                  type="button"
                >
                  <span className="truncate">
                    {selectedUserId
                      ? selectedUserName || "Select a user"
                      : "Select a user"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[416px] p-0 rounded-[12px] bg-white border-[#DADADA]" align="start">
                  <div className="flex flex-col w-full">
                    <div className="px-3 py-2 border-b border-[#DADADA]/50">
                      <Input
                        placeholder="Search user by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 border-none focus-visible:ring-0 shadow-none font-poppins text-sm px-0"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {isUsersPending ? (
                        <div className="py-6 text-center text-sm font-poppins text-[#565656]">Loading...</div>
                      ) : users.length === 0 ? (
                        <div className="py-6 text-center text-sm font-poppins text-[#565656]">No user found.</div>
                      ) : (
                        users.map((user: any) => (
                          <div
                            key={user._id}
                            className={cn(
                              "relative flex cursor-default select-none items-center rounded-[8px] px-3 py-2 text-sm outline-none hover:bg-[#083F92]/10 hover:text-[#083F92] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-poppins transition-colors cursor-pointer mb-1 last:mb-0",
                              selectedUserId === user._id ? "bg-[#083F92]/10 text-[#083F92] font-medium" : "text-[#181818]"
                            )}
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setSelectedUserName(`${user.firstName} ${user.lastName}`);
                              setError('');
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.firstName} {user.lastName}
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-2 border-t border-[#DADADA]/50 bg-[#F9FAFB] rounded-b-[12px]">
                        <button
                          type="button"
                          disabled={page <= 1 || isUsersPending}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPage(p => p - 1);
                          }}
                          className="text-[12px] font-poppins font-medium text-[#083F92] disabled:opacity-50 hover:underline cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="text-[11px] font-poppins text-[#565656]">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={page >= totalPages || isUsersPending}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPage(p => p + 1);
                          }}
                          className="text-[12px] font-poppins font-medium text-[#083F92] disabled:opacity-50 hover:underline cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {error && (
              <p className="text-[12px] text-red-500">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[12px] mt-4 shadow-md"
          >
            <span className="font-poppins font-semibold text-[14px] text-white capitalize">
              {isPending ? 'Assigning...' : 'Assign User'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
