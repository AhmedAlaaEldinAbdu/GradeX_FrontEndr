import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CustomImage from '@/shared/components/CustomImage';
import { getStudentFullName, type StudentDto } from '@/services/api/types/students.types';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchStudents } from '@/redux/features/students/studentsSlice';

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
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('addLesson.searchStudentsPlaceholder')}
            className="w-full"
            icon={
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>

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
                    className="relative flex cursor-pointer items-center gap-3 border-b border-gray-100 py-3 transition-colors hover:bg-gray-50"
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={`absolute start-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full transition-colors ${
                        isSelected ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />

                    {/* Student Avatar */}
                    <div className="ms-3 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      <CustomImage
                        src={student.avatar || DefaultAvatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Student Name */}
                    <span className="flex-1 text-sm text-gray-700">{student.name}</span>

                    {/* Hidden Checkbox for accessibility */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStudentToggle(student.id)}
                      className="sr-only"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm}>
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
