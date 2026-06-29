import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import {
  clearNotificationStudents,
  fetchNotificationStudents,
} from '@/redux/features/schoolNotificationsSlice';
import { getStudentFullName } from '@/services/api/types/students.types';

export type ParentsNotificationFormValues = {
  sentTo: string;
  educationalStages: string[];
  classrooms: string[];
  studentIds: string[];
  date: string;
  subjectAr: string;
  subjectEn: string;
  bodyAr: string;
  bodyEn: string;
  attachments: File[];
};

type ParentsNotificationFormProps = {
  mode: 'add' | 'edit';
  schoolBranchId: string;
  initialValues?: Partial<ParentsNotificationFormValues>;
  onCancel?: () => void;
  onSubmit?: (values: ParentsNotificationFormValues) => void | Promise<void>;
};

type ParentsNotificationFormErrors = Partial<
  Record<
    | 'sentTo'
    | 'studentIds'
    | 'educationalStages'
    | 'classrooms'
    | 'date'
    | 'subjectAr'
    | 'subjectEn'
    | 'bodyAr'
    | 'bodyEn',
    string
  >
>;

export default function ParentsNotificationForm({
  mode,
  schoolBranchId,
  initialValues,
  onCancel,
  onSubmit,
}: ParentsNotificationFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);
  const isEducationalStagesLoading = useAppSelector((state) => state.educationalStages.isLoading);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isClassroomsLoading = useAppSelector((state) => state.classrooms.isLoading);
  const notificationStudents = useAppSelector(
    (state) => state.schoolNotifications.notificationStudents
  );
  const isNotificationStudentsLoading = useAppSelector(
    (state) => state.schoolNotifications.isLoadingNotificationStudents
  );

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: { schoolBranchId },
      })
    );
  }, [dispatch, schoolBranchId]);

  const [values, setValues] = useState<ParentsNotificationFormValues>({
    sentTo: initialValues?.sentTo ?? 'parents',
    educationalStages: initialValues?.educationalStages ?? [],
    classrooms: initialValues?.classrooms ?? [],
    studentIds: initialValues?.studentIds ?? [],
    date: initialValues?.date ?? '',
    subjectAr: initialValues?.subjectAr ?? '',
    subjectEn: initialValues?.subjectEn ?? '',
    bodyAr: initialValues?.bodyAr ?? '',
    bodyEn: initialValues?.bodyEn ?? '',
    attachments: initialValues?.attachments ?? [],
  });

  const hasSelectedEducationalStages = values.educationalStages.length > 0;
  const hasSelectedClassrooms = values.classrooms.length > 0;

  const educationalStageOptions = useMemo<CustomSelectOption[]>(
    () =>
      educationalStages
        .map((stage) => ({
          value: stage.id,
          label:
            (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [currentLang, educationalStages]
  );

  const classroomOptions = useMemo<CustomSelectOption[]>(() => {
    const selectedStageIds = new Set(values.educationalStages);

    return classrooms
      .filter((classroom) => selectedStageIds.has(classroom.gradeId))
      .map((classroom) => ({
        value: classroom.id,
        label:
          (currentLang === 'ar' ? classroom.name : classroom.nameEn) ||
          classroom.name ||
          classroom.nameEn,
      }))
      .filter((option) => Boolean(option.value && option.label));
  }, [classrooms, currentLang, values.educationalStages]);

  useEffect(() => {
    if (!schoolBranchId || !hasSelectedEducationalStages || !hasSelectedClassrooms) {
      dispatch(clearNotificationStudents());
      return;
    }

    dispatch(fetchNotificationStudents({ schoolBranchId, classroomIds: values.classrooms }));
  }, [
    dispatch,
    hasSelectedClassrooms,
    hasSelectedEducationalStages,
    schoolBranchId,
    values.classrooms,
  ]);

  const studentOptions = useMemo<CustomSelectOption[]>(
    () =>
      notificationStudents
        .map((student) => ({
          value: student.id,
          label: getStudentFullName(student) || student.name,
        }))
        .filter((option) => Boolean(option.value && option.label)),
    [notificationStudents]
  );

  const errors = useMemo<ParentsNotificationFormErrors>(() => {
    if (!submitAttempted) return {};

    return {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
      educationalStages:
        values.educationalStages.length > 0
          ? ''
          : t('notifications.validation.educationalStageRequired'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
      bodyAr: values.bodyAr.trim() ? '' : t('notifications.validation.bodyArRequired'),
      bodyEn: values.bodyEn.trim() ? '' : t('notifications.validation.bodyEnRequired'),
    };
  }, [submitAttempted, t, values]);

  const hasValidationErrors = Object.values(errors).some(Boolean);
  const submitLabel = isSubmitting
    ? t('common.saving')
    : mode === 'add'
      ? t('common.send')
      : t('common.save');
  const cancelLabel = t('common.cancel');

  const patch = (partial: Partial<ParentsNotificationFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const normalizeMultiValue = (value: string | string[]) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean);

  const handleEducationalStagesChange = (value: string | string[]) => {
    patch({
      educationalStages: normalizeMultiValue(value),
      classrooms: [],
      studentIds: [],
    });
  };

  const handleClassroomsChange = (value: string | string[]) => {
    patch({
      classrooms: normalizeMultiValue(value),
      studentIds: [],
    });
  };

  const handleStudentIdsChange = (value: string | string[]) => {
    patch({ studentIds: normalizeMultiValue(value) });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitAttempted(true);

    const nextErrors = {
      sentTo: values.sentTo ? '' : t('notifications.validation.sentToRequired'),
      educationalStages:
        values.educationalStages.length > 0
          ? ''
          : t('notifications.validation.educationalStageRequired'),
      date: values.date ? '' : t('notifications.validation.dateRequired'),
      subjectAr: values.subjectAr.trim() ? '' : t('notifications.validation.subjectArRequired'),
      subjectEn: values.subjectEn.trim() ? '' : t('notifications.validation.subjectEnRequired'),
      bodyAr: values.bodyAr.trim() ? '' : t('notifications.validation.bodyArRequired'),
      bodyEn: values.bodyEn.trim() ? '' : t('notifications.validation.bodyEnRequired'),
    };

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <FormField label={t('notifications.sentTo')} required error={errors.sentTo}>
          <CustomSelect
            value={values.sentTo}
            onChange={(value) => {
              const selected = Array.isArray(value) ? (value[0] ?? '') : value;
              patch({ sentTo: selected ?? '' });
            }}
            options={[{ value: 'parents', label: t('notifications.tabs.parents') }]}
            placeholder={t('notifications.selectRecipient')}
            showSearch={false}
            error={Boolean(errors.sentTo)}
          />
        </FormField>

        <FormField
          label={t('notifications.educationalStageFilter')}
          required
          error={errors.educationalStages}
        >
          <CustomSelect
            isMulti
            value={values.educationalStages}
            onChange={handleEducationalStagesChange}
            options={educationalStageOptions}
            placeholder={
              isEducationalStagesLoading
                ? t('common.loading')
                : t('notifications.educationalStageFilter')
            }
            disabled={!schoolBranchId || isEducationalStagesLoading}
            error={Boolean(errors.educationalStages)}
          />
        </FormField>

        <FormField label={t('notifications.classroomFilter')} optional error={errors.classrooms}>
          <CustomSelect
            isMulti
            value={values.classrooms}
            onChange={handleClassroomsChange}
            options={classroomOptions}
            placeholder={
              !hasSelectedEducationalStages
                ? t('notifications.selectEducationalStageFirst')
                : isClassroomsLoading
                  ? t('common.loading')
                  : t('notifications.classroomFilter')
            }
            disabled={!schoolBranchId || isClassroomsLoading || !hasSelectedEducationalStages}
            error={Boolean(errors.classrooms)}
          />
        </FormField>

        <FormField label={t('notifications.parentNames')} optional error={errors.studentIds}>
          <CustomSelect
            isMulti
            value={values.studentIds}
            onChange={handleStudentIdsChange}
            options={studentOptions}
            placeholder={
              !hasSelectedEducationalStages
                ? t('notifications.selectEducationalStageFirst')
                : !hasSelectedClassrooms
                  ? t('notifications.selectClassroomFirst')
                  : isNotificationStudentsLoading
                    ? t('common.loading')
                    : t('notifications.chooseNames')
            }
            disabled={
              !schoolBranchId ||
              !hasSelectedEducationalStages ||
              !hasSelectedClassrooms ||
              isNotificationStudentsLoading
            }
            error={Boolean(errors.studentIds)}
          />
        </FormField>

        <FormField label={t('notifications.date')} required error={errors.date}>
          <Input
            type="date"
            value={values.date}
            onChange={(event) => patch({ date: event.target.value })}
            placeholder={t('common.chooseDate')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationSubjectAr')}
          required
          error={errors.subjectAr}
        >
          <TextArea
            value={values.subjectAr}
            onChange={(event) => patch({ subjectAr: event.target.value })}
            rows={3}
            placeholder={t('notifications.enterSubject')}
          />
        </FormField>

        <FormField
          label={t('notifications.notificationSubjectEn')}
          required
          error={errors.subjectEn}
        >
          <TextArea
            value={values.subjectEn}
            onChange={(event) => patch({ subjectEn: event.target.value })}
            rows={3}
            placeholder={t('notifications.enterSubject')}
          />
        </FormField>

        <FormField label={t('notifications.notificationContentAr')} required error={errors.bodyAr}>
          <TextArea
            value={values.bodyAr}
            onChange={(event) => patch({ bodyAr: event.target.value })}
            rows={4}
            placeholder={t('notifications.enterContent')}
          />
        </FormField>

        <FormField label={t('notifications.notificationContentEn')} required error={errors.bodyEn}>
          <TextArea
            value={values.bodyEn}
            onChange={(event) => patch({ bodyEn: event.target.value })}
            rows={4}
            placeholder={t('notifications.enterContent')}
          />
        </FormField>

        <FileUpload
          label={t('notifications.attachments')}
          optional
          multiple
          accept=".gif,.svg,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
          uploadText={t('notifications.uploadAttachments')}
          formatHints={[
            'gif',
            'svg',
            'jpg',
            'png',
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'txt',
            'ppt',
            'pptx',
          ]}
          maxSize={10}
          onFilesChange={(files) => patch({ attachments: files })}
        />

        <div className="flex flex-row-reverse gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={
              isSubmitting ||
              isNotificationStudentsLoading ||
              (submitAttempted && hasValidationErrors)
            }
          >
            {submitLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" type="button">
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
