import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { updateTeacherAssignment } from '@/redux/features/teachers';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { EducationalStagesApiService } from '@/services/api/educational-stages/educational-stages.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import type { Classroom } from '@/services/api/types/classrooms.types';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomImage from '@/shared/components/CustomImage';
import Loading from '@/shared/components/Loading';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import { useToast } from '@/shared/context/ToastContext';
import { getBackendMessage } from '@/lib/http';
import {
  EditTeacherPlacementSchema,
  type EditTeacherPlacementProps,
} from '@/validations/teacher-placement-validations';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

interface EditTeacherPlacementFormProps {
  teacherId: string;
  // Either an assignmentId OR a gradeId — the form picks the matching teacher
  // assignment to pre-fill.
  assignmentId: string;
}

export default function EditTeacherPlacementForm({
  teacherId,
  assignmentId,
}: EditTeacherPlacementFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  // Lookup data
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const bookGrades = useAppSelector((state) => state.books.bookGrades);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingBooks = useAppSelector((state) => state.books.isLoading);

  const [grades, setGrades] = useState<EducationalStageResponse[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  // Resolved assignment id from the loaded record. Seeded with the URL param
  // so the submit always has *something* to PUT against (and the call
  // surfaces a real backend error if the id is wrong, instead of failing
  // silently in the client). Updated after the assignment loads.
  const [resolvedAssignmentId, setResolvedAssignmentId] = useState(assignmentId);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);

  // Keep resolvedAssignmentId in sync if the URL param changes (e.g., user
  // navigates between edit pages without unmounting).
  useEffect(() => {
    setResolvedAssignmentId(assignmentId);
  }, [assignmentId]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<EditTeacherPlacementProps>({
    resolver: yupResolver(EditTeacherPlacementSchema),
    mode: 'onBlur',
    defaultValues: {
      subjectId: '',
      gradeId: '',
      classroomIds: [],
      bookIds: [],
    },
  });

  const scrollToFirstError = useScrollToFirstError<EditTeacherPlacementProps>();

  const subjectId = watch('subjectId');
  const gradeId = watch('gradeId');
  const bookIds = watch('bookIds') || [];

  // Load lookup data on mount
  useEffect(() => {
    dispatch(
      fetchSubjects({
        page: 1,
        limit: 100,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );
    dispatch(
      fetchBooks({
        page: 1,
        limit: 1000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );

    const loadGrades = async () => {
      setIsLoadingGrades(true);
      try {
        const response = await EducationalStagesApiService.fetchEducationalStages({
          pageIndex: 1,
          pageSize: 100,
        });
        setGrades(response.gradeDtos || []);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
      } finally {
        setIsLoadingGrades(false);
      }
    };
    loadGrades();
  }, [dispatch, schoolBranchId]);

  // Load existing assignment to pre-fill the form. Try by assignmentId first;
  // if that fails (or returns no data), look up the first matching
  // teacher+grade assignment via the list API.
  useEffect(() => {
    if (!assignmentId || !teacherId || !schoolBranchId) {
      setIsLoadingAssignment(false);
      return;
    }

    let cancelled = false;
    setIsLoadingAssignment(true);

    const populate = (data: {
      id: string;
      materialId: string;
      gradeId: string;
      classrooms: { id: string }[];
      books?: { id: string }[];
    }) => {
      setResolvedAssignmentId(data.id);
      reset({
        subjectId: data.materialId,
        gradeId: data.gradeId,
        classroomIds: data.classrooms?.map((c) => c.id) ?? [],
        bookIds: data.books?.map((b) => b.id) ?? [],
      });
    };

    const fallbackToListLookup = async () => {
      try {
        const list = await teacherApiService.getTeacherAssignmentList({
          TeacherId: teacherId,
          SchoolBranchesId: schoolBranchId,
          GrageId: assignmentId,
        });
        if (cancelled) return;
        const match = list?.teacherAssignmentDto?.[0];
        if (match) populate(match);
      } catch (error) {
        console.error('Failed to look up assignment by grade:', error);
      }
    };

    teacherApiService
      .getTeacherAssignmentById(assignmentId)
      .then(async (data) => {
        if (cancelled) return;
        if (data) {
          populate(data);
          return;
        }
        await fallbackToListLookup();
      })
      .catch(async () => {
        if (!cancelled) await fallbackToListLookup();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAssignment(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId, teacherId, schoolBranchId, reset]);

  // Fetch classrooms whenever the grade changes
  useEffect(() => {
    if (!gradeId) {
      setClassrooms([]);
      return;
    }
    let cancelled = false;
    setIsLoadingClassrooms(true);
    classroomApiService
      .getClassrooms({
        PageIndex: 1,
        PageSize: 100,
        GradeId: gradeId,
        SchoolBranchId: schoolBranchId || undefined,
      })
      .then((response) => {
        if (cancelled) return;
        setClassrooms(response.data?.classroomDto || []);
      })
      .catch((error) => {
        console.error('Failed to fetch classrooms:', error);
        if (!cancelled) setClassrooms([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingClassrooms(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gradeId, schoolBranchId]);

  // Options for dropdowns
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
  }));

  const gradeOptions = grades.map((grade) => ({
    value: grade.id,
    label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
  }));

  const classroomOptions = classrooms.map((c) => ({
    value: c.id,
    label: currentLang === 'ar' ? c.name : c.nameEn || c.name,
  }));

  const getBookOptionsForSubject = (subj: string) => {
    if (!subj) return [] as { value: string; label: string }[];
    const result: { value: string; label: string }[] = [];
    bookGrades.forEach((gradeBook) => {
      if (gradeBook.materialId === subj) {
        gradeBook.bookDtos.forEach((book) => {
          result.push({ value: book.id, label: book.name });
        });
      }
    });
    return result;
  };

  const handleAddBook = () => {
    setValue('bookIds', [...(bookIds || []), ''], { shouldDirty: true });
  };

  const handleBookChange = (index: number, value: string) => {
    const next = [...(bookIds || [])];
    next[index] = value;
    setValue('bookIds', next, { shouldDirty: true, shouldValidate: false });
  };

  const onSubmit = async (data: EditTeacherPlacementProps) => {
    const targetId = resolvedAssignmentId || assignmentId;
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }
    if (!targetId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }

    try {
      const cleanedBookIds = (data.bookIds || []).filter(
        (id): id is string => !!id && id.length > 0
      );

      const result = await dispatch(
        updateTeacherAssignment({
          id: targetId,
          schoolBranchesId: schoolBranchId,
          teacherId,
          gradeId: data.gradeId,
          materialId: data.subjectId,
          classroomIds: data.classroomIds.filter((id): id is string => !!id),
          bookIds: cleanedBookIds,
        })
      ).unwrap();

      if (!result.success) {
        throw new Error(result.message);
      }

      showToast({ message: t('common.successEdit'), type: 'success' });
      navigate(`/teaching-staff/teachers/${teacherId}?tab=educational-stages`);
    } catch (error) {
      showToast({ message: getBackendMessage(error) || t('common.errorOccurred'), type: 'error' });
    }
  };

  const handleCancel = () => {
    navigate(`/teaching-staff/teachers/${teacherId}?tab=educational-stages`);
  };

  if (isLoadingAssignment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Render at least one book row even when empty (so the user can add the first one)
  const bookRows = bookIds.length > 0 ? bookIds : [''];

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)}>
        <div className="space-y-8">
          {/* Subject + Stage row */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              label={t('teachers.placement.subject')}
              required
              error={errors.subjectId?.message}
              htmlFor="subject"
            >
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const v = Array.isArray(value) ? value[0] || '' : value;
                      field.onChange(v);
                      // Reset books when subject changes (book list is filtered by subject)
                      setValue('bookIds', [], { shouldDirty: true });
                    }}
                    options={subjectOptions}
                    placeholder={
                      isLoadingSubjects
                        ? t('common.loading')
                        : t('teachers.placement.selectSubject')
                    }
                    disabled={isLoadingSubjects}
                    error={!!errors.subjectId}
                    id="subject"
                  />
                )}
              />
            </FormField>

            <FormField
              label={t('teachers.placement.stage')}
              required
              error={errors.gradeId?.message}
              htmlFor="stage"
            >
              <Controller
                name="gradeId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const v = Array.isArray(value) ? value[0] || '' : value;
                      field.onChange(v);
                      // Reset classrooms when grade changes (classrooms filter by grade)
                      setValue('classroomIds', [], { shouldDirty: true });
                    }}
                    options={gradeOptions}
                    placeholder={
                      isLoadingGrades ? t('common.loading') : t('teachers.placement.selectStage')
                    }
                    disabled={isLoadingGrades}
                    error={!!errors.gradeId}
                    id="stage"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Classrooms */}
          <FormField
            label={t('teachers.placement.classrooms')}
            required
            error={(errors.classroomIds as { message?: string } | undefined)?.message}
            htmlFor="classrooms"
          >
            <Controller
              name="classroomIds"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={(field.value || []) as string[]}
                  onChange={(value) => {
                    const ids = Array.isArray(value) ? value : [value].filter(Boolean);
                    field.onChange(ids);
                  }}
                  options={classroomOptions}
                  placeholder={
                    !gradeId
                      ? t('teachers.placement.selectGradeFirst')
                      : isLoadingClassrooms
                        ? t('common.loading')
                        : t('teachers.placement.selectClassrooms')
                  }
                  disabled={!gradeId || isLoadingClassrooms}
                  isMulti={true}
                  id="classrooms"
                  error={!!errors.classroomIds}
                />
              )}
            />
          </FormField>

          {/* Books — circular plus on the end side, optional fields */}
          {bookRows.map((bookId, bookIndex) => (
            <div key={`book-row-${bookIndex}`} className="flex flex-row-reverse items-end gap-8">
              {bookIndex === 0 ? (
                <button
                  type="button"
                  onClick={handleAddBook}
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(0,81,46,0.1)] transition-colors hover:bg-[rgba(0,81,46,0.18)]"
                  aria-label="add book"
                >
                  <CustomImage src={GreenPlusCircleIcon} alt="add book" className="h-6 w-6" />
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1">
                <FormField
                  label={bookIndex === 0 ? t('teachers.placement.book') : ' '}
                  htmlFor={`book-${bookIndex}`}
                >
                  <CustomSelect
                    value={bookId || ''}
                    onChange={(value) =>
                      handleBookChange(bookIndex, Array.isArray(value) ? value[0] || '' : value)
                    }
                    options={getBookOptionsForSubject(subjectId)}
                    placeholder={
                      !subjectId
                        ? t('teachers.placement.selectSubjectFirst')
                        : isLoadingBooks
                          ? t('common.loading')
                          : t('teachers.placement.selectBook')
                    }
                    disabled={!subjectId || isLoadingBooks}
                    id={`book-${bookIndex}`}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.processing') : t('common.saveChanges')}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
