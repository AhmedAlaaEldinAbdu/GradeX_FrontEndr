import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import HistoryIcon from '@gradex/assets/icons/History.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import ProfileImage from '@gradex/assets/images/profile.png';

interface EmployeeAttendance {
  id: string;
  employeeName: string;
  employeeNameEn: string;
  educationalStage: string;
  educationalStageEn: string;
  classroom: string;
  classroomEn: string;
  date: string;
  attendanceTime: string | null;
  createdBy: string;
  createdByEn: string;
  createdByRole: string;
  createdByRoleEn: string;
  status: 'present' | 'absent' | 'late' | null;
}

// Mock data for employees
const mockEmployees: EmployeeAttendance[] = [
  {
    id: '1',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: null,
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '2',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'المرحلة الثانوية',
    educationalStageEn: 'Secondary School',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: '7:34 ص',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '3',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'المرحلة الإعدادية',
    educationalStageEn: 'Middle School',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: '8:30 ص (متأخر)',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '4',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'رياض الأطفال',
    educationalStageEn: 'Kindergarten',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: '7:34 ص',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '5',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: '7:34 ص',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '6',
    employeeName: 'أحمد محمد حسين',
    employeeNameEn: 'Ahmed Mohamed Hussein',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '1/أ - 2/أ',
    classroomEn: '1/A - 2/A',
    date: '22/2/2025',
    attendanceTime: '7:34 ص',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
];

const EDUCATIONAL_STAGES = [
  { value: 'primary', labelAr: 'المرحلة الابتدائية', labelEn: 'Primary School' },
  { value: 'middle', labelAr: 'المرحلة الإعدادية', labelEn: 'Middle School' },
  { value: 'secondary', labelAr: 'المرحلة الثانوية', labelEn: 'Secondary School' },
  { value: 'kindergarten', labelAr: 'رياض الأطفال', labelEn: 'Kindergarten' },
];

const CLASSROOMS = [
  { value: '1a', labelAr: '1/أ', labelEn: '1/A' },
  { value: '2a', labelAr: '2/أ', labelEn: '2/A' },
  { value: '1a-2a', labelAr: '1/أ - 2/أ', labelEn: '1/A - 2/A' },
];

const TYPE_OPTIONS = [
  { value: 'teacher', labelAr: 'معلم', labelEn: 'Teacher' },
  { value: 'admin', labelAr: 'إداري', labelEn: 'Administrator' },
  { value: 'supervisor', labelAr: 'مشرف', labelEn: 'Supervisor' },
];

interface EmployeesAttendanceTabProps {
  filterComponent?: React.ReactNode;
  isActive?: boolean;
}

export default function EmployeesAttendanceTab({
  filterComponent,
  isActive,
}: EmployeesAttendanceTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const [employees] = useState<EmployeeAttendance[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Only render when active
  if (!isActive) return null;

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchTerm === '' ||
      employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNameEn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      selectedStage === '' ||
      employee.educationalStage.includes(
        EDUCATIONAL_STAGES.find((s) => s.value === selectedStage)?.labelAr || ''
      );

    const matchesClassroom =
      selectedClassroom === '' ||
      employee.classroom ===
        CLASSROOMS.find((c) => c.value === selectedClassroom)?.[
          currentLang === 'ar' ? 'labelAr' : 'labelEn'
        ];

    return matchesSearch && matchesStage && matchesClassroom;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: DataTableColumn<EmployeeAttendance>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'attendance.employeeName',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <CustomImage src={ProfileImage} alt="profile" className="h-full w-full object-cover" />
          </div>
          <span className="font-medium">
            {currentLang === 'ar' ? row.employeeName : row.employeeNameEn}
          </span>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition-colors hover:bg-blue-100">
            <CustomImage src={EyeStyledIcon} alt="view" className="h-5 w-5" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'attendance.educationalStage',
      accessor: (row) => (
        <span>{currentLang === 'ar' ? row.educationalStage : row.educationalStageEn}</span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'attendance.classroom',
      accessor: (row) => <span>{currentLang === 'ar' ? row.classroom : row.classroomEn}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'attendance.date',
      accessor: (row) => <span>{row.date}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'attendance.attendanceTime',
      accessor: (row) => (
        <span className="text-sm">{row.attendanceTime || t('attendance.notAvailable')}</span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'attendance.createdBy',
      accessor: (row) => (
        <span className="text-sm">
          {currentLang === 'ar' ? row.createdBy : row.createdByEn} (
          {currentLang === 'ar' ? row.createdByRole : row.createdByRoleEn})
        </span>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'attendance.actions',
      accessor: () => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
            onClick={() => {}}
            title={t('attendance.present')}
          >
            <CustomImage src={CheckIcon} alt="check" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 transition-colors hover:bg-yellow-200"
            onClick={() => {}}
            title={t('attendance.late')}
          >
            <CustomImage src={HistoryIcon} alt="history" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
            onClick={() => {}}
            title={t('attendance.absent')}
          >
            <CustomImage src={XMarkDangerIcon} alt="delete" className="h-4 w-4" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'custom',
      name: 'type-filter',
      placeholder: '',
      value: selectedType,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedType}
          onChange={(value) => setSelectedType(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={TYPE_OPTIONS.map((type) => ({
            value: type.value,
            label: currentLang === 'ar' ? type.labelAr : type.labelEn,
          }))}
          placeholder={t('attendance.type')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
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
          options={CLASSROOMS.map((classroom) => ({
            value: classroom.value,
            label: currentLang === 'ar' ? classroom.labelAr : classroom.labelEn,
          }))}
          placeholder={t('attendance.classroom')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'educational-stage-filter',
      placeholder: '',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={EDUCATIONAL_STAGES.map((stage) => ({
            value: stage.value,
            label: currentLang === 'ar' ? stage.labelAr : stage.labelEn,
          }))}
          placeholder={t('attendance.educationalStage')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'search',
      name: 'searchEmployee',
      placeholder: t('attendance.searchEmployee'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStage('');
    setSelectedClassroom('');
  };

  return (
    <div>
      {filterComponent}

      <Card>
        <DataTable
          data={paginatedEmployees}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredEmployees.length,
            totalPages: totalPages,
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={false}
          emptyMessage={t('attendance.noEmployees')}
          t={t}
        />
      </Card>
    </div>
  );
}
