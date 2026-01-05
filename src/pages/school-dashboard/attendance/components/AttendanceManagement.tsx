import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import IconButton from '@/shared/components/IconButton';

interface StudentAttendance {
  id: string;
  studentName: string;
  studentNameEn: string;
  educationalStage: string;
  educationalStageEn: string;
  classroom: string;
  classroomEn: string;
  date: string;
  attendanceTime: string;
  createdBy: string;
  createdByEn: string;
  createdByRole: string;
  createdByRoleEn: string;
  status: 'present' | 'absent' | 'late' | null;
}

// Mock data
const mockStudents: StudentAttendance[] = [
  {
    id: '1',
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '1/أ',
    classroomEn: '1/A',
    date: '22/2/2025',
    attendanceTime: '',
    createdBy: 'أحمد حسن',
    createdByEn: 'Ahmed Hassan',
    createdByRole: 'مدرس الرياضيات',
    createdByRoleEn: 'Math Teacher',
    status: null,
  },
  {
    id: '2',
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'المرحلة الثانوية',
    educationalStageEn: 'Secondary School',
    classroom: '2/ج',
    classroomEn: '2/C',
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
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'المرحلة الإعدادية',
    educationalStageEn: 'Middle School',
    classroom: '1/أ',
    classroomEn: '1/A',
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
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'رياض الأطفال',
    educationalStageEn: 'Kindergarten',
    classroom: '1/أ',
    classroomEn: '1/A',
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
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '3/ج',
    classroomEn: '3/C',
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
    studentName: 'أحمد مختار حسن',
    studentNameEn: 'Ahmed Mokhtar Hassan',
    educationalStage: 'المرحلة الابتدائية',
    educationalStageEn: 'Primary School',
    classroom: '1/أ',
    classroomEn: '1/A',
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
  { value: '1b', labelAr: '1/ب', labelEn: '1/B' },
  { value: '1c', labelAr: '1/ج', labelEn: '1/C' },
  { value: '2a', labelAr: '2/أ', labelEn: '2/A' },
  { value: '2b', labelAr: '2/ب', labelEn: '2/B' },
  { value: '2c', labelAr: '2/ج', labelEn: '2/C' },
  { value: '3a', labelAr: '3/أ', labelEn: '3/A' },
  { value: '3c', labelAr: '3/ج', labelEn: '3/C' },
];

export default function AttendanceManagement() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as 'ar' | 'en';

  const [students] = useState<StudentAttendance[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<'present' | 'absent' | 'late'>('present');
  const [popupIsBulk, setPopupIsBulk] = useState(false);
  const [popupStudentName, setPopupStudentName] = useState('');
  const [popupStudentId, setPopupStudentId] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm === '' ||
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNameEn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      selectedStage === '' ||
      student.educationalStage.includes(
        EDUCATIONAL_STAGES.find((s) => s.value === selectedStage)?.labelAr || ''
      );

    const matchesClassroom =
      selectedClassroom === '' ||
      student.classroom ===
        CLASSROOMS.find((c) => c.value === selectedClassroom)?.[
          currentLang === 'ar' ? 'labelAr' : 'labelEn'
        ];

    return matchesSearch && matchesStage && matchesClassroom;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, id]);
    } else {
      setSelectedStudents((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedStudents.map((s) => s.id);
      setSelectedStudents((prev) => {
        const newSelected = [...prev];
        currentPageIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageIds = paginatedStudents.map((s) => s.id);
      setSelectedStudents((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const allCurrentPageSelected =
    paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedStudents.includes(s.id));

  const someCurrentPageSelected =
    paginatedStudents.some((s) => selectedStudents.includes(s.id)) && !allCurrentPageSelected;

  // Individual action handlers
  const handleIndividualAction = (
    studentId: string,
    studentName: string,
    type: 'present' | 'absent' | 'late'
  ) => {
    setPopupStudentId(studentId);
    setPopupStudentName(studentName);
    setPopupType(type);
    setPopupIsBulk(false);
    setPopupOpen(true);
  };

  // Bulk action handlers
  const handleBulkActionClick = (type: 'present' | 'absent' | 'late') => {
    setPopupType(type);
    setPopupIsBulk(true);
    setPopupStudentId(null);
    setPopupStudentName('');
    setPopupOpen(true);
  };

  const handleConfirmAction = (time?: string) => {
    if (popupIsBulk) {
      console.log(
        `Bulk action: ${popupType} for students:`,
        selectedStudents,
        time ? `at ${time}` : ''
      );
      setSelectedStudents([]);
    } else if (popupStudentId) {
      console.log(
        `Individual action: ${popupType} for student:`,
        popupStudentId,
        time ? `at ${time}` : ''
      );
    }
    setPopupOpen(false);
  };

  const handleCancelPopup = () => {
    setPopupOpen(false);
  };

  const columns: DataTableColumn<StudentAttendance>[] = [
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
          checked={selectedStudents.includes(row.id)}
          onChange={(e) => handleSelectStudent(row.id, e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      headerClassName: 'w-12',
      className: 'text-center',
    },
    {
      header: 'attendance.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <CustomImage src={ProfileImage} alt="profile" className="h-full w-full object-cover" />
          </div>
          {currentLang === 'ar' ? row.studentName : row.studentNameEn}
          <IconButton
            variant="blue"
            ariaLabel={t('jobAnnouncement.viewApplicants')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.id}?tab=attendance`);
            }}
            className="h-8 w-8"
          >
            <CustomImage
              src={EyeStyledIcon}
              alt={t('jobAnnouncement.viewApplicants')}
              className="h-4 w-4"
            />
          </IconButton>
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
                currentLang === 'ar' ? row.studentName : row.studentNameEn,
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
                currentLang === 'ar' ? row.studentName : row.studentNameEn,
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
                currentLang === 'ar' ? row.studentName : row.studentNameEn,
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
      type: 'search',
      name: 'searchStudent',
      placeholder: t('attendance.searchStudent'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedStage,
      onChange: () => {},
      width: '30%',
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
      type: 'custom',
      name: 'classroom-filter',
      placeholder: '',
      value: selectedClassroom,
      onChange: () => {},
      width: '30%',
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
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedClassroom('');
    setSelectedStudents([]);
  };

  const bulkActionsBar =
    selectedStudents.length > 0 ? (
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
      <Card>
        <DataTable
          data={paginatedStudents}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: filteredStudents.length,
            totalPages: totalPages,
          }}
          onPageChange={setCurrentPage}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          bulkActions={bulkActionsBar}
          isLoading={false}
          emptyMessage={t('attendance.noStudents')}
          t={t}
        />
      </Card>

      {/* Attendance Confirmation Popup */}
      <AttendanceConfirmPopup
        open={popupOpen}
        type={popupType}
        isBulk={popupIsBulk}
        personName={popupStudentName}
        personType="student"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}
