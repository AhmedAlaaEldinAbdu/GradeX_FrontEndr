import { useState, useEffect } from 'react';
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
import type { CreatePreparationRequest, UpdatePreparationRequest } from '@/types/preparations';

import * as yup from 'yup';
import {
  preparationValidationSchema,
  validatePreparationForm,
  type PreparationFormValidation,
} from '@/validations/preparations-validations';

import Card from '@/shared/components/Card';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';

interface PreparationFormProps {
  isEditMode?: boolean;
}

export default function PreparationForm({ isEditMode = false }: PreparationFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const { educationalStages } = useSelector((state: RootState) => state.educationalStages);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  const { isCreating, isUpdating, isLoading, currentPreparation } = useSelector(
    (state: RootState) => state.preparations
  );

  const schoolBranchId = '560581d1-5f5a-4ec7-5f29-08de6be7bc5a';

  useEffect(() => {
    dispatch(getEducationalStages({ schoolBranchId, pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchClassrooms({ filters: { schoolBranchId }, limit: 1000 }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchPreparationById(id));
    }
  }, [isEditMode, id, dispatch]);

  const [date, setDate] = useState('');
  const [educationalStage, setEducationalStage] = useState('');
  const [grades, setGrades] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [bookName, setBookName] = useState('');
  const [fromPage, setFromPage] = useState('');
  const [toPage, setToPage] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBlur = async (field: keyof PreparationFormValidation, value: any) => {
    try {
      await yup.reach(preparationValidationSchema, field).validate(value);
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

  // Mock Options mapped with default values or API matches from cURL
  const subjectOptions = [
    { value: '45e85024-f17f-4c43-b6ab-08de2240f2fc', label: 'اللغة العربية' },
    { value: 'english', label: 'اللغة الإنجليزية' },
  ];

  const bookOptions = [
    { value: 'f095c5c9-68aa-4e65-8eea-08de22252ef9', label: 'كتاب 1' },
    { value: 'book2', label: 'كتاب 2' },
  ];

  const handleSave = async () => {
    try {
      const validationResult = await validatePreparationForm({
        date,
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
        preparationDate: new Date(date).toISOString(),
        gradeId: educationalStage,
        classRoomIds: grades,
        materialId: subject,
        topic,
        content,
        bookId: bookName,
        fromPage: fromPage ? parseInt(fromPage) : undefined,
        toPage: toPage ? parseInt(toPage) : undefined,
        attachments: files,
      };

      if (isEditMode && id) {
        (data as UpdatePreparationRequest).id = id;
        const resultAction = await dispatch(
          editPreparation(data as UpdatePreparationRequest)
        ).unwrap();
        if (resultAction.success) {
          navigate('/calendar/preparations');
        }
      } else {
        const resultAction = await dispatch(
          addPreparation(data as CreatePreparationRequest)
        ).unwrap();
        if (resultAction.success) {
          navigate('/calendar/preparations');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dummy toolbar for rich text area
  const renderEditorToolbar = () => (
    <div className="flex items-center gap-4 rounded-t-lg border-b border-gray-200 bg-gray-50/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <button className="hover:text-black text-gray-500">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
        <select className="bg-transparent text-sm text-gray-700 outline-none">
          <option>Roboto</option>
          <option>Arial</option>
        </select>
        <select className="bg-transparent text-sm text-gray-700 outline-none">
          <option>16px</option>
          <option>14px</option>
          <option>18px</option>
        </select>
      </div>
      <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
        <button className="font-bold text-gray-700">B</button>
        <button className="italic text-gray-700">I</button>
        <button className="text-gray-700 underline">U</button>
        <button className="text-gray-700 line-through">S</button>
      </div>
      <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
        <button className="text-gray-700">≡</button>
        <button className="text-gray-700">≡</button>
        <button className="text-gray-700">≡</button>
        <button className="text-gray-700">≡</button>
      </div>
      <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
        <button className="text-gray-700">¶</button>
      </div>
      <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
        <button className="text-gray-700">1.</button>
        <button className="text-gray-700">•</button>
      </div>
    </div>
  );

  if (isEditMode && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#005B48]"></div>
      </div>
    );
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl bg-white p-6 shadow-sm">
        <form className="space-y-8">
          <div className="space-y-6">
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
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                      placeholder={t('preparations.form.bookSection.toPagePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Textareas (Mocks) */}
            <div>
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.content')} <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex flex-col overflow-hidden rounded-lg border ${errors.content ? 'border-red-500' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-green-500`}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    handleBlur('content', content);
                  }
                }}
              >
                {renderEditorToolbar()}
                <textarea
                  className="min-h-[120px] w-full resize-y p-4 outline-none"
                  placeholder={t('preparations.form.contentPlaceholder')}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) handleBlur('content', e.target.value);
                  }}
                />
                <div className="flex items-center justify-between p-2 text-xs">
                  {errors.content ? (
                    <span className="text-start text-red-500">{errors.content}</span>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-gray-400">0/2000</span>
                </div>
              </div>
            </div>

            <div>
              <FileUpload
                label={t('preparations.form.attachments')}
                uploadText={t('tasksManagement.form.uploadAttachment')}
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
                multiple={true}
              />
            </div>
          </div>
        </form>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditMode) {
                navigate('/calendar/preparations');
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
            onClick={() => {
              // Draft logic
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
    </div>
  );
}
