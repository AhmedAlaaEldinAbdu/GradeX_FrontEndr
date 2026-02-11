import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';
import type { StudentInterviewApiProps } from '@/validations/student-interviews-validations';
import { StudentInterviewApiSchema } from '@/validations/student-interviews-validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudents } from '@/redux/features/students/studentsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { getStudentFullName } from '@/services/api/types/students.types';

interface AddEditStudentInterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: StudentInterviewApiProps) => Promise<void>;
  initialValues?: StudentInterviewApiProps;
  selectedDate?: Date;
  mode?: 'add' | 'edit';
}

export default function AddEditStudentInterviewPopup({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  selectedDate,
  mode = 'add',
}: AddEditStudentInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    students,
    isInitialized: areStudentsInitialized,
    isLoading: areStudentsLoading,
  } = useAppSelector((state) => state.students);

  const {
    teachers,
    isInitialized: areTeachersInitialized,
    isLoading: areTeachersLoading,
  } = useAppSelector((state) => state.teachers);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentInterviewApiProps>({
    resolver: yupResolver(StudentInterviewApiSchema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      schoolBranchesId: '',
      studentId: '',
      supervisorId: '',
      interviewDate: '',
      startTime: '',
      endTime: '',
    },
  });

  const selectedStudentId = watch('studentId');

  const studentOptions: CustomSelectOption[] = students.length
    ? students.map((student) => ({
        value: student.id,
        label: getStudentFullName(student),
      }))
    : [];

  const supervisorOptions: CustomSelectOption[] = teachers.length
    ? teachers.map((teacher) => ({
        value: teacher.id,
        label: teacher.fullName,
      }))
    : [];

  const createInterviewFormDefaults = (): StudentInterviewApiProps => ({
    nameAr: '',
    nameEn: '',
    schoolBranchesId: '',
    studentId: '',
    supervisorId: '',
    interviewDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!areStudentsInitialized && !areStudentsLoading) {
      dispatch(fetchStudents({ limit: 10000 }));
    }

    if (!areTeachersInitialized && !areTeachersLoading) {
      dispatch(fetchTeachers({ limit: 10000 }));
    }
  }, [
    areStudentsInitialized,
    areStudentsLoading,
    areTeachersInitialized,
    areTeachersLoading,
    dispatch,
    isOpen,
  ]);

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    setValue('schoolBranchesId', student?.schoolBrancheId ?? '');
  }, [selectedStudentId, setValue, students]);

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? createInterviewFormDefaults());
    }
  }, [isOpen, initialValues, reset, selectedDate]);

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
    : null;

  const closeAndReset = () => {
    reset(createInterviewFormDefaults());
    onClose();
  };

  const handleFormSubmit = async (values: StudentInterviewApiProps) => {
    if (onSubmit) {
      await onSubmit(values);
    }
    closeAndReset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={mode === 'edit' ? t('interviews.editInterview') : t('interviews.addInterview')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {formattedSelectedDate && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('interviews.interviewDate')}:</span>{' '}
            {formattedSelectedDate}
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.interviewNameAr')}
              required
              error={errors.nameAr?.message && t(errors.nameAr.message)}
              htmlFor="nameAr"
            >
              <Controller
                name="nameAr"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nameAr"
                    placeholder={t('interviews.enterInterviewNameAr')}
                    error={errors.nameAr ? ' ' : undefined}
                    className={errors.nameAr ? 'border-red-500' : ''}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.interviewNameEn')}
              required
              error={errors.nameEn?.message && t(errors.nameEn.message)}
              htmlFor="nameEn"
            >
              <Controller
                name="nameEn"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nameEn"
                    placeholder={t('interviews.enterInterviewNameEn')}
                    error={errors.nameEn ? ' ' : undefined}
                    className={errors.nameEn ? 'border-red-500' : ''}
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('studentManagement.studentName')}
              required
              error={errors.studentId?.message && t(errors.studentId.message)}
              htmlFor="studentId"
            >
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="studentId"
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    options={studentOptions}
                    placeholder={t('studentManagement.searchByStudentName')}
                    error={!!errors.studentId}
                    disabled={studentOptions.length === 0}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.supervisorName')}
              required
              error={errors.supervisorId?.message && t(errors.supervisorId.message)}
              htmlFor="supervisorId"
            >
              <Controller
                name="supervisorId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    id="supervisorId"
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    options={supervisorOptions}
                    placeholder={t('interviews.selectSupervisor')}
                    error={!!errors.supervisorId}
                    disabled={supervisorOptions.length === 0}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Time */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label={t('interviews.startTime')}
              required
              error={errors.startTime?.message && t(errors.startTime.message)}
              htmlFor="startTime"
            >
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="startTime"
                    type="time"
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectStartTime')}
                    className="flex justify-end"
                    error={errors.startTime ? ' ' : undefined}
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('interviews.endTime')}
              required
              error={errors.endTime?.message && t(errors.endTime.message)}
              htmlFor="endTime"
            >
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="endTime"
                    type="time"
                    icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                    placeholder={t('interviews.selectEndTime')}
                    className="flex justify-end"
                    error={errors.endTime ? ' ' : undefined}
                  />
                )}
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closeAndReset} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('common.saving')
              : mode === 'edit'
                ? t('common.save')
                : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
