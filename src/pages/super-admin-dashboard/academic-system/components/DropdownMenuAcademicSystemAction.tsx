import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DeletePopup from '@/shared/components/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import { deleteAcademicSystem } from '@/redux/features/academic-system/academicSystemSlice';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

interface ActionProps {
  id: string;
  onActionComplete?: () => void;
}

export default function DropdownMenuAcademicSystemAction({ id, onActionComplete }: ActionProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
          duration: 3000,
        });
        onActionComplete?.();
      }
    } catch (error) {
      console.error('Failed to delete academic system:', error);
      showToast({ message: t('common.errorOccurred'), type: 'error', duration: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handleEdit()}
          className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
        >
          <img src={EditIcon} alt="Edit" className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowDeletePopup(true)}
          className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
          disabled={isProcessing}
        >
          <img src={TrashIcon} alt="Delete" className="h-4 w-4" />
        </button>
      </div>
      {showDeletePopup && (
        <DeletePopup
          message="academicSystem.confirmDeleteSystem"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeletePopup(false)}
          iconSrc={BigTrashIcon}
        />
      )}
    </div>
  );
}
