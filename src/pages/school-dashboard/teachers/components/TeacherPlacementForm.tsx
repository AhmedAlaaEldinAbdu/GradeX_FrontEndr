import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { createTeacherAssignment } from '@/redux/features/teachers';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { EducationalStagesApiService } from '@/services/api/educational-stages/educational-stages.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type { Classroom } from '@/services/api/types/classrooms.types';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomImage from '@/shared/components/CustomImage';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import SuccessPlacementPopup from '../popups/SuccessPlacementPopup';
import { useToast } from '@/shared/context/ToastContext';

interface BookEntry {
  id: string;
  bookId: string;
}

interface AssignmentRow {
  id: string;
  subjectId: string;
  gradeId: string;
  classroomIds: string[];
  books: BookEntry[];
}

interface TeacherPlacementFormProps {
  teacherId: string;
  teacherName?: string;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function TeacherPlacementForm({ teacherId }: TeacherPlacementFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  // Redux state
  const subjects = useAppSelector((state) => state.subjects.subjects);
  const bookGrades = useAppSelector((state) => state.books.bookGrades);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingBooks = useAppSelector((state) => state.books.isLoading);

  // Local state for grades from API
  const [grades, setGrades] = useState<EducationalStageResponse[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);

  // Local state for classrooms per row (filtered by gradeId)
  const [classroomsPerRow, setClassroomsPerRow] = useState<Record<string, Classroom[]>>({});
  const [loadingClassroomsForRow, setLoadingClassroomsForRow] = useState<Record<string, boolean>>(
    {}
  );

  // Form state
  const [assignments, setAssignments] = useState<AssignmentRow[]>([
    {
      id: generateId(),
      subjectId: '',
      gradeId: '',
      classroomIds: [],
      books: [{ id: generateId(), bookId: '' }],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch lookup data on mount
  useEffect(() => {
    // Subjects are fetched when grade is selected per-row to avoid
    // overwriting global subjects when multiple grades are used in rows.
    dispatch(
      fetchBooks({
        page: 1,
        limit: 1000,
        filters: { schoolBranchesId: schoolBranchId || undefined },
      })
    );

    // Fetch grades from API
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
  }, [dispatch]);

  // Options for dropdowns
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
  }));

  const gradeOptions = grades.map((grade) => ({
    value: grade.id,
    label: currentLang === 'ar' ? grade.nameAr : grade.nameEn || grade.nameAr,
  }));

  // Helper to get books filtered by materialId (subjectId) and optionally gradeId
  const getBookOptionsForSubject = (subjectId: string, gradeId?: string) => {
    if (!subjectId) return [] as { value: string; label: string }[];
    const books: { value: string; label: string }[] = [];
    bookGrades.forEach((gradeBook) => {
      const matchesSubject = gradeBook.materialId === subjectId;
      const matchesGrade = !gradeId || gradeBook.gradeId === gradeId;

      if (matchesSubject && matchesGrade) {
        gradeBook.bookDtos.forEach((book) => {
          books.push({ value: book.id, label: book.name });
        });
      }
    });
    return books;
  };

  // Assignment row handlers
  const handleAddRow = () => {
    setAssignments([
      ...assignments,
      {
        id: generateId(),
        subjectId: '',
        gradeId: '',
        classroomIds: [],
        books: [{ id: generateId(), bookId: '' }],
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((row) => row.id !== id));
      // Clear errors for removed row
      const newErrors = { ...formErrors };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(id)) {
          delete newErrors[key];
        }
      });
      setFormErrors(newErrors);
    }
  };

  const handleRowChange = (id: string, field: keyof AssignmentRow, value: string | string[]) => {
    setAssignments(
      assignments.map((row) => {
        if (row.id !== id) return row;
        if (field === 'gradeId') {
          return {
            ...row,
            gradeId: value as string,
            classroomIds: [],
            subjectId: '',
            books: [{ id: generateId(), bookId: '' }],
          };
        }
        if (field === 'subjectId') {
          return { ...row, subjectId: value as string, books: [{ id: generateId(), bookId: '' }] };
        }
        return { ...row, [field]: value };
      })
    );

    // Fetch classrooms when grade changes
    if (field === 'gradeId' && typeof value === 'string' && value) {
      fetchClassroomsForRow(id, value);
      // Also fetch subjects filtered by the selected grade so the
      // subject dropdown shows relevant items. This mirrors the
      // single-row form behaviour where subjects depend on the grade.
      dispatch(
        fetchSubjects({
          page: 1,
          limit: 100,
          filters: { schoolBranchesId: schoolBranchId || undefined, gradeId: value },
        })
      );
    }

    // Clear error when user changes value
    if (formErrors[`${field}-${id}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${field}-${id}`];
        return newErrors;
      });
    }
  };

  // Fetch classrooms for a specific row based on gradeId
  const fetchClassroomsForRow = async (rowId: string, gradeId: string) => {
    setLoadingClassroomsForRow((prev) => ({ ...prev, [rowId]: true }));
    try {
      const response = await classroomApiService.getClassrooms({
        PageIndex: 1,
        PageSize: 100,
        GradeId: gradeId,
        SchoolBranchId: schoolBranchId || undefined,
      });
      setClassroomsPerRow((prev) => ({
        ...prev,
        [rowId]: response.data?.classroomDto || [],
      }));
    } catch (error) {
      console.error('Failed to fetch classrooms for grade:', error);
      setClassroomsPerRow((prev) => ({ ...prev, [rowId]: [] }));
    } finally {
      setLoadingClassroomsForRow((prev) => ({ ...prev, [rowId]: false }));
    }
  };

  // Book handlers
  const handleAddBook = (rowId: string) => {
    setAssignments(
      assignments.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, books: [...row.books, { id: generateId(), bookId: '' }] };
      })
    );
  };

  const handleBookChange = (rowId: string, bookEntryId: string, bookId: string) => {
    setAssignments(
      assignments.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          books: row.books.map((book) => (book.id === bookEntryId ? { ...book, bookId } : book)),
        };
      })
    );
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    assignments.forEach((row) => {
      if (!row.subjectId) {
        errors[`subjectId-${row.id}`] = t('common.validation.required');
      }
      if (!row.gradeId) {
        errors[`gradeId-${row.id}`] = t('common.validation.required');
      }
      if (row.classroomIds.length === 0) {
        errors[`classroomIds-${row.id}`] = t('common.validation.required');
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }

    if (!validateForm()) {
      showToast({ message: t('common.validation.pleaseFillRequiredFields'), type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit each assignment row
      for (const row of assignments) {
        const bookIds = row.books.filter((book) => book.bookId).map((book) => book.bookId);

        const result = await dispatch(
          createTeacherAssignment({
            schoolBranchesId: schoolBranchId,
            teacherId,
            gradeId: row.gradeId,
            materialId: row.subjectId,
            classroomIds: row.classroomIds,
            bookIds,
          })
        ).unwrap();

        if (!result.success) {
          throw new Error(result.message);
        }
      }

      setShowSuccessPopup(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errorOccurred');
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    navigate(`/teachers/${teacherId}/placement-details`);
  };

  const handleCancel = () => {
    navigate('/teachers');
  };

  return (
    <Card>
      <div className="space-y-6">
        {assignments.map((row) => (
          <div
            key={row.id}
            className="flex items-start gap-4 rounded-2xl border border-[#E6E6E6] px-4 py-3"
          >
            {/* Inner bordered section containing the form fields */}
            <div className="flex flex-1 items-start gap-4 rounded-2xl border border-[#E6E6E6] px-4 py-3">
              <div className="flex-1 space-y-8">
                {/* Subject and Stage Row */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <FormField
                    label={t('teachers.placement.subject')}
                    required
                    htmlFor={`subject-${row.id}`}
                  >
                    <CustomSelect
                      value={row.subjectId}
                      onChange={(value) =>
                        handleRowChange(
                          row.id,
                          'subjectId',
                          Array.isArray(value) ? value[0] || '' : value
                        )
                      }
                      options={subjectOptions}
                      placeholder={
                        isLoadingSubjects
                          ? t('common.loading')
                          : t('teachers.placement.selectSubject')
                      }
                      disabled={isLoadingSubjects}
                      error={!!formErrors[`subjectId-${row.id}`]}
                    />
                  </FormField>

                  <FormField
                    label={t('teachers.placement.stage')}
                    required
                    htmlFor={`stage-${row.id}`}
                  >
                    <CustomSelect
                      value={row.gradeId}
                      onChange={(value) =>
                        handleRowChange(
                          row.id,
                          'gradeId',
                          Array.isArray(value) ? value[0] || '' : value
                        )
                      }
                      options={gradeOptions}
                      placeholder={
                        isLoadingGrades ? t('common.loading') : t('teachers.placement.selectStage')
                      }
                      disabled={isLoadingGrades}
                      error={!!formErrors[`gradeId-${row.id}`]}
                    />
                  </FormField>
                </div>

                {/* Classrooms Field */}
                <FormField
                  label={t('teachers.placement.classrooms')}
                  required
                  htmlFor={`classrooms-${row.id}`}
                >
                  <CustomSelect
                    value={row.classroomIds}
                    onChange={(value) => {
                      const selectedIds = Array.isArray(value) ? value : [value].filter(Boolean);
                      setAssignments(
                        assignments.map((r) =>
                          r.id === row.id ? { ...r, classroomIds: selectedIds as string[] } : r
                        )
                      );
                      if (formErrors[`classroomIds-${row.id}`]) {
                        setFormErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors[`classroomIds-${row.id}`];
                          return newErrors;
                        });
                      }
                    }}
                    options={(classroomsPerRow[row.id] || []).map((c) => ({
                      value: c.id,
                      label: currentLang === 'ar' ? c.name : c.nameEn || c.name,
                    }))}
                    placeholder={
                      !row.gradeId
                        ? t('teachers.placement.selectGradeFirst')
                        : loadingClassroomsForRow[row.id]
                          ? t('common.loading')
                          : t('teachers.placement.selectClassrooms')
                    }
                    disabled={!row.gradeId || loadingClassroomsForRow[row.id]}
                    isMulti={true}
                    id={`classrooms-${row.id}`}
                    error={!!formErrors[`classroomIds-${row.id}`]}
                  />
                </FormField>

                {/* Books Section with circular add button */}
                {row.books.map((bookEntry, bookIndex) => (
                  <div key={bookEntry.id} className="flex flex-row-reverse items-end gap-8">
                    {bookIndex === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleAddBook(row.id)}
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
                        htmlFor={`book-${bookEntry.id}`}
                      >
                        <CustomSelect
                          value={bookEntry.bookId}
                          onChange={(value) =>
                            handleBookChange(
                              row.id,
                              bookEntry.id,
                              Array.isArray(value) ? value[0] || '' : value
                            )
                          }
                          options={getBookOptionsForSubject(row.subjectId)}
                          placeholder={
                            !row.subjectId
                              ? t('teachers.placement.selectSubjectFirst')
                              : isLoadingBooks
                                ? t('common.loading')
                                : t('teachers.placement.selectBook')
                          }
                          disabled={!row.subjectId || isLoadingBooks}
                          id={`book-${bookEntry.id}`}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trash button - INSIDE the inner border, last child so it sits on the end (left in RTL) */}
              {assignments.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(221,4,23,0.1)] transition-colors hover:bg-[rgba(221,4,23,0.18)]"
                  aria-label="remove row"
                >
                  <CustomImage src={TrashIcon} alt="remove" className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Big plus button - OUTSIDE the border, end-aligned in RTL (visually on the left) */}
            <button
              type="button"
              onClick={handleAddRow}
              className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center"
              aria-label="add row"
            >
              <CustomImage src={GreenPlusIcon} alt="add" className="h-12 w-12" />
            </button>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.processing') : t('teachers.placement.submit')}
          </Button>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPlacementPopup open={showSuccessPopup} onClose={handleSuccessClose} />
    </Card>
  );
}
