import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import type { NotificationItem } from '../notifications.mock';

interface ParentsTabProps {
  items: NotificationItem[];
}

const PAGE_SIZE = 7;

const getSingleValue = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? '') : value;

const getUniqueOptions = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).map((value) => ({
    value,
    label: value,
  }));

export default function ParentsTab({ items }: ParentsTabProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const classroomText = item.classrooms?.join(' ') ?? '';
      const matchesSearch =
        !normalizedSearch ||
        item.recipientName.toLowerCase().includes(normalizedSearch) ||
        item.subject.toLowerCase().includes(normalizedSearch) ||
        item.educationalStage?.toLowerCase().includes(normalizedSearch) ||
        classroomText.toLowerCase().includes(normalizedSearch);
      const matchesStage = !selectedStage || item.educationalStage === selectedStage;
      const matchesClassroom =
        !selectedClassroom || item.classrooms?.includes(selectedClassroom) === true;
      const matchesDate = !selectedDate || item.date === selectedDate;

      return matchesSearch && matchesStage && matchesClassroom && matchesDate;
    });
  }, [items, searchTerm, selectedClassroom, selectedDate, selectedStage]);

  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const stageOptions = useMemo(
    () => getUniqueOptions(items.map((item) => item.educationalStage ?? '')),
    [items]
  );

  const classroomOptions = useMemo(
    () => getUniqueOptions(items.flatMap((item) => item.classrooms ?? [])),
    [items]
  );

  const dateOptions = useMemo(
    () => getUniqueOptions(items.map((item) => item.date)),
    [items]
  );

  const columns: DataTableColumn<NotificationItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index ?? 0) + 1 + (page - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[60px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.parentName',
      accessor: (row) => (
        <UserAvatarName
          name={row.recipientName}
          avatarSrc={ProfileImage}
          align="center"
          className="min-w-[220px]"
          viewCount={row.viewerCount}
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.educationalStage',
      accessor: (row) => <span className="text-[#646969]">{row.educationalStage ?? '-'}</span>,
      headerClassName: 'min-w-[190px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.classrooms',
      accessor: (row) => (
        <span className="block max-w-[260px] truncate text-base text-[#646969]">
          {row.classrooms?.join(' - ') || '-'}
        </span>
      ),
      headerClassName: 'min-w-[250px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.table.messageSubject',
      accessor: (row) => (
        <span className="block max-w-[280px] truncate text-base text-[#646969]">{row.subject}</span>
      ),
      headerClassName: 'min-w-[290px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.date',
      accessor: (row) => <span className="text-[#646969]">{row.date}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'notifications.attachments',
      accessor: (row) =>
        row.hasAttachment ? (
          <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-8" />
        ) : (
          <span className="text-base text-[#646969]">{t('notifications.noAttachment')}</span>
        ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-4">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            className="h-11 w-11 shadow-none"
            imgClassName="h-5 w-5"
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel={t('actions.delete')}
            className="h-11 w-11 shadow-none"
            imgClassName="h-5 w-5"
          />
        </div>
      ),
      headerClassName: 'min-w-[170px] text-center',
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
        data={pageData}
        columns={columns}
        keyExtractor={(row) => `parents-${row.id}`}
        filters={filterConfigs}
        showFilters={true}
        pagination={{ page, limit: PAGE_SIZE, total: filteredData.length, totalPages }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        emptyMessage={t('notifications.emptyStateDescription')}
        t={t}
      />
    </Card>
  );
}
