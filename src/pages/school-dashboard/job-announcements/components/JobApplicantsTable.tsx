import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ArchiveIcon from '@gradex/assets/icons/Archive.svg';
import RecallIcon from '@gradex/assets/icons/Recall.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import TimeLog from '@gradex/assets/icons/TimeLog.svg';
import {
  QUALIFICATION_LABELS,
  NATIONALITY_LABELS,
  WORK_TYPE_BADGES,
  STATUS_BADGES,
  type Applicant,
  type QualificationKey,
  type NationalityKey,
} from './applicants-data';
import { JobAdvertismentWorkShedule } from '@/services/api/types/job-advertisment.types';
import CustomImage from '@/shared/components/CustomImage';

type JobApplicantsTableProps = {
  data: Applicant[];
  filterPrefix: string;
  isArchived?: boolean;
};

const JobApplicantsTable = ({
  data,
  filterPrefix,
  isArchived = false,
}: JobApplicantsTableProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';

  const [searchValue, setSearchValue] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const getQualificationLabel = (key: QualificationKey) =>
    QUALIFICATION_LABELS[key]?.[currentLang] || QUALIFICATION_LABELS[key]?.en || '';
  const getNationalityLabel = (key: NationalityKey) =>
    NATIONALITY_LABELS[key]?.[currentLang] || NATIONALITY_LABELS[key]?.en || '';
  const getApplicantName = (applicant: Applicant) =>
    currentLang === 'ar' ? applicant.nameAr : applicant.nameEn || applicant.nameAr;
  const getApplicantRole = (applicant: Applicant) =>
    currentLang === 'ar' ? applicant.roleAr : applicant.roleEn || applicant.roleAr;
  const getAddress = (applicant: Applicant) =>
    currentLang === 'ar' ? applicant.addressAr : applicant.addressEn || applicant.addressAr;

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return data.filter((row) => {
      const nameForSearch = (
        currentLang === 'ar' ? row.nameAr : row.nameEn || row.nameAr
      ).toLowerCase();
      const matchesSearch = nameForSearch.includes(normalizedSearch);
      const matchesWorkType = workTypeFilter ? String(row.workType) === workTypeFilter : true;
      const matchesQualification = qualificationFilter
        ? row.qualificationKey === qualificationFilter
        : true;
      const matchesNationality = nationalityFilter
        ? row.nationalityKey === nationalityFilter
        : true;
      const matchesExperience = experienceFilter
        ? row.yearsExperience.toString() === experienceFilter
        : true;

      return (
        matchesSearch &&
        matchesWorkType &&
        matchesQualification &&
        matchesNationality &&
        matchesExperience
      );
    });
  }, [
    currentLang,
    data,
    experienceFilter,
    nationalityFilter,
    qualificationFilter,
    searchValue,
    workTypeFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const resetFilters = () => {
    setSearchValue('');
    setWorkTypeFilter('');
    setQualificationFilter('');
    setNationalityFilter('');
    setExperienceFilter('');
    setCurrentPage(1);
  };

  const workTypeOptions = useMemo(
    () => [
      { value: '', label: t('common.all') },
      { value: String(JobAdvertismentWorkShedule.OFFLINE), label: t('jobAnnouncement.fullTime') },
      { value: String(JobAdvertismentWorkShedule.ONLINE), label: t('jobAnnouncement.partTime') },
    ],
    [t]
  );

  const qualificationOptions = useMemo(
    () => [
      { value: '', label: t('common.all') },
      ...Object.keys(QUALIFICATION_LABELS).map((key) => ({
        value: key,
        label: QUALIFICATION_LABELS[key as QualificationKey][currentLang],
      })),
    ],
    [currentLang, t]
  );

  const nationalityOptions = useMemo(
    () => [
      { value: '', label: t('common.all') },
      ...Object.keys(NATIONALITY_LABELS).map((key) => ({
        value: key,
        label: NATIONALITY_LABELS[key as NationalityKey][currentLang],
      })),
    ],
    [currentLang, t]
  );

  const experienceOptions = useMemo(() => {
    const uniqueSorted = Array.from(new Set(data.map((item) => item.yearsExperience))).sort(
      (a, b) => a - b
    );

    return [
      { value: '', label: t('common.all') },
      ...uniqueSorted.map((value) => ({ value: String(value), label: `${value}` })),
    ];
  }, [data, t]);

  const filters: FilterConfig[] = [
    {
      type: 'search',
      name: `${filterPrefix}-applicants-search`,
      placeholder: t('jobAnnouncement.applicantsPage.filters.search'),
      value: searchValue,
      onChange: (value) => {
        setSearchValue(value as string);
        setCurrentPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: `${filterPrefix}-work-type`,
      value: workTypeFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={workTypeFilter}
          onChange={(value) => {
            setWorkTypeFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={workTypeOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.workType')}
          maxHeight="180px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-qualification`,
      value: qualificationFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={qualificationFilter}
          onChange={(value) => {
            setQualificationFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={qualificationOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.qualification')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-nationality`,
      value: nationalityFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={nationalityFilter}
          onChange={(value) => {
            setNationalityFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={nationalityOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.nationality')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-experience`,
      value: experienceFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={experienceFilter}
          onChange={(value) => {
            setExperienceFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={experienceOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.experience')}
          maxHeight="180px"
        />
      ),
    },
  ];

  const columns: DataTableColumn<Applicant>[] = [
    {
      header: '#',
      accessor: (_row, index) => startIndex + (index ?? 0) + 1,
      className: 'text-center text-sm text-gray-600',
      headerClassName: 'w-16',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={DefaultAvatar}
            alt={getApplicantName(row)}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{getApplicantName(row)}</p>
            <p className="text-xs text-gray-500">{getApplicantRole(row)}</p>
            {row.status && (
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGES[row.status]}`}
              >
                {t(`jobAnnouncement.applicantsPage.status.${row.status}`)}
              </span>
            )}
          </div>
        </div>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.resume',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => window.open(row.resumeUrl, '_blank', 'noopener,noreferrer')}
          className="flex h-10 w-10 items-center justify-center rounded-lg"
        >
          <CustomImage src={PdfIcon} alt="PDF" className="h-5 w-5" />
        </button>
      ),
      headerClassName: 'w-[180px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.workType',
      accessor: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            WORK_TYPE_BADGES[row.workType]?.bg || 'bg-gray-100 text-gray-600'
          }`}
        >
          {t(WORK_TYPE_BADGES[row.workType]?.label || 'jobAnnouncement.workType')}
        </span>
      ),
      headerClassName: 'w-[140px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.qualification',
      accessor: (row) => (
        <span className="text-sm text-gray-700">{getQualificationLabel(row.qualificationKey)}</span>
      ),
      headerClassName: 'min-w-[160px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.experience',
      accessor: (row) => (
        <span className="text-sm text-gray-700">{row.yearsExperience.toLocaleString(locale)}</span>
      ),
      headerClassName: 'w-[120px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.nationality',
      accessor: (row) => (
        <span className="text-sm text-gray-700">{getNationalityLabel(row.nationalityKey)}</span>
      ),
      headerClassName: 'w-[140px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.country',
      accessor: (row) => (
        <span className="text-sm text-gray-700">{getNationalityLabel(row.countryKey)}</span>
      ),
      headerClassName: 'w-[140px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.address',
      accessor: (row) => <span className="text-sm text-gray-700">{getAddress(row)}</span>,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-2">
          {isArchived ? (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              title={t('actions.recall')}
            >
              <CustomImage src={RecallIcon} alt={t('actions.recall')} className="h-4 w-4" />
            </button>
          ) : (
            <>
              {/* Accept/Approve Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
                title={t('common.approve')}
              >
                <CustomImage src={CheckIcon} alt={t('common.approve')} className="h-4 w-4" />
              </button>
              {/* Schedule Interview Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 transition-colors hover:bg-blue-200"
                title={t('interviews.addInterview')}
              >
                <CustomImage src={TimeLog} alt={t('interviews.addInterview')} className="h-4 w-4" />
              </button>
              {/* Archive Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 transition-colors hover:bg-orange-200"
                title={t('actions.archive')}
              >
                <CustomImage src={ArchiveIcon} alt={t('actions.archive')} className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
      headerClassName: 'w-[160px]',
      className: 'text-center',
    },
  ];

  return (
    <Card>
      <DataTable
        data={paginatedRows}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filters}
        showFilters={true}
        onResetFilters={resetFilters}
        pagination={{ page: currentPage, limit: pageSize, total: filteredRows.length, totalPages }}
        onPageChange={handlePageChange}
        emptyMessage={t('jobAnnouncement.applicantsPage.emptyState')}
        t={t}
      />
    </Card>
  );
};

export default JobApplicantsTable;
