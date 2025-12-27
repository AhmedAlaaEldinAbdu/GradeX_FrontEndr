import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
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
  stageId: string;
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
  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);
  const classrooms = useAppSelector((state) => state.classrooms.classrooms);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);
  const isLoadingStages = useAppSelector((state) => state.lookups.isLoadingSchoolStages);
  const isLoadingClassrooms = useAppSelector((state) => state.classrooms.isLoading);

  // Form state
  const [assignments, setAssignments] = useState<AssignmentRow[]>([
    {
      id: generateId(),
      subjectId: '',
      stageId: '',
      classroomIds: [],
      books: [{ id: generateId(), bookId: '' }],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Fetch lookup data on mount
  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
    dispatch(fetchClassrooms({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Options for dropdowns
  const subjectOptions = subjects.map((subject) => ({
    value: subject.id,
    label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
  }));

  const stageOptions = schoolStages.map((stage) => ({
    value: stage.id,
    label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
  }));

  const classroomOptions = classrooms.map((classroom) => ({
    value: classroom.id,
    label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
  }));

  // Mock book options
  const bookOptions = [
    {
      value: 'book1',
      label: currentLang === 'ar' ? 'كتاب وصايا الرسول' : 'Prophet Teachings Book',
    },
    {
      value: 'book2',
      label: currentLang === 'ar' ? 'كتاب القط و حرف سين' : 'Cat and Letter S Book',
    },
    { value: 'book3', label: currentLang === 'ar' ? 'القران الكريم' : 'Holy Quran' },
  ];

  // Assignment row handlers
  const handleAddRow = () => {
    setAssignments([
      ...assignments,
      {
        id: generateId(),
        subjectId: '',
        stageId: '',
        classroomIds: [],
        books: [{ id: generateId(), bookId: '' }],
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((row) => row.id !== id));
    }
  };

  const handleRowChange = (id: string, field: keyof AssignmentRow, value: string | string[]) => {
    setAssignments(assignments.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
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

  const handleSubmit = async () => {
    const isValid = assignments.every(
      (row) => row.subjectId && row.stageId && row.classroomIds.length > 0
    );

    if (!isValid) {
      showToast({ message: 'common.validation.required', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Placement data:', { teacherId, assignments });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessPopup(true);
    } catch {
      showToast({ message: 'common.errorOccurred', type: 'error' });
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

  const getClassroomName = (classroomId: string) => {
    const classroom = classrooms.find((c) => c.id === classroomId);
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
                    value={row.stageId}
                    onChange={(value) =>
                      handleRowChange(
                        row.id,
                        'stageId',
                        Array.isArray(value) ? value[0] || '' : value
                      )
                    }
                    options={stageOptions}
                    placeholder={
                      isLoadingStages ? t('common.loading') : t('teachers.placement.selectStage')
                    }
                    disabled={isLoadingStages}
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
                    options={classroomOptions.filter(
                      (opt) => !row.classroomIds.includes(opt.value)
                    )}
                    placeholder={
                      isLoadingClassrooms
                        ? t('common.loading')
                        : t('teachers.placement.selectClassrooms')
                    }
                    disabled={isLoadingClassrooms}
                  />
                  {row.classroomIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.classroomIds.map((classroomId) => (
                        <span
                          key={classroomId}
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                        >
                          {getClassroomName(classroomId)}
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
                        options={bookOptions}
                        placeholder={t('teachers.placement.selectBook')}
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
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.processing') : t('teachers.placement.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPlacementPopup open={showSuccessPopup} onClose={handleSuccessClose} />
    </Card>
  );
}
