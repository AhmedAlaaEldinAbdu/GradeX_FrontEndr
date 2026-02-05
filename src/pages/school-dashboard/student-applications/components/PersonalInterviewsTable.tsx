import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import EventCalendarIcon from '@gradex/assets/icons/EventCalendar.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

interface Interview {
  id: string;
  studentName: string;
  studentImage?: string;
  educationalStage: string;
  grade: string;
  interviewDate: string;
}

const PersonalInterviewsTable: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const data: Interview[] = [
    {
      id: '1',
      studentName: 'أحمد معتز حامد',
      studentImage: 'https://i.pravatar.cc/150?u=1',
      educationalStage: 'المرحلة الابتدائية',
      grade: '1/1', // Class 1/1
      interviewDate: '22/2/2025',
    },
    {
      id: '2',
      studentName: 'سارة أحمد علي',
      studentImage: 'https://i.pravatar.cc/150?u=2',
      educationalStage: 'المرحلة الثانوية',
      grade: '2/1',
      interviewDate: '22/2/2025',
    },
    {
      id: '3',
      studentName: 'محمد خالد ابراهيم',
      studentImage: 'https://i.pravatar.cc/150?u=3',
      educationalStage: 'المرحلة الإعدادية',
      grade: '1/1',
      interviewDate: '22/2/2025',
    },
    {
      id: '4',
      studentName: 'يوسف عمر حسن',
      studentImage: 'https://i.pravatar.cc/150?u=4',
      educationalStage: 'رياض الأطفال',
      grade: '1/1',
      interviewDate: '22/2/2025',
    },
    {
      id: '5',
      studentName: 'فاطمة الزهراء',
      studentImage: 'https://i.pravatar.cc/150?u=5',
      educationalStage: 'المرحلة الابتدائية',
      grade: '1/3',
      interviewDate: '22/2/2025',
    },
    {
      id: '6',
      studentName: 'محمود سامي',
      studentImage: 'https://i.pravatar.cc/150?u=6',
      educationalStage: 'المرحلة الابتدائية',
      grade: '1/1',
      interviewDate: '22/2/2025',
    },
  ];

  const columns: DataTableColumn<Interview>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">{(index || 0) + 1}</span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src={row.studentImage || ''}
            alt={row.studentName}
            className="h-10 w-10 rounded-full border border-gray-100 object-cover"
          />
          <span className="font-medium text-gray-900">{row.studentName}</span>
          <IconButton
            variant="blue"
            ariaLabel="View"
            onClick={() => console.log('View', row.id)}
            className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
          >
            <CustomImage src={EyeStyledIcon} className="h-4 w-4" alt="View" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentApplications.educationalStage',
      accessor: (row) => <span>{row.educationalStage}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.grade',
      accessor: (row) => <span>{row.grade}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.interviewDate',
      accessor: (row) => <span>{row.interviewDate}</span>,
      headerClassName: 'min-w-[150px] text-center',
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
      name: 'stage-filter',
      value: selectedStage,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'primary', label: 'المرحلة الابتدائية' },
            { value: 'middle', label: 'المرحلة الإعدادية' },
            { value: 'high', label: 'المرحلة الثانوية' },
          ]}
          placeholder={t('studentApplications.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'class-filter',
      value: '',
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value=""
          onChange={() => {}}
          options={[]}
          placeholder={t('sidebar.classes')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'pending', label: t('studentApplications.status.editRequested') },
            { value: 'accepted', label: t('studentApplications.status.accepted') },
            { value: 'rejected', label: t('studentApplications.status.notPassed') },
          ]}
          placeholder={t('common.status')}
        />
      ),
    },
  ];

  const [page, setPage] = useState(1);
  const limit = 10;
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  const paginatedData = data.slice((page - 1) * limit, page * limit);

  return (
    <Card className="mt-8">
      <DataTable
        data={paginatedData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{
          page: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
        }}
        onPageChange={(newPage) => setPage(newPage)}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedStage('');
          setSelectedStatus('');
          setPage(1);
        }}
        t={t}
      />
    </Card>
  );
};

export default PersonalInterviewsTable;
