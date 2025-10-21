import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Badge from '@gradex/shared/components/Badge';
import Pagination from '@gradex/shared/components/Pagination';
import DropdownMenuSchoolsAction from './DropdownMenuSchoolsAction';
import PhoneIcon from '@gradex/assets/icons/Phone.svg';
import EmailIcon from '@gradex/assets/icons/Email.svg';

interface School {
  id: number;
  schoolName: string;
  educationSystem: string;
  status: string;
  statusEnum: number | string;
  country: string;
  region: string;
  district: string;
  addedDate: string;
}

export default function RegisteredSchoolsTab() {
  const { t } = useTranslation();

  const schools: School[] = [
    {
      id: 1,
      schoolName: 'مدرسة الرشيد بنات',
      educationSystem: 'حكومي',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'مصر',
      region: 'القاهرة',
      district: 'الغربي',
      addedDate: '22-4-2025',
    },
    {
      id: 2,
      schoolName: 'مدرسة الأمل',
      educationSystem: 'خاص',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'السعودية',
      region: 'الرياض',
      district: 'الشرقي',
      addedDate: '22-4-2025',
    },
    {
      id: 3,
      schoolName: 'مدرسة النهضة',
      educationSystem: 'حكومي',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'مصر',
      region: 'القاهرة',
      district: 'الثالث',
      addedDate: '22-4-2025',
    },
    {
      id: 4,
      schoolName: 'مدرسة الإبداع',
      educationSystem: 'أهلي',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'مصر',
      region: 'الإسكندرية',
      district: 'الشرقي',
      addedDate: '22-4-2025',
    },
    {
      id: 5,
      schoolName: 'مدرسة المستقبل',
      educationSystem: 'حكومي',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'السعودية',
      region: 'جدة',
      district: 'الغربي',
      addedDate: '22-4-2025',
    },
    {
      id: 6,
      schoolName: 'مدرسة المعرفة',
      educationSystem: 'خاص',
      status: 'موافقة',
      statusEnum: 'approved',
      country: 'السعودية',
      region: 'الرياض',
      district: 'الثالث',
      addedDate: '22-4-2025',
    },
  ];

  const columns = [
    { header: '#', accessor: (row: School) => row.id },
    {
      header: 'schools.schoolName',
      accessor: (row: School) => row.schoolName,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.educationSystem',
      accessor: (row: School) => row.educationSystem,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.status',
      accessor: (row: School) => {
        const statusVariants: Record<string, 'success' | 'warning' | 'danger'> = {
          approved: 'success',
          pending: 'warning',
          rejected: 'danger',
        };

        const variant = statusVariants[row.statusEnum] || 'default';

        return (
          <Badge variant={variant} size="lg">
            {t(`${row.status}`)}
          </Badge>
        );
      },
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'schools.country',
      accessor: (row: School) => row.country,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.region',
      accessor: (row: School) => row.region,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'schools.district',
      accessor: (row: School) => row.district,
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'schools.addedDate',
      accessor: (row: School) => row.addedDate,
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'schools.contactMethods',
      accessor: (row: School) => (
        <div className="flex items-center justify-center gap-3">
          {' '}
          <span className="cursor-pointer">
            <img src={EmailIcon} alt="EmailIcon" className="h-[24px] w-[24px]" />
          </span>
          <span className="cursor-pointer">
            <img src={PhoneIcon} alt="PhoneIcon" className="h-[24px] w-[24px]" />
          </span>{' '}
        </div>
      ),
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'common.actions',
      accessor: () => <DropdownMenuSchoolsAction selectedTab={1} />,
      headerClassName: 'min-w-[100px]',
      sticky: false,
    },
  ];

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <Table columns={columns} data={schools} keyExtractor={(row) => row.id} />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={1}
        totalPages={10}
        to={6}
        from={7}
        onPageChange={() => console.log('click to change page')}
      />
    </div>
  );
}
