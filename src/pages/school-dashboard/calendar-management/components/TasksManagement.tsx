import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import MetricCard from '@/shared/components/MetricCard';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import TaskIcon from '@gradex/assets/icons/Task.svg';
import {
  TASK_CORRECTION_META,
  TASK_TYPE_META,
  TASKS_MOCK,
  type TaskRecord,
} from '../data/tasks.mock';

type TaskTableRow = TaskRecord & {
  index: number;
};

const PAGE_SIZE = 7;

const formatTaskDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB');
};

export default function TasksManagement() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [selectedCorrectionStatus, setSelectedCorrectionStatus] = useState('');
  const [page, setPage] = useState(1);

  const tasks = TASKS_MOCK;

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.progressStatus === 'completed').length,
      pending: tasks.filter((task) => task.progressStatus === 'pending').length,
      late: tasks.filter((task) => task.progressStatus === 'late').length,
    };
  }, [tasks]);

  const classroomOptions = useMemo(() => {
    const seen = new Set<string>();
    return tasks
      .map((task) => ({
        value: task.classroomAr,
        label: isArabic ? task.classroomAr : task.classroomEn,
      }))
      .filter((option) => {
        if (seen.has(option.value)) {
          return false;
        }
        seen.add(option.value);
        return true;
      });
  }, [isArabic, tasks]);

  const subjectOptions = useMemo(() => {
    const seen = new Set<string>();
    return tasks
      .map((task) => ({
        value: task.subjectAr,
        label: isArabic ? task.subjectAr : task.subjectEn,
      }))
      .filter((option) => {
        if (seen.has(option.value)) {
          return false;
        }
        seen.add(option.value);
        return true;
      });
  }, [isArabic, tasks]);

  const taskTypeOptions = Object.keys(TASK_TYPE_META).map((value) => ({
    value,
    label: t(`tasksManagement.taskTypes.${value}`),
  }));

  const correctionStatusOptions = Object.keys(TASK_CORRECTION_META).map((value) => ({
    value,
    label: t(`tasksManagement.correctionStatuses.${value}`),
  }));

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const localizedName = isArabic ? task.nameAr : task.nameEn;
      const localizedSubject = isArabic ? task.subjectAr : task.subjectEn;
      const localizedClassroom = isArabic ? task.classroomAr : task.classroomEn;

      const matchesSearch =
        !normalizedSearch ||
        localizedName.toLowerCase().includes(normalizedSearch) ||
        task.teacherName.toLowerCase().includes(normalizedSearch);

      const matchesClassroom = !selectedClassroom || task.classroomAr === selectedClassroom;
      const matchesSubject = !selectedSubject || task.subjectAr === selectedSubject;
      const matchesTaskType = !selectedTaskType || task.taskType === selectedTaskType;
      const matchesCorrectionStatus =
        !selectedCorrectionStatus || task.correctionStatus === selectedCorrectionStatus;

      return (
        matchesSearch &&
        matchesClassroom &&
        matchesSubject &&
        matchesTaskType &&
        matchesCorrectionStatus &&
        Boolean(localizedClassroom) &&
        Boolean(localizedSubject)
      );
    });
  }, [
    isArabic,
    searchTerm,
    selectedClassroom,
    selectedCorrectionStatus,
    selectedSubject,
    selectedTaskType,
    tasks,
  ]);

  const paginatedTasks = useMemo<TaskTableRow[]>(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredTasks.slice(startIndex, startIndex + PAGE_SIZE).map((task, index) => ({
      ...task,
      index: startIndex + index + 1,
    }));
  }, [filteredTasks, page]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));

  const columns: DataTableColumn<TaskTableRow>[] = [
    {
      header: '#',
      accessor: (row) => <span>{row.index}</span>,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.taskName',
      accessor: (row) => (
        <div className="flex w-full items-center justify-evenly gap-2">
          <div>{isArabic ? row.nameAr : row.nameEn}</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <CustomImage src={EyeStyledIcon} alt={t('actions.view')} className="h-5 w-5" />
          </div>
        </div>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'tasksManagement.table.correctionStatus',
      accessor: (row) => {
        const meta = TASK_CORRECTION_META[row.correctionStatus];
        return (
          <span
            className={`inline-flex min-w-[130px] justify-center rounded-full px-4 py-2 ${meta.className}`}
          >
            {t(`tasksManagement.correctionStatuses.${row.correctionStatus}`)}
          </span>
        );
      },
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.submissionsCount',
      accessor: (row) => <span>{row.submissionsLabel}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.taskType',
      accessor: (row) => {
        const meta = TASK_TYPE_META[row.taskType];
        return (
          <span
            className={`inline-flex min-w-[130px] justify-center rounded-full px-4 py-2 ${meta.className}`}
          >
            {t(`tasksManagement.taskTypes.${row.taskType}`)}
          </span>
        );
      },
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.educationalStage',
      accessor: (row) => <span>{isArabic ? row.stageAr : row.stageEn}</span>,
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.classroom',
      accessor: (row) => <span>{isArabic ? row.classroomAr : row.classroomEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.subjectName',
      accessor: (row) => <span>{isArabic ? row.subjectAr : row.subjectEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.teacherName',
      accessor: (row) => (
        <div className="flex w-full items-center justify-evenly gap-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
              <CustomImage
                src={DefaultAvatar}
                alt={row.teacherName}
                className="h-full w-full object-cover"
              />
            </div>
            <span>{row.teacherName}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <CustomImage src={EyeStyledIcon} alt={t('actions.view')} className="h-5 w-5" />
          </div>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.date',
      accessor: (row) => <span>{formatTaskDate(row.dueDate)}</span>,
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-2">
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
      name: 'tasks-search',
      placeholder: t('tasksManagement.filters.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'tasks-classroom',
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) => {
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('tasksManagement.filters.classroomPlaceholder')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'tasks-subject',
      value: selectedSubject,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedSubject}
          onChange={(value) => {
            setSelectedSubject(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={subjectOptions}
          placeholder={t('tasksManagement.filters.subjectPlaceholder')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'tasks-type',
      value: selectedTaskType,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedTaskType}
          onChange={(value) => {
            setSelectedTaskType(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={taskTypeOptions}
          placeholder={t('tasksManagement.filters.taskTypePlaceholder')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'tasks-status',
      value: selectedCorrectionStatus,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedCorrectionStatus}
          onChange={(value) => {
            setSelectedCorrectionStatus(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={correctionStatusOptions}
          placeholder={t('tasksManagement.filters.correctionStatusPlaceholder')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClassroom('');
    setSelectedSubject('');
    setSelectedTaskType('');
    setSelectedCorrectionStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t('tasksManagement.metrics.total')}
          value={metrics.total}
          icon={
            <CustomImage
              src={TaskBlueIcon}
              alt={t('tasksManagement.alt.total')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title={t('tasksManagement.metrics.completed')}
          value={metrics.completed}
          icon={
            <CustomImage
              src={CheckMarkIcon}
              alt={t('tasksManagement.alt.completed')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-green-50 text-green-600"
        />
        <MetricCard
          title={t('tasksManagement.metrics.pending')}
          value={metrics.pending}
          icon={
            <CustomImage
              src={ClockYellowBoldIcon}
              alt={t('tasksManagement.alt.pending')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-yellow-50 text-yellow-600"
        />
        <MetricCard
          title={t('tasksManagement.metrics.late')}
          value={metrics.late}
          icon={
            <CustomImage
              src={XmarkCircleRedIcon}
              alt={t('tasksManagement.alt.late')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      {tasks.length === 0 ? (
        <Card className="min-h-[280px]">
          <div className="flex min-h-[248px] flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
              <CustomImage
                src={TaskIcon}
                alt={t('tasksManagement.alt.empty')}
                className="h-14 w-14 opacity-80"
              />
            </div>
            <div className="max-w-[540px] space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('tasksManagement.emptyState.title')}
              </h2>
              <p className="text-base text-gray-500">
                {t('tasksManagement.emptyState.description')}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <DataTable
            data={paginatedTasks}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page,
              limit: PAGE_SIZE,
              total: filteredTasks.length,
              totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={false}
            emptyMessage={t('tasksManagement.emptyState.noMatchingResults')}
            t={t}
          />
        </Card>
      )}
    </div>
  );
}
