import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import { getClassrooms } from '@/services/api/classrooms/classrooms.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { Classroom } from '@/services/api/types/classrooms.types';
import FormField from '@/shared/components/FormField';

interface HousingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomId: string, isDifferent?: boolean) => void;
  isLoading?: boolean;
  gradeId?: string;
  currentClassName?: string | null;
}

const HousingPopup: React.FC<HousingPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: externalLoading,
  gradeId,
  currentClassName,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [matchedClassroomId, setMatchedClassroomId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch classrooms when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const response = await getClassrooms({
          PageSize: 100,
          SchoolBranchId: getCurrentSchoolBranchId() || undefined,
          ...(gradeId && { gradeId }),
        });
        const fetched = response.data.classroomDto || [];
        setClassrooms(fetched);

        // If a current class name is provided, try to pre-select the matching classroom
        if (gradeId || fetched.length > 0) {
          if (currentClassName) {
            const normalized = currentClassName.trim().toLowerCase();
            const matched = fetched.find(
              (c) =>
                (c.name && c.name.trim().toLowerCase() === normalized) ||
                (c.nameEn && c.nameEn.trim().toLowerCase() === normalized)
            );
            if (matched) {
              setSelectedClassroomId(matched.id);
              setMatchedClassroomId(matched.id);
            } else {
              setMatchedClassroomId(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [isOpen, gradeId, currentClassName]);

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const handleConfirm = () => {
    if (!selectedClassroomId) {
      setError(t('common.validation.required'));
      return;
    }
    const isDifferent =
      !!currentClassName &&
      matchedClassroomId !== null &&
      selectedClassroomId !== matchedClassroomId;
    onConfirm(selectedClassroomId, isDifferent);
    setSelectedClassroomId('');
    setError('');
  };

  const handleClose = () => {
    setSelectedClassroomId('');
    setError('');
    onClose();
  };

  const classroomOptions: CustomSelectOption[] = classrooms.map((c) => ({
    value: c.id,
    label: isRTL ? c.name : c.nameEn || c.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('studentApplications.modals.housingTitle')}
      // size="sm"
    >
      <div className="flex flex-col">
        {/* Classroom select */}
        <div className="mb-4 h-[125px]">
          <FormField label={t('studentApplications.modals.classroomLabel')} required>
            <CustomSelect
              value={selectedClassroomId}
              onChange={(value) => {
                setSelectedClassroomId(String(value || ''));
                if (error) setError('');
              }}
              options={classroomOptions}
              placeholder={t('studentManagement.selectClassroom')}
              disabled={loading}
              error={!!error}
              showSearch={true}
            />
          </FormField>
        </div>

        {/* Action buttons */}
        <div className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleConfirm}
            disabled={!selectedClassroomId || externalLoading || loading}
          >
            {externalLoading ? t('common.processing') : t('studentApplications.modals.housing')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HousingPopup;
