import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

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
      header: 'attendanceRequests.educationalStage',
      accessor: (row) => <span>{row.educationalStage}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'attendanceRequests.grade',
      accessor: (row) => <span>{row.grade}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'attendanceRequests.interviewDate',
      accessor: (row) => <span>{row.interviewDate}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (_row) => (
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
      headerClassName: 'min-w-[100px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('attendanceRequests.searchPlaceholder'),
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
          placeholder={t('attendanceRequests.educationalStage')}
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
            { value: 'pending', label: t('attendanceRequests.status.editRequested') },
            { value: 'accepted', label: t('attendanceRequests.status.accepted') },
            { value: 'rejected', label: t('attendanceRequests.status.notPassed') },
          ]}
          placeholder={t('common.status')}
        />
      ),
    },
  ];

  return (
    <Card className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          {t('attendanceRequests.interviewsTitle')}
        </h3>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedStage('');
          setSelectedStatus('');
        }}
        t={t}
      />
    </Card>
  );
};

export default PersonalInterviewsTable;
