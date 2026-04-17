import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import {
  addPreparation,
  editPreparation,
  fetchPreparationById,
} from '@/redux/features/preparations/preparationsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchBooks } from '@/redux/features/books/booksSlice';
import type { CreatePreparationRequest, UpdatePreparationRequest } from '@/types/preparations';

import * as yup from 'yup';
import {
  preparationValidationSchema,
  validatePreparationForm,
  type PreparationFormValidation,
} from '@/validations/preparations-validations';

import { useFormDraft } from '@/hooks/useFormDraft';
import { tokenManager } from '@/lib/auth/token-manager';
import Card from '@/shared/components/Card';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import FileUpload, { type FileUploadRef } from '@/shared/components/FileUpload';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { useToast } from '@/shared/context/ToastContext';
import Loading from '@/shared/components/Loading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface PreparationFormProps {
  isEditMode?: boolean;
}

export default function PreparationForm({ isEditMode = false }: PreparationFormProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const { educationalStages } = useSelector((state: RootState) => state.educationalStages);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  const { subjects } = useSelector((state: RootState) => state.subjects);
  const { flattenedBooks } = useSelector((state: RootState) => state.books);
  const { isCreating, isUpdating, isLoading, currentPreparation } = useSelector(
    (state: RootState) => state.preparations
  );

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  useEffect(() => {
    dispatch(getEducationalStages({ schoolBranchId, pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchSubjects({ limit: 1000 }));
    dispatch(fetchBooks({ limit: 100 }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchPreparationById(id));
    }
  }, [isEditMode, id, dispatch]);

  const [date, setDate] = useState('');
  const [preparationNumber, setPreparationNumber] = useState('');
  const [educationalStage, setEducationalStage] = useState('');
  const [grades, setGrades] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [bookName, setBookName] = useState('');
  const [fromPage, setFromPage] = useState('');
  const [toPage, setToPage] = useState('');
  const [content, setContent] = useState('');
  const fileUploadRef = useRef<FileUploadRef>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (educationalStage) {
      dispatch(
        fetchClassrooms({ filters: { gradeId: educationalStage, schoolBranchId: '' }, limit: 1000 })
      );
    }
  }, [dispatch, educationalStage]);

  const { draftData, isDraftLoaded, saveDraft, clearDraft } = useFormDraft<{
    date: string;
    preparationNumber: string;
    educationalStage: string;
    grades: string[];
    subject: string;
    topic: string;
    bookName: string;
    fromPage: string;
    toPage: string;
    content: string;
  }>('preparation_form_draft');

  useEffect(() => {
    // Only restore if the draft exists, we're not in edit mode, and the current topic is empty
    // this avoids duplicate toast notifications and overwriting user data if they started typing
    if (!isEditMode && isDraftLoaded && draftData && !topic) {
      if (draftData.date) setDate(draftData.date);
      if (draftData.preparationNumber) setPreparationNumber(draftData.preparationNumber);
      if (draftData.educationalStage) setEducationalStage(draftData.educationalStage);
      if (draftData.grades) setGrades(draftData.grades);
      if (draftData.subject) setSubject(draftData.subject);
      if (draftData.topic) setTopic(draftData.topic);
      if (draftData.bookName) setBookName(draftData.bookName);
      if (draftData.fromPage) setFromPage(draftData.fromPage);
      if (draftData.toPage) setToPage(draftData.toPage);
      if (draftData.content) setContent(draftData.content);

      showToast({ message: t('preparations.form.draftLoaded'), type: 'info' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraftLoaded, isEditMode, draftData]);

  const handleBlur = async (field: keyof PreparationFormValidation, value: any) => {
    try {
      const schema = yup.reach(preparationValidationSchema, field);
      if (schema && 'validate' in schema) {
        await (schema as yup.Schema).validate(value);
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [field]: t(err.message) }));
    }
  };

  useEffect(() => {
    if (isEditMode && currentPreparation) {
      if (currentPreparation.preparationDate) {
        setDate(currentPreparation.preparationDate.split('T')[0]);
      }
      setPreparationNumber(currentPreparation.preparationNumber?.toString() || '');
      setEducationalStage(currentPreparation.gradeId || '');
      // Map the array of classrooms to an array of classRoomIds
      if (currentPreparation.classRooms) {
        setGrades(currentPreparation.classRooms.map((c) => c.classRoomId || c.id));
      }
      setSubject(currentPreparation.materialId || '');
      setTopic(currentPreparation.topic || '');
      setBookName(currentPreparation.bookId || '');
      setFromPage(currentPreparation.fromPage?.toString() || '');
      setToPage(currentPreparation.toPage?.toString() || '');
      setContent(currentPreparation.content || '');
    }
  }, [isEditMode, currentPreparation]);

  // Options from API data
  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name || s.nameEn || '',
  }));

  // Get unique books from flattenedBooks
  const bookOptions = Array.from(
    new Map(flattenedBooks.map((b) => [b.id, { value: b.id, label: b.name }])).values()
  );

  const handleSave = async () => {
    try {
      const validationResult = await validatePreparationForm({
        date,
        preparationNumber,
        educationalStage,
        grades,
        subject,
        topic,
        content,
      });

      if (!validationResult.isValid) {
        const translatedErrors: Record<string, string> = {};
        for (const [key, msg] of Object.entries(validationResult.errors)) {
          translatedErrors[key] = t(msg as string);
        }
        setErrors(translatedErrors);
        return;
      }

      const data: CreatePreparationRequest | UpdatePreparationRequest = {
        schoolBranchId,
        preparationNumber: parseInt(preparationNumber),
        preparationDate: new Date(date).toISOString(),
        gradeId: educationalStage,
        classRoomIds: grades,
        materialId: subject,
        topic,
        content,
        bookId: bookName,
        fromPage: fromPage ? parseInt(fromPage) : undefined,
        toPage: toPage ? parseInt(toPage) : undefined,
        attachments: fileUploadRef.current?.getFiles() ?? [],
      };

      if (isEditMode && id) {
        (data as UpdatePreparationRequest).id = id;
        const resultAction = await dispatch(
          editPreparation(data as UpdatePreparationRequest)
        ).unwrap();
        if (resultAction.success) {
          setShowSuccessPopup(true);
        }
      } else {
        const resultAction = await dispatch(
          addPreparation(data as CreatePreparationRequest)
        ).unwrap();
        if (resultAction.success) {
          clearDraft();
          setShowSuccessPopup(true);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const message = typeof err === 'string' ? err : t('common.errorOccurred');
      showToast({
        message,
        type: 'error',
        isRaw: typeof err === 'string',
      });
    }
  };

  const handleReset = () => {
    setDate('');
    setPreparationNumber('');
    setEducationalStage('');
    setGrades([]);
    setSubject('');
    setTopic('');
    setBookName('');
    setFromPage('');
    setToPage('');
    setContent('');
    fileUploadRef.current?.reset();
    setErrors({});
    clearDraft();
    showToast({ message: t('preparations.form.formResetSuccess'), type: 'success' });
  };

  if (isEditMode && isLoading) {
    return <Loading />;
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-white p-6 shadow-sm">
        <form className="space-y-8">
          <div className="space-y-6">
            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.preparationNumber')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={preparationNumber}
                min={1}
                onChange={(e) => {
                  setPreparationNumber(e.target.value);
                  if (errors.preparationNumber) handleBlur('preparationNumber', e.target.value);
                }}
                onBlur={() => handleBlur('preparationNumber', preparationNumber)}
                error={errors.preparationNumber}
                placeholder={t('preparations.form.preparationNumberPlaceholder')}
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.date')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) handleBlur('date', e.target.value);
                }}
                onBlur={() => handleBlur('date', date)}
                error={errors.date}
                placeholder={t('preparations.form.datePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                  {t('preparations.form.educationalStage')} <span className="text-red-500">*</span>
                </label>
                <div
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      handleBlur('educationalStage', educationalStage);
                    }
                  }}
                >
                  <CustomSelect
                    value={educationalStage}
                    onChange={(val) => {
                      setEducationalStage(val as string);
                      setGrades([]);
                      if (errors.educationalStage) handleBlur('educationalStage', val);
                    }}
                    options={educationalStages.map((stage) => ({
                      value: stage.id,
                      label: stage.nameAr || stage.nameEn || '',
                    }))}
                    error={!!errors.educationalStage}
                    placeholder={t('preparations.form.educationalStagePlaceholder')}
                  />
                  {errors.educationalStage && (
                    <p className="mt-1 text-start text-sm text-red-500">
                      {errors.educationalStage}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                  {t('preparations.form.grades')} <span className="text-red-500">*</span>
                </label>
                <div
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      handleBlur('grades', grades);
                    }
                  }}
                >
                  <CustomSelect
                    isMulti
                    value={grades}
                    onChange={(val) => {
                      setGrades(val as string[]);
                      if (errors.grades) handleBlur('grades', val);
                    }}
                    options={classrooms.map((c) => ({
                      value: c.id,
                      label: `${c.name || ''} ${c.nameEn || ''}`.trim(),
                    }))}
                    error={!!errors.grades}
                    placeholder={t('preparations.form.gradesPlaceholder')}
                  />
                  {errors.grades && (
                    <p className="mt-1 text-start text-sm text-red-500">{errors.grades}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.subject')} <span className="text-red-500">*</span>
              </label>
              <div
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    handleBlur('subject', subject);
                  }
                }}
              >
                <CustomSelect
                  value={subject}
                  onChange={(val) => {
                    setSubject(val as string);
                    if (errors.subject) handleBlur('subject', val);
                  }}
                  options={subjectOptions}
                  error={!!errors.subject}
                  placeholder={t('preparations.form.subjectPlaceholder')}
                />
                {errors.subject && (
                  <p className="mt-1 text-start text-sm text-red-500">{errors.subject}</p>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.topic')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (errors.topic) handleBlur('topic', e.target.value);
                }}
                onBlur={() => handleBlur('topic', topic)}
                error={errors.topic}
                placeholder={t('preparations.form.topicPlaceholder')}
              />
            </div>

            {/* Book Section */}
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="mb-4 text-start text-sm font-medium text-gray-900">
                {t('preparations.form.bookSection.title')}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-start text-sm font-medium text-gray-500">
                    {t('preparations.form.bookSection.bookName')}
                  </label>
                  <CustomSelect
                    value={bookName}
                    onChange={(val) => setBookName(val as string)}
                    options={bookOptions}
                    placeholder={t('preparations.form.bookSection.bookNamePlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-start text-sm font-medium text-gray-500">
                      {t('preparations.form.bookSection.fromPage')}
                    </label>
                    <Input
                      type="number"
                      value={fromPage}
                      min={1}
                      onChange={(e) => setFromPage(e.target.value)}
                      placeholder={t('preparations.form.bookSection.fromPagePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-start text-sm font-medium text-gray-500">
                      {t('preparations.form.bookSection.toPage')}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                      placeholder={t('preparations.form.bookSection.toPagePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.content')} <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex flex-col overflow-hidden rounded-lg border ${errors.content ? 'border-red-500' : 'border-gray-200'}`}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    handleBlur('content', content);
                  }
                }}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={(val) => {
                    setContent(val === '<p><br></p>' ? '' : val);
                    if (errors.content) handleBlur('content', val);
                  }}
                  placeholder={t('preparations.form.contentPlaceholder')}
                  className={`bg-white [&_.ql-editor]:min-h-[150px] ${isRTL ? '[&_.ql-editor]:text-right [&_.ql-editor]:[direction:rtl]' : '[&_.ql-editor]:text-left [&_.ql-editor]:[direction:ltr]'}`}
                  modules={{
                    toolbar: [
                      [{ font: [] }],
                      [{ size: ['small', false, 'large', 'huge'] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ color: [] }, { background: [] }],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ align: [] }, { direction: 'rtl' }],
                      ['clean'],
                    ],
                  }}
                />
                {errors.content && (
                  <div className="flex items-center justify-between p-2 text-xs">
                    <span className="text-start text-red-500">{errors.content}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <FileUpload
                ref={fileUploadRef}
                label={t('preparations.form.attachments')}
                uploadText={t('tasksManagement.form.uploadAttachment')}
                multiple
                attachments={isEditMode ? currentPreparation?.attachments : undefined}
              />
            </div>
          </div>
        </form>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              if (isEditMode) {
                navigate('/calendar/preparations');
              } else {
                handleReset();
              }
            }}
            className="px-8"
          >
            {isEditMode
              ? t('preparations.form.actions.cancel')
              : t('preparations.form.actions.reset')}
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              saveDraft({
                date,
                preparationNumber,
                educationalStage,
                grades,
                subject,
                topic,
                bookName,
                fromPage,
                toPage,
                content,
              });
              showToast({ message: t('preparations.form.draftSaved'), type: 'success' });
            }}
            className="px-8"
          >
            {t('preparations.form.actions.draft')}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave()}
            disabled={isSubmitting}
            className={`bg-[#005B48] px-8 ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting
              ? t('common.saving')
              : isEditMode
                ? t('common.saveChanges')
                : t('common.save')}
          </Button>
        </div>
      </Card>

      {/* Success Popup */}
      <PopupMessage
        open={showSuccessPopup}
        type="success"
        message={isEditMode ? 'actions.successEdit' : 'actions.successAdd'}
        iconSrc={BigSuccessIcon}
        autoClose={true}
        duration={1500}
        onClose={() => {
          setShowSuccessPopup(false);
          navigate('/calendar/preparations');
        }}
      />
    </div>
  );
}
