import { useState } from 'react';
import Card from '@gradex/shared/components/Card';
import EmptyState from '@gradex/shared/components/EmptyState';
import Table from '@gradex/shared/components/Table';
import { useTranslation } from 'react-i18next';
import StudentIcon from '@gradex/assets/icons/Student.svg'; // Placeholder or use specialized icon
import IconButton from '@/shared/components/IconButton';
import RefreshSolidIcon from '@gradex/assets/icons/RefreshSolid.svg';
import MaterialPdfIcon from '@gradex/assets/icons/MaterialPdf.svg';
import ExcelFileIcon from '@gradex/assets/icons/ExcelFile.svg';
import PrinterIcon from '@gradex/assets/icons/Printer.svg';

interface Announcement {
  id: number;
  stage: string;
  startDate: string;
  endDate: string;
  status: 'valid' | 'expired' | 'cancelled';
}

export default function RegistrationAnnouncement() {
  const { t } = useTranslation();
  const [hasAnnouncements] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  //   const [startDate, setStartDate] = useState('');
  //   const [endDate, setEndDate] = useState('');

  const announcements: Announcement[] = [
    {
      id: 1,
      stage: 'المرحلة الابتدائية',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'valid',
    },
    {
      id: 2,
      stage: 'المرحلة الثانوية',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'valid',
    },
    {
      id: 3,
      stage: 'المرحلة الإعدادية',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'valid',
    },
    {
      id: 4,
      stage: 'رياض الأطفال',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'expired',
    },
    {
      id: 5,
      stage: 'المرحلة الابتدائية',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'cancelled',
    },
    {
      id: 6,
      stage: 'المرحلة الابتدائية',
      startDate: '22/2/2025',
      endDate: '22/2/2025',
      status: 'expired',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {t('registrationAnnouncement.valid')}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {t('registrationAnnouncement.expired')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
            {t('registrationAnnouncement.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  const columns = [
    { header: '#', accessor: (row: Announcement) => row.id },
    {
      header: 'registrationAnnouncement.educationalStage',
      accessor: (row: Announcement) => row.stage,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'registrationAnnouncement.startDate',
      accessor: (row: Announcement) => row.startDate,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'registrationAnnouncement.endDate',
      accessor: (row: Announcement) => row.endDate,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'registrationAnnouncement.status',
      accessor: (row: Announcement) => getStatusBadge(row.status),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'common.actions',
      accessor: () => (
        <div className="flex items-center gap-2">
          <IconButton status="edit" variant="success" ariaLabel="Edit" />
          <IconButton status="delete" variant="danger" ariaLabel="Delete" />
        </div>
      ),
      headerClassName: 'min-w-[150px]',
    },
  ];

  const handleReload = () => {
    window.location.reload();
  };

  const handleExportPdf = () => {
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      {!hasAnnouncements ? (
        <EmptyState
          imgSrc={StudentIcon}
          description={t('registrationAnnouncement.noAnnouncementsMessage')} // You might need to add this key or reuse another
          blend={true}
        />
      ) : (
        <div>
          {/* Action Buttons */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-100"
            >
              <img src={RefreshSolidIcon} alt="" className="h-4 w-4" />
              {t('studentManagement.reload')}
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-red-100"
            >
              <img src={MaterialPdfIcon} alt="" className="h-4 w-4" />
              {t('studentManagement.exportPdf')}
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-green-100"
            >
              <img src={ExcelFileIcon} alt="" className="h-4 w-4" />
              {t('studentManagement.exportExcel')}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-100"
            >
              <img src={PrinterIcon} alt="" className="h-4 w-4" />
              {t('studentManagement.print')}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('registrationAnnouncement.searchByStudentName')}
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
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('registrationAnnouncement.educationalStage')}</option>
              <option value="primary">المرحلة الابتدائية</option>
              <option value="middle">المرحلة الإعدادية</option>
              <option value="high">المرحلة الثانوية</option>
            </select>
            {/* Start Date Picker (Placeholder) */}
            <div className="relative">
              {/* Using a simple input date for now, or text input with calendar icon as per image pattern if manual */}
              <input
                type="text"
                placeholder={t('registrationAnnouncement.startDate')}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => (e.target.type = 'text')}
                className="h-[40px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {/* End Date Picker (Placeholder) */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('registrationAnnouncement.endDate')}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => (e.target.type = 'text')}
                className="h-[40px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table columns={columns} data={announcements} keyExtractor={(row) => row.id} />
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">عرض الآن 1-7 من إعلانات</div>
            <div className="flex items-center gap-2">
              <button className="rounded border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50">
                التالي
              </button>
              <button className="rounded bg-green-600 px-3 py-1 text-sm text-white">1</button>
              <button className="rounded border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50">
                2
              </button>
              <button className="rounded border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50">
                السابق
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
