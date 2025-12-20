import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import AttendanceConfirmPopup from '@/pages/school-dashboard/attendance/popups/AttendanceConfirmPopup';
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
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'present' | 'absent' | 'late'>('present');
  const [popupIsBulk, setPopupIsBulk] = useState(false);
  const [popupEmployeeName, setPopupEmployeeName] = useState('');
  const [popupEmployeeId, setPopupEmployeeId] = useState<string | null>(null);

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

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, id]);
    } else {
      setSelectedEmployees((prev) => prev.filter((eid) => eid !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedEmployees.map((e) => e.id);
      setSelectedEmployees((prev) => {
        const newSelected = [...prev];
        currentPageIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageIds = paginatedEmployees.map((e) => e.id);
      setSelectedEmployees((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const allCurrentPageSelected =
    paginatedEmployees.length > 0 &&
    paginatedEmployees.every((e) => selectedEmployees.includes(e.id));

  const someCurrentPageSelected =
    paginatedEmployees.some((e) => selectedEmployees.includes(e.id)) && !allCurrentPageSelected;

  // Individual action handlers
  const handleIndividualAction = (
    employeeId: string,
    employeeName: string,
    type: 'present' | 'absent' | 'late'
  ) => {
    setPopupEmployeeId(employeeId);
    setPopupEmployeeName(employeeName);
    setPopupType(type);
    setPopupIsBulk(false);
    setPopupOpen(true);
  };

  // Bulk action handlers
  const handleBulkActionClick = (type: 'present' | 'absent' | 'late') => {
    setPopupType(type);
    setPopupIsBulk(true);
    setPopupEmployeeId(null);
    setPopupEmployeeName('');
    setPopupOpen(true);
  };

  const handleConfirmAction = (time?: string) => {
    if (popupIsBulk) {
      console.log(
        `Bulk action: ${popupType} for employees:`,
        selectedEmployees,
        time ? `at ${time}` : ''
      );
      setSelectedEmployees([]);
    } else if (popupEmployeeId) {
      console.log(
        `Individual action: ${popupType} for employee:`,
        popupEmployeeId,
        time ? `at ${time}` : ''
      );
    }
    setPopupOpen(false);
  };

  const handleCancelPopup = () => {
    setPopupOpen(false);
  };

  const columns: DataTableColumn<EmployeeAttendance>[] = [
    {
      header: '#',
      accessor: (_row, index) => (currentPage - 1) * pageSize + (index || 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: '',
      headerComponent: (
        <input
          type="checkbox"
          checked={allCurrentPageSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = someCurrentPageSelected;
            }
          }}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedEmployees.includes(row.id)}
          onChange={(e) => handleSelectEmployee(row.id, e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      headerClassName: 'w-12',
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
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
            onClick={() =>
              handleIndividualAction(
                row.id,
                currentLang === 'ar' ? row.employeeName : row.employeeNameEn,
                'present'
              )
            }
            title={t('attendance.present')}
          >
            <CustomImage src={CheckIcon} alt="check" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 transition-colors hover:bg-yellow-200"
            onClick={() =>
              handleIndividualAction(
                row.id,
                currentLang === 'ar' ? row.employeeName : row.employeeNameEn,
                'late'
              )
            }
            title={t('attendance.late')}
          >
            <CustomImage src={HistoryIcon} alt="history" className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 transition-colors hover:bg-red-200"
            onClick={() =>
              handleIndividualAction(
                row.id,
                currentLang === 'ar' ? row.employeeName : row.employeeNameEn,
                'absent'
              )
            }
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
    setSelectedEmployees([]);
  };

  const bulkActionsBar =
    selectedEmployees.length > 0 ? (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => handleBulkActionClick('present')}
          className="flex items-center gap-1.5 rounded-full border border-green-500 bg-white px-3 py-1.5 text-sm text-green-600 transition-colors hover:bg-green-50"
        >
          <CustomImage src={CheckIcon} className="h-4 w-4" alt="present" />
          <span>{t('attendance.markAllPresent')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('late')}
          className="flex items-center gap-1.5 rounded-full border border-yellow-500 bg-white px-3 py-1.5 text-sm text-yellow-600 transition-colors hover:bg-yellow-50"
        >
          <CustomImage src={HistoryIcon} className="h-4 w-4" alt="late" />
          <span>{t('attendance.markAllLate')}</span>
        </button>
        <button
          onClick={() => handleBulkActionClick('absent')}
          className="flex items-center gap-1.5 rounded-full border border-red-500 bg-white px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <CustomImage src={XMarkDangerIcon} className="h-4 w-4" alt="absent" />
          <span>{t('attendance.markAllAbsent')}</span>
        </button>
      </div>
    ) : null;

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
          bulkActions={bulkActionsBar}
          isLoading={false}
          emptyMessage={t('attendance.noEmployees')}
          t={t}
        />
      </Card>

      {/* Attendance Confirmation Popup */}
      <AttendanceConfirmPopup
        open={popupOpen}
        type={popupType}
        isBulk={popupIsBulk}
        personName={popupEmployeeName}
        personType="employee"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}
