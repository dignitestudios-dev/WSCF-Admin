'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ConfirmDeleteDialog } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormFields } from '@/features/forms/hooks/use-form-fields';
import { useCreateFormField } from '@/features/forms/hooks/use-create-form-field';
import { useUpdateFormField } from '@/features/forms/hooks/use-update-form-field';
import { useDeleteFormField } from '@/features/forms/hooks/use-delete-form-field';
import { FormField } from '@/features/forms/services/form.service';

export default function Forms() {
  const { data: formFieldsData, isLoading, isFetching } = useFormFields();
  const { mutateAsync: createFormField, isPending: isCreating } = useCreateFormField();
  const { mutateAsync: updateFormField, isPending: isUpdating } = useUpdateFormField();
  const { mutateAsync: deleteFormField, isPending: isDeleting } = useDeleteFormField();

  const fields = useMemo(() => {
    return formFieldsData?.data?.fields || [];
  }, [formFieldsData]);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<FormField | null>(null);

  // Form states
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [nature, setNature] = useState('mandatory');
  const [minLength, setMinLength] = useState<number | ''>('');
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState('');
  const [isTournamentSpecific, setIsTournamentSpecific] = useState<boolean>(false);

  const handleOpenAddDialog = () => {
    setEditingField(null);
    setFieldName('');
    setFieldType('text');
    setNature('mandatory');
    setMinLength('');
    setOptionsList([]);
    setCurrentOption('');
    setIsTournamentSpecific(false);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (field: FormField) => {
    setEditingField(field);
    setFieldName(field.fieldName || '');
    setFieldType(field.fieldType || 'text');
    setNature(field.nature || 'mandatory');
    setMinLength(field.minLength !== undefined ? field.minLength : '');
    setOptionsList(field.options || []);
    setCurrentOption('');
    setIsTournamentSpecific(field.isTournamentSpecific || false);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (field: FormField) => {
    setFieldToDelete(field);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (fieldToDelete) {
      await deleteFormField(fieldToDelete._id);
      setDeleteConfirmOpen(false);
      setFieldToDelete(null);
    }
  };

  const handleAddOption = () => {
    const trimmed = currentOption.trim();
    if (trimmed && !optionsList.includes(trimmed)) {
      setOptionsList(prev => [...prev, trimmed]);
      setCurrentOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptionsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      fieldName: fieldName.trim(),
      fieldType,
      nature,
      minLength: Number(minLength),
      options: fieldType === 'dropdown' && !isTournamentSpecific ? optionsList : [],
      isTournamentSpecific: fieldType === 'dropdown' ? isTournamentSpecific : false,
    };

    if (editingField) {
      await updateFormField({ id: editingField._id, data: payload });
    } else {
      await createFormField(payload);
    }
    setIsDialogOpen(false);
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
              Registration Form
            </h1>
          </div>

        </div>

        {/* Form Preview Container */}
        <div className="w-full bg-[#FFFFFF] border border-[#DADADA] rounded-[24px] overflow-hidden flex flex-col shadow-xs mt-6 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-[42px] w-full rounded-full" />
                </div>
              ))
            ) : fields.length > 0 ? (
              fields.map((field) => (
                <div key={field._id} className="flex flex-col gap-2 relative group">
                  <div className="flex justify-between items-center">
                    <label className="font-poppins font-medium text-[14px] leading-[21px] text-[#181818] capitalize">
                      {field.fieldName} {field.nature === 'mandatory' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditDialog(field)}
                        className="w-[28px] h-[28px] bg-[#083F92]/10 hover:bg-[#083F92]/20 rounded-full flex items-center justify-center text-[#083F92] transition-colors cursor-pointer focus:outline-none"
                        title="Edit Field"
                      >
                        <Pencil className="w-[14px] h-[14px]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(field)}
                        className="w-[28px] h-[28px] bg-[#083F92]/10 hover:bg-red-100 rounded-full flex items-center justify-center text-[#CE2D32] transition-colors cursor-pointer focus:outline-none"
                        title="Delete Field"
                      >
                        <Trash2 className="w-[14px] h-[14px]" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative h-[42px] w-full">
                    {field.fieldType === 'dropdown' ? (
                      field.isTournamentSpecific ? (
                        // Options are chosen per tournament, so there is nothing
                        // to preview here — keep the inert placeholder.
                        <div className="w-full h-full bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] flex items-center opacity-70 pointer-events-none justify-between">
                          <span className="text-[#181818]/60">Set per tournament</span>
                          <ChevronDown className="w-4 h-4 text-[#083F92] opacity-80" />
                        </div>
                      ) : (
                        // Preview only: it opens so the options can be read, but
                        // onValueChange is a no-op so nothing can be selected.
                        <Select value="" onValueChange={() => {}}>
                          <SelectTrigger className="w-full h-[42px]! bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] outline-none focus:ring-0 focus-visible:ring-0">
                            <SelectValue placeholder={`Select ${field.fieldName}...`} />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            {(field.options || []).length > 0 ? (
                              field.options.map((opt: string) => (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className="cursor-default focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5"
                                >
                                  {opt}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-3 py-2.5 text-[13px] text-[#181818]/50">
                                No options configured
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      )
                    ) : (
                      <Input
                        type={field.fieldType === 'number' ? 'number' : field.fieldType === 'email' ? 'email' : 'text'}
                        placeholder={`Enter ${field.fieldName}`}
                        className="w-full h-full bg-white border border-[#3D3775] rounded-full px-4 font-normal text-[14px] text-[#181818] placeholder:text-[#181818]/40 pointer-events-none opacity-70"
                        readOnly
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[12px] text-[#181818]/50">Min Length: {field.minLength}</span>
                    {field.fieldType === 'dropdown' && (
                      <span className="text-[12px] text-[#181818]/50 truncate max-w-[200px]" title={field.options?.join(', ')}>Options: {field.isTournamentSpecific ? 'Tournament Specific' : field.options?.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full md:col-span-2 py-12 text-center text-[#787878] font-poppins">
                No fields created for this form yet.
              </div>
            )}

          </div>

          {/* Add Field — below the fields, outside the grid so it spans the
              full width instead of landing in one column */}
          <div className="flex justify-center w-full mt-8 pt-6 border-t border-[#DADADA]/60">
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center gap-2 h-[40px] px-5 bg-white border border-[#083F92] hover:bg-[#083F92]/5 text-[#083F92] rounded-full transition-colors font-poppins font-medium text-[13px] cursor-pointer focus:outline-none"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {fields.length > 0 ? 'Add Another Field' : 'Add Field'}
            </button>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            showCloseButton={true}
            className="sm:max-w-[589px] w-[90vw] max-h-[90vh] overflow-y-auto bg-white rounded-[12px] p-6 sm:p-8 border-none shadow-2xl outline-none"
          >
            <DialogTitle className="font-general-sans font-semibold text-[32px] leading-[43px] text-[#181818] m-0 mb-6">
              {editingField ? 'Edit Field' : 'Add Field'}
            </DialogTitle>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[22px] w-full">
              {/* Field Name */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <div className="relative h-[44px]">
                  <Input
                    required
                    maxLength={30}
                    value={fieldName}
                    onChange={(e) => {
                      const cleanValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFieldName(cleanValue);
                    }}
                    placeholder="E.g. Grade"
                    className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                  />
                </div>
              </div>

              {/* Grid for Type and Nature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field Type */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={fieldType} onValueChange={(val) => val && setFieldType(val)}>
                    <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select type">{fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#3D3775] rounded-[12px] z-[100] shadow-xl p-2">
                      <SelectItem value="text" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Text</SelectItem>
                      <SelectItem value="number" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Number</SelectItem>
                      <SelectItem value="dropdown" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Dropdown</SelectItem>
                      {/* <SelectItem value="email" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Email</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nature */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Nature <span className="text-red-500">*</span>
                  </label>
                  <Select value={nature} onValueChange={(val) => val && setNature(val)}>
                    <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select nature">{nature.charAt(0).toUpperCase() + nature.slice(1)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#3D3775] rounded-[12px] z-[100] shadow-xl p-2">
                      <SelectItem value="mandatory" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Mandatory</SelectItem>
                      <SelectItem value="optional" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid for Min Length and Tournament Specific */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min Length */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Min Length <span className="text-red-500">*</span>
                  </label>
                  <div className="relative h-[44px]">
                    <Input
                      type="number"
                      min={0}
                      value={minLength}
                      onChange={(e) => setMinLength(e.target.value ? Number(e.target.value) : '')}
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Tournament Specific */}
                {fieldType === 'dropdown' && (
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                      Tournament Specific <span className="text-red-500">*</span>
                    </label>
                    <Select value={isTournamentSpecific ? 'true' : 'false'} onValueChange={(val) => setIsTournamentSpecific(val === 'true')}>
                      <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Tournament Specific">{isTournamentSpecific ? 'Yes' : 'No'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#3D3775] rounded-[12px] z-[100] shadow-xl p-2">
                        <SelectItem value="false" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">No</SelectItem>
                        <SelectItem value="true" className="cursor-pointer focus:bg-[#083F92]/10 focus:text-[#083F92] rounded-[8px] py-2.5 mb-1 last:mb-0">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Options (if dropdown and not tournament specific) */}
              {fieldType === 'dropdown' && !isTournamentSpecific && (
                <div className="flex flex-col gap-[8px] w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <div className="relative h-[44px] flex items-center w-full bg-white border border-[#3D3775] rounded-[24px] overflow-hidden">
                    <Input
                      maxLength={30}
                      value={currentOption}
                      onChange={(e) => setCurrentOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder="e.g. Beginner"
                      className="h-full flex-1 bg-transparent border-none pl-4 pr-[80px] font-general-sans text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[92px] h-[92px] bg-[#083F92] rounded-full flex items-center justify-center hover:bg-[#083F92]/95 transition-colors shrink-0 z-10 focus:outline-none"
                    >
                      <Plus className="w-[28px] h-[28px] text-white stroke-[2.5]" />
                    </button>
                  </div>
                  
                  {/* Tags */}
                  {optionsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {optionsList.map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 h-[44px] px-4 pr-2.5 bg-white border border-[#3D3775] rounded-[24px]"
                        >
                          <span className="font-general-sans font-medium text-[14px] text-[#181818]">{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(i)}
                            className="w-[24px] h-[24px] rounded-full bg-[#083F92] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none"
                          >
                            <Minus className="w-[14px] h-[14px] stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 text-white font-poppins font-semibold text-[16px] rounded-[12px] mt-4 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center cursor-pointer"
              >
                {(isCreating || isUpdating) ? 'Saving...' : 'Save Field'}
              </button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDeleteDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Field"
          description={`Are you sure you want to delete the field "${fieldToDelete?.fieldName}"?`}
          onConfirm={executeDelete}
          isLoading={isDeleting}
        />
      </div>
    </PageTransition>
  );
}
