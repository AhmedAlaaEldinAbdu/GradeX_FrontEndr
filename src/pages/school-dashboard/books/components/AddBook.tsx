import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useEffect, useState } from 'react';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import PopupMessage from '@/shared/components/PopupMessage';
import FormField from '@/shared/components/FormField';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import CustomSelect from '@/shared/components/CustomSelect';
import Button from '@/shared/components/Button';
import { addBook } from '@/redux/features/books/booksSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchSchoolStages } from '@/redux/features/lookups/lookupsSlice';
import { AddBookSchema, type AddBookProps } from '@/validations/books-validations';
import FileUpload from '@/shared/components/FileUpload';

// Package type options
const PACKAGE_TYPES = [
  { value: '1', labelKey: 'books.packageIndividual' },
  { value: '2', labelKey: 'books.packageSet' },
];

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

  const isCreating = useAppSelector((state) => state.books.isCreating);

  const subjects = useAppSelector((state) => state.subjects.subjects);
  const isLoadingSubjects = useAppSelector((state) => state.subjects.isLoading);

  const schoolStages = useAppSelector((state) => state.lookups.schoolStages);
  const isLoadingSchoolStages = useAppSelector((state) => state.lookups.isLoadingSchoolStages);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(AddBookSchema),
    defaultValues: {
      restorePreviousCurriculum: 'no' as const,
      lkSchoolStageId: '',
      materialId: '',
      name: '',
      nameEn: '',
      code: '',
      packageType: '1' as '1' | '2',
      quantity: 0,
      price: 0,
    },
  });

  const watchedRestoreCurriculum = watch('restorePreviousCurriculum');
  const watchedPackageType = watch('packageType');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchSubjects({ page: 1, limit: 100 }));
    dispatch(fetchSchoolStages());
  }, [dispatch]);

  const onSubmit = async (data: AddBookProps) => {
    try {
      await dispatch(
        addBook({
          name: data.name,
          nameEn: data.nameEn,
          code: data.code,
          price: data.price,
          priceView: 1,
          totalQuantity: data.quantity,
          packageType: Number(data.packageType),
          number: 0,
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
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : t('common.errorOccurred');
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: errorMessage,
      });
    }
  };

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
                  <span className="text-sm text-gray-700">{t('common.no')}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value="yes"
                    checked={watchedRestoreCurriculum === 'yes'}
                    onChange={() => setValue('restorePreviousCurriculum', 'yes')}
                    className="h-4 w-4 accent-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{t('common.yes')}</span>
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
                    options={schoolStages.map((stage) => ({
                      value: stage.id,
                      label: currentLang === 'ar' ? stage.nameAR : stage.nameEN,
                    }))}
                    placeholder={
                      isLoadingSchoolStages
                        ? t('common.loading')
                        : t('books.selectEducationalStage')
                    }
                    disabled={isLoadingSchoolStages}
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
              label={t('books.bookCode')}
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
                    placeholder={t('books.enterBookCode')}
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
                    <span className="text-sm text-gray-700">{t(pkg.labelKey)}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>

          {/* Quantity and Price */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Quantity */}
            <FormField
              label={t('books.totalQuantity')}
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
                    placeholder={t('books.enterTotalQuantity')}
                    className="w-full"
                    id="quantity"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormField>

            {/* Price */}
            <FormField
              label={t('books.price')}
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
                    placeholder={t('books.enterPrice')}
                    className="w-full"
                    id="price"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Book Image */}
          <div className="mb-6">
            <FileUpload
              label={t('books.bookImage')}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                }
              }}
              onDelete={() => setImageFile(null)}
              fileName={imageFile?.name}
              uploadText={t('books.uploadBookImage')}
              formatHints={['JPG', 'PNG', 'GIF']}
              id="image"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3 rtl:justify-end">
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
