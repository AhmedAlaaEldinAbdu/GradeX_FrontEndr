import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import { addSubject, fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import lookupsApiService from '@/services/api/lookups/lookups.service';
import type { SchoolStage as SchoolStageType } from '@/services/api/types/lookup.types';
import { AddSubjectSchema, type AddSubjectProps } from '@/validations/subjects-validations';
import { MATERIAL_LEVELS } from '@/constants';

export default function AddSubject() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const existingSubjects = useAppSelector((state) => state.subjects.subjects);
  const isCreating = useAppSelector((state) => state.subjects.isCreating);

  const [schoolStages, setSchoolStages] = useState<SchoolStageType[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddSubjectProps>({
    resolver: yupResolver(AddSubjectSchema),
    mode: 'onBlur',
    defaultValues: {
      materialLevel: '',
      lKSchoolStageIds: [],
      subjects: [{ name: '', nameEn: '' }],
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: 'subjects',
  });

  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 10000 }));

    const fetchStages = async () => {
      setIsLoadingStages(true);
      try {
        const stages = await lookupsApiService.getSchoolStages();
        setSchoolStages(stages);
      } catch (error) {
        console.error('Failed to fetch school stages', error);
      } finally {
        setIsLoadingStages(false);
      }
    };

    fetchStages();
  }, [dispatch]);

  const onSubmit = async (data: AddSubjectProps) => {
    try {
      const results = await Promise.all(
        data.subjects.map((subject) =>
          dispatch(
            addSubject({
              name: subject.name,
              nameEn: subject.nameEn,
              materialLevel: Number(data.materialLevel),
              lKSchoolStageIds: data.lKSchoolStageIds,
            })
          ).unwrap()
        )
      );

      // Check if any failed
      const hasError = results.some((r) => !r);
      if (hasError) {
        throw new Error('Some subjects failed to create');
      }

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('subjects.subjectsAddedSuccessfully'),
      });
    } catch {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
    }
  };

  const handleRemoveSubject = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  interface SubjectPreview {
    id: string;
    name: string;
    nameEn: string;
  }

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

  const allSubjectsForDisplay: SubjectPreview[] = [
    ...existingSubjects.map((s) => ({ id: s.id, name: s.name, nameEn: s.nameEn || '' })),
  ];

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Subject Name Fields */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field, index) => (
              <div key={field.id} className="col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Subject Name Arabic */}
                <FormField
                  label={t('subjects.subjectNameAr')}
                  required
                  error={errors.subjects?.[index]?.name?.message}
                  htmlFor={`subjects.${index}.name`}
                >
                  <Controller
                    name={`subjects.${index}.name`}
                    control={control}
                    render={({ field: inputField }) => (
                      <Input
                        {...inputField}
                        type="text"
                        placeholder={t('subjects.enterSubjectNameAr')}
                        className="w-full"
                        id={`subjects.${index}.name`}
                      />
                    )}
                  />
                </FormField>

                {/* Subject Name English */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormField
                      label={t('subjects.subjectNameEn')}
                      required
                      error={errors.subjects?.[index]?.nameEn?.message}
                      htmlFor={`subjects.${index}.nameEn`}
                    >
                      <Controller
                        name={`subjects.${index}.nameEn`}
                        control={control}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            type="text"
                            placeholder={t('subjects.enterSubjectNameEn')}
                            className="w-full"
                            id={`subjects.${index}.nameEn`}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  {fields.length > 1 && (
                    <IconButton
                      status="delete"
                      variant="danger"
                      onClick={() => handleRemoveSubject(index)}
                      ariaLabel="Delete"
                      className="mb-1"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Material Level */}
          <div className="mb-6">
            <FormField
              label={t('subjects.level')}
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

          {/* School Stages - Multi Select */}
          <div className="mb-6">
            <FormField
              label={t('subjects.schoolStages')}
              required
              error={errors.lKSchoolStageIds?.message}
              htmlFor="lKSchoolStageIds"
            >
              <Controller
                name="lKSchoolStageIds"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    options={schoolStages.map((stage) => ({
                      value: stage.id,
                      label: currentLang === 'ar' ? stage.nameAR : stage.nameEN || stage.nameAR,
                    }))}
                    placeholder={
                      isLoadingStages ? t('common.loading') : t('subjects.selectSchoolStages')
                    }
                    disabled={isLoadingStages}
                    error={!!errors.lKSchoolStageIds}
                    isMulti={true}
                    id="lKSchoolStageIds"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Added Subjects Preview Table */}
          {allSubjectsForDisplay.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-4 text-start text-2xl font-medium text-green-500">
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
              disabled={isSubmitting || isCreating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isCreating}>
              {isSubmitting || isCreating ? t('common.saving') : t('common.add')}
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
