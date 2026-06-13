import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useMemo, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import {
  fetchSubjectById,
  fetchSubjects,
  updateSubject,
} from '@/redux/features/subjects/subjectsSlice';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { EditSubjectSchema, type EditSubjectProps } from '@/validations/subjects-validations';
import { MATERIAL_LEVELS } from '@/constants';
import Loading from '@/shared/components/Loading';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { getBackendMessage } from '@/lib/http';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

export default function EditSubject() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchesId = getCurrentSchoolBranchId() || undefined;

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const currentSubject = useAppSelector((state) => state.subjects.currentSubject);
  const allSubjects = useAppSelector((state) => state.subjects.subjects);
  const isLoading = useAppSelector((state) => state.subjects.isLoading);
  const isUpdating = useAppSelector((state) => state.subjects.isUpdating);

  const grades = useAppSelector((state) => state.grades.grades);
  const isLoadingGrades = useAppSelector((state) => state.grades.isLoading);

  const gradeOptions = useMemo(() => {
    type GradeOption = { id: string; nameAr: string; nameEn: string };

    const subjectGrades = currentSubject?.schoolGrades || [];
    const gradeMap = new Map<string, GradeOption>(
      grades.map((g) => [g.id, { id: g.id, nameAr: g.nameAr, nameEn: g.nameEn }])
    );

    subjectGrades.forEach((stage) => {
      const targetId = stage.gradeId || stage.id;
      if (!gradeMap.has(targetId)) {
        gradeMap.set(targetId, {
          id: targetId,
          nameAr: stage.nameAr,
          nameEn: stage.nameEn,
        });
      }
    });

    return Array.from(gradeMap.values());
  }, [grades, currentSubject?.schoolGrades]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<EditSubjectProps>({
    resolver: yupResolver(EditSubjectSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      nameEn: '',
      materialLevel: '',
      gradeIds: [],
    },
  });

  const scrollToFirstError = useScrollToFirstError<EditSubjectProps>();

  const watchedName = watch('name');
  const watchedNameEn = watch('nameEn');

  useEffect(() => {
    if (id) {
      dispatch(fetchSubjectById(id));
    }
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId } }));
    if (schoolBranchesId) {
      dispatch(fetchGrades(schoolBranchesId));
    }
  }, [dispatch, id, schoolBranchesId]);

  useEffect(() => {
    if (currentSubject) {
      reset({
        name: currentSubject.name || '',
        nameEn: currentSubject.nameEn ?? '',
        materialLevel: String(currentSubject.materialLevel) || '',
        gradeIds: currentSubject.schoolGrades?.map((stage) => stage.gradeId || stage.id) || [],
      });
    }
  }, [currentSubject, reset]);

  const onSubmit = async (data: EditSubjectProps) => {
    if (!id) return;

    try {
      await dispatch(
        updateSubject({
          id,
          data: {
            name: data.name,
            nameEn: data.nameEn,
            materialLevel: Number(data.materialLevel),
            gradeIds: data.gradeIds,
            schoolBranchesId,
          },
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('subjects.subjectUpdatedSuccessfully'),
      });
    } catch (error) {
      const errorMessage = getBackendMessage(error) || t('common.errorOccurred');
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage,
      });
    }
  };

  interface SubjectPreview {
    id: string;
    name: string;
    nameEn: string;
  }

  const allSubjectsForDisplay: SubjectPreview[] = allSubjects.map((subject) => {
    if (subject.id === id) {
      return {
        id: subject.id,
        name: watchedName || subject.name,
        nameEn: watchedNameEn || subject.nameEn || '',
      };
    }
    return {
      id: subject.id,
      name: subject.name,
      nameEn: subject.nameEn || '',
    };
  });

  const previewColumns: DataTableColumn<SubjectPreview>[] = [
    {
      header: '#',
      accessor: (row) => {
        const idx = allSubjectsForDisplay.findIndex((s) => s.id === row.id);
        return idx + 1;
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'subjects.subjectName',
      accessor: (row) => (
        <span>{currentLang === 'ar' ? row.name || '-' : row.nameEn || row.name || '-'}</span>
      ),
      headerClassName: 'min-w-[200px]',
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)}>
          {/* Subject Name Fields */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Subject Name Arabic */}
            <FormField
              label={t('subjects.subjectNameAr')}
              required
              error={errors.name?.message}
              htmlFor="name"
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('subjects.enterSubjectNameAr')}
                    className="w-full"
                    id="name"
                  />
                )}
              />
            </FormField>

            {/* Subject Name English */}
            <FormField
              label={t('subjects.subjectNameEn')}
              required
              error={errors.nameEn?.message}
              htmlFor="nameEn"
            >
              <Controller
                name="nameEn"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('subjects.enterSubjectNameEn')}
                    className="w-full"
                    id="nameEn"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Material Level */}
          <div className="mb-6">
            <FormField
              label={t('subjects.materialLevel')}
              required
              error={errors.materialLevel?.message}
              htmlFor="materialLevel"
            >
              <Controller
                name="materialLevel"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                    }}
                    options={MATERIAL_LEVELS.map((level) => ({
                      value: level.value,
                      label: t(level.labelKey),
                    }))}
                    placeholder={t('subjects.selectLevel')}
                    error={!!errors.materialLevel}
                    id="materialLevel"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Grades - Multi Select */}
          <div className="mb-6">
            <FormField
              label={t('subjects.schoolStages')}
              required
              error={errors.gradeIds?.message}
              htmlFor="gradeIds"
            >
              <Controller
                name="gradeIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    options={gradeOptions.map((grade) => ({
                      value: grade.id,
                      label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
                    }))}
                    placeholder={
                      isLoadingGrades ? t('common.loading') : t('subjects.selectSchoolStages')
                    }
                    disabled={isLoadingGrades}
                    error={!!errors.gradeIds}
                    isMulti={true}
                    id="gradeIds"
                  />
                )}
              />
            </FormField>
          </div>

          {/* All Subjects Preview Table */}
          {allSubjectsForDisplay.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 text-start text-base font-medium text-green-500">
                {t('subjects.addedSubjects')}
              </h3>
              <DataTable
                data={allSubjectsForDisplay}
                columns={previewColumns}
                keyExtractor={(row) => row.id}
                showFilters={false}
                t={t}
                emptyMessage={t('common.noResults')}
                showActionButtons={false}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isUpdating}>
              {isSubmitting || isUpdating ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>

      {/* Popup Message */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </Card>
  );
}
