import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import SearchInput from '@/shared/components/SearchInput';
import Button from '@/shared/components/Button';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CustomImage from '@/shared/components/CustomImage';
import { getStudentFullName, type StudentDto } from '@/services/api/types/students.types';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchStudents } from '@/redux/features/students/studentsSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

export interface Student {
  id: string;
  name: string;
  avatar?: string;
}

interface SelectStudentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStudents: Student[]) => void;
  initialSelectedStudents?: Student[];
  classroomId?: string;
}

export default function SelectStudentsPopup({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedStudents = [],
  classroomId,
}: SelectStudentsPopupProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(initialSelectedStudents.map((s) => s.id))
  );

  // Fetch students from API
  const fetchStudentsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        fetchStudents({
          page: 1,
          limit: 100,
          filters: {
            classroomId,
            schoolBranchId: getCurrentSchoolBranchId() || undefined,
          },
        })
      ).unwrap();
      const studentDtos = response.data || [];
      const mappedStudents: Student[] = studentDtos.map((s: StudentDto) => ({
        id: s.id,
        name: getStudentFullName(s),
        avatar: s.profilePicture || '',
      }));
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, dispatch]);

  // Fetch students when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchStudentsData();
    }
  }, [isOpen, fetchStudentsData]);

  // Reset selected students when initialSelectedStudents changes
  useEffect(() => {
    setSelectedStudentIds(new Set(initialSelectedStudents.map((s) => s.id)));
  }, [initialSelectedStudents]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, students]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedStudents = students.filter((student) => selectedStudentIds.has(student.id));
    onConfirm(selectedStudents);
    onClose();
  };

  const handleClose = () => {
    // Reset to initial state on close
    setSelectedStudentIds(new Set(initialSelectedStudents.map((s) => s.id)));
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('addLesson.selectStudentsTitle')}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('addLesson.searchStudentsPlaceholder')}
          debounce={0}
        />

        {/* Students List */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">{t('lesson.loadingStudents')}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-gray-500">{t('addLesson.noStudentsFound')}</div>
          ) : (
            <div className="flex flex-col">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                return (
                  <div
                    key={student.id}
                    className="flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors hover:bg-gray-50"
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    {/* Custom Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <CustomCheckbox
                        label=""
                        checked={isSelected}
                        onChange={() => handleStudentToggle(student.id)}
                        className="!gap-0 !py-0"
                      />
                    </div>
                    {/* Student Avatar (rounded square) */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      <CustomImage
                        src={student.avatar || DefaultAvatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Student Name */}
                    <span className="text-xl font-normal text-[#3A3A3A]">{student.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm}>
            {t('lesson.selectButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
