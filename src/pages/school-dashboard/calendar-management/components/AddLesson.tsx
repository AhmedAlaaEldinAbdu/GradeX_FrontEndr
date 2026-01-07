import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import FileUpload from '@/shared/components/FileUpload';
import PopupMessage from '@/shared/popups/PopupMessage';
import SelectStudentsPopup, { type Student } from '../popups/SelectStudentsPopup';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CustomImage from '@/shared/components/CustomImage';

// Demo options for selects (will be replaced with API data)
const subjectOptions = [
  { value: 'arabic', label: 'العربي' },
  { value: 'math', label: 'الرياضيات' },
  { value: 'science', label: 'العلوم' },
  { value: 'english', label: 'الإنجليزية' },
];

const teacherOptions = [
  { value: '1', label: 'معتز أحمد محمد' },
  { value: '2', label: 'أحمد حسن رجب' },
  { value: '3', label: 'محمد علي' },
];

const bookOptions = [
  { value: '1', label: 'قصة دمية' },
  { value: '2', label: 'كتاب العربي الأساسي' },
  { value: '3', label: 'كتاب الرياضيات' },
];

interface AddLessonFormData {
  subjectId: string;
  teacherId: string;
  bookId: string;
  classworkFromPage: string;
  classworkToPage: string;
  classworkPageNumber: string;
  homeworkFromPage: string;
  homeworkToPage: string;
  homeworkPageNumber: string;
  descriptionAr: string;
  descriptionEn: string;
  sendTo: 'all' | 'specific';
}

