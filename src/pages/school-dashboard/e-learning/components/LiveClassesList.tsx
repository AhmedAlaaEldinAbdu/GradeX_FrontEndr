import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';
import CalendarInputIcon from '@gradex/assets/icons/CalendarInput.svg';
import VideoConferenceIcon from '@gradex/assets/icons/VideoConference.svg';

type LiveClassStatus = 'completed' | 'active' | 'upcoming' | 'closed';

type LiveClassRow = {
  id: string;
  subject: string;
  teacherName: string;
  status: LiveClassStatus;
  stage: string;
  classroom: string;
  date: string;
  startsAt: string;
  endsAt: string;
};

const PAGE_SIZE = 6;

const LIVE_CLASSES: LiveClassRow[] = [
  {
    id: '1',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'completed',
    stage: 'المرحلة الأبتدائية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '2',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'completed',
    stage: 'المرحلة الثانوية',
    classroom: '2/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '3',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'active',
    stage: 'المرحلة الإعدادية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '4',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'رياض الأطفال',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '5',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'المرحلة الأبتدائية',
    classroom: '3/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '6',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'closed',
    stage: 'المرحلة الأبتدائية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '7',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'المرحلة الثانوية',
    classroom: '2/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
];

const statusClassName: Record<LiveClassStatus, string> = {
  completed: 'bg-[#E6F3FE] text-[#117BD7]',
  active: 'bg-[#DFF8ED] text-[#1A9F58]',
  upcoming: 'bg-[#FEF8E6] text-[#C89004]',
  closed: 'bg-red-100 text-red-500',
};

const teacherOptions = [{ value: 'ahmed', label: 'أحمد معتز حسن' }];

const classroomOptions = [
  { value: '1-1', label: '1/1 ع' },
  { value: '2-1', label: '2/1 ع' },
  { value: '3-1', label: '3/1 ع' },
];

export default function LiveClassesList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  const statusOptions = [
    { value: 'completed', label: t('eLearning.liveClasses.status.completed') },
    { value: 'active', label: t('eLearning.liveClasses.status.active') },
    { value: 'upcoming', label: t('eLearning.liveClasses.status.upcoming') },
    { value: 'closed', label: t('eLearning.liveClasses.status.closed') },
  ];

  const hasActiveFilters = Boolean(search || teacher || classroom || status || date);

  const filteredClasses = useMemo(
    () =>
      LIVE_CLASSES.filter((item) => {
        const matchesSearch = search ? item.subject.includes(search.trim()) : true;
        const matchesTeacher = teacher ? item.teacherName === 'أحمد معتز حسن' : true;
        const selectedClassroom = classroomOptions.find((option) => option.value === classroom);
        const matchesClassroom = classroom ? item.classroom === selectedClassroom?.label : true;
        const matchesStatus = status ? item.status === status : true;
        const matchesDate = date ? item.date === date : true;

        return matchesSearch && matchesTeacher && matchesClassroom && matchesStatus && matchesDate;
      }),
    [classroom, date, search, status, teacher]
  );

  const totalPages = Math.max(Math.ceil(filteredClasses.length / PAGE_SIZE), 1);
  const paginatedClasses = filteredClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const columns: DataTableColumn<LiveClassRow>[] = [
    {
      header: '#',
      accessor: (_row, index = 0) => (page - 1) * PAGE_SIZE + index + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.subject',
      accessor: (row) => <span>{row.subject}</span>,
      headerClassName: 'min-w-[160px]',
    },
    {
      header: 'eLearning.liveClasses.table.teacherName',
      accessor: (row) => (
        <UserAvatarName name={row.teacherName} align="between" onView={() => {}} />
      ),
      headerClassName: 'min-w-[260px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.status',
      accessor: (row) => (
        <span
          className={`inline-flex min-w-[104px] items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium ${statusClassName[row.status]}`}
        >
          {t(`eLearning.liveClasses.status.${row.status}`)}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.stage',
      accessor: (row) => <span>{row.stage}</span>,
      headerClassName: 'min-w-[190px]',
    },
    {
      header: 'eLearning.liveClasses.table.classroom',
      accessor: (row) => <span>{row.classroom}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'eLearning.liveClasses.table.date',
      accessor: (row) => <span>{row.date}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.startsAt',
      accessor: (row) => <span>{row.startsAt}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'eLearning.liveClasses.table.endsAt',
      accessor: (row) => <span>{row.endsAt}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-3">
          <IconButton status="edit" variant="success" ariaLabel={t('actions.edit')} />
          <IconButton status="delete" variant="danger" ariaLabel={t('actions.delete')} />
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'live-classes-search',
      placeholder: t('eLearning.liveClasses.searchPlaceholder'),
      value: search,
      onChange: (value) => {
        setSearch(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'live-classes-teacher',
      value: teacher,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={teacher}
          onChange={(value) => {
            setTeacher(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={teacherOptions}
          placeholder={t('eLearning.liveClasses.filters.teacher')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-classroom',
      value: classroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={classroom}
          onChange={(value) => {
            setClassroom(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('eLearning.liveClasses.filters.classroom')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-status',
      value: status,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={status}
          onChange={(value) => {
            setStatus(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('eLearning.liveClasses.filters.status')}
          showSearch={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'live-classes-date',
      value: date,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <button
          type="button"
          onClick={() => {
            setDate(date ? '' : '22/2/2025');
            setPage(1);
          }}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#DDE0E0] bg-white px-4 text-sm font-normal text-[#646969]"
        >
          <CustomImage src={CalendarInputIcon} alt="" className="h-4 w-4" />
          {t('eLearning.liveClasses.filters.date')}
        </button>
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setTeacher('');
    setClassroom('');
    setStatus('');
    setDate('');
    setPage(1);
  };

  const shouldShowEmptyState = LIVE_CLASSES.length === 0 && !hasActiveFilters;
  const shouldShowContent = LIVE_CLASSES.length > 0 || hasActiveFilters;

  return (
    <>
      {shouldShowEmptyState ? (
        <Card className="flex min-h-56 items-center justify-center rounded-2xl" padding="sm">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <CustomImage
              src={VideoConferenceIcon}
              alt={t('eLearning.liveClasses.emptyTitle')}
              className="h-36 w-36 mix-blend-luminosity"
            />
            <p className="text-base font-normal leading-5 text-[#3A3A3A]">
              {t('eLearning.liveClasses.emptyTitle')}
            </p>
          </div>
        </Card>
      ) : shouldShowContent ? (
        <Card className="overflow-hidden rounded-3xl" padding="md">
          <DataTable
            data={paginatedClasses}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page,
              limit: PAGE_SIZE,
              total: filteredClasses.length,
              totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            emptyMessage={t('common.noResults')}
            t={t}
          />
        </Card>
      ) : null}
    </>
  );
}
