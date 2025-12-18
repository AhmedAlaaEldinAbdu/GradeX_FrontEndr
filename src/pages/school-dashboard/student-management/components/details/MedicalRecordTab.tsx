import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import Badge from '@/shared/components/Badge';

interface MedicalRecordTabProps {
  studentId: string;
}

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  vaccineNameEn: string;
  className: string;
  classNameEn: string;
  vaccinationDate: string;
  status: 'attended' | 'notAttended';
  notes: string;
  notesEn: string;
}

// Mock data matching the design
const mockVaccinationRecords: VaccinationRecord[] = [
  {
    id: '1',
    vaccineName: 'تطعيم فيروس كورونا v1',
    vaccineNameEn: 'COVID-19 Vaccine v1',
    className: 'الأول الإعدادي',
    classNameEn: 'First Preparatory',
    vaccinationDate: '1-1-2020',
    status: 'attended',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '2',
    vaccineName: 'تطعيم فيروس كورونا v2',
    vaccineNameEn: 'COVID-19 Vaccine v2',
    className: 'الثاني الإعدادي',
    classNameEn: 'Second Preparatory',
    vaccinationDate: '1-1-2021',
    status: 'notAttended',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
];

export default function MedicalRecordTab({ studentId }: MedicalRecordTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  console.log('Student ID:', studentId);

  // Section Header Component
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-4 flex items-center gap-4">
      <h3 className="whitespace-nowrap text-base font-semibold text-gray-900">{title}</h3>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'attended':
        return <Badge variant="success">{t('medicalRecord.attended')}</Badge>;
      case 'notAttended':
        return <Badge variant="danger">{t('medicalRecord.notAttended')}</Badge>;
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'attended', label: t('medicalRecord.attended') },
    { value: 'notAttended', label: t('medicalRecord.notAttended') },
  ];

  const classOptions = [
    { value: 'first', label: currentLang === 'ar' ? 'الأول الإعدادي' : 'First Preparatory' },
    { value: 'second', label: currentLang === 'ar' ? 'الثاني الإعدادي' : 'Second Preparatory' },
  ];

  // Filter records
  const filteredRecords = mockVaccinationRecords.filter((record) => {
    const vaccineName = currentLang === 'ar' ? record.vaccineName : record.vaccineNameEn;
    const matchesSearch =
      !searchQuery || vaccineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    const matchesClass = !selectedClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const columns: DataTableColumn<VaccinationRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.vaccineName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.vaccineName : row.vaccineNameEn}</span>,
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.className'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.className : row.classNameEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.vaccinationDate'),
      accessor: (row) => <span>{row.vaccinationDate}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.notes'),
      accessor: (row) => (
        <span className="text-gray-600">{currentLang === 'ar' ? row.notes : row.notesEn}</span>
      ),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Health Status Section */}
      <div className="rounded-xl bg-white p-6">
        <SectionHeader title={t('medicalRecord.healthStatus')} />
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{t('medicalRecord.disabilityType')}:</span>
          <span className="text-gray-600">{t('medicalRecord.hearingImpairment')}</span>
        </div>
      </div>

      {/* Vaccination Record Section */}
      <div className="rounded-xl bg-white p-6">
        <SectionHeader title={t('medicalRecord.vaccinationRecord')} />

        {/* Filter row */}
        <div className="mb-4 flex items-center justify-start gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('medicalRecord.searchVaccine')}
              className="h-10 w-64 rounded-lg border border-gray-200 pe-4 ps-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Class dropdown */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('medicalRecord.className')}</option>
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('medicalRecord.status')}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <div className="rounded-lg border border-gray-200">
          <DataTable
            data={filteredRecords}
            columns={columns}
            keyExtractor={(row) => row.id}
            showFilters={false}
            isLoading={false}
            emptyMessage={t('medicalRecord.noRecords')}
            t={t}
          />
        </div>
      </div>

      {/* Medical Record Section */}
      <div className="rounded-xl bg-white p-6">
        <SectionHeader title={t('medicalRecord.medicalRecordTitle')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{t('medicalRecord.lastExamDate')}:</span>
            <span className="text-gray-600">11/4/2022</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{t('medicalRecord.bloodType')}:</span>
            <span className="text-gray-600">{t('medicalRecord.bloodTypeValue')}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <span className="font-medium text-gray-700">{t('medicalRecord.allergies')}:</span>
            <span className="text-gray-600">{t('medicalRecord.allergiesValue')}</span>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="rounded-xl bg-white p-6">
        <SectionHeader title={t('medicalRecord.attachments')} />
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <span className="text-xs font-semibold text-red-600">PDF</span>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t('medicalRecord.medicalReport')}</p>
                <p className="text-sm text-gray-500">520 KB</p>
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
