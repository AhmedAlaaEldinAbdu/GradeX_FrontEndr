import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Card from '@gradex/shared/components/Card';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import FilesIcon from '@gradex/assets/icons/Files.svg';
import CalendarIcon from '@gradex/assets/icons/Calendar.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import PdfIcon from '@gradex/assets/icons/Pdf.svg';

interface RegistrationRequest {
  id: string;
  studentName: string;
  studentImage?: string;
  educationalStage: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interview_scheduled';
  previousSchool: string;
  applicationDate: string;
  parentId?: string; // URL or boolean to show icon
  vaccinationCertificate?: string; // URL or boolean
  lastEducationCertificate?: string; // URL or boolean
}

const RegistrationRequestsTable: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data matching the style of other components (Arabic)
  const data: RegistrationRequest[] = [
    {
      id: '1',
      studentName: 'أحمد معتز حامد', // Arabic Name
      studentImage: 'https://i.pravatar.cc/150?u=1',
      educationalStage: 'المرحلة الابتدائية', // Arabic Stage
      status: 'pending',
      previousSchool: 'مدرسة الرشيد', // Arabic School Name
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
    {
      id: '2',
      studentName: 'سارة أحمد علي',
      studentImage: 'https://i.pravatar.cc/150?u=2',
      educationalStage: 'المرحلة الثانوية',
      status: 'rejected',
      previousSchool: 'مدرسة النور',
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
    {
      id: '3',
      studentName: 'محمد خالد ابراهيم',
      studentImage: 'https://i.pravatar.cc/150?u=3',
      educationalStage: 'المرحلة الإعدادية',
      status: 'rejected',
      previousSchool: 'مدرسة المستقبل',
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
    {
      id: '4',
      studentName: 'يوسف عمر حسن',
      studentImage: 'https://i.pravatar.cc/150?u=4',
      educationalStage: 'رياض الأطفال',
      status: 'interview_scheduled',
      previousSchool: '-- top --',
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
    {
      id: '5',
      studentName: 'فاطمة الزهراء',
      studentImage: 'https://i.pravatar.cc/150?u=5',
      educationalStage: 'المرحلة الابتدائية',
      status: 'accepted',
      previousSchool: 'مدرسة التفوق',
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
    {
      id: '6',
      studentName: 'محمود سامي',
      studentImage: 'https://i.pravatar.cc/150?u=6',
      educationalStage: 'المرحلة الابتدائية',
      status: 'interview_scheduled',
      previousSchool: 'مدرسة السلام',
      applicationDate: '22/2/2025',
      parentId: 'pdf',
      vaccinationCertificate: 'pdf',
      lastEducationCertificate: 'pdf',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {t('studentApplications.status.accepted')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {t('studentApplications.status.notPassed')}
          </span>
        );
      case 'interview_scheduled':
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
            {t('studentApplications.status.waitingInterview')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
            {t('studentApplications.status.modified')}
          </span>
        );
      default:
        return null;
    }
  };

  const columns: DataTableColumn<RegistrationRequest>[] = [
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
      header: 'common.status',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.previousSchool',
      accessor: (row) => <span>{row.previousSchool}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.applicationDate',
      accessor: (row) => <span>{row.applicationDate}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.parentId',
      accessor: (row) => (
        <div className="flex justify-center">
          <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center w-[120px]',
    },
    {
      header: 'studentApplications.vaccinationCertificate',
      accessor: (row) => (
        <div className="flex justify-center">
          <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center w-[120px]',
    },
    {
      header: 'studentApplications.lastEducationalCertificate',
      accessor: (row) => (
        <div className="flex justify-center">
          <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
        </div>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center w-[150px]',
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
            id: 'editRequest',
            label: t('studentApplications.actions.sendEditRequest'),
            icon: FilesIcon,
            onClick: () => console.log('Edit Request', row.id),
          },
          {
            id: 'schedule',
            label: t('studentApplications.actions.scheduleAppointment'),
            icon: CalendarIcon,
            onClick: () => console.log('Schedule', row.id),
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
    <Card>
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

export default RegistrationRequestsTable;
