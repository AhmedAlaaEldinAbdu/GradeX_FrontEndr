import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import MetricCard from '@/shared/components/MetricCard';
import DeletePopup from '@/shared/popups/DeletePopup';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import ClockYellowBoldIcon from '@gradex/assets/icons/ClockYellowBold.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import TasksBadgeIcon from '@gradex/assets/icons/TasksBadge.svg';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import {
  deleteSchoolTask as deleteSchoolTaskAction,
  fetchSchoolTasks,
} from '@/redux/features/school-tasks/schoolTasksSlice';
import type { SchoolTask, SchoolTaskType } from '@/types/schoolTasks';

type CorrectionStatusKey = 'corrected' | 'notCorrected';
type ProgressStatusKey = 'completed' | 'pending' | 'late';

type TaskTableRow = SchoolTask & {
  index: number;
  correctionStatusKey: CorrectionStatusKey;
  progressStatusKey: ProgressStatusKey;
  submissionsLabel: string;
};

const PAGE_SIZE = 7;

const TASK_TYPE_LABEL_KEYS: Partial<Record<SchoolTaskType, string>> = {
  1: 'tasksManagement.taskTypes.homework',
  2: 'tasksManagement.taskTypes.training',
  3: 'tasksManagement.taskTypes.dictation',
  4: 'tasksManagement.taskTypes.quiz',
};

const TASK_TYPE_META: Record<number, { className: string }> = {
  1: { className: 'bg-emerald-100 text-emerald-700' },
  2: { className: 'bg-amber-100 text-amber-700' },
  3: { className: 'bg-cyan-100 text-cyan-700' },
  4: { className: 'bg-violet-100 text-violet-700' },
  5: { className: 'bg-blue-100 text-blue-700' },
  6: { className: 'bg-rose-100 text-rose-700' },
};

const TASK_CORRECTION_META: Record<CorrectionStatusKey, { className: string }> = {
  corrected: {
    className: 'bg-emerald-100 text-emerald-700',
  },
  notCorrected: {
    className: 'bg-rose-100 text-rose-700',
  },
};

const formatTaskDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB');
};

const getCorrectionStatusKey = (task: SchoolTask): CorrectionStatusKey =>
  task.correctTaskNumber > 0 ? 'corrected' : 'notCorrected';

const getProgressStatusKey = (task: SchoolTask): ProgressStatusKey => {
  if (task.totalTaskNumber > 0 && task.correctTaskNumber >= task.totalTaskNumber) {
    return 'completed';
  }

  const deliveryDate = new Date(task.deliveryDate || task.date);
  if (!Number.isNaN(deliveryDate.getTime()) && deliveryDate.getTime() < Date.now()) {
    return 'late';
  }

  return 'pending';
};

const getTeacherId = (task: SchoolTask) => {
  const taskWithTeacherId = task as SchoolTask & {
    teacherId?: string;
    teatcherId?: string;
  };

  return taskWithTeacherId.teacherId || taskWithTeacherId.teatcherId || '';
};

