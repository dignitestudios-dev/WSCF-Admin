'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowRight,
} from 'lucide-react';
import { PageTransition } from '@/components/animations/page-transition';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/alert-dialog';

interface FormItem {
  id: string;
  name: string;
  createdAt: string;
}

export default function Forms() {
  const router = useRouter();
  // Initialize with default form item as in user request/screenshot
  const [forms, setForms] = useState<FormItem[]>([
    { id: '1', name: 'Registration form', createdAt: '2026-07-07' }
  ]);

  // Load from localStorage on mount (for persistent simulation)
  useEffect(() => {
    const savedForms = localStorage.getItem('chess_admin_forms');
    if (savedForms) {
      try {
        setForms(JSON.parse(savedForms));
      } catch (e) {
        console.error('Failed to parse forms from localStorage', e);
      }
    }
  }, []);

  const saveForms = (updatedForms: FormItem[]) => {
    setForms(updatedForms);
    localStorage.setItem('chess_admin_forms', JSON.stringify(updatedForms));
  };

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('');
  const [editingForm, setEditingForm] = useState<FormItem | null>(null);
  const [formToDelete, setFormToDelete] = useState<FormItem | null>(null);

  // Submit Handler (Create/Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = dialogName.trim();
    
    if (!trimmedName) {
      toast.error('Form name cannot be empty');
      return;
    }

    if (editingForm) {
      // Edit mode
      const updated = forms.map(f => f.id === editingForm.id ? { ...f, name: trimmedName } : f);
      saveForms(updated);
      toast.success('Form updated successfully');
    } else {
      // Create mode
      const newForm: FormItem = {
        id: Date.now().toString(),
        name: trimmedName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      saveForms([...forms, newForm]);
      toast.success('Form created successfully');
    }

    // Reset & Close
    setIsDialogOpen(false);
    setDialogName('');
    setEditingForm(null);
  };

  // Edit Action
  const handleEditClick = (form: FormItem) => {
    setEditingForm(form);
    setDialogName(form.name);
    setIsDialogOpen(true);
  };

  // Delete Action
  const handleDeleteClick = (form: FormItem) => {
    setFormToDelete(form);
  };

  const executeDeleteForm = () => {
    if (formToDelete) {
      const updated = forms.filter(f => f.id !== formToDelete.id);
      saveForms(updated);
      toast.success('Form deleted successfully');
      setFormToDelete(null);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none pb-12">
        
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0">
              Form Management
            </h1>
          </div>

          {/* Add Form Button Styled exactly to matching rules */}
          <button 
            onClick={() => {
              setEditingForm(null);
              setDialogName('');
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-all focus:outline-none h-[72px] shadow-sm w-full sm:w-[147px] justify-center shrink-0 cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
              Add Form
            </span>
          </button>
        </div>

        {/* Forms List Container */}
        <div className="w-full flex flex-col gap-4 mt-6">
          {forms.length > 0 ? (
            forms.map((form) => (
              <div 
                key={form.id}
                onClick={() => router.push(`/forms/${form.id}`)}
                className="w-full min-h-[77px] py-3 sm:py-0 flex items-center justify-between px-4 sm:px-[28px] bg-[#083F92]/10 rounded-[12px] border border-transparent hover:border-[#083F92]/20 transition-all shadow-xs cursor-pointer gap-2"
              >
                {/* Form Title */}
                <span className="font-poppins font-bold sm:text-[22px] text-[16px] leading-[24px] sm:leading-[33px] text-[#000000] truncate max-w-[60%] sm:max-w-none">
                  {form.name}
                </span>

                {/* Actions group */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Edit Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(form);
                    }}
                    className="w-[36px] sm:w-[42px] h-[36px] sm:h-[42px] bg-[#083F92] hover:bg-[#083F92]/90 transition-colors rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm focus:outline-none"
                    title="Edit Form"
                  >
                    <Pencil className="w-4 h-4 fill-white text-transparent" />
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(form);
                    }}
                    className="w-[36px] sm:w-[42px] h-[36px] sm:h-[42px] bg-[#083F92] hover:bg-destructive/90 transition-colors rounded-full flex items-center justify-center text-white cursor-pointer shadow-sm focus:outline-none"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4 fill-white text-transparent" />
                  </button>

                  {/* Navigation / Arrow Link */}
                  <div className="flex items-center justify-center pl-1 sm:pl-2">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#000000] stroke-[2]" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-16 text-center text-[#787878] font-poppins bg-[#083F92]/5 rounded-[12px] border border-dashed border-[#083F92]/20">
              No forms created yet. Click "Add Form" to create your first form.
            </div>
          )}
        </div>

        {/* Add/Edit Form Dialog (Shadcn UI wrapper) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent 
            showCloseButton={true}
            className="sm:max-w-[589px] w-[90vw] h-auto min-h-[291px] bg-white rounded-[12px] p-6 sm:p-8 gap-0 border border-[#DADADA]/40 shadow-2xl outline-none"
          >
            <DialogTitle className="font-general-sans font-semibold text-[32px] leading-[43px] text-[#181818] m-0 mb-6">
              Form Heading
            </DialogTitle>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-[22px] w-full">
              <div className="flex flex-col gap-[8px] w-full">
                <label htmlFor="formName" className="font-general-sans font-medium text-[14px] leading-[19px] text-[#181818] capitalize">
                  Form Name
                </label>
                <div className="relative w-full h-[44px]">
                  <Input 
                    id="formName"
                    type="text"
                    placeholder="Write heading here"
                    value={dialogName}
                    onChange={(e) => setDialogName(e.target.value)}
                    maxLength={100}
                    className="w-full h-full bg-white border border-[#3D3775] rounded-[24px] px-[16px] font-general-sans font-normal text-[14px] text-[#181818] placeholder:text-[#181818]/60 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-[48px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[100px] flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none"
              >
                <span className="font-general-sans font-semibold text-[14px] leading-[19px] text-white text-center capitalize">
                  {editingForm ? 'Save' : 'Create'}
                </span>
              </button>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteDialog
          open={!!formToDelete}
          onOpenChange={(open) => !open && setFormToDelete(null)}
          title="Delete Form"
          description={formToDelete ? `Are you sure you want to delete "${formToDelete.name}"? This action cannot be undone.` : ''}
          onConfirm={executeDeleteForm}
        />

      </div>
    </PageTransition>
  );
}
