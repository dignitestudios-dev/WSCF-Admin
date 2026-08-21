'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateUser } from '../hooks/use-users';
import { toast } from 'sonner';

function formatPhoneNumber(value: string) {
  if (!value) return value;
  const hasPlus = value.startsWith('+');
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return hasPlus ? '+' : '';
  }

  if (hasPlus) {
    if (cleaned.length <= 1) {
      return `+${cleaned}`;
    }
    if (cleaned.length <= 4) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
    }
    if (cleaned.length <= 7) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    }
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  } else {
    if (cleaned.length <= 3) {
      return cleaned;
    }
    if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
}

const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be at most 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be at most 50 characters'),
  gender: z.string().optional(),
  sigma: z.string().optional(),
  streetAddress: z.string().max(150, 'Street Address must be at most 150 characters').optional().or(z.literal('')),
  city: z.string().max(100, 'City must be at most 100 characters').optional().or(z.literal('')),
  grade: z.string().max(20, 'Grade must be at most 20 characters').optional().or(z.literal('')),
  zipCode: z.string().max(10, 'Zip Code must be at most 10 characters').optional().or(z.literal('')),
  rating: z.string().max(5, 'Rating must be at most 5 characters').optional().or(z.literal('')),
  fatherName: z.string().max(100, 'Father\'s Name must be at most 100 characters').optional().or(z.literal('')),
  fatherPhone: z.string().max(20, 'Father\'s Phone must be at most 20 characters').optional().or(z.literal('')),
  motherName: z.string().max(100, 'Mother\'s Name must be at most 100 characters').optional().or(z.literal('')),
  motherPhone: z.string().max(20, 'Mother\'s Phone must be at most 20 characters').optional().or(z.literal('')),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

/**
 * `userId` is the PLAYER being edited — a child. The name, grade and rating
 * belong to them; the address and guardian details belong to the account and
 * are shared with any siblings, which the dialog says out loud.
 */
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialData: {
    user?: {
      name?: string;
      address?: {
        streetAddress?: string | null;
        city?: string | null;
        zipCode?: number | null;
      };
      parents?: {
        father?: { name?: string; phone?: string };
        mother?: { name?: string; phone?: string };
      };
    } | null;
    playerProfile?: {
      firstName?: string;
      lastName?: string;
      gender?: string;
      sigma?: string;
      grade?: string;
      rating?: number;
      account?: {
        address?: {
          streetAddress?: string | null;
          city?: string | null;
          zipCode?: number | null;
        };
        parents?: {
          father?: { name?: string; phone?: string };
          mother?: { name?: string; phone?: string };
        };
      } | null;
    } | null;
  } | null;
}