export default function TasksManagement() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isArabic = i18n.language === 'ar';
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();
  const handleViewTask = (taskId: string) => navigate(`/calendar/tasks/details/${taskId}`);
  const handleViewTeacher = (teacherId: string) =>
    navigate(`/teachers/${teacherId}`, { state: { comeFrom: 'calendar-tasks' } });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [selectedCorrectionStatus, setSelectedCorrectionStatus] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [page, setPage] = useState(1);

  const tasks = useAppSelector((state) => state.schoolTasks.schoolTasks);
  const isLoading = useAppSelector((state) => state.schoolTasks.isLoading);
  const isDeleting = useAppSelector((state) => state.schoolTasks.isDeleting);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);

  useEffect(() => {
    dispatch(
      fetchSubjects({
        page: 1,
        limit: 10000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId: schoolBranchId || undefined },
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    dispatch(
      fetchSchoolTasks({
        page: 1,
        limit: 10,
        filters: {
          classroomId: selectedClassroom || undefined,
          materialId: selectedSubject || undefined,
          taskType: selectedTaskType ? (Number(selectedTaskType) as SchoolTaskType) : undefined,
        },
      })
    );
  }, [dispatch, selectedClassroom, selectedSubject, selectedTaskType]);

  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => getProgressStatusKey(task) === 'completed').length,
      pending: tasks.filter((task) => getProgressStatusKey(task) === 'pending').length,
      late: tasks.filter((task) => getProgressStatusKey(task) === 'late').length,
    };
  }, [tasks]);

  const classroomOptions = useMemo(() => {
    return classrooms.map((classroom) => ({
      value: classroom.id,
      label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
    }));
  }, [classrooms, currentLang]);

  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      value: subject.id,
      label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
    }));
  }, [currentLang, subjects]);

  const getTaskTypeLabel = (taskType: number) => {
    const labelKey = TASK_TYPE_LABEL_KEYS[taskType as SchoolTaskType];
    return labelKey ? t(labelKey) : `${t('tasksManagement.table.taskType')} ${taskType}`;
  };

  const taskTypeOptions = [1, 2, 3, 4, 5, 6].map((value) => ({
    value: String(value),
    label: getTaskTypeLabel(value),
  }));

  const correctionStatusOptions = Object.keys(TASK_CORRECTION_META).map((value) => ({
    value,
    label: t(`tasksManagement.correctionStatuses.${value}`),
  }));

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const localizedName = isArabic ? task.nameAr || task.name : task.nameEn || task.name;
      const localizedSubject = task.materialName || '';
      const localizedClassroom = task.classroomName || '';
      const correctionStatusKey = getCorrectionStatusKey(task);

      const matchesSearch =
        !normalizedSearch ||
        localizedName.toLowerCase().includes(normalizedSearch) ||
        (task.teatcherName || '').toLowerCase().includes(normalizedSearch);

      const matchesCorrectionStatus =
        !selectedCorrectionStatus || correctionStatusKey === selectedCorrectionStatus;

      return (
        matchesSearch &&
        matchesCorrectionStatus &&
        Boolean(localizedClassroom) &&
        Boolean(localizedSubject)
      );
    });
  }, [isArabic, searchTerm, selectedCorrectionStatus, tasks]);

  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [filteredTasks.length, page]);

  const paginatedTasks = useMemo<TaskTableRow[]>(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredTasks.slice(startIndex, startIndex + PAGE_SIZE).map((task, index) => ({
      ...task,
      index: startIndex + index + 1,
      correctionStatusKey: getCorrectionStatusKey(task),
      progressStatusKey: getProgressStatusKey(task),
      submissionsLabel: `${task.correctTaskNumber}/${task.totalTaskNumber}`,
    }));
  }, [filteredTasks, page]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const handleDeleteConfirm = async () => {
    if (!selectedTaskId) return;

    try {
      await dispatch(deleteSchoolTaskAction(selectedTaskId)).unwrap();
      setShowDeletePopup(false);
      setSelectedTaskId('');
      showToast({
        message: isArabic ? 'تم حذف المهمة بنجاح' : 'Task deleted successfully',
        isRaw: true,
        type: 'success',
      });
    } catch {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      selectedClassroom ||
      selectedSubject ||
      selectedTaskType ||
      selectedCorrectionStatus
  );

  const shouldShowEmptyState = !isLoading && tasks.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || tasks.length > 0 || hasActiveFilters;

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
          <div>{isArabic ? row.nameAr || row.name : row.nameEn || row.name}</div>
          <button
            type="button"
            onClick={() => handleViewTask(row.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50"
            aria-label={t('actions.view')}
          >
            <CustomImage src={EyeStyledIcon} alt={t('actions.view')} className="h-5 w-5" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'tasksManagement.table.correctionStatus',
      accessor: (row) => {
        const meta = TASK_CORRECTION_META[row.correctionStatusKey];
        return (
          <span
            className={`inline-flex min-w-[130px] justify-center rounded-full px-4 py-2 ${meta.className}`}
          >
            {t(`tasksManagement.correctionStatuses.${row.correctionStatusKey}`)}
          </span>
        );
      },
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.submissionsCount',
      accessor: (row) => <span>{row.submissionsLabel}</span>,
      headerClassName: 'min-w-[180px]',
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
            {getTaskTypeLabel(row.taskType)}
          </span>
        );
      },
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.educationalStage',
      accessor: (row) => <span>{row.gradeName}</span>,
      headerClassName: 'min-w-[230px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.classroom',
      accessor: (row) => <span>{row.classroomName}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.subjectName',
      accessor: (row) => <span>{row.materialName}</span>,
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.teacherName',
      accessor: (row) => {
        const teacherId = getTeacherId(row);

        return (
          <div className="flex w-full items-center justify-evenly gap-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                <CustomImage
                  src={DefaultAvatar}
                  alt={row.teatcherName}
                  className="h-full w-full object-cover"
                />
              </div>
              <span>{row.teatcherName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (teacherId) {
                  handleViewTeacher(teacherId);
                }
              }}
              disabled={!teacherId}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t('actions.view')}
            >
              <CustomImage src={EyeStyledIcon} alt={t('actions.view')} className="h-5 w-5" />
            </button>
          </div>
        );
      },
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'tasksManagement.table.date',
      accessor: (row) => <span>{formatTaskDate(row.deliveryDate || row.date)}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            onClick={() => navigate(`/calendar/tasks/edit/${row.id}`)}
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel={t('actions.delete')}
            onClick={() => {
              setSelectedTaskId(row.id);
              setShowDeletePopup(true);
            }}
          />
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
          placeholder={
            isLoadingClassrooms
              ? t('common.loading')
              : t('tasksManagement.filters.classroomPlaceholder')
          }
          disabled={isLoadingClassrooms}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'tasks-subject',
      value: selectedSubject,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedSubject}
          onChange={(value) => {
            setSelectedSubject(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={subjectOptions}
          placeholder={
            isLoadingSubjects
              ? t('common.loading')
              : t('tasksManagement.filters.subjectPlaceholder')
          }
          disabled={isLoadingSubjects}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'tasks-type',
      value: selectedTaskType,
      onChange: () => {},
      width: '20%',
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
    <div className="space-y-6">
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

      {shouldShowEmptyState ? (
        <Card className="min-h-[280px]">
          <EmptyState
            imgSrc={TasksBadgeIcon}
            title={t('tasksManagement.emptyState.title')}
            description={t('tasksManagement.emptyState.description')}
            blend={true}
          />
        </Card>
      ) : shouldShowContent ? (
        <Card className="overflow-hidden">
          <>
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
              isLoading={isLoading}
              emptyMessage={t('tasksManagement.emptyState.noMatchingResults')}
              t={t}
            />

            <DeletePopup
              open={showDeletePopup}
              message="tasksManagement.messages.deleteConfirm"
              itemName={
                selectedTask
                  ? isArabic
                    ? selectedTask.nameAr || selectedTask.name
                    : selectedTask.nameEn || selectedTask.name
                  : ''
              }
              onConfirm={handleDeleteConfirm}
              onCancel={() => {
                setShowDeletePopup(false);
                setSelectedTaskId('');
              }}
              iconSrc={BigTrashIcon}
              isProcessing={isDeleting}
            />
          </>
        </Card>
      ) : null}
    </div>
  );
}
