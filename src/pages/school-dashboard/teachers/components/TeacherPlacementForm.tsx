import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import { createTeacherAssignment } from '@/redux/features/teachers';
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import { EducationalStagesApiService } from '@/services/api/educational-stages/educational-stages.service';
import type { EducationalStageResponse } from '@/services/api/types/educational-stages.types';
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type { Classroom } from '@/services/api/types/classrooms.types';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomImage from '@/shared/components/CustomImage';
import PlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
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
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchBooks({ page: 1, limit: 1000 }));

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

  // Helper to get books filtered by materialId (subjectId)
  const getBookOptionsForSubject = (subjectId: string) => {
    if (!subjectId) return [];
    const books: { value: string; label: string }[] = [];
    bookGrades.forEach((gradeBook) => {
      if (gradeBook.materialId === subjectId) {
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
          return { ...row, gradeId: value as string, classroomIds: [] };
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
        pageIndex: 1,
        pageSize: 100,
        gradeId,
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

  const handleClassroomToggle = (rowId: string, classroomId: string) => {
    setAssignments(
      assignments.map((row) => {
        if (row.id !== rowId) return row;
        const isSelected = row.classroomIds.includes(classroomId);
        return {
          ...row,
          classroomIds: isSelected
            ? row.classroomIds.filter((id) => id !== classroomId)
            : [...row.classroomIds, classroomId],
        };
      })
    );
    // Clear classroom error
    if (formErrors[`classroomIds-${rowId}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`classroomIds-${rowId}`];
        return newErrors;
      });
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
            schoolBranchesId: STATIC_SCHOOL_BRANCH_ID,
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
    navigate('/teachers');
  };

  const handleCancel = () => {
    navigate('/teachers');
  };

  const getClassroomName = (rowId: string, classroomId: string) => {
    const rowClassrooms = classroomsPerRow[rowId] || [];
    const classroom = rowClassrooms.find((c) => c.id === classroomId);
    if (!classroom) return classroomId;
    return currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name;
  };

  return (
    <Card>
      <div className="space-y-6">
        {assignments.map((row) => (
          <div key={row.id} className="flex items-start gap-3">
            {/* Bordered section containing the form fields */}
            <div className="flex-1 rounded-lg border border-gray-200 p-4">
              {/* Trash button - INSIDE the border, only when multiple rows */}
              {assignments.length > 1 && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 transition-colors hover:bg-red-100"
                  >
                    <CustomImage src={TrashIcon} alt="remove" className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Subject and Stage Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  />
                </FormField>
              </div>

              {/* Classrooms Field */}
              <div className="mt-4">
                <FormField
                  label={t('teachers.placement.classrooms')}
                  required
                  htmlFor={`classrooms-${row.id}`}
                >
                  <CustomSelect
                    value=""
                    onChange={(value) => {
                      const classroomId = Array.isArray(value) ? value[0] : value;
                      if (classroomId) {
                        handleClassroomToggle(row.id, classroomId);
                      }
                    }}
                    options={(classroomsPerRow[row.id] || [])
                      .filter((c) => !row.classroomIds.includes(c.id))
                      .map((c) => ({
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
                  />
                  {row.classroomIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.classroomIds.map((classroomId) => (
                        <span
                          key={classroomId}
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                        >
                          {getClassroomName(row.id, classroomId)}
                          <button
                            type="button"
                            onClick={() => handleClassroomToggle(row.id, classroomId)}
                            className="ms-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </FormField>
              </div>

              {/* Books Section with Add Button */}
              {row.books.map((bookEntry, bookIndex) => (
                <div key={bookEntry.id} className="mt-4 flex items-end gap-2">
                  {bookIndex === 0 && (
                    <button
                      type="button"
                      onClick={() => handleAddBook(row.id)}
                      className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center"
                    >
                      <CustomImage src={PlusCircleIcon} alt="add book" className="h-6 w-6" />
                    </button>
                  )}
                  {bookIndex > 0 && <div className="w-8 shrink-0" />}
                  <div className="flex-1">
                    <FormField
                      label={bookIndex === 0 ? t('teachers.placement.book') : ''}
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
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            {/* Plus button - OUTSIDE the border */}
            <button
              type="button"
              onClick={handleAddRow}
              className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center"
            >
              <CustomImage src={PlusCircleIcon} alt="add" className="h-7 w-7" />
            </button>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
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