export function EditUserDialog({ open, onOpenChange, userId, initialData }: EditUserDialogProps) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      sigma: '',
      streetAddress: '',
      city: '',
      grade: '',
      zipCode: '',
      rating: '',
      fatherName: '',
      fatherPhone: '',
      motherName: '',
      motherPhone: '',
    },
  });

  useEffect(() => {
    if (open && initialData) {
      const profile = initialData.playerProfile;
      // The account, whichever key the caller passed it under.
      const account = initialData.user ?? profile?.account ?? null;
      const address = account?.address;

      reset({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        gender: profile?.gender || '',
        sigma: profile?.sigma || '',
        streetAddress: address?.streetAddress || '',
        city: address?.city || '',
        grade: profile?.grade || '',
        zipCode:
          address?.zipCode !== undefined && address?.zipCode !== null
            ? String(address.zipCode)
            : '',
        rating: profile?.rating !== undefined && profile?.rating !== null ? String(profile.rating) : '',
        fatherName: account?.parents?.father?.name || '',
        fatherPhone: formatPhoneNumber(account?.parents?.father?.phone || ''),
        motherName: account?.parents?.mother?.name || '',
        motherPhone: formatPhoneNumber(account?.parents?.mother?.phone || ''),
      });
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: EditUserFormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender || undefined,
      sigma: data.sigma || undefined,
      streetAddress: data.streetAddress || undefined,
      city: data.city || undefined,
      grade: data.grade || undefined,
      zipCode: data.zipCode ? Number(data.zipCode) : undefined,
      rating: data.rating ? Number(data.rating) : undefined,
      parents: {
        father: {
          name: data.fatherName || undefined,
          phone: data.fatherPhone ? data.fatherPhone.replace(/[^0-9+]/g, '') : undefined,
        },
        mother: {
          name: data.motherName || undefined,
          phone: data.motherPhone ? data.motherPhone.replace(/[^0-9+]/g, '') : undefined,
        },
      },
    };

    try {
      await updateUser(payload);
      toast.success('User profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by react-query / global toast
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw]! sm:w-[589px]! max-w-[589px]! max-h-[90vh]! overflow-y-auto no-scrollbar bg-white rounded-[12px] p-0 border-none shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-8 pb-0">
          <DialogTitle className="font-poppins font-semibold text-[32px] leading-[43px] text-[#181818]">
            Edit Profile
          </DialogTitle>
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
            {/* Name */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="firstName" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="firstName"
                    maxLength={50}
                    placeholder="Enter first name"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('firstName', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      }
                    })}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.firstName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="lastName" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="lastName"
                    maxLength={50}
                    placeholder="Enter last name"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('lastName', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      }
                    })}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Gender and Sigma */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="gender" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  Gender
                </Label>
                <div className="relative h-[44px]">
                  <select
                    id="gender"
                    {...register('gender')}
                    className="h-full w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.gender.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="sigma" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  Sigma
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="sigma"
                    maxLength={50}
                    placeholder="Enter sigma"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('sigma')}
                  />
                </div>
                {errors.sigma && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.sigma.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="streetAddress" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                Street Address
              </Label>
              <div className="relative h-[44px]">
                <Input
                  id="streetAddress"
                  maxLength={150}
                  placeholder="Enter street address"
                  className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                  {...register('streetAddress')}
                />
              </div>
              {errors.streetAddress && (
                <p className="text-[12px] text-red-500 mt-[-6px]">{errors.streetAddress.message}</p>
              )}
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="city" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                City
              </Label>
              <div className="relative h-[44px]">
                <Input
                  id="city"
                  maxLength={100}
                  placeholder="Enter city"
                  className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                  {...register('city')}
                />
              </div>
              {errors.city && (
                <p className="text-[12px] text-red-500 mt-[-6px]">{errors.city.message}</p>
              )}
            </div>

            {/* Grade & Zip Code */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="grade" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  Grade
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="grade"
                    maxLength={20}
                    placeholder="Enter grade"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('grade')}
                  />
                </div>
                {errors.grade && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.grade.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="zipCode" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                  Zip Code
                </Label>
                <div className="relative h-[44px]">
                  <Input
                    id="zipCode"
                    maxLength={10}
                    placeholder="Enter zip code"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    {...register('zipCode', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                      }
                    })}
                  />
                </div>
                {errors.zipCode && (
                  <p className="text-[12px] text-red-500 mt-[-6px]">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="rating" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                Rating
              </Label>
              <div className="relative h-[44px]">
                <Input
                  id="rating"
                  maxLength={5}
                  placeholder="Enter rating"
                  className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                  {...register('rating', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  })}
                />
              </div>
              {errors.rating && (
                <p className="text-[12px] text-red-500 mt-[-6px]">{errors.rating.message}</p>
              )}
            </div>

            {/* Father's Details */}
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4">
              <h3 className="font-poppins font-semibold text-[16px] text-[#083F92] m-0">Father&apos;s Details</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="fatherName" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                    Father&apos;s Name
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="fatherName"
                      maxLength={100}
                      placeholder="Name"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('fatherName', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        }
                      })}
                    />
                  </div>
                  {errors.fatherName && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.fatherName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="fatherPhone" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                    Father&apos;s Phone
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="fatherPhone"
                      maxLength={20}
                      placeholder="Phone"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('fatherPhone', {
                        onChange: (e) => {
                          e.target.value = formatPhoneNumber(e.target.value);
                        }
                      })}
                    />
                  </div>
                  {errors.fatherPhone && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.fatherPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mother's Details */}
            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4">
              <h3 className="font-poppins font-semibold text-[16px] text-[#083F92] m-0">Mother&apos;s Details</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="motherName" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                    Mother&apos;s Name
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="motherName"
                      maxLength={100}
                      placeholder="Name"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('motherName', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        }
                      })}
                    />
                  </div>
                  {errors.motherName && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.motherName.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="motherPhone" className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                    Mother&apos;s Phone
                  </Label>
                  <div className="relative h-[44px]">
                    <Input
                      id="motherPhone"
                      maxLength={20}
                      placeholder="Phone"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                      {...register('motherPhone', {
                        onChange: (e) => {
                          e.target.value = formatPhoneNumber(e.target.value);
                        }
                      })}
                    />
                  </div>
                  {errors.motherPhone && (
                    <p className="text-[12px] text-red-500 mt-[-6px]">{errors.motherPhone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[12px] mt-8 disabled:opacity-50 shadow-md"
          >
            <span className="font-poppins font-semibold text-[14px] leading-[19px] text-white capitalize">
              {isPending ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
