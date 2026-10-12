import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { getErrorMessage } from '@/lib/http';
import { addSubject, updateSubject } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { getLKSchoolStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import EducationalStagesApiService from '@/services/api/educational-stages/educational-stages.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import subjectApiService from '@/services/api/subjects/subjects.service';
import type { CreateSubjectRequest } from '@/types/subjects';
import { SubjectPopupSchema, type SubjectPopupValues } from '@/validations/subjects-validations';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import PlusWhite16Icon from '@/assets/icons/PlusWhite16.svg';
import {
  PopupField,
  PopupSelect,
  PopupTextInput,
  type PopupSelectOption,
} from '../../calendar-management/components/AcademicCalendarPopupFields';

const LOOKUP_LIMIT = 10000;
const ALL_STAGE_NAMES = ['الكل', 'all'];

interface AddEditSubjectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  mode: 'add' | 'edit';
  subjectId?: string;
}

const EMPTY_VALUES: SubjectPopupValues = {
  subSystemId: '',
  lkSchoolStageIds: [],
  gradeIds: [],
  name: '',
  nameEn: '',
  teacherIds: [],
  description: '',
  descriptionEn: '',
};

export default function AddEditSubjectPopup({
  isOpen,
  onClose,
  onSaved,
  mode,
  subjectId,
}: AddEditSubjectPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';
  const isEdit = mode === 'edit';
  const schoolBranchesId = getCurrentSchoolBranchId() || undefined;

  const subSystems = useAppSelector((state) => state.academicSubSystems.schoolAcademicSubSystems);
  const lkStages = useAppSelector((state) => state.educationalStages.lkEducationalStages);
  const teachers = useAppSelector((state) => state.teachers.teachers);
  const isLoadingTeachers = useAppSelector((state) => state.teachers.isLoading);

  const [isLoadingSubject, setIsLoadingSubject] = useState(false);
  const [grades, setGrades] = useState<EducationalStageResponse[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [linkedGrades, setLinkedGrades] = useState<
    { id: string; nameAr: string; nameEn: string; lkSchoolStageId?: string }[]
  >([]);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SubjectPopupValues>({
    resolver: yupResolver(SubjectPopupSchema),
    defaultValues: EMPTY_VALUES,
  });

  const scrollToFirstError = useScrollToFirstError<SubjectPopupValues>();

  const subSystemId = watch('subSystemId');
  const selectedStageIds = watch('lkSchoolStageIds');

  useEffect(() => {
    if (!isOpen) return;

    setLinkedGrades([]);
    reset(EMPTY_VALUES);

    dispatch(
      getSchoolAcademicSubSystems({
        pageIndex: 1,
        pageSize: LOOKUP_LIMIT,
        schoolBranchId: schoolBranchesId,
      })
    );
    dispatch(getLKSchoolStages());
    dispatch(
      fetchTeachers({
        page: 1,
        limit: 1000,
        filters: schoolBranchesId ? { schoolBranchId: schoolBranchesId } : {},
      })
    );

    if (!isEdit || !subjectId) return;

    let cancelled = false;
    setIsLoadingSubject(true);
    subjectApiService
      .getSubjectById(subjectId)
      .then((subject) => {
        if (cancelled) return;
        const subjectGrades = subject.schoolGrades ?? [];
        setLinkedGrades(
          subjectGrades.map((grade) => ({
            id: grade.gradeId || grade.id,
            nameAr: grade.nameAr,
            nameEn: grade.nameEn,
            lkSchoolStageId: grade.lkSchoolStageId,
          }))
        );
        reset({
          subSystemId:
            subject.academicSubSystems?.[0]?.id ?? subjectGrades[0]?.academicSubSystemId ?? '',
          lkSchoolStageIds: subject.stages?.map((stage) => stage.id) ?? [],
          gradeIds: subjectGrades.map((grade) => grade.gradeId || grade.id),
          name: subject.name || '',
          nameEn: subject.nameEn ?? '',
          teacherIds: subject.teachers?.map((teacher) => teacher.id) ?? [],
          description: subject.description ?? '',
          descriptionEn: subject.descriptionEn ?? '',
        });
      })
      .catch((error) => {
        if (cancelled) return;
        showToast({ message: getErrorMessage(error), type: 'error', isRaw: true });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSubject(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, subjectId, schoolBranchesId]);

  useEffect(() => {
    if (!isOpen || !subSystemId) {
      setGrades([]);
      return;
    }
    let cancelled = false;
    setIsLoadingGrades(true);
    EducationalStagesApiService.fetchEducationalStagesBySubSystemId(subSystemId, {
      pageIndex: 1,
      pageSize: LOOKUP_LIMIT,
    })
      .then((response) => !cancelled && setGrades(response?.gradeDtos ?? []))
      .catch(() => !cancelled && setGrades([]))
      .finally(() => !cancelled && setIsLoadingGrades(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, subSystemId]);

  const subSystemOptions = useMemo<PopupSelectOption[]>(
    () => subSystems.map((item) => ({ value: item.id, label: item.name })),
    [subSystems]
  );

  const stageOptions = useMemo<PopupSelectOption[]>(
    () =>
      lkStages
        .filter(
          (stage) =>
            !ALL_STAGE_NAMES.includes(stage.nameAR?.trim().toLowerCase()) &&
            !ALL_STAGE_NAMES.includes(stage.nameEN?.trim().toLowerCase())
        )
        .map((stage) => ({
          value: stage.id,
          label: currentLang === 'ar' ? stage.nameAR : stage.nameEN || stage.nameAR,
        })),
    [lkStages, currentLang]
  );

  const availableGrades = useMemo(() => {
    const merged = new Map<
      string,
      { nameAr: string; nameEn: string; lkSchoolStageId?: string | null }
    >(
      grades.map((grade) => [
        grade.id,
        { nameAr: grade.nameAr, nameEn: grade.nameEn, lkSchoolStageId: grade.lkSchoolStageId },
      ])
    );
    linkedGrades.forEach((grade) => {
      if (!merged.has(grade.id)) merged.set(grade.id, grade);
    });
    return merged;
  }, [grades, linkedGrades]);

  const gradeOptions = useMemo<PopupSelectOption[]>(
    () =>
      Array.from(availableGrades, ([value, grade]) => ({ value, grade }))
        .filter(
          ({ grade }) =>
            selectedStageIds.length === 0 ||
            !grade.lkSchoolStageId ||
            selectedStageIds.includes(grade.lkSchoolStageId)
        )
        .map(({ value, grade }) => ({
          value,
          label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
        })),
    [availableGrades, selectedStageIds, currentLang]
  );

  const teacherOptions = useMemo<PopupSelectOption[]>(
    () => teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
    [teachers]
  );

  const closeAndReset = () => {
    reset(EMPTY_VALUES);
    onClose();
  };

  const handleStagesChange = (stageIds: string[]) => {
    setValue('lkSchoolStageIds', stageIds, { shouldValidate: true });
    const keptGrades = getValues('gradeIds').filter((gradeId) => {
      const stageId = availableGrades.get(gradeId)?.lkSchoolStageId;
      return !stageId || stageIds.includes(stageId);
    });
    setValue('gradeIds', keptGrades);
  };

  const onSubmit = async (data: SubjectPopupValues) => {
    const payload: CreateSubjectRequest = {
      name: data.name,
      nameEn: data.nameEn,
      description: data.description?.trim() || undefined,
      descriptionEn: data.descriptionEn?.trim() || undefined,
      schoolBranchesId,
      lkSchoolStageIds: data.lkSchoolStageIds,
      gradeIds: data.gradeIds,
      teacherIds: data.teacherIds,
    };

    try {
      if (isEdit && subjectId) {
        await dispatch(updateSubject({ id: subjectId, data: payload })).unwrap();
      } else {
        await dispatch(addSubject(payload)).unwrap();
      }
      onSaved(
        t(isEdit ? 'subjects.subjectUpdatedSuccessfully' : 'subjects.subjectsAddedSuccessfully')
      );
      closeAndReset();
    } catch (error) {
      const isApiError = typeof error === 'string';
      showToast({
        message: isApiError ? error : t('common.errorOccurred'),
        type: 'error',
        isRaw: isApiError,
      });
    }
  };

  const multiSelect = (
    name: 'lkSchoolStageIds' | 'gradeIds' | 'teacherIds',
    options: PopupSelectOption[],
    placeholder: string,
    disabled = false,
    onChange?: (value: string[]) => void
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <PopupSelect
          multiple
          name={field.name}
          value={field.value ?? []}
          onChange={onChange ?? field.onChange}
          onBlur={field.onBlur}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          hasError={Boolean(errors[name])}
        />
      )}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      showHeader={false}
      placement="end"
      closeOnOverlayClick={false}
      panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <div className="flex flex-col gap-1 text-start">
          <h2 className="text-xl leading-7 font-bold text-[black]">
            {t(isEdit ? 'subjects.editSubject' : 'subjects.popup.addTitle')}
          </h2>
          <p className="text-xs leading-4 text-[#9D9D9D]">
            {t(isEdit ? 'subjects.editSubjectSubtitle' : 'subjects.popup.addSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={closeAndReset}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-8 py-6">
        {isLoadingSubject ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70">
            <div className="size-10 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#1E7A52]" />
          </div>
        ) : null}

        <PopupField
          name="subSystemId"
          label={t('subjects.popup.academicSystem')}
          required
          error={errors.subSystemId?.message}
        >
          <Controller
            name="subSystemId"
            control={control}
            render={({ field }) => (
              <PopupSelect
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue('gradeIds', []);
                }}
                onBlur={field.onBlur}
                options={subSystemOptions}
                placeholder={t('subjects.popup.academicSystemPlaceholder')}
                hasError={Boolean(errors.subSystemId)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="lkSchoolStageIds"
          label={t('subjects.popup.stages')}
          required
          error={errors.lkSchoolStageIds?.message as string | undefined}
        >
          {multiSelect(
            'lkSchoolStageIds',
            stageOptions,
            t('subjects.popup.stagesPlaceholder'),
            false,
            handleStagesChange
          )}
        </PopupField>

        <PopupField
          name="gradeIds"
          label={t('subjects.popup.grades')}
          required
          error={errors.gradeIds?.message as string | undefined}
        >
          {multiSelect(
            'gradeIds',
            gradeOptions,
            !subSystemId
              ? t('subjects.popup.selectAcademicSystemFirst')
              : isLoadingGrades
                ? t('common.loading')
                : t('subjects.popup.gradesPlaceholder'),
            !subSystemId || isLoadingGrades
          )}
        </PopupField>

        <PopupField
          name="name"
          label={t('subjects.popup.nameAr')}
          required
          error={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('subjects.enterSubjectNameAr')}
                hasError={Boolean(errors.name)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="nameEn"
          label={t('subjects.popup.nameEn')}
          required
          error={errors.nameEn?.message}
        >
          <Controller
            name="nameEn"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('subjects.enterSubjectNameEn')}
                hasError={Boolean(errors.nameEn)}
              />
            )}
          />
        </PopupField>

        <PopupField
          name="teacherIds"
          label={t('subjects.popup.teachers')}
          required
          error={errors.teacherIds?.message as string | undefined}
        >
          {multiSelect(
            'teacherIds',
            teacherOptions,
            isLoadingTeachers ? t('common.loading') : t('subjects.popup.teachersPlaceholder'),
            isLoadingTeachers
          )}
        </PopupField>

        <PopupField name="description" label={t('subjects.popup.descriptionAr')}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('subjects.popup.descriptionPlaceholder')}
              />
            )}
          />
        </PopupField>

        <PopupField name="descriptionEn" label={t('subjects.popup.descriptionEn')}>
          <Controller
            name="descriptionEn"
            control={control}
            render={({ field }) => (
              <PopupTextInput
                name={field.name}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('subjects.popup.descriptionPlaceholder')}
              />
            )}
          />
        </PopupField>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
        <Button
          actionKey={isEdit ? 'edit' : 'add'}
          onClick={handleSubmit(onSubmit, scrollToFirstError)}
          disabled={isSubmitting || isLoadingSubject}
          icon={isEdit ? undefined : <CustomImage src={PlusWhite16Icon} alt="" className="block" />}
          className="h-10 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-6! py-2.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! drop-shadow-[0px_1px_1px_rgba(5,150,105,0.2)] hover:bg-[#1E7A52]/90!"
        >
          {isSubmitting
            ? t('common.saving')
            : t(isEdit ? 'common.save' : 'subjects.popup.saveSubject')}
        </Button>
        <button
          type="button"
          onClick={closeAndReset}
          disabled={isSubmitting}
          className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
        >
          {t('common.cancel')}
        </button>
      </div>
    </Modal>
  );
}
