'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface FormField {
  id: string;
  title: string;
  type: string;
  value: string;
  nature: string;
  length: number;
}

const DEFAULT_FIELDS: FormField[] = [
  { id: '1', title: 'First Name', type: 'Text', value: 'Null', nature: 'Mandatory', length: 30 },
  { id: '2', title: 'First Name', type: 'Text', value: 'Null', nature: 'Mandatory', length: 30 },
  { id: '3', title: 'Grade', type: 'Number', value: 'Null', nature: 'Mandatory', length: 5 },
  { id: '4', title: 'Team Name', type: 'Text', value: 'Null', nature: 'Mandatory', length: 150 },
  { id: '5', title: 'City', type: 'Dropdown', value: 'Null', nature: 'Mandatory', length: 150 },
  { id: '6', title: 'Division', type: 'Dropdown', value: 'X1, X2, X3', nature: 'Mandatory', length: 150 },
  { id: '7', title: 'Parent/Guardian First Name', type: 'Text', value: 'Null', nature: 'Mandatory', length: 30 },
  { id: '8', title: 'Parent/Guardian Last Name', type: 'Text', value: 'Null', nature: 'Mandatory', length: 30 },
  { id: '9', title: 'Parent/Guardian Phone Number', type: 'Number', value: 'Null', nature: 'Mandatory', length: 11 },
  { id: '10', title: 'Parent/Guardian Email Address', type: 'Email', value: 'Null', nature: 'Mandatory', length: 25 },
];

