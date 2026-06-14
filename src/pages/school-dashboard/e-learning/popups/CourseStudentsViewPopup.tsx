import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Modal from '@/shared/popups/Modal';
import SearchInput from '@/shared/components/SearchInput';
import UserAvatarName from '@/shared/components/UserAvatarName';
import type { CourseStudentDto } from '@/services/api/types/school-course.types';

type CourseStudentsViewPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  students: CourseStudentDto[];
};

export default function CourseStudentsViewPopup({
  isOpen,
  onClose,
  students,
}: CourseStudentsViewPopupProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const visibleStudents = useMemo(
    () => students.filter((s) => !search || s.studentFullName.includes(search)),
    [students, search]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('eLearning.selectStudents.title')}
      size="sm"
      contentClassName="h-[550px]"
    >
      <div className="flex h-full flex-col gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('eLearning.selectStudents.studentSearchPlaceholder')}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {visibleStudents.length === 0 ? (
            <p className="py-6 text-center text-sm font-normal text-[#646969]">
              {t('common.noDataFound')}
            </p>
          ) : (
            visibleStudents.map((student) => (
              <UserAvatarName
                key={student.studentId}
                name={student.studentFullName}
                align="between"
                onView={() => navigate(`/students/student-details/${student.studentId}`)}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
