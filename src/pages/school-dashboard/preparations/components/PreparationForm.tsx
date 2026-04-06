import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { addPreparation } from '@/redux/features/preparations/preparationsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import type { CreatePreparationRequest } from '@/types/preparations';

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

  const dispatch = useDispatch<AppDispatch>();

  const { educationalStages } = useSelector((state: RootState) => state.educationalStages);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  const { isCreating } = useSelector((state: RootState) => state.preparations);

  const schoolBranchId = '560581d1-5f5a-4ec7-5f29-08de6be7bc5a';

  useEffect(() => {
    dispatch(getEducationalStages({ schoolBranchId, pageIndex: 1, pageSize: 1000 }));
    dispatch(fetchClassrooms({ filters: { schoolBranchId }, limit: 1000 }));
  }, [dispatch, schoolBranchId]);

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
      const data: CreatePreparationRequest = {
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

      const resultAction = await dispatch(addPreparation(data)).unwrap();
      if (resultAction.success) {
        navigate('/calendar/preparations');
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
                onChange={(e) => setDate(e.target.value)}
                placeholder={t('preparations.form.datePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                  {t('preparations.form.educationalStage')} <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={educationalStage}
                  onChange={(val) => setEducationalStage(val as string)}
                  options={educationalStages.map((stage) => ({
                    value: stage.id,
                    label: stage.nameAr || stage.nameEn || '',
                  }))}
                  placeholder={t('preparations.form.educationalStagePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                  {t('preparations.form.grades')} <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  isMulti
                  value={grades}
                  onChange={(val) => setGrades(val as string[])}
                  options={classrooms.map((c) => ({
                    value: c.id,
                    label: `${c.name || ''} ${c.nameEn || ''}`.trim(),
                  }))}
                  placeholder={t('preparations.form.gradesPlaceholder')}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.subject')} <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={subject}
                onChange={(val) => setSubject(val as string)}
                options={subjectOptions}
                placeholder={t('preparations.form.subjectPlaceholder')}
              />
            </div>

            <div className="w-full">
              <label className="mb-2 block text-start text-sm font-medium text-gray-700">
                {t('preparations.form.topic')} <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
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
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-green-500">
                {renderEditorToolbar()}
                <textarea
                  className="min-h-[120px] w-full resize-y p-4 outline-none"
                  placeholder={t('preparations.form.contentPlaceholder')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="p-2 text-left text-xs text-gray-400">0/2000</div>
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
            disabled={isCreating}
            className={`bg-[#005B48] px-8 ${isCreating ? 'opacity-50' : ''}`}
          >
            {isCreating
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
