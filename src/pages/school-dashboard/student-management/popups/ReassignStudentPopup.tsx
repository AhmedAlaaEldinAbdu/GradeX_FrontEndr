import PopupFooter from '@/shared/popups/PopupFooter';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomSelect from '@/shared/components/CustomSelect';
import { getClassrooms } from '@/services/api/classrooms/classrooms.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { Classroom } from '@/services/api/types/classrooms.types';

interface ReassignStudentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomId: string) => void;
  isProcessing?: boolean;
  initialClassroomId?: string;
  gradeId?: string;
}

export default function ReassignStudentPopup({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  initialClassroomId = '',
  gradeId,
}: ReassignStudentPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedClassroomId(initialClassroomId);
    setError(false);

    const fetchClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const response = await getClassrooms({
          PageSize: 100,
          SchoolBranchId: getCurrentSchoolBranchId() || undefined,
          ...(gradeId && { gradeId }),
        });
        setClassrooms(response.data?.classroomDto || []);
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
        setClassrooms([]);
      } finally {
        setIsLoadingClassrooms(false);
      }
    };

    fetchClassrooms();
  }, [isOpen, gradeId, initialClassroomId]);

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const handleConfirm = () => {
    if (!selectedClassroomId) {
      setError(true);
      return;
    }
    onConfirm(selectedClassroomId);
  };

  const classroomOptions = classrooms.map((c) => ({
    value: c?.id || '',
    label: currentLang === 'ar' ? c?.name || '' : c?.nameEn || c?.name || '',
  }));

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={onClose}
      title={t('studentManagement.reAssignStudent')}
      size="md"
    >
      <div className="flex flex-col">
        <div className="mb-4">
          <label className="mb-2 block text-start text-sm font-medium text-gray-700">
            {t('studentManagement.classroom')} <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={selectedClassroomId}
            onChange={(value) => {
              const next = Array.isArray(value) ? (value[0] ?? '') : value;
              setSelectedClassroomId(next);
              if (error) setError(false);
            }}
            options={classroomOptions}
            placeholder={
              isLoadingClassrooms ? t('common.loading') : t('studentManagement.selectClassroom')
            }
            disabled={isLoadingClassrooms || isProcessing}
            error={error}
            maxHeight="200px"
          />
        </div>

        {selectedClassroom && (
          <div className="mb-6 text-start text-sm text-gray-600">
            <span>{t('studentApplications.modals.studentsInClass')}</span>{' '}
            <span className="font-semibold">{selectedClassroom.foundStudentNumber}</span>
          </div>
        )}

        <PopupFooter className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleConfirm}
            disabled={isProcessing || isLoadingClassrooms}
            loading={isProcessing}
          >
            {t('common.save')}
          </Button>
        </PopupFooter>
      </div>
    </Modal>
  );
}
