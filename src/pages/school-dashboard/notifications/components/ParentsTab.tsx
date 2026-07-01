import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Input from '@/shared/components/Input';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import {
  fetchSchoolNotifications,
  resetSchoolNotifications,
} from '@/redux/features/schoolNotificationsSlice';
import {
  SchoolNotificationTarget,
  type SchoolNotificationItem,
  type SchoolNotificationRecipient,
  type SchoolNotificationRecipientStudent,
} from '@/services/api/types/school-notification.types';
import NotificationRecipientsPopup from '../popups/NotificationRecipientsPopup';

const PAGE_SIZE = 10;
const FILE_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

const getSingleValue = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? '') : value;

const getDateKey = (value: string) => value.split('T')[0] ?? '';

const getDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const formatNotificationDate = (value: string, language: string) => {
  const dateKey = getDateKey(value);
  const date = getDateFromKey(dateKey);

  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB').format(date);
};

const getSelectedDateRange = (dateKey: string) => ({
  CreatedFrom: `${dateKey}T00:00:00.000Z`,
  CreatedTo: `${dateKey}T23:59:59.999Z`,
});

const resolveFileUrl = (path?: string | null) => {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${FILE_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const getLocalizedText = (arValue: string, enValue: string, language: string) =>
  (language === 'ar' ? arValue : enValue) || arValue || enValue || '-';

const getParents = (row: SchoolNotificationItem): SchoolNotificationRecipient[] =>
  row.parents ?? [];

const getParentStudents = (row: SchoolNotificationItem): SchoolNotificationRecipientStudent[] =>
  getParents(row).flatMap((parent) => parent.students ?? []);

const getParentCount = (row: SchoolNotificationItem) =>
  row.totalParents ?? row.parents?.length ?? 0;

const getUniqueOptions = (
  items: { value: string; label: string }[]
): { value: string; label: string }[] => {
  const optionsByValue = new Map<string, string>();

  items.forEach((item) => {
    if (item.value && item.label && !optionsByValue.has(item.value)) {
      optionsByValue.set(item.value, item.label);
    }
  });

  return Array.from(optionsByValue, ([value, label]) => ({ value, label }));
};

const getStageLabels = (row: SchoolNotificationItem, language: string) =>
  getUniqueOptions(
    getParentStudents(row).map((student) => ({
      value: student.gradeId,
      label: getLocalizedText(student.gradeNameAr, student.gradeNameEn, language),
    }))
  ).map((option) => option.label);

const getClassroomLabels = (row: SchoolNotificationItem, language: string) =>
  getUniqueOptions(
    getParentStudents(row).map((student) => ({
      value: student.classroomId,
      label: getLocalizedText(student.classroomNameAr, student.classroomNameEn, language),
    }))
  ).map((option) => option.label);

export default function ParentsTab() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedParents, setSelectedParents] = useState<SchoolNotificationRecipient[]>([]);
  const {
    items: notifications,
    pagination,
    isLoading,
  } = useAppSelector((state) => state.schoolNotifications.parentNotifications);
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId },
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim();

    if (!schoolBranchId) {
      dispatch(resetSchoolNotifications());
      return;
    }

    dispatch(
      fetchSchoolNotifications({
        SchoolBranchId: schoolBranchId,
        Target: SchoolNotificationTarget.Parents,
        ...(normalizedSearchTerm ? { SearchName: normalizedSearchTerm } : {}),
        ...(selectedStage ? { GradeId: selectedStage } : {}),
        ...(selectedClassroom ? { ClassroomId: selectedClassroom } : {}),
        ...(selectedDate ? getSelectedDateRange(selectedDate) : {}),
        PageIndex: page,
        PageSize: PAGE_SIZE,
      })
    );
  }, [dispatch, page, schoolBranchId, searchTerm, selectedClassroom, selectedDate, selectedStage]);

  const stageOptions = useMemo(
    () =>
      educationalStages
        .map((stage) => ({
          value: stage.id,
          label:
            (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [currentLang, educationalStages]
  );

  const classroomOptions = useMemo(
    () =>
      classrooms
        .map((classroom) => ({
          value: classroom.id,
          label:
            (currentLang === 'ar' ? classroom.name : classroom.nameEn) ||
            classroom.name ||
            classroom.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [classrooms, currentLang]
  );

  const tablePagination = {
    page: pagination.pageIndex,
    limit: pagination.pageSize || PAGE_SIZE,
    total: pagination.totalItems,
    totalPages: Math.max(1, pagination.totalPages),
  };
  const hasActiveFilter = Boolean(
    searchTerm.trim() || selectedStage || selectedClassroom || selectedDate
  );
  const emptyMessage = hasActiveFilter
    ? t('common.noDataFound')
    : t('notifications.emptyStateDescription');

  const renderParentCell = (row: SchoolNotificationItem) => {
    const parents = getParents(row);
    const parentCount = getParentCount(row);
    const additionalParentsCount = parentCount > 1 ? parentCount - 1 : undefined;
    const firstParent = parents[0];

    if (!firstParent) {
      return (
        <UserAvatarName
          name="-"
          avatarSrc={ProfileImage}
          align="center"
          className="min-w-[220px]"
        />
      );
    }

    if (parentCount > 1) {
      return (
        <button
          type="button"
          className="mx-auto rounded-lg text-start transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#117BD7]/30"
          onClick={() => setSelectedParents(parents)}
        >
          <UserAvatarName
            name={firstParent.fullName}
            avatarSrc={resolveFileUrl(firstParent.imagePath) ?? ProfileImage}
            align="center"
            className="min-w-[220px]"
            viewCount={additionalParentsCount}
          />
        </button>
      );
    }

    return (
      <UserAvatarName
        name={firstParent.fullName}
        avatarSrc={resolveFileUrl(firstParent.imagePath) ?? ProfileImage}
        align="center"
        className="min-w-[220px]"
      />
    );
  };

  const columns: DataTableColumn<SchoolNotificationItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index ?? 0) + 1 + (pagination.pageIndex - 1) * (pagination.pageSize || PAGE_SIZE)}
        </span>
      ),
      headerClassName: 'w-[60px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.parentName',
      accessor: renderParentCell,
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.educationalStage',
      accessor: (row) => (
        <span className="block max-w-[220px] truncate text-[#646969]">
          {getStageLabels(row, i18n.language).join(' - ') || '-'}
        </span>
      ),
      headerClassName: 'min-w-[190px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.classrooms',
      accessor: (row) => (
        <span className="block max-w-[260px] truncate text-base text-[#646969]">
          {getClassroomLabels(row, i18n.language).join(' - ') || '-'}
        </span>
      ),
      headerClassName: 'min-w-[250px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.messageSubject',
      accessor: (row) => (
        <span className="block max-w-[280px] truncate text-base text-[#646969]">
          {getLocalizedText(row.titleAr, row.titleEn, i18n.language)}
        </span>
      ),
      headerClassName: 'min-w-[290px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.date',
      accessor: (row) => (
        <span className="text-[#646969]">{formatNotificationDate(row.created, i18n.language)}</span>
      ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.attachments',
      accessor: (row) =>
        row.attachments?.length ? (
          <CustomImage
            src={PdfIcon}
            alt={row.attachments.map((attachment) => attachment.fileName).join(', ')}
            className="h-10 w-8"
          />
        ) : (
          <span className="text-base text-[#646969]">{t('notifications.noAttachment')}</span>
        ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('notifications.searchParentName'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'educational-stage-filter',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => {
            setSelectedStage(getSingleValue(value));
            setSelectedClassroom('');
            setPage(1);
          }}
          options={stageOptions}
          placeholder={t('notifications.educationalStageFilter')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) => {
            setSelectedClassroom(getSingleValue(value));
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('notifications.classroomFilter')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      value: selectedDate,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setPage(1);
          }}
          placeholder={t('notifications.dateFilter')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedClassroom('');
    setSelectedDate('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={notifications}
        columns={columns}
        keyExtractor={(row) => `parents-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={tablePagination}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        t={t}
      />

      <NotificationRecipientsPopup
        isOpen={selectedParents.length > 0}
        onClose={() => setSelectedParents([])}
        title={t('notifications.parentNames')}
        recipients={selectedParents}
        isRtl={i18n.language.startsWith('ar') || i18n.dir(i18n.language) === 'rtl'}
        viewLabel={t('common.view')}
      />
    </Card>
  );
}
