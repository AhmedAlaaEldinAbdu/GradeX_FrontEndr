import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import StudentIcon from '@gradex/assets/icons/Student.svg';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import { fetchTeachers, deleteTeacher as deleteTeacherAction } from '@/redux/features/teachers';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups';
import type { Teacher } from '@/types/teachers';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';

export default function TeachersList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  const { showToast } = useToast();

  const teachers = useAppSelector((state) => state.teachers.teachers);
  const pagination = useAppSelector((state) => state.teachers.pagination);
  const isLoading = useAppSelector((state) => state.teachers.isLoading);
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
    dispatch(
      fetchSubjects({
        page: 1,
        limit: 10000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
    dispatch(fetchClassrooms({ page: 1, limit: 100, filters: { schoolBranchId: schoolBranchId } }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTeachers({
        page: pagination.page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          subjectId: selectedSubject || undefined,
          educationalStageId: selectedEducationalStage || undefined,
          classroomId: selectedClassroom || undefined,
          schoolBranchId: schoolBranchId || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedSubject,
    selectedEducationalStage,
    selectedClassroom,
    schoolBranchId,
  ]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchTeachers({
        page,
        limit: pagination.limit,
        filters: {
          searchName: searchTerm || undefined,
          subjectId: selectedSubject || undefined,
          educationalStageId: selectedEducationalStage || undefined,
          classroomId: selectedClassroom || undefined,
          schoolBranchesId: schoolBranchId || undefined,
        },
      })
    );
  };

  const hasActiveFilters =
    searchTerm || selectedSubject || selectedEducationalStage || selectedClassroom;
  const shouldShowEmptyState = !isLoading && teachers.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || teachers.length > 0 || hasActiveFilters;

  const columns: DataTableColumn<Teacher>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = teachers?.findIndex((teacher) => teacher?.id === _row?.id);
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
              src={row.pictureProfilePath || ProfileImage}
              alt={row.fullName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = ProfileImage;
              }}
              className="h-8 w-8 rounded-md object-cover"
            />
          </div>
          {row.fullName}
          <IconButton
            variant="blue"
            ariaLabel={t('jobAnnouncement.viewApplicants')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teachers/${row.id}`);
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
        const phone = row?.phoneNumber?.trim();
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
        const phone = row?.phoneNumber?.trim();
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
        const subjectNames =
          row.subjects && row.subjects.length > 0
            ? row.subjects
                .map((subject) => (currentLang === 'ar' ? subject.nameAr : subject.nameEn))
                .filter(Boolean)
            : [
                currentLang === 'ar'
                  ? row.subjectNameAr
                  : row.subjectNameEn || row.subjectName || '',
              ].filter(Boolean);

        return subjectNames.length > 0 ? (
          <span>{subjectNames.join(' - ')}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
      headerClassName: 'min-w-[180px]',
    },
    {
      header: 'teachers.educationalStages',
      accessor: (row) => {
        const stageNames = (row.educationalStages || [])
          .map((stage) => (currentLang === 'ar' ? stage.nameAr : stage.nameEn))
          .filter(Boolean);

        return stageNames.length > 0 ? (
          <span className="text-base font-medium text-gray-800">{stageNames.join(' - ')}</span>
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
                {currentLang === 'ar' ? classroom.nameAr : classroom.nameEn || classroom.nameAr}
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
              setSelectedTeacherId(row.id);
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
              fetchTeachers({
                page: pagination.page,
                limit: pagination.limit,
                filters: {
                  searchName: searchTerm || undefined,
                  subjectId: selectedSubject || undefined,
                  educationalStageId: selectedEducationalStage || undefined,
                  classroomId: selectedClassroom || undefined,
                  schoolBranchesId: schoolBranchId || undefined,
                },
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
          imgSrc={StudentIcon}
          description={t('teachers.noTeachersMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <div>
          <DataTable
            data={teachers}
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
            itemName={teachers.find((teacher) => teacher.id === selectedTeacherId)?.fullName ?? ''}
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
