import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import IconButton from '@/shared/components/IconButton';
import { deleteAcademicSystem } from '@/redux/features/academic-system/academicSystemSlice';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useAppSelector } from '@/hooks/useRedux';

interface ActionProps {
  id: string;
  onActionComplete?: () => void;
}

export default function DropdownMenuAcademicSystemAction({ id, onActionComplete }: ActionProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isDeleting = useAppSelector((state) => state.academicSystems.isDeleting);
  const academicSystems = useAppSelector((state) => state.academicSystems.academicSystems);
  const currentLang = i18n.language as 'ar' | 'en';

  const handleEdit = () => {
    navigate(`/academic-system/edit-academic-system/${id}`);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsProcessing(true);
      const res = await dispatch(deleteAcademicSystem(id)).unwrap();
      if (res?.isSuccess) {
        setShowDeletePopup(false);
        showToast({
          message: t('academicSystem.systemDeletedSuccessfully'),
          type: 'success',
        });
        onActionComplete?.();
      } else {
        showToast({
          message: res?.errors?.[0] || t('common.errorOccurred'),
          type: 'error',
        });
        setShowDeletePopup(false);
      }
    } catch (error) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      setShowDeletePopup(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center justify-center gap-2">
        <IconButton
          status="edit"
          variant="success"
          onClick={() => handleEdit()}
          ariaLabel="Edit"
        />
        <IconButton
          status="delete"
          variant="danger"
          onClick={() => setShowDeletePopup(true)}
          disabled={isProcessing}
          ariaLabel="Delete"
        />
      </div>
      <DeletePopup
        open={showDeletePopup}
        message="academicSystem.confirmDeleteSystem"
        itemName={(() => {
          const system = academicSystems.find((sys) => sys.id === id);
          if (!system) return '';
          return currentLang === 'ar' ? system.nameAr : system.nameEn;
        })()}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </div>
  );
}
