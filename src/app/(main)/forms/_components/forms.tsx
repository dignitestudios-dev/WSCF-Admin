'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
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
  const [minLength, setMinLength] = useState<number>(0);
  const [optionsStr, setOptionsStr] = useState('');
  const [isTournamentSpecific, setIsTournamentSpecific] = useState<boolean>(false);

  const handleOpenAddDialog = () => {
    setEditingField(null);
    setFieldName('');
    setFieldType('text');
    setNature('mandatory');
    setMinLength(0);
    setOptionsStr('');
    setIsTournamentSpecific(false);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (field: FormField) => {
    setEditingField(field);
    setFieldName(field.fieldName || '');
    setFieldType(field.fieldType || 'text');
    setNature(field.nature || 'mandatory');
    setMinLength(field.minLength || 0);
    setOptionsStr((field.options || []).join(', '));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const optionsArray = optionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const payload = {
      fieldName: fieldName.trim(),
      fieldType,
      nature,
      minLength: Number(minLength),
      options: fieldType === 'dropdown' ? optionsArray : [],
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

          <button
            onClick={handleOpenAddDialog}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-all focus:outline-none h-[72px] shadow-sm w-full sm:w-auto justify-center shrink-0 cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center  relative shadow-md shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]  text-[#083F92] bg-white rounded-full" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Add Field
            </span>
          </button>
        </div>

        {/* Table Container */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden min-h-[400px] relative pb-16 mt-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold">Field Name</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Nature</th>
                  <th className="px-6 py-3 font-semibold">Min Length</th>
                  <th className="px-6 py-3 font-semibold">Tournament Specific</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="h-[50px] border-b border-[#EEEEEE] bg-white">
                      <td className="px-6 py-3"><Skeleton className="h-4 w-3/4 max-w-[200px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : fields.length > 0 ? (
                  fields.map((field, idx) => {
                    const isEven = idx % 2 !== 0;
                    return (
                      <tr
                        key={field._id}
                        className={`h-[50px] font-poppins text-[13px] text-[#000000] border-b border-[#EEEEEE] last:border-b-0 ${isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                      >
                        <td className="px-6 py-3 font-medium truncate max-w-[200px]">{field.fieldName}</td>
                        <td className="px-6 py-3 capitalize">{field.fieldType}</td>
                        <td className="px-6 py-3 capitalize">{field.nature}</td>
                        <td className="px-6 py-3">{field.minLength}</td>
                        <td className="px-6 py-3">{field.isTournamentSpecific ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditDialog(field)}
                              className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/20 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                              title="Edit Field"
                            >
                              <Pencil className="w-4 h-4 text-[#083F92]" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(field)}
                              className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-destructive/15 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                              title="Delete Field"
                            >
                              <Trash2 className="w-4 h-4 text-[#CE2D32]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#787878] font-poppins bg-[#083F92]/5 border-dashed border-[#083F92]/20">
                      No form fields found. Click "Add Field" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  Field Name
                </label>
                <div className="relative h-[44px]">
                  <Input
                    required
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
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
                    Type
                  </label>
                  <Select value={fieldType} onValueChange={(val) => val && setFieldType(val)}>
                    <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                      <SelectValue placeholder="Select type">{fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#3D3775] rounded-[12px]">
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nature */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Nature
                  </label>
                  <Select value={nature} onValueChange={(val) => val && setNature(val)}>
                    <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                      <SelectValue placeholder="Select nature">{nature.charAt(0).toUpperCase() + nature.slice(1)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#3D3775] rounded-[12px]">
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid for Min Length and Tournament Specific */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min Length */}
                <div className="flex flex-col gap-[8px]">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Min Length
                  </label>
                  <div className="relative h-[44px]">
                    <Input
                      type="number"
                      min={0}
                      value={minLength}
                      onChange={(e) => setMinLength(Number(e.target.value))}
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Tournament Specific */}
                {fieldType === 'dropdown' && (
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                      Tournament Specific
                    </label>
                    <Select value={isTournamentSpecific ? 'true' : 'false'} onValueChange={(val) => setIsTournamentSpecific(val === 'true')}>
                      <SelectTrigger className="!h-[44px] w-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                        <SelectValue placeholder="Tournament Specific">{isTournamentSpecific ? 'Yes' : 'No'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#3D3775] rounded-[12px]">
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Options (if dropdown) */}
              {fieldType === 'dropdown' && (
                <div className="flex flex-col gap-[8px] w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                    Options (comma-separated)
                  </label>
                  <div className="relative h-[44px]">
                    <Input
                      value={optionsStr}
                      onChange={(e) => setOptionsStr(e.target.value)}
                      placeholder="e.g. Beginner, Intermediate, Expert"
                      className="h-full bg-white border border-[#3D3775] rounded-[24px] px-4 font-normal text-[14px] text-[#181818] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#181818]/40"
                    />
                  </div>
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
