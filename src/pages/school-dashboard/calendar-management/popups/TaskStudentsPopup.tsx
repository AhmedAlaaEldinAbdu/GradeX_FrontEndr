import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import CustomCheckbox from '@/shared/components/CustomCheckbox';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudents } from '@/redux/features/students/studentsSlice';
import { getStudentFullName } from '@/services/api/types/students.types';

export interface TaskStudentOption {
  id: string;
  name: string;
  avatar?: string;
  classroom?: string;
}

interface TaskStudentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStudents: TaskStudentOption[]) => void;
  initialSelectedStudents?: TaskStudentOption[];
  classroomName?: string;
}

export default function TaskStudentsPopup({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedStudents = [],
  classroomName,
}: TaskStudentsPopupProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.students.students);
  const isLoading = useAppSelector((state) => state.students.isLoading);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedStudents.map((student) => student.id))
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dispatch(
      fetchStudents({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch, isOpen]);

  useEffect(() => {
    setSelectedIds(new Set(initialSelectedStudents.map((student) => student.id)));
  }, [initialSelectedStudents, isOpen]);

  const studentOptions = useMemo<TaskStudentOption[]>(
    () =>
      students.map((student) => ({
        id: student.id,
        name: getStudentFullName(student),
        avatar: student.profilePicture || undefined,
        classroom: student.className || undefined,
      })),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    const normalizedClassroom = classroomName?.trim().toLowerCase();

    return studentOptions.filter((student) => {
      const matchesClassroom =
        !normalizedClassroom || student.classroom?.toLowerCase().includes(normalizedClassroom);
      const matchesSearch =
        !normalizedQuery || student.name.toLowerCase().includes(normalizedQuery);

      return Boolean(matchesClassroom && matchesSearch);
    });
  }, [classroomName, searchValue, studentOptions]);

  const toggleStudent = (studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }

      return next;
    });
  };

  const handleClose = () => {
    setSelectedIds(new Set(initialSelectedStudents.map((student) => student.id)));
    setSearchValue('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(studentOptions.filter((student) => selectedIds.has(student.id)));
    setSearchValue('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showHeader={false}
      contentClassName="p-8"
    >
      <div className="space-y-6">
        <div className="relative flex items-center justify-center">
          <h2 className="text-3xl font-semibold text-black-900">
            {t('tasksManagement.studentPopup.title')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="absolute start-0 flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200"
            aria-label={t('common.close')}
          >
            <CustomImage src={XmarkCircleGrayIcon} alt={'close icon'} className="w-20px h-20px" />
          </button>
        </div>

        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder={t('tasksManagement.studentPopup.searchPlaceholder')}
          debounce={0}
        />

        <div className="max-h-[420px] overflow-y-auto pe-2">
          {isLoading ? (
            <div className="py-16 text-center text-base text-gray-500">
              {t('tasksManagement.studentPopup.loading')}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-base text-gray-500">
              {t('tasksManagement.studentPopup.empty')}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const isSelected = selectedIds.has(student.id);

                return (
                  <div
                    key={student.id}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-1 transition-colors hover:bg-gray-50"
                  >
                    <CustomCheckbox
                      checked={isSelected}
                      onChange={() => toggleStudent(student.id)}
                      label=""
                      className="shrink-0"
                      inputClassName="h-12 w-12 rounded-2xl border-gray-200 checked:border-green-600"
                      textClassName="hidden"
                      inputProps={{
                        'aria-label': student.name,
                        onClick: (event) => event.stopPropagation(),
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => toggleStudent(student.id)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-start"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                        <CustomImage
                          src={student.avatar}
                          fallbackSrc={DefaultAvatar}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-2xl font-medium text-black-800">
                          {student.name}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="min-w-[120px]" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" className="min-w-[170px]" onClick={handleConfirm}>
            {t('tasksManagement.studentPopup.confirmButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
