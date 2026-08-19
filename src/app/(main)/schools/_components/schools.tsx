'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronsUpDown,
  Plus,
  Edit,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import { PageTransition } from '@/components/animations/page-transition';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/ui/alert-dialog';
import { useSchools, useDeleteSchool } from '@/features/schools/hooks/use-schools';
import { School } from '@/features/schools/services/school.service';
import { CreateSchoolDialog } from '@/features/schools/components/create-school-dialog';
import { EditSchoolDialog } from '@/features/schools/components/edit-school-dialog';
import { AssignUserDialog } from '@/features/schools/components/assign-user-dialog';

export default function Schools() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [schoolToAssign, setSchoolToAssign] = useState<School | null>(null);

  // Data fetching
  const { data: schoolsData, isLoading } = useSchools(currentPage, itemsPerPage, debouncedSearchQuery);
  const { mutateAsync: deleteSchool, isPending: isDeleting } = useDeleteSchool();

  const schools = schoolsData?.data?.schools || [];
  const totalPages = schoolsData?.data?.pagination?.totalPages || 1;

  const handleDelete = async () => {
    if (schoolToDelete) {
      try {
        await deleteSchool(schoolToDelete._id);
        setSchoolToDelete(null);
      } catch (error) {
        // Error is handled by react-query hook
      }
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans select-none">

        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">

          {/* Left Title + Search pill bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:max-w-[500px]">
            <h1 className="font-poppins font-bold sm:text-[42px] text-[28px] sm:leading-[63px] leading-[36px] text-[#083F92] m-0 shrink-0">
              Schools
            </h1>

            {/* Search Pill Input */}
            <div className="w-full sm:w-auto">
              <SearchInput value={searchQuery} onChangeValue={setSearchQuery} />
            </div>
          </div>

          {/* Right Button: Create School */}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2.5 px-[15px] py-[15px] bg-[#083F92]/10 hover:bg-[#083F92]/15 text-[#000000] rounded-[100px] transition-colors focus:outline-none h-[72px] shrink-0 shadow-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            <div className="w-[42px] h-[42px] bg-[#083F92] rounded-full flex items-center justify-center text-white relative shadow-md">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em] pr-2">
              Create School
            </span>
          </button>

        </div>

        {/* Main Table Container Card */}
        <div className="w-full bg-white border border-[#DADADA] rounded-[24px] shadow-sm flex flex-col justify-between overflow-hidden flex-1 relative min-h-[600px] mb-8 pb-20">

          {/* Scrollable Table Area */}
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">

              {/* Table Header */}
              <thead>
                <tr className="bg-[#083F92] text-white text-left h-[50px] font-poppins font-semibold text-[13px]">
                  <th className="px-6 py-3 font-semibold w-auto">
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                      School Name <ChevronsUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 font-semibold w-[200px]">Address</th>
                  <th className="px-6 py-3 font-semibold w-[150px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                      Created At <ChevronsUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 font-semibold text-right w-[126px]">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="h-[50px] border-b border-[#DADADA]/30 bg-white">
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[120px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[250px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-[100px]" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-8 w-[64px] float-right rounded-full" /></td>
                    </tr>
                  ))
                ) : schools.length > 0 ? (
                  schools.map((school, index) => {
                    const isEven = index % 2 !== 0;
                    return (
                      <tr
                        key={school._id}
                        onClick={() => router.push(`/schools/${school._id}`)}
                        className={`h-[50px] border-b border-[#DADADA]/30 font-poppins text-[13px] text-[#636363] cursor-pointer hover:bg-[#083F92]/5 transition-colors ${isEven ? 'bg-[#083F92]/10' : 'bg-white'
                          }`}
                      >
                        <td className={`px-6 py-3 ${isEven ? 'font-bold' : 'font-semibold'}`}>
                          {school.name}
                        </td>
                        <td className="px-6 py-3 font-semibold text-nowrap truncate max-w-[200px]" title={school.address}>{school.address || 'N/A'}</td>
                        <td className="px-6 py-3 font-semibold tracking-[-0.02em]">
                          {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSchoolToAssign(school)}
                              className="w-8 h-8 rounded-full bg-[#083F92]/10 hover:bg-[#083F92]/20 flex items-center justify-center transition-colors shadow-xs"
                              title="Assign User"
                            >
                              <UserPlus className="w-4 h-4 text-[#083F92]" />
                            </button>
                            <button
                              onClick={() => setSchoolToEdit(school)}
                              className="w-8 h-8 rounded-full bg-[#083F92]/10 hover:bg-[#083F92]/20 flex items-center justify-center transition-colors shadow-xs"
                              title="Edit School"
                            >
                              <Edit className="w-4 h-4 text-[#083F92]" />
                            </button>
                            <button
                              onClick={() => setSchoolToDelete(school)}
                              className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors shadow-xs"
                              title="Delete School"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-[#787878] font-poppins">
                      No schools found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Floating Pagination Bar (Bottom Right) */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="absolute right-[24px] bottom-[16px]"
            />
          )}

        </div>

      </div>

      <CreateSchoolDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditSchoolDialog
        open={!!schoolToEdit}
        onOpenChange={(open) => !open && setSchoolToEdit(null)}
        school={schoolToEdit}
      />

      <AssignUserDialog
        open={!!schoolToAssign}
        onOpenChange={(open) => !open && setSchoolToAssign(null)}
        school={schoolToAssign}
      />

      <ConfirmDeleteDialog
        open={!!schoolToDelete}
        onOpenChange={(open) => !open && setSchoolToDelete(null)}
        title="Delete School"
        description={schoolToDelete ? `Are you sure you want to delete the school "${schoolToDelete.name}"? This action cannot be undone.` : ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

    </PageTransition>
  );
}
