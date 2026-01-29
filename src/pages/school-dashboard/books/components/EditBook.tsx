import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import { fetchBookById, updateBook } from '@/redux/features/books/booksSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { EditBookSchema, type EditBookProps } from '@/validations/books-validations';
import FileUpload from '@/shared/components/FileUpload';
import Loading from '@/shared/components/Loading';

// Package type options
const PACKAGE_TYPES = [
  { value: '1', labelKey: 'books.packageIndividual' },
  { value: '2', labelKey: 'books.packageSet' },
];

// Price view options: 1 = Individual (show price in each row), 2 = Set (show price below table)
const PRICE_VIEW_OPTIONS = [
  { value: '1', labelKey: 'books.priceViewOptions.individual' },
  { value: '2', labelKey: 'books.priceViewOptions.set' },
];

export default function EditBook() {
  const { t, i18n } = useTranslation();
  const { gradeBookId, bookId } = useParams<{ gradeBookId: string; bookId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const currentBook = useAppSelector((state) => state.books.currentBook);
  const isLoading = useAppSelector((state) => state.books.isLoading);
  const isUpdating = useAppSelector((state) => state.books.isUpdating);

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);

  const grades = useAppSelector((state) => state.educationalStages.educationalStages);
  const isLoadingGrades = useAppSelector((state) => state.educationalStages.isLoading);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(EditBookSchema),
    defaultValues: {
      lkSchoolStageId: '',
      materialId: '',
      name: '',
      nameEn: '',
      code: '',
      packageType: '1' as '1' | '2',
      setQuantity: undefined as number | undefined,
      priceView: '1' as '1' | '2',
      quantity: 0,
      price: 0,
    },
  });

  const watchedPackageType = watch('packageType');
  const watchedPriceView = watch('priceView');

  useEffect(() => {
    if (gradeBookId && bookId) {
      dispatch(fetchBookById({ bookId, gradeBookId }));
    }
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 100 }));
  }, [dispatch, gradeBookId, bookId]);

  // Populate form when book data is loaded
  useEffect(() => {
    if (currentBook) {
      reset({
        lkSchoolStageId: currentBook.gradeId || '',
        materialId: currentBook.materialId || '',
        name: currentBook.name || '',
        nameEn: '', // API doesn't return nameEn, would need to add if available
        code: currentBook.code || '',
        packageType: String(currentBook.packageType || 1) as '1' | '2',
        setQuantity: currentBook.number || undefined,
        priceView: String(currentBook.priceView || 1) as '1' | '2',
        quantity: currentBook.totalQuantity || 0,
        price: currentBook.price || 0,
      });
    }
  }, [currentBook, reset]);

  const onSubmit = async (data: EditBookProps) => {
    if (!bookId) return;

    try {
      await dispatch(
        updateBook({
          id: bookId,
          data: {
            id: bookId,
            name: data.name,
            nameEn: data.nameEn,
            code: data.code,
            price: data.price,
            priceView: data.packageType === '2' ? Number(data.priceView) || 1 : 1,
            totalQuantity: data.quantity,
            packageType: Number(data.packageType),
            number: data.packageType === '2' ? Number(data.setQuantity) || 0 : 0,
            gradeId: data.lkSchoolStageId,
            materialId: data.materialId,
            fileName: pdfFile?.name ?? currentBook?.fileName ?? '',
            file: pdfFile ?? undefined,
          },
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('books.bookUpdatedSuccessfully'),
      });
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : t('common.errorOccurred');
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Educational Stage and Subject */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Educational Stage */}
            <FormField
              label={t('books.educationalStage')}
              required
              error={errors.lkSchoolStageId?.message}
              htmlFor="lkSchoolStageId"
            >
              <Controller
                name="lkSchoolStageId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                    }}
                    options={grades.map((grade) => ({
                      value: grade.id,
                      label: currentLang === 'ar' ? grade.nameAr : grade.nameEn,
                    }))}
                    placeholder={
                      isLoadingGrades ? t('common.loading') : t('books.selectEducationalStage')
                    }
                    disabled={isLoadingGrades}
                    error={!!errors.lkSchoolStageId}
                    id="lkSchoolStageId"
                  />
                )}
              />
            </FormField>

            {/* Subject */}
            <FormField
              label={t('books.subjectName')}
              required
              error={errors.materialId?.message}
              htmlFor="materialId"
            >
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const val = Array.isArray(value) ? value[0] : value;
                      field.onChange(val);
                    }}
                    options={subjects.map((subject) => ({
                      value: subject.id,
                      label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
                    }))}
                    placeholder={isLoadingSubjects ? t('common.loading') : t('books.selectSubject')}
                    disabled={isLoadingSubjects}
                    error={!!errors.materialId}
                    id="materialId"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Book Names */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Book Name Arabic */}
            <FormField
              label={t('books.bookNameAr')}
              required
              error={errors.name?.message}
              htmlFor="name"
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('books.enterBookNameAr')}
                    className="w-full"
                    id="name"
                  />
                )}
              />
            </FormField>

            {/* Book Name English */}
            <FormField
              label={t('books.bookNameEn')}
              required
              error={errors.nameEn?.message}
              htmlFor="nameEn"
            >
              <Controller
                name="nameEn"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('books.enterBookNameEn')}
                    className="w-full"
                    id="nameEn"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Book Code and Package Type */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Book Code */}
            <FormField
              label={t('books.bookCode2')}
              required
              error={errors.code?.message}
              htmlFor="code"
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={t('books.enterBookCode2')}
                    className="w-full"
                    id="code"
                  />
                )}
              />
            </FormField>

            {/* Package Type */}
            <FormField
              label={t('books.packageType')}
              required
              error={errors.packageType?.message}
              htmlFor="packageType"
            >
              <div className="flex items-center gap-6 pt-2">
                {PACKAGE_TYPES.map((pkg) => (
                  <label key={pkg.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value={pkg.value}
                      checked={watchedPackageType === pkg.value}
                      onChange={() => setValue('packageType', pkg.value as '1' | '2')}
                      className="h-4 w-4 accent-green-600 focus:ring-green-500"
                    />
                    <span className="text-base text-black-800">{t(pkg.labelKey)}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>

          {/* Set-specific fields (only show when packageType is '2') */}
          {watchedPackageType === '2' && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Set Quantity */}
              <FormField
                label={t('books.setQuantity')}
                required
                error={errors.setQuantity?.message}
                htmlFor="setQuantity"
              >
                <Controller
                  name="setQuantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      placeholder={t('books.enterSetQuantity')}
                      className="w-full"
                      id="setQuantity"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(Math.max(0, Number(e.target.value)) || undefined)
                      }
                    />
                  )}
                />
              </FormField>

              {/* Price View */}
              <FormField
                label={t('books.priceView')}
                required
                error={errors.priceView?.message}
                htmlFor="priceView"
              >
                <div className="flex items-center gap-6 pt-2">
                  {PRICE_VIEW_OPTIONS.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        value={option.value}
                        checked={watchedPriceView === option.value}
                        onChange={() => setValue('priceView', option.value as '1' | '2')}
                        className="h-4 w-4 accent-green-600 focus:ring-green-500"
                      />
                      <span className="text-base text-black-800">{t(option.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>
          )}

          {/* Quantity and Price */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Quantity */}
            <FormField
              label={t('books.stock')}
              required
              error={errors.quantity?.message}
              htmlFor="quantity"
            >
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder={t('books.enterTotalQuantity')}
                    className="w-full"
                    id="quantity"
                    onChange={(e) => field.onChange(Math.max(0, Number(e.target.value)))}
                  />
                )}
              />
            </FormField>

            {/* Price */}
            <FormField
              label={t('books.bookPrice')}
              required
              error={errors.price?.message}
              htmlFor="price"
            >
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder={t('books.enterPrice')}
                    className="w-full"
                    id="price"
                    onChange={(e) => field.onChange(Math.max(0, Number(e.target.value)))}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Book PDF */}
          <div className="mb-6">
            <FileUpload
              label={t('books.uploadBook')}
              accept="application/pdf,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPdfFile(file);
                }
              }}
              onDelete={() => setPdfFile(null)}
              fileName={pdfFile?.name || currentBook?.fileName}
              uploadText={t('books.uploadBookFile')}
              formatHints={['PDF', 'JPG', 'PNG']}
              id="bookPdf"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isUpdating}>
              {isSubmitting || isUpdating ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>

      {/* Popup Message */}
      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
      />
    </Card>
  );
}
