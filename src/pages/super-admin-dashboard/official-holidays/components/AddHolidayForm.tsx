import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import { createHoliday } from '@/redux/features/official-holidays/officialHolidaysSlice';
import type { Country } from '@/services/api/types/lookup.types';
import {
  createHolidayRequest,
  createStaticHolidayRequest,
} from '../utils/holiday-form.transformer';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import FileUpload from '@/shared/components/FileUpload';
import CustomSelect from '@/shared/components/CustomSelect';
import {
  AddHolidaysSchema,
  AddStaticHolidaySchema,
  type AddHolidaysProps,
  type AddStaticHolidayProps,
} from '@/validations/official-holidays-validations';
import TrashIcon from '@/assets/icons/Trash.svg';
import GreenPlusIcon from '@/assets/icons/GreenPlus.svg';
import Input from '@/shared/components/Input';

const AddHolidayForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { countries, isLoadingCountries } = useAppSelector((state) => state.lookups);
  const { isCreating } = useAppSelector((state) => state.officialHolidays);
  const { i18n } = useTranslation();
  const [isStaticHoliday, setIsStaticHoliday] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<{ [key: number]: string[] }>({});

  // Fetch countries on component mount
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  // Dynamic holidays form (single holiday)
  const {
    control: dynamicControl,
    handleSubmit: handleDynamicSubmit,
    watch: watchDynamic,
    setValue: setDynamicValue,
    formState: { errors: dynamicErrors, isSubmitting: isDynamicSubmitting },
  } = useForm<AddHolidaysProps>({
    resolver: yupResolver(AddHolidaysSchema) as any,
    defaultValues: {
      holidayType: '',
      startDate: '',
      endDate: '',
      country: '',
      reason: '',
    },
  });

  // Static holiday form
  const {
    control: staticControl,
    handleSubmit: handleStaticSubmit,
    setValue: setStaticValue,
    watch: watchStatic,
    formState: { errors: staticErrors, isSubmitting: isStaticSubmitting },
  } = useForm<{
    holidayType: string;
    holidays: Array<{
      day: string;
      country: string;
      reason: string;
      officialDocuments?: File[];
    }>;
  }>({
    resolver: yupResolver(AddStaticHolidaySchema) as any,
    defaultValues: {
      holidayType: '',
      holidays: [
        {
          day: '',
          country: '',
          reason: '',
          officialDocuments: [],
        },
      ],
    },
  });

  const {
    fields: staticFields,
    append: appendStatic,
    remove: removeStatic,
  } = useFieldArray({
    control: staticControl,
    name: 'holidays',
  });

  const watchDynamicHolidayType = watchDynamic('holidayType');
  const watchStaticHolidayType = watchStatic('holidayType');

  useEffect(() => {
    const holidayType = isStaticHoliday ? watchStaticHolidayType : watchDynamicHolidayType;

    if (holidayType === 'static') {
      setIsStaticHoliday(true);
      // Sync to static form if changed from dynamic
      if (!isStaticHoliday) {
        setStaticValue('holidayType', 'static');
      }
    } else if (holidayType === 'official') {
      setIsStaticHoliday(false);
      // Sync to dynamic form if changed from static
      if (isStaticHoliday) {
        setDynamicValue('holidayType', 'official');
      }
    }
  }, [
    watchDynamicHolidayType,
    watchStaticHolidayType,
    isStaticHoliday,
    setStaticValue,
    setDynamicValue,
  ]);

  const holidayTypeOptions = [
    { value: 'static', label: t('officialHolidays.staticHoliday') },
    { value: 'official', label: t('officialHolidays.officialHoliday') },
  ];

  const countryOptions = countries.map((country: Country) => ({
    value: country.id.toString(),
    label: i18n.language === 'ar' ? country.arabicName : country.englishName,
  }));

  const handleFileUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const fileNames = fileArray.map((f) => f.name);

      setUploadedFileNames((prev) => ({
        ...prev,
        [index]: [...(prev[index] || []), ...fileNames],
      }));

      if (isStaticHoliday) {
        const currentFiles = staticControl._formValues.holidays?.[index]?.officialDocuments || [];
        setStaticValue(`holidays.${index}.officialDocuments` as any, [
          ...currentFiles,
          ...fileArray,
        ]);
      } else {
        const currentFiles = dynamicControl._formValues.officialDocuments || [];
        setDynamicValue('officialDocuments' as any, [...currentFiles, ...fileArray]);
      }
    }
  };

  const handleFileDelete = (index: number, fileName?: string) => () => {
    if (fileName) {
      // Delete specific file
      setUploadedFileNames((prev) => ({
        ...prev,
        [index]: (prev[index] || []).filter((name) => name !== fileName),
      }));

      if (isStaticHoliday) {
        const currentFiles = staticControl._formValues.holidays?.[index]?.officialDocuments || [];
        const updatedFiles = currentFiles.filter((file: File) => file.name !== fileName);
        setStaticValue(`holidays.${index}.officialDocuments` as any, updatedFiles);
      } else {
        const currentFiles = dynamicControl._formValues.officialDocuments || [];
        const updatedFiles = currentFiles.filter((file: File) => file.name !== fileName);
        setDynamicValue('officialDocuments' as any, updatedFiles);
      }
    } else {
      // Delete all files
      setUploadedFileNames((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });

      if (isStaticHoliday) {
        setStaticValue(`holidays.${index}.officialDocuments` as any, []);
      } else {
        setDynamicValue('officialDocuments' as any, []);
      }
    }
  };

  const handleAddStaticHoliday = () => {
    appendStatic({
      day: '',
      country: '',
      reason: '',
    });
  };

  const handleDeleteStaticHoliday = (index: number) => {
    if (staticFields.length > 1) {
      removeStatic(index);
      setUploadedFileNames((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const onDynamicSubmit = async (data: AddHolidaysProps) => {
    try {
      // Transform form data to API request format using transformer
      const requestData = createHolidayRequest(data, 1);

      const result = await dispatch(createHoliday(requestData)).unwrap();

      if (result.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
    }
  };

  const onStaticSubmit = async (data: AddStaticHolidayProps) => {
    try {
      // Create all static holidays sequentially using transformer
      const promises = data.holidays.map(async (holiday) => {
        const requestData = createStaticHolidayRequest(holiday);
        return dispatch(createHoliday(requestData)).unwrap();
      });

      const results = await Promise.all(promises);

      // Check if all succeeded
      if (results.every((r) => r.success)) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error adding static holidays:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  console.log('staticErrors', staticErrors);
  console.log('dynamicErrors', dynamicErrors);

  return (
    <Card>
      <div className="space-y-6">
        {/* Holiday Type */}
        <div className="mb-5">
          <FormField
            label={t('officialHolidays.holidayType')}
            required
            error={
              isStaticHoliday
                ? staticErrors.holidayType?.message
                : dynamicErrors.holidayType?.message
            }
          >
            {!isStaticHoliday ? (
              <Controller
                name="holidayType"
                control={dynamicControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const selectedValue = Array.isArray(value) ? value[0] : value;
                      field.onChange(selectedValue);
                      setStaticValue('holidayType', selectedValue);
                      setIsStaticHoliday(selectedValue === 'static');
                    }}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                  />
                )}
              />
            ) : (
              <Controller
                name="holidayType"
                control={staticControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => {
                      const selectedValue = Array.isArray(value) ? value[0] : value;
                      field.onChange(selectedValue);
                      setDynamicValue('holidayType', selectedValue);
                      setIsStaticHoliday(selectedValue === 'static');
                    }}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                  />
                )}
              />
            )}
          </FormField>
        </div>

        {/* Static Holiday Form */}
        {isStaticHoliday ? (
          <form onSubmit={handleStaticSubmit(onStaticSubmit)}>
            <div className="mb-5">
              <div className="flex flex-wrap items-center justify-between">
                <div className="text-xl font-bold text-gray-700">
                  {t('officialHolidays.fixedHolidays')}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleAddStaticHoliday}>
                    <img src={GreenPlusIcon} className="h-7 w-7" alt="Plus" />
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {staticFields.map((field, index) => (
                <Card key={field.id}>
                  <div className="space-y-6">
                    <div className="flex gap-1">
                      <div className="w-full">
                        {/* Day */}
                        <FormField
                          label={t('officialHolidays.day')}
                          required
                          error={staticErrors.holidays?.[index]?.day?.message}
                        >
                          <Controller
                            name={`holidays.${index}.day`}
                            control={staticControl}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="text"
                                placeholder={t('officialHolidays.selectDay')}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            )}
                          />
                        </FormField>
                      </div>
                      <div className="w-8">
                        {/* Delete Button (only show if more than 1 item) */}
                        {staticFields.length > 1 && (
                          <div className="mb-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteStaticHoliday(index)}
                              className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                            >
                              <img src={TrashIcon} alt="Trash" className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <div className="flex w-full flex-wrap gap-3">
                        <div className="flex-1">
                          {/* Country */}
                          <FormField
                            label={t('officialHolidays.country')}
                            required
                            error={staticErrors.holidays?.[index]?.country?.message}
                          >
                            <Controller
                              name={`holidays.${index}.country`}
                              control={staticControl}
                              render={({ field }) => (
                                <CustomSelect
                                  value={field.value}
                                  onChange={(value) => field.onChange(value)}
                                  options={countryOptions}
                                  placeholder={t('officialHolidays.selectCountry')}
                                  disabled={isLoadingCountries}
                                  error={!!staticErrors.holidays?.[index]?.country?.message}
                                />
                              )}
                            />
                          </FormField>
                        </div>
                        <div className="flex-1">
                          {/* Reason */}
                          <FormField
                            label={t('officialHolidays.reason')}
                            required
                            error={staticErrors.holidays?.[index]?.reason?.message}
                          >
                            <Controller
                              name={`holidays.${index}.reason`}
                              control={staticControl}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder={t('officialHolidays.enterReason')}
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              )}
                            />
                          </FormField>
                        </div>
                      </div>
                      <div aria-hidden="true">
                        <div className="h-8 w-8"></div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <div className="w-full">
                        {/* Official Document Upload */}
                        <FormField label={t('officialHolidays.officialDocument')} optional>
                          <FileUpload
                            label=""
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                            onChange={handleFileUpload(index)}
                            onDelete={(fileIndex) =>
                              handleFileDelete(index, uploadedFileNames[index]?.[fileIndex || 0])()
                            }
                            fileNames={uploadedFileNames[index]}
                            uploadText={t('officialHolidays.uploadAttachments')}
                            formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                            multiple
                          />
                        </FormField>
                      </div>
                      <div aria-hidden="true">
                        <div className="h-8 w-8"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isStaticSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={isStaticSubmitting || isCreating}>
                  {isCreating ? t('common.saving') : t('common.add')}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Dynamic Holidays Form */
          <form onSubmit={handleDynamicSubmit(onDynamicSubmit)}>
            <Card>
              <div className="space-y-6">
                {/* Single Dynamic Holiday */}
                <div className="space-y-4">
                  {/* Date Range and Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Start Date */}
                    <FormField
                      label={t('officialHolidays.startDate')}
                      required
                      error={dynamicErrors.startDate?.message}
                    >
                      <Controller
                        name="startDate"
                        control={dynamicControl}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      />
                    </FormField>

                    {/* End Date */}
                    <FormField
                      label={t('officialHolidays.endDate')}
                      required
                      error={dynamicErrors.endDate?.message}
                    >
                      <Controller
                        name="endDate"
                        control={dynamicControl}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      />
                    </FormField>

                    {/* Country */}
                    <FormField
                      label={t('officialHolidays.country')}
                      required
                      error={dynamicErrors.country?.message}
                    >
                      <Controller
                        name="country"
                        control={dynamicControl}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            options={countryOptions}
                            placeholder={t('officialHolidays.selectCountry')}
                            disabled={isLoadingCountries}
                          />
                        )}
                      />
                    </FormField>

                    {/* Reason */}
                    <FormField
                      label={t('officialHolidays.reason')}
                      required
                      error={dynamicErrors.reason?.message}
                    >
                      <Controller
                        name="reason"
                        control={dynamicControl}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('officialHolidays.enterReason')}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      />
                    </FormField>
                  </div>

                  {/* Official Document Upload */}
                  <FormField label={t('officialHolidays.officialDocument')} optional>
                    <FileUpload
                      label=""
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                      onChange={handleFileUpload(0)}
                      onDelete={(fileIndex) =>
                        handleFileDelete(0, uploadedFileNames[0]?.[fileIndex || 0])()
                      }
                      fileNames={uploadedFileNames[0]}
                      uploadText={t('officialHolidays.uploadAttachments')}
                      formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                      multiple
                    />
                  </FormField>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isDynamicSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isDynamicSubmitting || isCreating}
                >
                  {isCreating ? t('common.saving') : t('common.add')}
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </Card>
  );
};

export default AddHolidayForm;
