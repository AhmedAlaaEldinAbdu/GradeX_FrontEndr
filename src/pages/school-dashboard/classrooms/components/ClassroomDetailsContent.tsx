import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import EmptyState from '@/shared/components/EmptyState';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { deleteClassroom } from '@/redux/features/classrooms/classroomsSlice';
import MathIcon from '@gradex/assets/icons/Math.svg';
import ProgressSummaryCard from '../../../../shared/components/ProgressSummaryCard';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import PopupMessage from '@/shared/popups/PopupMessage';
import type { Action } from '@/shared/components/ActionsDropdown';
import type { Classroom } from '@/services/api/types/classrooms.types';

type ClassroomDetailsContentProps = {
  currentLang: 'ar' | 'en';
};

export default function ClassroomDetailsContent({ currentLang }: ClassroomDetailsContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [classroomPendingDelete, setClassroomPendingDelete] = useState<Classroom | null>(null);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoading = useAppSelector((state) => state.classrooms.isLoading);
  const isDeleting = useAppSelector((state) => state.classrooms.isDeleting);
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const maxStudentCount = classrooms.reduce(
    (maximum, classroom) => Math.max(maximum, classroom.studentNumber || 0),
    0
  );

  const handleDeleteConfirm = async () => {
    if (!classroomPendingDelete) {
      return;
    }

    try {
      const willDeleteLastClassroom =
        classrooms.length === 1 && classrooms[0]?.id === classroomPendingDelete.id;

      await dispatch(deleteClassroom(classroomPendingDelete.id)).unwrap();
      setClassroomPendingDelete(null);
      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('grades.gradeDeletedSuccessfully'),
      });

      if (willDeleteLastClassroom) {
        navigate('/classrooms');
      }
    } catch (error) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
    }
  };

  const getCardActions = (classroom: Classroom): Action[] => [
    {
      id: `edit-${classroom.id}`,
      label: t('actions.edit'),
      icon: EditFilledIcon,
      color: 'text-gray-500 hover:bg-gray-100',
      onClick: () => navigate(`/classrooms/edit-classroom/${classroom.id}`),
    },
    {
      id: `delete-${classroom.id}`,
      label: t('actions.delete'),
      icon: TrashIcon,
      color: 'text-red-500 hover:bg-red-100',
      onClick: () => setClassroomPendingDelete(classroom),
      disabled: isDeleting,
    },
  ];

  if (isLoading && classrooms.length === 0) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  if (!isLoading && classrooms.length === 0) {
    return (
      <Card>
        <EmptyState imgSrc={MathIcon} description={t('common.noDataFound')} blend={true} />
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-3xl border border-[#E6E6E6] p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => {
            const name = currentLang === 'ar' ? classroom.name : classroom.nameEn;
            const alias = currentLang === 'ar' ? classroom.alias : classroom.aliasEn;
            const title = alias ? `${name} (${alias})` : name;
            const subtitle = `${classroom.studentNumber || 0} ${t('grades.studentPlural')}`;
            const progress =
              maxStudentCount > 0
                ? Math.round(((classroom.studentNumber || 0) / maxStudentCount) * 100)
                : 0;
            const imageSrc = classroom.imagePath ? `${baseUrl}/${classroom.imagePath}` : undefined;

            return (
              <ProgressSummaryCard
                key={classroom.id}
                title={title}
                subtitle={subtitle}
                imageSrc={imageSrc}
                imageAlt={title}
                progress={progress}
                onClick={() => navigate(`/classrooms/${classroom.id}/roster`)}
                actions={getCardActions(classroom)}
              />
            );
          })}
        </div>
      </Card>

      <DeletePopup
        open={Boolean(classroomPendingDelete)}
        message="grades.confirmDeleteGrade"
        itemName={
          classroomPendingDelete
            ? currentLang === 'ar'
              ? classroomPendingDelete.name
              : classroomPendingDelete.nameEn
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setClassroomPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        isMessageRaw={true}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={showPopupMessage.type === 'success'}
        onClose={() => setShowPopupMessage((current) => ({ ...current, show: false }))}
      />
    </>
  );
}
