import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/shared/components/Loading';
import EmptyState from '@/shared/components/EmptyState';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { deleteClassroom, fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import AddClassroomModal from '../popups/AddClassroomModal';
import EditClassroomModal from '../popups/EditClassroomModal';
import MathIcon from '@gradex/assets/icons/Math.svg';
import WhitePlusIcon from '@gradex/assets/icons/WhitePlus.svg';
import StudentsGreenOutlineIcon from '@gradex/assets/icons/StudentsGreenOutline.svg';
import StudentBlackSmIcon from '@gradex/assets/icons/StudentBlackSm.svg';
import MenuKebabVerticalIcon from '@gradex/assets/icons/MenuKebabVertical.svg';
import ArrowLeftSmIcon from '@gradex/assets/icons/ArrowLeftSm.svg';
import ArrowRightSmIcon from '@gradex/assets/icons/ArrowRightSm.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import PopupMessage from '@/shared/popups/PopupMessage';
import CustomImage from '@/shared/components/CustomImage';
import ActionsDropdown from '@/shared/components/ActionsDropdown';
import type { Action } from '@/shared/components/ActionsDropdown';
import type { Classroom } from '@/services/api/types/classrooms.types';

type ClassroomDetailsContentProps = {
  currentLang: 'ar' | 'en';
  gradeId?: string;
};

const PAGE_SIZE = 8;

const CARD_ICON_BG_CLASSES = [
  'bg-[#ecfdf5]',
  'bg-[#eff6ff]',
  'bg-[#faf5ff]',
  'bg-[#fff7ed]',
  'bg-[rgba(239,68,68,0.08)]',
  'bg-[#fdf2f8]',
  'bg-[#fefce8]',
  'bg-[#f0f9ff]',
];

const getClassroomStatus = (progress: number): 'available' | 'nearFull' | 'full' => {
  if (progress >= 100) {
    return 'full';
  }

  if (progress >= 90) {
    return 'nearFull';
  }

  return 'available';
};

const STATUS_STYLES: Record<
  'available' | 'nearFull' | 'full',
  { badgeBg: string; text: string; barBg: string }
> = {
  available: { badgeBg: 'bg-[#ecfdf5]', text: 'text-[#059669]', barBg: 'bg-[#10b981]' },
  nearFull: { badgeBg: 'bg-[#fffbeb]', text: 'text-[#d97706]', barBg: 'bg-[#f59e0b]' },
  full: { badgeBg: 'bg-[#fff1f2]', text: 'text-[#e11d48]', barBg: 'bg-[#f43f5e]' },
};

export default function ClassroomDetailsContent({
  currentLang,
  gradeId,
}: ClassroomDetailsContentProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [classroomPendingDelete, setClassroomPendingDelete] = useState<Classroom | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassroomId, setEditingClassroomId] = useState<string | null>(null);
  const initialNameParam = useRef(searchParams.get('name') ?? '').current;
  const [searchTerm, setSearchTerm] = useState(initialNameParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoading = useAppSelector((state) => state.classrooms.isLoading);
  const isDeleting = useAppSelector((state) => state.classrooms.isDeleting);

  const totalPages = Math.max(1, Math.ceil(classrooms.length / PAGE_SIZE));
  const pagedClassrooms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return classrooms.slice(start, start + PAGE_SIZE);
  }, [classrooms, currentPage]);

  // Skip the first run only when there's nothing to add: the parent page already
  // fetches on mount with no name filter, so re-running with an empty term here
  // would just duplicate that request. If the page was opened with ?name=... in
  // the URL, the first run must still fetch — the parent's mount fetch doesn't
  // know about it.
  const isFirstSearchRun = useRef(true);
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      if (!initialNameParam) {
        return;
      }
    }

    setCurrentPage(1);
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          gradeId,
          schoolBranchId: getCurrentSchoolBranchId(),
          name: searchTerm || undefined,
        },
      })
    );
  }, [searchTerm, gradeId, dispatch, initialNameParam]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set('name', value);
        } else {
          next.delete('name');
        }
        return next;
      },
      { replace: true }
    );
  };

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
    } catch {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
    }
  };

  const refreshClassrooms = () =>
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          gradeId,
          schoolBranchId: getCurrentSchoolBranchId(),
          name: searchTerm || undefined,
        },
      })
    );

  const getCardActions = (classroom: Classroom): Action[] => [
    {
      id: `edit-${classroom.id}`,
      label: t('actions.edit'),
      icon: EditFilledIcon,
      color: 'text-gray-500 hover:bg-gray-100',
      actionKey: 'edit',
      onClick: () => setEditingClassroomId(classroom.id),
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
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          debounce={500}
          placeholder={t('grades.searchClassroomsPlaceholder')}
          iconClass="w-4 h-4"
          wrapperClassName="w-1/2 md:w-64"
          className={`h-10 w-full rounded-lg border border-[#e2e8f0] bg-white text-xs font-normal text-[#3a3a3a] placeholder:text-[#9d9d9d] focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-hidden ${
            isRTL ? 'pr-9 pl-4' : 'pr-4 pl-9'
          }`}
        />

        <Button
          variant="success"
          size="sm"
          actionKey="add"
          onClick={() => setIsAddModalOpen(true)}
          imgSrc={WhitePlusIcon}
          imgClassName="h-3.5 w-3.5"
          className="flex-row-reverse rounded-lg! border-[#1e7a52]! bg-[#1e7a52]! px-4! py-2.5! text-sm! hover:bg-[#1e7a52]/90!"
        >
          {t('grades.addNewClassroom')}
        </Button>
      </div>

      {!isLoading && classrooms.length === 0 ? (
        <EmptyState imgSrc={MathIcon} description={t('common.noDataFound')} blend={true} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pagedClassrooms.map((classroom, index) => {
              const name = currentLang === 'ar' ? classroom.name : classroom.nameEn;
              const alias = currentLang === 'ar' ? classroom.alias : classroom.aliasEn;
              const title = alias ? `${name} (${alias})` : name;
              const progress = classroom.studentPercentage || 0;
              const status = getClassroomStatus(progress);
              const statusStyle = STATUS_STYLES[status];
              const iconBgClassName = CARD_ICON_BG_CLASSES[index % CARD_ICON_BG_CLASSES.length];

              return (
                <div
                  key={classroom.id}
                  onClick={() => navigate(`/classrooms/${classroom.id}/roster`)}
                  className="flex h-[190px] cursor-pointer flex-col justify-center gap-4 rounded-xl border border-[rgba(226,232,240,0.9)] bg-white p-[17px] transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg ${iconBgClassName}`}
                      >
                        <CustomImage src={StudentsGreenOutlineIcon} alt="" className="h-4 w-4" />
                      </div>
                      <span className="text-xl font-bold text-[black]">{title}</span>
                    </div>
                    <div onClick={(event) => event.stopPropagation()}>
                      <ActionsDropdown
                        actions={getCardActions(classroom)}
                        triggerIcon={MenuKebabVerticalIcon}
                        triggerClassName="flex items-center justify-center rounded p-1 hover:bg-gray-100 transition-colors"
                        iconClassName="h-4 w-4"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9d9d9d]">
                      {t('grades.capacityLabel')}: {classroom.maxStudentNumber || 0}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-[black]">
                        {classroom.foundStudentNumber || 0} {t('grades.studentPlural')}
                      </span>
                      <CustomImage src={StudentBlackSmIcon} alt="" className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className={`text-end text-[11px] font-bold ${statusStyle.text}`}>
                      {Math.round(progress)}%
                    </span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                      <div
                        className={`h-full rounded-full ${statusStyle.barBg}`}
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`flex items-center justify-center rounded-md py-1 ${statusStyle.badgeBg}`}
                  >
                    <span className={`text-xs font-medium ${statusStyle.text}`}>
                      {t(
                        `grades.classroomStatus${status.charAt(0).toUpperCase() + status.slice(1)}`
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[rgba(226,232,240,0.8)] pt-[17px]">
            <span className="text-base font-medium text-[#9d9d9d]">
              {t('grades.showingClassroomsRange', {
                from: classrooms.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
                to: Math.min(currentPage * PAGE_SIZE, classrooms.length),
                total: classrooms.length,
              })}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CustomImage
                  src={isRTL ? ArrowRightSmIcon : ArrowLeftSmIcon}
                  alt=""
                  className="h-4 w-4"
                />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex size-8 items-center justify-center rounded-lg border text-xs font-bold ${
                    page === currentPage
                      ? 'border-[#1e7a52] bg-[#ecfdf5] text-[#1e7a52]'
                      : 'border-[#e2e8f0] bg-white text-[#3a3a3a]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CustomImage
                  src={isRTL ? ArrowLeftSmIcon : ArrowRightSmIcon}
                  alt=""
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>
        </>
      )}

      <AddClassroomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        gradeId={gradeId}
        onSuccess={refreshClassrooms}
      />

      <EditClassroomModal
        isOpen={Boolean(editingClassroomId)}
        classroomId={editingClassroomId}
        onClose={() => setEditingClassroomId(null)}
        onSuccess={refreshClassrooms}
      />

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
