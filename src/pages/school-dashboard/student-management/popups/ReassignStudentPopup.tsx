import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomSelect from '@/shared/components/CustomSelect';
import { useAppSelector } from '@/hooks/useRedux';

interface ReassignStudentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomId: string) => void;
  isProcessing?: boolean;
  initialClassroomId?: string;
}

export default function ReassignStudentPopup({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  initialClassroomId = '',
}: ReassignStudentPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);

  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedClassroomId(initialClassroomId);
      setError(false);
    }
  }, [isOpen, initialClassroomId]);

  const handleConfirm = () => {
    if (!selectedClassroomId) {
      setError(true);
      return;
    }
    onConfirm(selectedClassroomId);
  };

  const classroomOptions = Array.isArray(classrooms)
    ? classrooms.map((c) => ({
        value: c?.id || '',
        label: currentLang === 'ar' ? c?.name || '' : c?.nameEn || c?.name || '',
      }))
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('studentManagement.reAssignStudent')}
      size="md"
    >
      <div className="flex flex-col">
        <div className="mb-6 pb-4">
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

        <div className="flex w-full gap-3">
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
        </div>
      </div>
    </Modal>
  );
}
