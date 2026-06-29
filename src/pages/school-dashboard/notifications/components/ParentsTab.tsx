import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { schoolNotificationApiService } from '@/services/api/school-notification/school-notification.service';
import {
  SchoolNotificationTarget,
  type SchoolNotificationItem,
  type SchoolNotificationMetrics,
  type SchoolNotificationRecipient,
  type SchoolNotificationRecipientStudent,
} from '@/services/api/types/school-notification.types';

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

const getDateOptions = (items: SchoolNotificationItem[], language: string) =>
  getUniqueOptions(
    items.map((item) => {
      const dateKey = getDateKey(item.created);
      return {
        value: dateKey,
        label: formatNotificationDate(dateKey, language),
      };
    })
  );

interface ParentsTabProps {
  onMetricsChange?: (metrics: SchoolNotificationMetrics) => void;
}

export default function ParentsTab({ onMetricsChange }: ParentsTabProps) {
  const { t, i18n } = useTranslation();
  const schoolBranchId = getCurrentSchoolBranchId() || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<SchoolNotificationItem[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: PAGE_SIZE,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!schoolBranchId) {
      setNotifications([]);
      setPagination({
        pageIndex: 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: PAGE_SIZE,
      });
      return;
    }

    let isActive = true;

    const fetchParentNotifications = async () => {
      setIsLoading(true);

      try {
        const response = await schoolNotificationApiService.getSchoolNotifications({
          SchoolBranchId: schoolBranchId,
          Target: SchoolNotificationTarget.Parents,
          PageIndex: page,
          PageSize: PAGE_SIZE,
        });

        if (!isActive) return;

        setNotifications(response.data?.items ?? []);
        onMetricsChange?.({
          totalNotifications: response.data?.totalNotifications ?? 0,
          totalTeacherNotifications: response.data?.totalTeacherNotifications ?? 0,
          totalParentNotifications: response.data?.totalParentNotifications ?? 0,
        });
        setPagination({
          pageIndex: response.data?.pageIndex ?? page,
          totalPages: response.data?.totalPages ?? 0,
          totalItems: response.data?.totalItems ?? 0,
          pageSize: response.data?.pageSize ?? PAGE_SIZE,
        });
      } catch {
        if (!isActive) return;

        setNotifications([]);
        setPagination({
          pageIndex: page,
          totalPages: 0,
          totalItems: 0,
          pageSize: PAGE_SIZE,
        });
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchParentNotifications();

    return () => {
      isActive = false;
    };
  }, [onMetricsChange, page, schoolBranchId]);

  const stageOptions = useMemo(
    () =>
      getUniqueOptions(
        notifications.flatMap((notification) =>
          getParentStudents(notification).map((student) => ({
            value: student.gradeId,
            label: getLocalizedText(student.gradeNameAr, student.gradeNameEn, i18n.language),
          }))
        )
      ),
    [i18n.language, notifications]
  );

  const classroomOptions = useMemo(
    () =>
      getUniqueOptions(
        notifications.flatMap((notification) =>
          getParentStudents(notification)
            .filter((student) => !selectedStage || student.gradeId === selectedStage)
            .map((student) => ({
              value: student.classroomId,
              label: getLocalizedText(
                student.classroomNameAr,
                student.classroomNameEn,
                i18n.language
              ),
            }))
        )
      ),
    [i18n.language, notifications, selectedStage]
  );

  const dateOptions = useMemo(
    () => getDateOptions(notifications, i18n.language),
    [i18n.language, notifications]
  );

  useEffect(() => {
    if (
      selectedStage &&
      notifications.length > 0 &&
      notifications.every(
        (notification) =>
          !getParentStudents(notification).some((student) => student.gradeId === selectedStage)
      )
    ) {
      setSelectedStage('');
      setSelectedClassroom('');
    }

    if (
      selectedClassroom &&
      notifications.length > 0 &&
      notifications.every(
        (notification) =>
          !getParentStudents(notification).some(
            (student) => student.classroomId === selectedClassroom
          )
      )
    ) {
      setSelectedClassroom('');
    }

    if (
      selectedDate &&
      notifications.length > 0 &&
      notifications.every((notification) => getDateKey(notification.created) !== selectedDate)
    ) {
      setSelectedDate('');
    }
  }, [notifications, selectedClassroom, selectedDate, selectedStage]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const parentsText = getParents(notification)
        .map((parent) => parent.fullName)
        .join(' ')
        .toLowerCase();
      const studentsText = getParentStudents(notification)
        .map((student) => student.studentName)
        .join(' ')
        .toLowerCase();
      const stageText = getStageLabels(notification, i18n.language).join(' ').toLowerCase();
      const classroomText = getClassroomLabels(notification, i18n.language).join(' ').toLowerCase();
      const title = getLocalizedText(
        notification.titleAr,
        notification.titleEn,
        i18n.language
      ).toLowerCase();
      const body = getLocalizedText(
        notification.bodyAr,
        notification.bodyEn,
        i18n.language
      ).toLowerCase();
      const students = getParentStudents(notification);

      const matchesSearch =
        !normalizedSearch ||
        parentsText.includes(normalizedSearch) ||
        studentsText.includes(normalizedSearch) ||
        stageText.includes(normalizedSearch) ||
        classroomText.includes(normalizedSearch) ||
        title.includes(normalizedSearch) ||
        body.includes(normalizedSearch);
      const matchesStage =
        !selectedStage || students.some((student) => student.gradeId === selectedStage);
      const matchesClassroom =
        !selectedClassroom || students.some((student) => student.classroomId === selectedClassroom);
      const matchesDate = !selectedDate || getDateKey(notification.created) === selectedDate;

      return matchesSearch && matchesStage && matchesClassroom && matchesDate;
    });
  }, [i18n.language, notifications, searchTerm, selectedClassroom, selectedDate, selectedStage]);

  const hasActiveClientFilter = Boolean(
    searchTerm.trim() || selectedStage || selectedClassroom || selectedDate
  );
  const tableData = hasActiveClientFilter ? filteredData : notifications;
  const tablePagination = hasActiveClientFilter
    ? {
        page: 1,
        limit: PAGE_SIZE,
        total: tableData.length,
        totalPages: Math.max(1, Math.ceil(tableData.length / PAGE_SIZE)),
      }
    : {
        page: pagination.pageIndex,
        limit: pagination.pageSize || PAGE_SIZE,
        total: pagination.totalItems,
        totalPages: Math.max(1, pagination.totalPages),
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
      accessor: (row) => {
        const parents = getParents(row);
        const parentCount = getParentCount(row);
        const additionalParentsCount = parentCount > 1 ? parentCount - 1 : undefined;
        const firstParent = parents[0];

        return (
          <UserAvatarName
            name={firstParent?.fullName ?? '-'}
            avatarSrc={resolveFileUrl(firstParent?.imagePath) ?? ProfileImage}
            align="center"
            className="min-w-[220px]"
            viewCount={additionalParentsCount}
          />
        );
      },
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
        <CustomSelect
          value={selectedDate}
          onChange={(value) => {
            setSelectedDate(getSingleValue(value));
            setPage(1);
          }}
          options={dateOptions}
          placeholder={t('notifications.dateFilter')}
          showSearch={false}
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
        data={tableData}
        columns={columns}
        keyExtractor={(row) => `parents-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={tablePagination}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={t('notifications.emptyStateDescription')}
        t={t}
      />
    </Card>
  );
}
