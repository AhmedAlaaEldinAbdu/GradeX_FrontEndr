import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import Badge from '@/shared/components/Badge';

interface PerformanceTabProps {
  studentId: string;
}

interface PerformanceRecord {
  id: string;
  subjectName: string;
  subjectNameEn: string;
  status: 'excellent' | 'veryGood' | 'good' | 'struggling' | 'weak';
  updateDate: string;
  teacherName: string;
  teacherNameEn: string;
  notes: string;
  notesEn: string;
}

interface BehaviorRecord {
  id: string;
  updateDate: string;
  status: 'excellent' | 'veryGood' | 'good' | 'struggling' | 'weak';
  teacherName: string;
  teacherNameEn: string;
  notes: string;
  notesEn: string;
}

interface HealthRecord {
  id: string;
  updateDate: string;
  status: 'excellent' | 'veryGood' | 'good' | 'struggling' | 'weak';
  teacherName: string;
  teacherNameEn: string;
  notes: string;
  notesEn: string;
}

// Mock data matching the design
const mockAcademicPerformance: PerformanceRecord[] = [
  {
    id: '1',
    subjectName: 'اللغة الفرنسية',
    subjectNameEn: 'French',
    status: 'excellent',
    updateDate: '1-1-2020',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '2',
    subjectName: 'اللغة العربية',
    subjectNameEn: 'Arabic',
    status: 'good',
    updateDate: '1-1-2021',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '3',
    subjectName: 'اللغة الانجليزية',
    subjectNameEn: 'English',
    status: 'struggling',
    updateDate: '1-1-2021',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '4',
    subjectName: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    status: 'veryGood',
    updateDate: '1-1-2021',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
];

const mockBehaviorRecords: BehaviorRecord[] = [
  {
    id: '1',
    updateDate: '1-1-2020',
    status: 'excellent',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'لا يوجد',
    notesEn: 'None',
  },
  {
    id: '2',
    updateDate: '1-1-2021',
    status: 'good',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'كان الطفل غير متعاون فى الحصة',
    notesEn: 'The child was uncooperative in class',
  },
  {
    id: '3',
    updateDate: '1-1-2021',
    status: 'weak',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'قال الطالب بالتنمر على صديقه',
    notesEn: 'The student bullied his friend',
  },
  {
    id: '4',
    updateDate: '1-1-2021',
    status: 'veryGood',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'كان الطفل متعاون فى اميع أنشطته',
    notesEn: 'The child was cooperative in all activities',
  },
];

const mockHealthRecords: HealthRecord[] = [
  {
    id: '1',
    updateDate: '1-1-2020',
    status: 'excellent',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'قام الطفل بتنزيب حقيبته و قام بتعليم زملائه',
    notesEn: 'The child organized his bag and taught his peers',
  },
  {
    id: '2',
    updateDate: '1-1-2021',
    status: 'good',
    teacherName: 'سماح السيد أحمد',
    teacherNameEn: 'Samah El-Sayed Ahmed',
    notes: 'كان الطفل غير مرتب بقدر يكفي',
    notesEn: 'The child was not tidy enough',
  },
  {
    id: '3',
    updateDate: '1-1-2021',
    status: 'weak',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'قال الطالب بترس الطعام علي الأرض من مقعد',
    notesEn: 'The student threw food on the ground from his seat',
  },
  {
    id: '4',
    updateDate: '1-1-2021',
    status: 'veryGood',
    teacherName: 'أحمد حسن إبراهيم',
    teacherNameEn: 'Ahmed Hassan Ibrahim',
    notes: 'قام الطفل بتنظيف الفصل مع زملائه',
    notesEn: 'The child cleaned the class with his peers',
  },
];

export default function PerformanceTab({ studentId }: PerformanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  // Academic Performance filters
  const [academicSearch, setAcademicSearch] = useState('');
  const [academicTeacher, setAcademicTeacher] = useState('');
  const [academicStatus, setAcademicStatus] = useState('');

  // Behavior filters
  const [behaviorSearch, setBehaviorSearch] = useState('');
  const [behaviorTeacher, setBehaviorTeacher] = useState('');
  const [behaviorStatus, setBehaviorStatus] = useState('');

  // Health filters
  const [healthSearch, setHealthSearch] = useState('');
  const [healthTeacher, setHealthTeacher] = useState('');
  const [healthStatus, setHealthStatus] = useState('');

  console.log('Student ID:', studentId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="success">{t('performance.excellent')}</Badge>;
      case 'veryGood':
        return (
          <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
            {t('performance.veryGood')}
          </span>
        );
      case 'good':
        return <Badge variant="warning">{t('performance.good')}</Badge>;
      case 'struggling':
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            {t('performance.struggling')}
          </span>
        );
      case 'weak':
        return <Badge variant="danger">{t('performance.weak')}</Badge>;
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'excellent', label: t('performance.excellent') },
    { value: 'veryGood', label: t('performance.veryGood') },
    { value: 'good', label: t('performance.good') },
    { value: 'struggling', label: t('performance.struggling') },
    { value: 'weak', label: t('performance.weak') },
  ];

  const teacherOptions = [
    { value: 'samah', label: currentLang === 'ar' ? 'سماح السيد أحمد' : 'Samah El-Sayed Ahmed' },
    { value: 'ahmed', label: currentLang === 'ar' ? 'أحمد حسن إبراهيم' : 'Ahmed Hassan Ibrahim' },
  ];

  // Section Header Component
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="whitespace-nowrap text-lg font-semibold text-gray-900">{title}</h2>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );

  // Academic Performance Columns
  const academicColumns: DataTableColumn<PerformanceRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('performance.subjectName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.subjectName : row.subjectNameEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('performance.updateDate'),
      accessor: (row) => <span>{row.updateDate}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.teacherName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.teacherName : row.teacherNameEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: t('performance.notes'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.notes : row.notesEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  // Behavior Columns
  const behaviorColumns: DataTableColumn<BehaviorRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('performance.updateDate'),
      accessor: (row) => <span>{row.updateDate}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('performance.teacherName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.teacherName : row.teacherNameEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: t('performance.notes'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.notes : row.notesEn}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
  ];

  // Health Columns (same as behavior)
  const healthColumns: DataTableColumn<HealthRecord>[] = [
    {
      header: '#',
      accessor: (_, index) => <span>{(index ?? 0) + 1}</span>,
      headerClassName: 'min-w-[50px]',
      className: 'text-center',
    },
    {
      header: t('performance.updateDate'),
      accessor: (row) => <span>{row.updateDate}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: t('performance.status'),
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: t('performance.teacherName'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.teacherName : row.teacherNameEn}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: t('performance.notes'),
      accessor: (row) => <span>{currentLang === 'ar' ? row.notes : row.notesEn}</span>,
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
  ];

  // Filter configs for each section
  const createFilters = (
    search: string,
    setSearch: (v: string) => void,
    teacher: string,
    setTeacher: (v: string) => void,
    status: string,
    setStatus: (v: string) => void
  ): FilterConfig[] => [
    {
      type: 'search',
      name: 'search',
      placeholder: t('performance.searchSubject'),
      value: search,
      onChange: (value) => setSearch(value as string),
      width: '30%',
    },
    {
      type: 'select',
      name: 'teacher',
      placeholder: t('performance.teacherName'),
      value: teacher,
      onChange: (value) => setTeacher(value as string),
      options: teacherOptions,
      width: 'auto',
    },
    {
      type: 'select',
      name: 'status',
      placeholder: t('performance.status'),
      value: status,
      onChange: (value) => setStatus(value as string),
      options: statusOptions,
      width: 'auto',
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6">
      {/* Academic Performance Section */}
      <div className="mb-8 rounded-lg border border-gray-200 p-6">
        <SectionHeader title={t('performance.academicPerformance')} />

        {/* Date Display */}
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {t('common.showAll')}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>◀</span>
            <span>8 {t('performance.august')} 2025</span>
            <span>▶</span>
          </div>
        </div>

        <DataTable
          data={mockAcademicPerformance}
          columns={academicColumns}
          keyExtractor={(row) => row.id}
          filters={createFilters(
            academicSearch,
            setAcademicSearch,
            academicTeacher,
            setAcademicTeacher,
            academicStatus,
            setAcademicStatus
          )}
          isLoading={false}
          emptyMessage={t('performance.noRecords')}
          t={t}
        />
      </div>

      {/* Behavior Record Section */}
      <div className="mb-8 rounded-lg border border-gray-200 p-6">
        <SectionHeader title={t('performance.behaviorRecord')} />

        {/* Date Display */}
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {t('common.showAll')}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>◀</span>
            <span>8 {t('performance.august')} 2025</span>
            <span>▶</span>
          </div>
        </div>

        <DataTable
          data={mockBehaviorRecords}
          columns={behaviorColumns}
          keyExtractor={(row) => row.id}
          filters={createFilters(
            behaviorSearch,
            setBehaviorSearch,
            behaviorTeacher,
            setBehaviorTeacher,
            behaviorStatus,
            setBehaviorStatus
          )}
          isLoading={false}
          emptyMessage={t('performance.noRecords')}
          t={t}
        />
      </div>

      {/* Health and Hygiene Record Section */}
      <div className="rounded-lg border border-gray-200 p-6">
        <SectionHeader title={t('performance.healthRecord')} />

        {/* Date Display */}
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {t('common.showAll')}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>◀</span>
            <span>8 {t('performance.august')} 2025</span>
            <span>▶</span>
          </div>
        </div>

        <DataTable
          data={mockHealthRecords}
          columns={healthColumns}
          keyExtractor={(row) => row.id}
          filters={createFilters(
            healthSearch,
            setHealthSearch,
            healthTeacher,
            setHealthTeacher,
            healthStatus,
            setHealthStatus
          )}
          isLoading={false}
          emptyMessage={t('performance.noRecords')}
          t={t}
        />
      </div>
    </div>
  );
}
