import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import PopupMessage from '@/shared/popups/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import { addBook, fetchBooks } from '@/redux/features/books/booksSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import type { FlattenedBook } from '@/types/books';
import { AddBookSchema, type AddBookProps } from '@/validations/books-validations';
import FileUpload from '@/shared/components/FileUpload';
import DataTable, { type DataTableColumn } from '@/shared/components/DataTable';
import CustomImage from '@/shared/components/CustomImage';

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

// Book item interface for the preview table
interface BookItem {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  quantity: number;
  price: number;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function AddBook() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Books list for preview table
  const [books, setBooks] = useState<BookItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isCreating = useAppSelector((state) => state.books.isCreating);

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
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(AddBookSchema),
    mode: 'onBlur',
    defaultValues: {
      restorePreviousCurriculum: 'no' as const,
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

  const watchedRestoreCurriculum = watch('restorePreviousCurriculum');
  const watchedPackageType = watch('packageType');
  const watchedPriceView = watch('priceView');
  const watchedLkSchoolStageId = watch('lkSchoolStageId');
  const watchedMaterialId = watch('materialId');
  const watchedName = watch('name');
  const watchedQuantity = watch('quantity');
  const watchedPrice = watch('price');
  const watchedSetQuantity = watch('setQuantity');

  // Existing books from API
  const existingBooks = useAppSelector((state) => state.books.flattenedBooks);
  const isLoadingExistingBooks = useAppSelector((state) => state.books.isLoading);

  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 100 }));
  }, [dispatch]);

  // Fetch existing books when gradeId or materialId changes
  useEffect(() => {
    // Only fetch if at least one filter is selected
    if (watchedLkSchoolStageId || watchedMaterialId) {
      const filters: { gradeId?: string; materialId?: string } = {};

      if (watchedLkSchoolStageId) {
        filters.gradeId = watchedLkSchoolStageId;
      }
      if (watchedMaterialId) {
        filters.materialId = watchedMaterialId;
      }

      dispatch(
        fetchBooks({
          page: 1,
          limit: 100,
          filters,
        })
      );
    }
  }, [dispatch, watchedLkSchoolStageId, watchedMaterialId]);

  // Get selected stage and subject names
  const selectedGrade = grades.find((g) => g.id === watchedLkSchoolStageId);
  const selectedSubject = subjects.find((s) => s.id === watchedMaterialId);
  const gradeName = selectedGrade
    ? currentLang === 'ar'
      ? selectedGrade.nameAr
      : selectedGrade.nameEn
    : '';
  const subjectName = selectedSubject
    ? currentLang === 'ar'
      ? selectedSubject.name
      : selectedSubject.nameEn || selectedSubject.name
    : '';

  // Calculate total price from form data and books list
  // For set package, multiply by setQuantity
  const setQty = watchedPackageType === '2' && watchedSetQuantity ? watchedSetQuantity : 1;
  const formBookPrice = (watchedPrice || 0) * (watchedQuantity || 0) * setQty;
  const booksListPrice = books.reduce((sum, book) => sum + book.price * book.quantity, 0);
  const totalPrice = formBookPrice + booksListPrice;

  // Check if form has enough data to show preview
  const hasFormData = watchedName && watchedQuantity > 0 && watchedPrice > 0;

  // Generate preview rows - duplicate based on setQuantity for package type 2
  const generatePreviewRows = (): BookItem[] => {
    if (!hasFormData) return [];

    const baseBook = {
      name: watchedName,
      nameEn: getValues('nameEn') || '',
      code: getValues('code') || '',
      quantity: watchedQuantity,
      price: watchedPrice,
      imageFile: imageFile,
      imagePreview: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    // For set package with setQuantity > 1, create multiple rows
    if (watchedPackageType === '2' && watchedSetQuantity && watchedSetQuantity > 1) {
      return Array.from({ length: watchedSetQuantity }, (_, index) => ({
        ...baseBook,
        id: `current-form-${index + 1}`,
        name: `${watchedName} ${index + 1}`,
        nameEn: baseBook.nameEn ? `${baseBook.nameEn} ${index + 1}` : '',
      }));
    }

    // Single row for individual package or setQuantity = 1
    return [{ ...baseBook, id: 'current-form' }];
  };

  // Preview data combining current form entry with books list
  const previewData: BookItem[] = [
    ...generatePreviewRows(),
    // Plus any books already added to the list
    ...books,
  ];

  const onSubmit = async (data: AddBookProps) => {
    try {
      // Submit the book from form data
      await dispatch(
        addBook({
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
          fileName: imageFile?.name ?? '',
          filePath: '',
          file: imageFile ?? undefined,
        })
      ).unwrap();

      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t('books.booksAddedSuccessfully'),
      });

      // Reset form
      reset();
      setBooks([]);
      setImageFile(null);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : t('common.errorOccurred');
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage,
      });
    }
  };

  // Preview table columns
  // Always show the entered price in the table.
  // If packageType is Set and priceView is Set, we additionally show the total footer below.
  const showTotalFooter = watchedPackageType === '2' && watchedPriceView === '2';

  const previewColumns: DataTableColumn<BookItem>[] = [
    {
      header: '#',
      accessor: (_row, index) => (index ?? 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'books.bookName',
      accessor: (row) => <span>{currentLang === 'ar' ? row.name : row.nameEn || row.name}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'books.bookCode2',
      accessor: (row) => <span>{row.code || '-'}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'books.bookFile',
      accessor: (row) =>
        row.imagePreview ? (
          <CustomImage src={BookIcon} alt={row.name} className="mx-auto h-8 w-8" />
        ) : (
          <span className="text-gray-400">-</span>
        ),
      headerClassName: 'min-w-[110px]',
      className: 'text-center',
    },
    {
      header: 'books.stock',
      accessor: (row) => <span>{row.quantity}</span>,
      headerClassName: 'min-w-[80px]',
      className: 'text-center',
    },
    {
      header: 'books.bookPrice',
      accessor: (row) => <span>{row.price}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  // Existing books table columns (from API)
  const existingBooksColumns: DataTableColumn<FlattenedBook>[] = [
    {
      header: '#',
      accessor: (_row, index) => (index ?? 0) + 1,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'books.bookName',
      accessor: (row) => <span>{row.name}</span>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'books.bookCode2',
      accessor: (row) => <span>{row.code || '-'}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
    {
      header: 'books.stock',
      accessor: (row) => <span>{row.totalQuantity}</span>,
      headerClassName: 'min-w-[80px]',
      className: 'text-center',
    },
    {
      header: 'books.bookPrice',
      accessor: (row) => <span>{row.price}</span>,
      headerClassName: 'min-w-[100px]',
      className: 'text-center',
    },
  ];

  return (
    <Card>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Restore Previous Curriculum */}
          <div className="mb-6">
            <FormField
              label={t('books.restorePreviousCurriculum')}
              required
              htmlFor="restorePreviousCurriculum"
            >
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="no"
                    checked={watchedRestoreCurriculum === 'no'}
                    onChange={() => setValue('restorePreviousCurriculum', 'no')}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-black-800">{t('common.no')}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="yes"
                    checked={watchedRestoreCurriculum === 'yes'}
                    onChange={() => setValue('restorePreviousCurriculum', 'yes')}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-base text-black-800">{t('common.yes')}</span>
                </label>
              </div>
            </FormField>
          </div>

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
                  setImageFile(file);
                }
              }}
              onDelete={() => setImageFile(null)}
              fileName={imageFile?.name}
              uploadText={t('books.uploadBookFile')}
              formatHints={['PDF', 'JPG', 'PNG']}
              id="bookPdf"
            />
          </div>

          {/* Preview Table (shows current form data as preview) */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <DataTable
                columns={previewColumns}
                data={previewData}
                keyExtractor={(row) => row.id}
                isLoading={false}
                emptyMessage={t('books.noBooks')}
                t={t}
              />

              {/* Total Price - only show for Set package with Set price view */}
              {showTotalFooter && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-lg font-semibold">{t('books.total')}</span>
                  <span className="text-lg font-semibold text-green-600">{totalPrice}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting || isCreating}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || isCreating}>
              {isSubmitting || isCreating ? t('common.saving') : t('common.add')}
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Books Section (based on selected stage and/or subject) */}
      {(watchedLkSchoolStageId || watchedMaterialId) && (
        <div className="mt-8 border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold">
            {subjectName && gradeName ? `${subjectName} - ${gradeName}` : subjectName || gradeName}
          </h3>
          <DataTable
            columns={existingBooksColumns}
            data={existingBooks}
            keyExtractor={(row) => row.id}
            isLoading={isLoadingExistingBooks}
            emptyMessage={t('books.noBooks')}
            t={t}
          />
        </div>
      )}

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
