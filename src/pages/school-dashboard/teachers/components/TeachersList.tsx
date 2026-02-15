import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchTeacherAssignmentList,
  deleteTeacher as deleteTeacherAction,
} from '@/redux/features/teachers';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups';
import type { TeacherAssignmentListItem } from '@/types/teacherAssignment';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';

// Static school branch ID
const SCHOOL_BRANCH_ID = 'D18C45EA-EEEE-4A41-D35E-08DE1D686083';

export default function TeachersList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const { showToast } = useToast();

  const teacherAssignmentList = useAppSelector((state) => state.teachers.teacherAssignmentList);
  const pagination = useAppSelector((state) => state.teachers.pagination);
  const isLoading = useAppSelector((state) => state.teachers.isLoadingAssignmentList);
  const isDeleting = useAppSelector((state) => state.teachers.isDeleting);

  // Get subjects and classrooms from other slices for filter options
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);
  const isLoadingSchoolStages = useAppSelector((state) => state.lookups.isLoadingSchoolStages);

  // Fetch filter data on mount
  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchClassrooms({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTeacherAssignmentList({
        schoolBranchesId: SCHOOL_BRANCH_ID,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  }, [dispatch, pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchTeacherAssignmentList({
        schoolBranchesId: SCHOOL_BRANCH_ID,
        page,
        limit: pagination.limit,
      })
    );
  };

  // Filter locally since the API doesn't support these filters
  const filteredTeachers = teacherAssignmentList.filter((teacher) => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        teacher.teacherName.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower) ||
        teacher.phone.includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Subject filter
    if (selectedSubject && teacher.materialId !== selectedSubject) {
      return false;
    }

    // Educational stage filter
    if (selectedEducationalStage && teacher.gradeId !== selectedEducationalStage) {
      return false;
    }

    // Classroom filter
    if (selectedClassroom) {
      const hasClassroom = teacher.classrooms?.some((c) => c.id === selectedClassroom);
      if (!hasClassroom) return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchTerm || selectedSubject || selectedEducationalStage || selectedClassroom;
  const shouldShowEmptyState =
    !isLoading && teacherAssignmentList.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || teacherAssignmentList.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<TeacherAssignmentListItem>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = filteredTeachers?.findIndex((t) => t?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'teachers.teacherName',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="">
            <CustomImage
              src={ProfileImage}
              alt={row.teacherName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = ProfileImage;
              }}
              className="h-8 w-8 rounded-md object-cover"
            />
          </div>
          {row.teacherName}
          <IconButton
            variant="blue"
            ariaLabel={t('jobAnnouncement.viewApplicants')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teachers/${row.teacherId}`);
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
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'teachers.mobile',
      accessor: (row) => {
        const phone = row?.phone?.trim();
        const countryCode = row?.countryCode?.trim();

        if (!phone && !countryCode) return <span className="text-gray-400">-</span>;
        if (!countryCode) return <span dir="ltr">{phone}</span>;
        if (!phone) return <span dir="ltr">{countryCode}</span>;

        return <span dir="ltr">{`${countryCode} ${phone}`}</span>;
      },
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'teachers.contactMethods',
      accessor: (row) => {
        const phone = row?.phone?.trim();
        const countryCode = row?.countryCode?.trim();
        const tel = phone ? `${countryCode ?? ''}${phone}`.replace(/\s+/g, '') : '';

        if (!row?.email && !tel) return <span className="text-gray-400">-</span>;

        return (
          <div className="flex items-center justify-center gap-3">
            {tel && (
              <a
                href={`tel:${tel}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-lightGreen-100 hover:bg-green-200"
              >
                <CustomImage src={WhatsAppIcon} alt="Phone" className="h-6 w-6" />
              </a>
            )}
            {row?.email && (
              <a
                href={`mailto:${row.email}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-yellow-100 hover:bg-orange-200"
              >
                <CustomImage src={EmailYellowIcon} alt="Email" className="h-6 w-6" />
              </a>
            )}
          </div>
        );
      },
      headerClassName: 'min-w-[180px]',
      className: 'text-center',
    },
    {
      header: 'teachers.subjectName',
      accessor: (row) => {
        const materialName = currentLang === 'ar' ? row.materialNameAR : row.materialNameEN;
        return materialName ? (
          <span>{materialName}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
      headerClassName: 'min-w-[180px]',
    },
    {
      header: 'teachers.educationalStages',
      accessor: (row) => {
        const gradeName = currentLang === 'ar' ? row.gradeNameAR : row.gradeNameEN;
        return gradeName ? (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-base font-medium text-blue-800">
            {gradeName}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'teachers.classrooms',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.classrooms && row.classrooms.length > 0 ? (
            row.classrooms.map((classroom) => (
              <span
                key={classroom.id}
                className="inline-flex rounded-full bg-green-100 px-2 py-1 text-base font-medium text-green-500"
              >
                {currentLang === 'ar' ? classroom.nameAR : classroom.nameEN || classroom.nameAR}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedTeacherId(row.teacherId);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  // Build subject options from the subjects in store
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
  }));

  // Build classroom options from the classrooms in store
  const classroomOptions = classrooms.map((classroom) => ({
    value: classroom.id,
    label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
  }));

  const schoolStageOptions = schoolStages.map((stage) => ({
    value: stage.id,
    label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
  }));

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'searchTeacher',
      placeholder: t('teachers.searchTeacher'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '30%',
    },
    {
      type: 'custom',
      name: 'subject-filter',
      placeholder: '',
      value: selectedSubject,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedSubject}
          onChange={(value) => setSelectedSubject(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={subjectOptions}
          placeholder={isLoadingSubjects ? t('common.loading') : t('teachers.selectSubject')}
          disabled={isLoadingSubjects}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'stage-filter',
      placeholder: '',
      value: selectedEducationalStage,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedEducationalStage}
          onChange={(value) =>
            setSelectedEducationalStage(Array.isArray(value) ? (value[0] ?? '') : value)
          }
          options={schoolStageOptions}
          placeholder={
            isLoadingSchoolStages ? t('common.loading') : t('teachers.selectEducationalStage')
          }
          disabled={isLoadingSchoolStages}
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
          options={classroomOptions}
          placeholder={isLoadingClassrooms ? t('common.loading') : t('teachers.selectClassroom')}
          disabled={isLoadingClassrooms}
          maxHeight="200px"
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedEducationalStage('');
    setSelectedClassroom('');
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacherId) return;

    try {
      await dispatch(deleteTeacherAction(selectedTeacherId))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess || res === selectedTeacherId) {
            setShowDeletePopup(false);
            showToast({
              message: 'teachers.teacherDeletedSuccessfully',
              type: 'success',
            });
            dispatch(
              fetchTeacherAssignmentList({
                schoolBranchesId: SCHOOL_BRANCH_ID,
                page: pagination.page,
                limit: pagination.limit,
              })
            );
          } else {
            setShowDeletePopup(false);
            showToast({
              message: res.message || 'common.errorOccurred',
              type: 'error',
              isRaw: !!res.message,
            });
          }
        });
    } catch (error) {
      setShowDeletePopup(false);
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: isApiError,
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={PeopleRegularIcon}
          description={t('teachers.noTeachersMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={filteredTeachers}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          {/* Popups */}
          <DeletePopup
            open={showDeletePopup}
            message="teachers.confirmDeleteTeacher"
            itemName={
              filteredTeachers.find((t) => t.teacherId === selectedTeacherId)?.teacherName ?? ''
            }
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </div>
      ) : null}
    </Card>
  );
}
