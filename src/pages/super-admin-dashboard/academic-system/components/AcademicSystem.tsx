import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import Pagination from '@gradex/shared/components/Pagination';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import AcademicIcon from '@gradex/assets/icons/Academic.svg';
import { useState } from 'react';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import DeletePopup from '@/shared/components/DeletePopup';
import PopupMessage from '@/shared/components/PopupMessage';

interface AcademicSystem {
  id: number;
  systemName: string;
  systemType: string;
  countriesCount: number;
  countryName: string;
  educationalStagesCount: number;
  addedDate: string;
}

export default function AcademicSystemsTable() {
  const { t } = useTranslation();
  const [hasAcademicSystems, setHasAcademicSystems] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [academicSystem, setAcademicSystem] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleDeleteConfirm = () => {
    setShowDelete(false);
    setShowPopupMessage(true);
  };

  const systems: AcademicSystem[] = [
    {
      id: 1,
      systemName: 'عالمي',
      systemType: 'أمريكي',
      countriesCount: 1,
      countryName: 'مصر',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
    {
      id: 2,
      systemName: 'عالمي',
      systemType: 'أمريكي',
      countriesCount: 1,
      countryName: 'السعودية',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
    {
      id: 3,
      systemName: 'عالمي',
      systemType: 'دولي',
      countriesCount: 1,
      countryName: 'مصر',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
    {
      id: 4,
      systemName: 'عالمي',
      systemType: 'دولي',
      countriesCount: 1,
      countryName: 'مصر',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
    {
      id: 5,
      systemName: 'عالمي',
      systemType: 'أمريكي',
      countriesCount: 1,
      countryName: 'السعودية',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
    {
      id: 6,
      systemName: 'عالمي',
      systemType: 'أمريكي',
      countriesCount: 1,
      countryName: 'السعودية',
      educationalStagesCount: 12,
      addedDate: '22-4-2025',
    },
  ];

  const columns = [
    { header: '#', accessor: (row: AcademicSystem) => row.id },
    {
      header: 'academicSystem.systemName',
      accessor: (row: AcademicSystem) => row.systemName,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.systemType',
      accessor: (row: AcademicSystem) => row.systemType,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.countryName',
      accessor: (row: AcademicSystem) => row.countryName,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'academicSystem.educationalStagesCount',
      accessor: (row: AcademicSystem) => row.educationalStagesCount,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'academicSystem.addedDate',
      accessor: (row: AcademicSystem) => row.addedDate,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100">
            <img src={EditIcon} alt="Edit" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
          >
            <img src={TrashIcon} alt="Delete" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  return (
    <Card>
      {!hasAcademicSystems ? (
        <EmptyState
          imgSrc={AcademicIcon}
          description={t('academicSystem.noAcademicSystemMessage')}
          blend={true}
        />
      ) : (
        <div>
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg xl:w-[40%]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('schools.searchBySchoolRegionDistrictName')}
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
            </div>
            <div className="grid w-[100%] grid-cols-1 gap-4 rounded-lg sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <select
                  value={academicSystem}
                  onChange={(e) => setAcademicSystem(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t('academicSystem.educationSystem')}</option>
                  <option value="1">حكومي</option>
                  <option value="2">خاص</option>
                  <option value="3">أهلي</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t('academicSystem.country')}</option>
                  <option value="egypt">مصر</option>
                  <option value="ksa">السعودية</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t('academicSystem.systemType')}</option>
                  <option value="usa">أمريكي</option>
                  <option value="global">دولي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table columns={columns} data={systems} keyExtractor={(row) => row.id} />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={1}
            totalPages={10}
            to={6}
            from={1}
            onPageChange={() => console.log('Page changed')}
          />
          {/* Popups */}
          {showDelete && (
            <DeletePopup
              message="academicSystem.confirmDeleteSystem"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDelete(false)}
              iconSrc={BigTrashIcon}
            />
          )}
          {showPopupMessage && (
            <PopupMessage
              type="success"
              message="academicSystem.systemDeletedSuccessfully"
              iconSrc={BigSuccessIcon}
              autoClose={true}
              onClose={() => setShowPopupMessage(false)}
            />
          )}
        </div>
      )}
    </Card>
  );
}