export default function FormDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formName, setFormName] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);

  // Load Form details and Fields on mount
  useEffect(() => {
    if (!id) return;

    // Load form name
    const savedForms = localStorage.getItem('chess_admin_forms');
    if (savedForms) {
      try {
        const parsedForms = JSON.parse(savedForms);
        const currentForm = parsedForms.find((f: any) => f.id === id);
        if (currentForm) {
          setFormName(currentForm.name);
        } else {
          setFormName(id === '1' ? 'Registration form' : `Form #${id}`);
        }
      } catch (e) {
        setFormName(id === '1' ? 'Registration form' : `Form #${id}`);
      }
    } else if (id === '1') {
      setFormName('Registration form');
    } else {
      setFormName(`Form #${id}`);
    }

    // Load form fields
    const savedFields = localStorage.getItem(`chess_admin_form_fields_${id}`);
    if (savedFields) {
      try {
        setFields(JSON.parse(savedFields));
      } catch (e) {
        console.error('Failed to load fields', e);
      }
    } else {
      // Seed with default fields if id is 1 (Registration form)
      if (id === '1') {
        setFields(DEFAULT_FIELDS);
        localStorage.setItem(`chess_admin_form_fields_${id}`, JSON.stringify(DEFAULT_FIELDS));
      } else {
        setFields([]);
      }
    }
  }, [id]);

  const saveFields = (updatedFields: FormField[]) => {
    setFields(updatedFields);
    localStorage.setItem(`chess_admin_form_fields_${id}`, JSON.stringify(updatedFields));
  };

  // Delete entire Form handler
  const handleDeleteForm = () => {
    setDeleteFormConfirmOpen(true);
  };

  const executeDeleteForm = () => {
    const savedForms = localStorage.getItem('chess_admin_forms');
    if (savedForms) {
      try {
        const parsedForms = JSON.parse(savedForms);
        const updated = parsedForms.filter((f: any) => f.id !== id);
        localStorage.setItem('chess_admin_forms', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem(`chess_admin_form_fields_${id}`);
    toast.success('Form deleted successfully');
    router.push('/forms');
  };

  // Add/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [deleteFormConfirmOpen, setDeleteFormConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<FormField | null>(null);

  // Field state hooks
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Text');
  const [value, setValue] = useState('Null');
  const [nature, setNature] = useState('Mandatory');
  const [length, setLength] = useState<number>(30);

  const handleOpenAddDialog = () => {
    setEditingField(null);
    setTitle('');
    setType('Text');
    setValue('Null');
    setNature('Mandatory');
    setLength(30);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (field: FormField) => {
    setEditingField(field);
    setTitle(field.title);
    setType(field.type);
    setValue(field.value);
    setNature(field.nature);
    setLength(field.length);
    setIsDialogOpen(true);
  };

  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
    if (selectedType !== 'Dropdown') {
      setValue('Null');
    } else {
      setValue(editingField && editingField.type === 'Dropdown' ? editingField.value : 'Option 1, Option 2');
    }
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Field title is required');
      return;
    }

    if (editingField) {
      // Update Mode
      const updated = fields.map(f => f.id === editingField.id ? {
        ...f,
        title: trimmedTitle,
        type,
        value,
        nature,
        length: Number(length) || 0
      } : f);
      saveFields(updated);
      toast.success('Field updated successfully');
    } else {
      // Create Mode
      const newField: FormField = {
        id: Date.now().toString(),
        title: trimmedTitle,
        type,
        value,
        nature,
        length: Number(length) || 0
      };
      saveFields([...fields, newField]);
      toast.success('Field added successfully');
    }

    setIsDialogOpen(false);
  };

  const handleDeleteField = (field: FormField) => {
    setFieldToDelete(field);
  };

  const executeDeleteField = () => {
    if (fieldToDelete) {
      const updated = fields.filter(f => f.id !== fieldToDelete.id);
      saveFields(updated);
      toast.success('Field deleted successfully');
      setFieldToDelete(null);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">

        {/* Top Navigation / Action Bar */}
        <div className="flex justify-between items-center w-full pt-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#083F92] hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
            <span className="font-poppins font-medium text-[18px] leading-[27px]">Back</span>
          </button>

          {/* Action buttons (Delete Form & Add Field) */}
          <div className="flex items-center gap-4 text-nowrap">

            {/* Delete entire Form circular button */}
            <button
              onClick={handleDeleteForm}
              className="w-[42px] h-[42px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#CE2D32] rounded-full flex items-center justify-center transition-colors cursor-pointer focus:outline-none shadow-xs"
              title="Delete Form"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Add Field Button */}
            <button
              onClick={handleOpenAddDialog}
              className="flex items-center gap-2 px-[15px] py-[5px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[42px] shadow-xs cursor-pointer"
            >
              <div className="w-[32px] h-[32px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-sm shrink-0">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
                Add Field
              </span>
            </button>

          </div>
        </div>

        {/* Form Title */}
        <div className="flex flex-col mt-4">
          <h1 className="font-poppins font-bold text-[32px] leading-[45px] text-[#083F92] m-0">
            {formName || 'Form Details'}
          </h1>
        </div>

        {/* Table Container */}
        <div className="w-full bg-[#FFFFFF] border border-[#DADADA] rounded-[24px] overflow-hidden flex flex-col shadow-xs mt-4">
          <div className="overflow-x-auto w-full">
            <div className="min-w-[800px] flex flex-col">
              {/* Table Header */}
              <div
                className="w-full bg-[#083F92] border-4 border-[#F4F4F4] rounded-t-[20px] h-[54px] grid grid-cols-[260px_130px_150px_130px_100px_1fr] items-center px-6"
              >
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white">Filed Title</span>
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white">Type</span>
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white">Value</span>
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white">Nature</span>
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white">Length</span>
                <span className="font-poppins font-bold text-[13px] leading-[20px] text-white text-right">Action</span>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col w-full">
                {fields.length > 0 ? (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`w-full min-h-[52px] grid grid-cols-[260px_130px_150px_130px_100px_1fr] items-center px-6 border-b border-[#DADADA]/30 last:border-0 ${index % 2 === 1 ? 'bg-[#083F92]/10' : 'bg-white'
                        }`}
                    >
                      {/* Field Title */}
                      <span className="font-poppins font-semibold text-[13px] leading-[20px] text-[#636363] py-2 truncate pr-4">
                        {field.title}
                      </span>

                      {/* Type */}
                      <span className="font-poppins font-semibold text-[13px] leading-[20px] text-[#636363]">
                        {field.type}
                      </span>

                      {/* Value */}
                      <span className="font-poppins font-semibold text-[13px] leading-[20px] text-[#636363] truncate pr-4">
                        {field.value}
                      </span>

                      {/* Nature */}
                      <span className="font-poppins font-semibold text-[13px] leading-[20px] text-[#636363]">
                        {field.nature}
                      </span>

                      {/* Length */}
                      <span className="font-poppins font-semibold text-[13px] leading-[20px] text-[#636363]">
                        {field.length}
                      </span>

                      {/* Actions Column */}
                      <div className="flex justify-end items-center gap-4">
                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEditDialog(field)}
                          className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-[#083F92]/20 transition-colors rounded-full flex items-center justify-center text-[#083F92] cursor-pointer focus:outline-none"
                          title="Edit Field"
                        >
                          <Pencil className="w-[15px] h-[15px]" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteField(field)}
                          className="w-[32px] h-[32px] bg-[#083F92]/10 hover:bg-destructive/10 transition-colors rounded-full flex items-center justify-center text-[#CE2D32] cursor-pointer focus:outline-none"
                          title="Delete Field"
                        >
                          <Trash2 className="w-[15px] h-[15px]" />
                        </button>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="w-full py-16 text-center text-[#787878] font-poppins bg-white">
                    No fields created for this form yet. Click "Add Field" to start building it.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Field Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            showCloseButton={true}
            className="sm:max-w-[580px] w-[90vw] bg-white rounded-[12px] p-6 sm:p-8 gap-0 border border-[#DADADA]/40 shadow-2xl outline-none"
          >
            <DialogTitle className="font-heading text-base leading-none font-semibold text-[32px]! text-[#181818] m-0 mb-6 font-general-sans">
              {editingField ? 'Edit Field' : 'Add Field'}
            </DialogTitle>

            <form onSubmit={handleDialogSubmit} className="flex flex-col gap-5 w-full">
              {/* Field Title */}
              <div className="flex flex-col gap-2 w-full">
                <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818]">
                  Field Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. First Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] placeholder:text-[#181818]/60 focus:outline-none"
                  required
                />
              </div>

              {/* Grid for Type, Nature, Length */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {/* Field Type */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818]">
                    Field Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] focus:outline-none cursor-pointer"
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                {/* Nature */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818]">
                    Nature <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nature}
                    onChange={(e) => setNature(e.target.value)}
                    className="w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] focus:outline-none cursor-pointer"
                  >
                    <option value="Mandatory">Mandatory</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              {/* Grid for Value & Length */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {/* Field Value (Dropdown options or Null) */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818]">
                    Value (Dropdown Options) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder={type === 'Dropdown' ? 'Comma-separated options' : 'Null'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={type !== 'Dropdown'}
                    className="w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] placeholder:text-[#181818]/60 focus:outline-none disabled:opacity-50"
                  />
                </div>

                {/* Max Length */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818]">
                    Max Length <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 30"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full h-[44px] bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none mt-4 text-white font-general-sans font-semibold text-[14px] leading-[19px] capitalize"
              >
                {editingField ? 'Save Field' : 'Add Field'}
              </button>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteFormConfirmOpen}
          onOpenChange={setDeleteFormConfirmOpen}
          title="Delete Form"
          description={`Are you sure you want to delete the entire form "${formName}"? This action cannot be undone.`}
          onConfirm={executeDeleteForm}
        />

        <ConfirmDialog
          open={!!fieldToDelete}
          onOpenChange={(open) => !open && setFieldToDelete(null)}
          title="Delete Field"
          description={fieldToDelete ? `Are you sure you want to delete the field "${fieldToDelete.title}"? This action cannot be undone.` : ''}
          onConfirm={executeDeleteField}
        />

      </div>
    </PageTransition>
  );
}
