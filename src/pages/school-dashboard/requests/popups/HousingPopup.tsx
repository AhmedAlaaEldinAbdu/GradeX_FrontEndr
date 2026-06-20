import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Select from '@/shared/components/Select';
import { getClassrooms } from '@/services/api/classrooms/classrooms.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { Classroom } from '@/services/api/types/classrooms.types';

interface HousingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (classroomId: string) => void;
  isLoading?: boolean;
  gradeId?: string;
}

const HousingPopup: React.FC<HousingPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading: externalLoading,
  gradeId,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
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
        setClassrooms(response.data.classroomDto || []);
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [isOpen, gradeId]);

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const handleConfirm = () => {
    if (!selectedClassroomId) {
      setError(t('common.validation.required'));
      return;
    }
    onConfirm(selectedClassroomId);
    setSelectedClassroomId('');
    setError('');
  };

  const handleClose = () => {
    setSelectedClassroomId('');
    setError('');
    onClose();
  };

  const classroomOptions = [
    { value: '', label: isRTL ? 'ادخل الصف الدراسي' : 'Select classroom' },
    ...classrooms.map((c) => ({
      value: c.id,
      label: isRTL ? c.name : c.nameEn || c.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('studentApplications.modals.housingTitle')}
      size="sm"
    >
      <div className="flex flex-col">
        {/* Classroom select */}
        <div className="mb-4">
          <Select
            label={`${t('studentApplications.modals.classroomLabel')} *`}
            options={classroomOptions}
            value={selectedClassroomId}
            onChange={(e) => {
              setSelectedClassroomId(e.target.value);
              if (error) setError('');
            }}
            error={error}
            disabled={loading}
          />
        </div>

        {/* Classroom info — shows when a classroom is selected */}
        {selectedClassroom && (
          <div className="mb-6 text-start text-sm text-gray-600">
            <span>{t('studentApplications.modals.studentsInClass')}</span>{' '}
            <span className="font-semibold">{selectedClassroom.studentNumber}</span>
          </div>
        )}

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
