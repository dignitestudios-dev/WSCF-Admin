'use client';

import { useState } from 'react';
import { Pencil, Trash2, UserPlus, FileSpreadsheet, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useSchools, useDeleteSchool } from '../hooks/use-schools';
import { School } from '../services/school.service';
import { CreateSchoolDialog } from './create-school-dialog';
import { EditSchoolDialog } from './edit-school-dialog';
import { AssignUserDialog } from './assign-user-dialog';

const GRID_COLS = "grid grid-cols-[80px_1fr_1.5fr_120px_150px]";

export default function SchoolsList() {
  const { data: schoolsData, isPending } = useSchools();
  const { mutate: deleteSchool } = useDeleteSchool();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [assignSchool, setAssignSchool] = useState<School | null>(null);
  
  const schools = schoolsData?.data?.schools || [];

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      deleteSchool(id);
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden min-w-[760px] bg-white rounded-3xl mx-6 md:mx-10 my-4 md:my-6 border border-neutral-100 flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-[#F5F5F5] gap-4">
        <h2 className="font-poppins font-medium text-[24px] leading-[36px] text-[#151515] capitalize">
          All Schools
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-[44px] bg-[#083F92] hover:bg-[#083F92]/90 rounded-[8px] px-6"
          >
            <span className="font-poppins font-medium text-[16px] text-white">Create School</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#F9F9F9] relative">
        <div className="min-w-fit px-8 py-6">
          {/* Header */}
          <div className={`${GRID_COLS} h-[47px] items-center bg-[#083F92] rounded-t-[12px] px-6`}>
            <div className="font-poppins font-medium text-[16px] text-white">No</div>
            <div className="font-poppins font-medium text-[16px] text-white">School Name</div>
            <div className="font-poppins font-medium text-[16px] text-white">Address</div>
            <div className="font-poppins font-medium text-[16px] text-white text-center">Date Created</div>
            <div className="font-poppins font-medium text-[16px] text-white text-right">Actions</div>
          </div>

          {/* Body */}
          <div className="flex flex-col">
            {isPending ? (
              <div className="flex items-center justify-center h-[200px] bg-white rounded-b-[12px]">
                <p className="font-poppins text-[#181818]/60">Loading schools...</p>
              </div>
            ) : schools.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] bg-white rounded-b-[12px]">
                <p className="font-poppins text-[#181818]/60">No schools found.</p>
              </div>
            ) : (
              schools.map((school, index) => (
                <div
                  key={school._id}
                  className={`${GRID_COLS} h-[47px] items-center bg-white px-6 border-b border-[#F2F2F2] last:border-0 last:rounded-b-[12px]`}
                >
                  <div className="font-poppins font-medium text-[16px] text-[#151515]">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="font-poppins font-medium text-[16px] text-[#151515] truncate pr-4">
                    {school.name}
                  </div>
                  <div className="font-poppins font-medium text-[16px] text-[#151515] truncate pr-4">
                    {school.address}
                  </div>
                  <div className="font-poppins font-medium text-[16px] text-[#151515] text-center">
                    {format(new Date(school.createdAt), 'dd-MM-yy')}
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setAssignSchool(school)}
                      className="w-8 h-8 rounded-full bg-[#083F92]/10 flex items-center justify-center hover:bg-[#083F92]/20 transition-colors"
                      title="Assign User"
                    >
                      <UserPlus className="w-4 h-4 text-[#083F92]" />
                    </button>
                    <button
                      onClick={() => setEditSchool(school)}
                      className="w-8 h-8 rounded-full bg-[#083F92]/10 flex items-center justify-center hover:bg-[#083F92]/20 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-[#083F92]" />
                    </button>
                    <button
                      onClick={() => handleDelete(school._id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <CreateSchoolDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      {editSchool && (
        <EditSchoolDialog 
          open={!!editSchool} 
          onOpenChange={(open) => !open && setEditSchool(null)} 
          school={editSchool} 
        />
      )}

      {assignSchool && (
        <AssignUserDialog 
          open={!!assignSchool} 
          onOpenChange={(open) => !open && setAssignSchool(null)} 
          school={assignSchool} 
        />
      )}
    </div>
  );
}
