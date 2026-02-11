import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
// import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
// import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';

interface Administrator {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  countryCode: string;
  permissions: string;
}

const SAMPLE_DATA: Administrator[] = Array.from({ length: 7 }).map((_, index) => ({
  id: (index + 1).toString(),
  name: 'أحمد معتز حسن',
  role: 'اسم الدور 1',
  phone: '599 3546 6789',
  email: 'test@grade-x.com',
  countryCode: '',
  permissions: 'رياض أطفال - المرحلة الأبتدائية',
}));

export default function AdministratorsPage() {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');

  // Filters state (placeholders)
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  // Sample data simulation
  const [administrators, setAdministrators] = useState<Administrator[]>(SAMPLE_DATA);
  const isLoading = false; // Mock loading state

  const filteredAdministrators = administrators.filter((admin) => {
    if (searchTerm) {
      return admin.name.includes(searchTerm);
    }
    return true;
  });

  const columns: DataTableColumn<Administrator>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">{(index || 0) + 1}</span>
      ),
      headerClassName: 'w-16 text-center',
      className: 'text-center',
    },
    {
      header: 'attendance.employeeName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src={ProfileImage}
            alt={row.name}
            className="h-10 w-10 rounded-full border border-gray-100 object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{row.name}</span>
          </div>
          <IconButton
            variant="blue"
            ariaLabel={t('actions.view')}
            onClick={(e) => {
              e.stopPropagation();
              // navigate(`/administrators/${row.id}`);
            }}
            className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
          >
            <CustomImage src={EyeStyledIcon} className="h-4 w-4" alt="View" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'teachers.mobile',
      accessor: (row) => (
        <span dir="ltr" className="font-medium text-gray-600">
          {row.phone}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'teachers.contactMethods',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <a
            href={`whatsapp://send?phone=${row.phone.replace(/\s/g, '')}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-lightGreen-100 transition-colors hover:bg-green-200"
          >
            <CustomImage src={WhatsAppIcon} alt="WhatsApp" className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${row.email}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-orange-50 transition-colors hover:bg-orange-100"
          >
            <CustomImage src={EmailYellowIcon} alt="Email" className="h-5 w-5" />
          </a>
        </div>
      ),
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row) => <span className="font-medium text-gray-700">{row.role}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.permissions',
      accessor: (row) => <span className="text-gray-600">{row.permissions}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedAdminId(row.id);
              setShowDeletePopup(true);
            }}
            ariaLabel={t('actions.delete')}
            className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
          />
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchAdmin',
      placeholder: t('administrators.searchAdministrator'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '35%',
    },
    {
      type: 'custom',
      name: 'subject-filter', // Keeping name for consistency or usage context
      placeholder: '',
      value: selectedSubject,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedSubject}
          onChange={(value) => setSelectedSubject(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[]}
          placeholder={t('teachers.subjectName')} // Placeholder text from image: "اسم المادة"
          disabled={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'class-filter',
      placeholder: '',
      value: selectedClassroom,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) =>
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={[]}
          placeholder={t('classes.title')} // Placeholder: "الصفوف الدراسية"
          disabled={false}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedEducationalStage,
      onChange: () => {},
      width: '30%',
      customComponent: (
        <CustomSelect
          value={selectedEducationalStage}
          onChange={(value) =>
            setSelectedEducationalStage(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={[]}
          placeholder={t('sidebar.educationalStages')} // Placeholder: "المراحل التعليمية"
          disabled={false}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleDeleteConfirm = () => {
    // Simulate deletion
    setAdministrators((prev) => prev.filter((a) => a.id !== selectedAdminId));
    setShowDeletePopup(false);
    showToast({
      message: 'administrators.administratorDeletedSuccessfully',
      type: 'success',
    });
  };

  return (
    <Card className="min-h-[500px]">
      <DataTable
        data={filteredAdministrators}
        columns={columns}
        keyExtractor={(row) => row.id}
        pagination={{
          page: 1,
          limit: 10,
          total: filteredAdministrators.length,
          totalPages: 1,
        }}
        onPageChange={() => {}}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedSubject('');
          setSelectedClassroom('');
          setSelectedEducationalStage('');
        }}
        isLoading={isLoading}
        emptyMessage={t('administrators.noAdministratorsMessage')}
        t={t}
      />

      <DeletePopup
        open={showDeletePopup}
        message="administrators.confirmDeleteAdministrator"
        itemName={administrators.find((a) => a.id === selectedAdminId)?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
        isProcessing={false}
      />
    </Card>
  );
}
