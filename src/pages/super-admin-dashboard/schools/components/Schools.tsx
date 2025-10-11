import { useState } from 'react';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Badge from '@gradex/shared/components/Badge';
import schoolIcon from '@gradex/assets/icons/School.svg';
import ArrowRightIcon from '@gradex/assets/icons/ArrowRight.svg';
import ArrowLeftIcon from '@gradex/assets/icons/ArrowLeft.svg';
import SettingsIcon from '@gradex/assets/icons/Settings.svg';
import Pagination from '@gradex/shared/components/Pagination';
import DropdownMenuSchoolsAction from './DropdownMenuSchoolsAction';

interface School {
  id: number;
  schoolName: string;
  educationSystem: string;
  status: string;
  statusEnum: number | string;
  country: string;
  region: string;
  district: string;
}

export default function Schools() {
  const { t } = useTranslation();
  const [hasSchools, setHasSchools] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicSystem, setAcademicSystem] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const schools: School[] = [
    {
      id: 1,
      schoolName: 'مدرسة الرشيد بنات',
      educationSystem: 'حكومي',
      status: 'قيد الانتظار',
      statusEnum: 'pending',
      country: 'مصر',
      region: 'القاهرة',
      district: 'الغربي',
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
    },
    {
      id: 3,
      schoolName: 'مدرسة النهضة',
      educationSystem: 'حكومي',
      status: 'قيد الانتظار',
      statusEnum: 'pending',
      country: 'مصر',
      region: 'القاهرة',
      district: 'الثالث',
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
    },
    {
      id: 5,
      schoolName: 'مدرسة المستقبل',
      educationSystem: 'حكومي',
      status: 'قيد المراجعة',
      statusEnum: 'pending',
      country: 'السعودية',
      region: 'جدة',
      district: 'الغربي',
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
      header: 'common.actions',
      accessor: () => <DropdownMenuSchoolsAction />,
      headerClassName: 'min-w-[100px]',
    },
  ];

  return (
    <Card>
      {!hasSchools ? (
        <EmptyState imgSrc={schoolIcon} description={t('schools.noSchoolsMessage')} blend={true} />
      ) : (
        <div>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="relative">
              <input
                type="text"
                placeholder={t('schools.searchBySchoolName')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[40px] w-full rounded-lg border border-gray-300 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              >
                <path
                  d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                  fill="#878F8F"
                />
              </svg>
            </div>

            <select
              value={academicSystem}
              onChange={(e) => setAcademicSystem(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('schools.academicSystem')}</option>
              <option value="1">حكومي</option>
              <option value="2">خاص</option>
              <option value="3">أهلي</option>
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('schools.country')}</option>
              <option value="egypt">مصر</option>
              <option value="ksa">السعودية</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('schools.region')}</option>
              <option value="cairo">القاهرة</option>
              <option value="riyadh">الرياض</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('schools.district')}</option>
              <option value="1">الشرقي</option>
              <option value="2">الغربي</option>
            </select>
          </div>

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
      )}
    </Card>
  );
}
