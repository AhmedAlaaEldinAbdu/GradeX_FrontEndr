import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import { getVaccinationStatusBadgeColor } from '@/shared/components/SharedBadges';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';

interface MedicalRecordTabProps {
  studentId: string;
}

type VaccinationStatus = 'attended' | 'notAttended';

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  vaccineNameEn: string;
  className: string;
  classNameEn: string;
  vaccinationDate: string;
  status: VaccinationStatus;
  notes: string;
  notesEn: string;
}

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

const attachments = [
  { id: '1', name: 'التقرير الطبي', nameEn: 'Medical Report', size: '520 KB' },
];

export default function MedicalRecordTab(_props: MedicalRecordTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredRecords = mockVaccinationRecords.filter((record) => {
    const vaccineName = currentLang === 'ar' ? record.vaccineName : record.vaccineNameEn;
    const matchesSearch =
      !searchQuery || vaccineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    const matchesClass =
      !selectedClass ||
      (currentLang === 'ar' ? record.className : record.classNameEn) === selectedClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusLabel = (status: VaccinationStatus) =>
    status === 'attended' ? t('medicalRecord.attended') : t('medicalRecord.notAttended');

  const columns: DataTableColumn<VaccinationRecord>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index ?? 0) + 1,
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.vaccineName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.vaccineName : row.vaccineNameEn}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.className'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.className : row.classNameEn}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.vaccinationDate'),
      accessor: (row) => <span>{row.vaccinationDate}</span>,
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.status'),
      accessor: (row) => (
        <span className={getVaccinationStatusBadgeColor(row.status)}>
          {getStatusLabel(row.status)}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('medicalRecord.notes'),
      accessor: (row) => (
        <span className="text-sm text-[#646969]">
          {currentLang === 'ar' ? row.notes : row.notesEn}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'search',
      placeholder: '',
      value: searchQuery,
      onChange: () => {},
      width: '40%',
      customComponent: (
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('medicalRecord.searchVaccine')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'class-filter',
      placeholder: '',
      value: selectedClass,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedClass}
          onChange={(value) => setSelectedClass(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            {
              value: 'الأول الإعدادي',
              label: currentLang === 'ar' ? 'الأول الإعدادي' : 'First Preparatory',
            },
            {
              value: 'الثاني الإعدادي',
              label: currentLang === 'ar' ? 'الثاني الإعدادي' : 'Second Preparatory',
            },
          ]}
          placeholder={t('medicalRecord.className')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      placeholder: '',
      value: selectedStatus,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={[
            { value: 'attended', label: t('medicalRecord.attended') },
            { value: 'notAttended', label: t('medicalRecord.notAttended') },
          ]}
          placeholder={t('medicalRecord.status')}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-[#EDEDED] p-5">
      <h3 className="mb-4 text-base font-medium text-[#0E1F1F]">{title}</h3>
      {children}
    </div>
  );

  const InlineRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-[#0E1F1F]">{label}:</span>
      <span className="text-[#646969]">{value}</span>
    </div>
  );

  return (
    <Card>
      <div className="space-y-4">
        <SectionCard title={t('medicalRecord.healthStatus')}>
          <InlineRow
            label={t('medicalRecord.disabilityType')}
            value={t('medicalRecord.none')}
          />
        </SectionCard>

        <SectionCard title={t('medicalRecord.vaccinationRecord')}>
          <DataTable
            data={filteredRecords}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: filteredRecords.length,
              totalPages: Math.max(1, Math.ceil(filteredRecords.length / pageSize)),
            }}
            onPageChange={setCurrentPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={false}
            emptyMessage={t('medicalRecord.noRecords')}
            t={t}
          />
        </SectionCard>

        <SectionCard title={t('medicalRecord.medicalRecordTitle')}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <InlineRow label={t('medicalRecord.lastExamDate')} value="11/4/2022" />
            <InlineRow
              label={t('medicalRecord.bloodType')}
              value={t('medicalRecord.bloodTypeValue')}
            />
            <div className="md:col-span-2">
              <InlineRow
                label={t('medicalRecord.allergies')}
                value={t('medicalRecord.none')}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('medicalRecord.attachments')}>
          <div className="flex flex-col gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#EDEDED] bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <CustomImage src={PdfIcon} alt="PDF" className="h-10 w-9 flex-shrink-0" />
                  <div className="text-start">
                    <p className="text-sm font-medium text-[#0E1F1F]">
                      {currentLang === 'ar' ? attachment.name : attachment.nameEn}
                    </p>
                    <p className="text-xs font-normal text-[#646969]">{attachment.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E7F2FB] transition-colors hover:bg-[#D5E9F7]"
                  title={t('common.download')}
                  aria-label={t('common.download')}
                >
                  <CustomImage src={DownloadIcon} alt="" className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </Card>
  );
}
