import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';

import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import TextArea from '@/shared/components/TextArea';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useAddMessageValidations } from '@/validations/requests-validations';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

import { EducationalStagesApiService } from '@/services/api/educational-stages/educational-stages.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type { Classroom } from '@/services/api/types/classrooms.types';

import { type MockStudentOption } from '../requests.mock';
import SelectStudentsPopup from '../popups/SelectStudentsPopup';

type DirectedTo = 'all' | 'selected';

interface AddMessageFormValues {
  grades: string[];
  classrooms: string[];
  content: string;
}

const AddMessage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language;
  const scrollToFirstError = useScrollToFirstError<AddMessageFormValues>();
  const { gradesRules, classroomsRules, contentRules, validateStudents } =
    useAddMessageValidations();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<AddMessageFormValues>({
    defaultValues: { grades: [], classrooms: [], content: '' },
  });

  const grades = useWatch({ control, name: 'grades' });

  const [directedTo, setDirectedTo] = useState<DirectedTo>('all');
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<MockStudentOption[]>([]);
  const [studentsError, setStudentsError] = useState<string | undefined>();

  const [gradeItems, setGradeItems] = useState<EducationalStageResponse[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [classroomItems, setClassroomItems] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Load grades (educational stages) once on mount.
  useEffect(() => {
    let isActive = true;
    const loadGrades = async () => {
      setIsLoadingGrades(true);
      try {
        const response = await EducationalStagesApiService.fetchEducationalStages({
          pageIndex: 1,
          pageSize: 100,
        });
        if (isActive) setGradeItems(response.gradeDtos || []);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
        if (isActive) setGradeItems([]);
      } finally {
        if (isActive) setIsLoadingGrades(false);
      }
    };
    loadGrades();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!grades || grades.length === 0) {
      setClassroomItems([]);
      setValue('classrooms', []);
      return;
    }
    let isActive = true;
    const loadClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const responses = await Promise.all(
          grades.map((gradeId) =>
            classroomApiService.getClassrooms({ PageIndex: 1, PageSize: 100, GradeId: gradeId })
          )
        );
        if (!isActive) return;
        const merged = new Map<string, Classroom>();
        responses.forEach((response) => {
          (response.data?.classroomDto || []).forEach((classroom) => {
            merged.set(classroom.id, classroom);
          });
        });
        setClassroomItems(Array.from(merged.values()));
        // Drop any previously-selected classrooms that no longer belong.
        setValue(
          'classrooms',
          getValues('classrooms').filter((id) => merged.has(id))
        );
      } catch (error) {
        console.error('Failed to fetch classrooms:', error);
        if (isActive) setClassroomItems([]);
      } finally {
        if (isActive) setIsLoadingClassrooms(false);
      }
    };
    loadClassrooms();
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grades]);

  const gradeOptions = useMemo(
    () =>
      gradeItems.map((grade) => ({
        value: grade.id,
        label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
      })),
    [gradeItems, currentLang]
  );

  const classroomOptions = useMemo(
    () =>
      classroomItems.map((classroom) => ({
        value: classroom.id,
        label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
      })),
    [classroomItems, currentLang]
  );

  const classroomChoices = useMemo(
    () => classroomItems.map((classroom) => ({ id: classroom.id, name: classroom.name })),
    [classroomItems]
  );

  const hasGrade = Boolean(grades && grades.length > 0);

  const handleSelectedRadio = () => {
    if (!hasGrade) return;
    setIsStudentsPopupOpen(true);
  };

  const handleConfirmStudents = (students: MockStudentOption[]) => {
    setSelectedStudents(students);
    setDirectedTo(students.length > 0 ? 'selected' : 'all');
    if (students.length > 0) setStudentsError(undefined);
  };

  const onValid = (values: AddMessageFormValues) => {
    const studentsResult = validateStudents(directedTo, selectedStudents.length);
    if (studentsResult !== true) {
      setStudentsError(studentsResult);
      scrollToFirstError({ directedTo: { message: studentsResult } } as never);
      return;
    }

    // TODO(backend): replace with a redux thunk + requests service call.
    void values;
    setShowPopupMessage({
      show: true,
      type: 'success',
      message: t('requests.addMessage.addedSuccessfully'),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onValid, scrollToFirstError)}>
        <Card className="rounded-2xl" padding="lg">
          <div className="flex flex-col items-start gap-8">
            <div className="w-full">
              <FormField
                label={t('requests.addMessage.gradeLabel')}
                required
                name="grades"
                error={errors.grades?.message}
              >
                <Controller
                  name="grades"
                  control={control}
                  rules={gradesRules}
                  render={({ field }) => (
                    <CustomSelect
                      isMulti
                      value={field.value}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value : [value])}
                      options={gradeOptions}
                      disabled={isLoadingGrades}
                      error={Boolean(errors.grades)}
                      placeholder={
                        isLoadingGrades
                          ? t('common.loading')
                          : t('requests.addMessage.gradePlaceholder')
                      }
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="w-full">
              <FormField
                label={t('requests.addMessage.classroomLabel')}
                required
                name="classrooms"
                error={errors.classrooms?.message}
              >
                <Controller
                  name="classrooms"
                  control={control}
                  rules={classroomsRules}
                  render={({ field }) => (
                    <CustomSelect
                      isMulti
                      value={field.value}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value : [value])}
                      options={classroomOptions}
                      disabled={!hasGrade || isLoadingClassrooms}
                      error={Boolean(errors.classrooms)}
                      placeholder={
                        !hasGrade
                          ? t('requests.addMessage.selectGradeFirst')
                          : isLoadingClassrooms
                            ? t('common.loading')
                            : t('requests.addMessage.classroomPlaceholder')
                      }
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="w-full" data-form-field="directedTo">
              <label className="mb-2 flex items-center justify-start gap-1 text-sm font-normal text-[#3A3A3A]">
                <span className="required">{t('requests.addMessage.directedToLabel')}</span>
              </label>
              <div className="flex items-center justify-start gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-[#646969]">
                  <span>{t('requests.addMessage.allClassrooms')}</span>
                  <input
                    type="radio"
                    name="directedTo"
                    value="all"
                    checked={directedTo === 'all'}
                    onChange={() => {
                      setDirectedTo('all');
                      setStudentsError(undefined);
                    }}
                    className="h-4 w-4 accent-[#00512E]"
                  />
                </label>
                <label
                  className={`flex items-center gap-2 text-sm font-normal text-[#646969] ${
                    !hasGrade ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <span>{t('requests.addMessage.selectedStudents')}</span>
                  <input
                    type="radio"
                    name="directedTo"
                    value="selected"
                    checked={directedTo === 'selected'}
                    onChange={handleSelectedRadio}
                    disabled={!hasGrade}
                    className="h-4 w-4 accent-[#00512E]"
                  />
                </label>
              </div>

              {directedTo === 'selected' && selectedStudents.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsStudentsPopupOpen(true)}
                  className="mt-4 flex items-center gap-3"
                >
                  <CustomImage
                    src={selectedStudents[0].avatarPath || DefaultAvatar}
                    fallbackSrc={DefaultAvatar}
                    alt={selectedStudents[0].name}
                    className="h-11 w-11 rounded-lg border border-[#DDE0E0] object-cover"
                  />
                  <span className="text-base font-medium text-[#00512E]">
                    {selectedStudents[0].name}
                    {selectedStudents.length > 1
                      ? ` ${t('requests.addMessage.studentsSummary', {
                          count: selectedStudents.length - 1,
                        })}`
                      : ''}
                  </span>
                </button>
              ) : null}

              {studentsError ? (
                <p className="mt-2 text-start text-sm text-red-500">{studentsError}</p>
              ) : null}
            </div>

            <div className="w-full">
              <FormField
                label={t('requests.addMessage.contentLabel')}
                required
                name="content"
                error={errors.content?.message}
              >
                <Controller
                  name="content"
                  control={control}
                  rules={contentRules}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder={t('requests.addMessage.contentPlaceholder')}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="flex w-full items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/requests?tab=messages')}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {t('requests.addMessage.next')}
              </Button>
            </div>
          </div>
        </Card>
      </form>

      <SelectStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        classrooms={classroomChoices}
        selectedIds={selectedStudents.map((student) => student.id)}
        onConfirm={handleConfirmStudents}
      />

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        onClose={() => {
          const wasSuccess = showPopupMessage.type === 'success';
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (wasSuccess) navigate('/requests?tab=messages');
        }}
      />
    </>
  );
};

export default AddMessage;
