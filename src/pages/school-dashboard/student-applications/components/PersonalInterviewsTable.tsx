import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import StudentIcon from '@gradex/assets/icons/Student.svg';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import EventCalendarIcon from '@gradex/assets/icons/EventCalendar.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import Input from '@/shared/components/Input';
import { FaRegCalendarAlt } from 'react-icons/fa';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentInterviews } from '@/redux/features/student-interviews/studentInterviewsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import type { StudentInterview } from '@/services/api/types/student-interviews.types';
import useLanguage from '@/hooks/useLanguage';

const PersonalInterviewsTable: React.FC = () => {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Redux State
  const { studentInterviews, pagination, isLoading } = useAppSelector(
    (state) => state.studentInterviews
  );
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);

  // Fetch educational stages for grade filter
  useEffect(() => {
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 100 }));
  }, [dispatch]);

  // Fetch interviews when filters or pagination change
  useEffect(() => {
    dispatch(
      fetchStudentInterviews({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        filters: {
          studentName: searchTerm || undefined,
          gradeId: selectedGradeId || undefined,
          date: selectedDate || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
    selectedGradeId,
    selectedDate,
  ]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const gradeOptions = educationalStages.map((stage) => ({
    value: stage.id,
    label: isArabic ? stage.nameAr : stage.nameEn,
  }));

  const columns: DataTableColumn<StudentInterview>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(pagination.pageIndex - 1) * pagination.pageSize + (index || 0) + 1}
        </span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src=""
            alt={row.studentName || ''}
            fallbackSrc={StudentIcon}
            className="h-10 w-10 rounded-full border border-gray-100 object-cover"
          />
          <span className="font-medium text-gray-900">
            {row.studentName || (isArabic ? row.nameAr : row.nameEn)}
          </span>
          <IconButton
            variant="blue"
            ariaLabel="View"
            onClick={() => {}}
            className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
          >
            <CustomImage src={EyeStyledIcon} className="h-4 w-4" alt="View" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentApplications.interviewName',
      accessor: (row) => <span>{isArabic ? row.nameAr : row.nameEn}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.supervisor',
      accessor: (row) => <span>{row.supervisor || row.supervisorName || '-'}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.interviewDate',
      accessor: (row) => <span>{formatDate(row.interviewDate)}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.interviewTime',
      accessor: (row) => (
        <span>
          {formatTime(row.startTime)} - {formatTime(row.endTime)}
        </span>
      ),
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const actions: Action[] = [
          {
            id: 'accept',
            label: t('studentApplications.actions.accept'),
            icon: CheckmarkCircleIcon,
            onClick: () => console.log('Accept', row.id),
          },
          {
            id: 'changeDate',
            label: t('studentApplications.actions.changeAppointment'),
            icon: EventCalendarIcon,
            onClick: () => console.log('Change Date', row.id),
          },
          {
            id: 'notPassed',
            label: t('studentApplications.actions.notPassed'),
            icon: XMarkDangerIcon,
            onClick: () => console.log('Not Passed', row.id),
          },
        ];

        return (
          <div className="flex items-center justify-center gap-2">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
      headerClassName: 'min-w-[100px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('studentApplications.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '25%',
    },
    {
      type: 'custom',
      name: 'grade-filter',
      value: selectedGradeId,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedGradeId}
          onChange={(value) => setSelectedGradeId(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={gradeOptions}
          placeholder={t('studentApplications.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      value: selectedDate,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <Input
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder={t('studentApplications.interviewDate')}
          icon={<FaRegCalendarAlt className="h-4 w-4" />}
        />
      ),
    },
  ];

  return (
    <Card className="mt-8">
      <DataTable
        data={studentInterviews}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        isLoading={isLoading}
        pagination={{
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(newPage) => {
          dispatch(
            fetchStudentInterviews({
              page: newPage,
              limit: pagination.pageSize,
              filters: {
                studentName: searchTerm || undefined,
                gradeId: selectedGradeId || undefined,
                date: selectedDate || undefined,
              },
            })
          );
        }}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedGradeId('');
          setSelectedDate('');
          dispatch(
            fetchStudentInterviews({
              page: 1,
              limit: pagination.pageSize,
            })
          );
        }}
        t={t}
      />
    </Card>
  );
};

export default PersonalInterviewsTable;