export default function AddLesson() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get day and period from URL params if available
  const dayIndex = searchParams.get('day');
  const periodIndex = searchParams.get('period');

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all');
  const [attachmentFileNames, setAttachmentFileNames] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isSelectStudentsPopupOpen, setIsSelectStudentsPopupOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddLessonFormData>({
    defaultValues: {
      subjectId: '',
      teacherId: '',
      bookId: '',
      classworkFromPage: '',
      classworkToPage: '',
      classworkPageNumber: '',
      homeworkFromPage: '',
      homeworkToPage: '',
      homeworkPageNumber: '',
      descriptionAr: '',
      descriptionEn: '',
      sendTo: 'all',
    },
  });

  const onSubmit = async (data: AddLessonFormData) => {
    try {
      // TODO: Implement actual API call
      console.log('Form data:', data, 'Day:', dayIndex, 'Period:', periodIndex);
      console.log('Attachments:', attachmentFileNames);
      console.log('Selected Students:', selectedStudents);

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('addLesson.lessonAddedSuccessfully'),
      });
    } catch {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: t('common.errorOccurred'),
      });
    }
  };

  const handleCancel = () => {
    navigate('/school/calendar/weekly');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newFileNames = newFiles.map((file) => file.name);
      setAttachmentFileNames((prev) => [...prev, ...newFileNames]);
    }
  };

  const handleFileDelete = (index?: number) => {
    if (index !== undefined) {
      setAttachmentFileNames((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAttachmentFileNames([]);
    }
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Subject Name & Teacher Name */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Subject Name */}
              <FormField
                label={t('addLesson.subjectName')}
                required
                error={errors.subjectId?.message}
                htmlFor="subjectId"
              >
                <Controller
                  name="subjectId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={subjectOptions}
                      placeholder={t('addLesson.selectSubject')}
                    />
                  )}
                />
              </FormField>

              {/* Teacher Name */}
              <FormField
                label={t('addLesson.teacherName')}
                required
                error={errors.teacherId?.message}
                htmlFor="teacherId"
              >
                <Controller
                  name="teacherId"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={teacherOptions}
                      placeholder={t('addLesson.selectTeacher')}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Book Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('addLesson.book')}
            </h3>
            <FormField label={t('addLesson.bookName')} htmlFor="bookId">
              <Controller
                name="bookId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={bookOptions}
                    placeholder={t('addLesson.selectBook')}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Classwork Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('addLesson.classwork')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* From Page */}
              <FormField label={t('addLesson.fromPage')} htmlFor="classworkFromPage">
                <Controller
                  name="classworkFromPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.pageNumber')}
                      id="classworkFromPage"
                    />
                  )}
                />
              </FormField>

              {/* To Page */}
              <FormField label={t('addLesson.toPage')} htmlFor="classworkToPage">
                <Controller
                  name="classworkToPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.pageNumber')}
                      id="classworkToPage"
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Homework Section */}
          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-4 text-start text-sm font-semibold text-gray-700">
              {t('addLesson.homework')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* From Page */}
              <FormField label={t('addLesson.fromPage')} htmlFor="homeworkFromPage">
                <Controller
                  name="homeworkFromPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.pageNumber')}
                      id="homeworkFromPage"
                    />
                  )}
                />
              </FormField>

              {/* To Page */}
              <FormField label={t('addLesson.toPage')} htmlFor="homeworkToPage">
                <Controller
                  name="homeworkToPage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.pageNumber')}
                      id="homeworkToPage"
                    />
                  )}
                />
              </FormField>
            </div>

            {/* Descriptions */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Description Arabic */}
              <FormField label={t('addLesson.descriptionAr')} htmlFor="descriptionAr">
                <Controller
                  name="descriptionAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.enterDescription')}
                      id="descriptionAr"
                    />
                  )}
                />
              </FormField>

              {/* Description English */}
              <FormField label={t('addLesson.descriptionEn')} htmlFor="descriptionEn">
                <Controller
                  name="descriptionEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder={t('addLesson.enterDescription')}
                      id="descriptionEn"
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Send To Section */}
          <div className="mb-6">
            <FormField label={t('addLesson.sendTo')} required htmlFor="sendTo">
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    value="all"
                    checked={sendTo === 'all'}
                    onChange={() => {
                      setSendTo('all');
                      setSelectedStudents([]);
                    }}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('addLesson.all')}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    value="specific"
                    checked={sendTo === 'specific'}
                    onChange={() => {
                      setSendTo('specific');
                      setIsSelectStudentsPopupOpen(true);
                    }}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-sm text-gray-700">{t('addLesson.specificStudents')}</span>
                </label>
              </div>
            </FormField>

            {/* Selected students indicator */}
            {sendTo === 'specific' && selectedStudents.length > 0 && (
              <div
                className="mt-3 flex cursor-pointer items-center gap-2"
                onClick={() => setIsSelectStudentsPopupOpen(true)}
              >
                {/* Stacked Avatars */}
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {selectedStudents.slice(0, 3).map((student, index) => (
                    <div
                      key={student.id}
                      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100"
                      style={{ zIndex: 3 - index }}
                    >
                      <CustomImage
                        src={student.avatar || DefaultAvatar}
                        alt={student.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {selectedStudents.length > 3 && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200"
                      style={{ zIndex: 0 }}
                    >
                      <span className="text-xs text-gray-600">+{selectedStudents.length - 3}</span>
                    </div>
                  )}
                </div>
                {/* First student name or count */}
                <span className="text-sm text-gray-600">
                  {selectedStudents.length === 1
                    ? selectedStudents[0].name
                    : t('addLesson.studentsSelected', { count: selectedStudents.length })}
                </span>
              </div>
            )}

            {/* Button to open popup when specific is selected but no students yet */}
            {sendTo === 'specific' && selectedStudents.length === 0 && (
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setIsSelectStudentsPopupOpen(true)}
                >
                  {t('addLesson.selectStudentsButton')}
                </Button>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="mb-6">
            <FileUpload
              label={t('addLesson.attachments')}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/svg+xml,application/pdf"
              onChange={handleFileChange}
              onDelete={handleFileDelete}
              fileNames={attachmentFileNames}
              uploadText={t('addLesson.clickToUpload')}
              formatHints={['GIF', 'SVG', 'JPG', 'PNG', 'PDF']}
              optional={true}
              multiple={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.add')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success/Error Popup */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        onClose={() => {
          setShowPopupMessage({ show: false, type: 'success', message: '' });
          if (showPopupMessage.type === 'success') {
            navigate('/school/calendar/weekly');
          }
        }}
      />

      {/* Select Students Popup */}
      <SelectStudentsPopup
        isOpen={isSelectStudentsPopupOpen}
        onClose={() => setIsSelectStudentsPopupOpen(false)}
        onConfirm={(students) => setSelectedStudents(students)}
        initialSelectedStudents={selectedStudents}
      />
    </>
  );
}
