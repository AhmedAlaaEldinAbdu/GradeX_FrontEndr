import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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

const AddHolidayForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isStaticHoliday, setIsStaticHoliday] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<{ [key: number]: string }>({});

  // Dynamic holidays form
  const {
    control: dynamicControl,
    handleSubmit: handleDynamicSubmit,
    watch: watchDynamic,
    setValue: setDynamicValue,
    formState: { errors: dynamicErrors, isSubmitting: isDynamicSubmitting },
  } = useForm<AddHolidaysProps>({
    resolver: yupResolver(AddHolidaysSchema),
    defaultValues: {
      holidays: [
        {
          holidayType: '',
          reason: '',
          startDate: '',
          endDate: '',
          duration: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: dynamicControl,
    name: 'holidays',
  });

  // Static holiday form
  const {
    control: staticControl,
    handleSubmit: handleStaticSubmit,
    setValue: setStaticValue,
    formState: { errors: staticErrors, isSubmitting: isStaticSubmitting },
  } = useForm<{
    holidayType: string;
    dayName: string;
    reason: string;
    officialDocument?: File;
  }>({
    resolver: yupResolver(AddStaticHolidaySchema) as any,
    defaultValues: {
      holidayType: '',
      dayName: '',
      reason: '',
    },
  });

  const watchHolidayType = watchDynamic('holidays.0.holidayType');

  useEffect(() => {
    if (watchHolidayType === 'static') {
      setIsStaticHoliday(true);
    } else if (watchHolidayType === 'official') {
      setIsStaticHoliday(false);
    }
  }, [watchHolidayType]);

  const holidayTypeOptions = [
    { value: 'static', label: t('officialHolidays.staticHoliday') },
    { value: 'official', label: t('officialHolidays.officialHoliday') },
  ];

  const dayNameOptions = [
    { value: 'friday', label: t('officialHolidays.friday') },
    { value: 'saturday', label: t('officialHolidays.saturday') },
    { value: 'sunday', label: t('officialHolidays.sunday') },
    { value: 'monday', label: t('officialHolidays.monday') },
    { value: 'tuesday', label: t('officialHolidays.tuesday') },
    { value: 'wednesday', label: t('officialHolidays.wednesday') },
    { value: 'thursday', label: t('officialHolidays.thursday') },
  ];

  const durationOptions = [
    { value: '1', label: t('officialHolidays.oneDay') },
    { value: '2', label: t('officialHolidays.twoDays') },
    { value: '3', label: t('officialHolidays.threeDays') },
    { value: '4', label: t('officialHolidays.fourDays') },
    { value: '5', label: t('officialHolidays.fiveDays') },
    { value: '6', label: t('officialHolidays.sixDays') },
    { value: '7', label: t('officialHolidays.oneWeek') },
  ];

  const handleFileUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileNames((prev) => ({ ...prev, [index]: file.name }));
      if (isStaticHoliday) {
        setStaticValue('officialDocument', file);
      } else {
        setDynamicValue(`holidays.${index}.officialDocument`, file);
      }
    }
  };

  const handleFileDelete = (index: number) => () => {
    setUploadedFileNames((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    if (isStaticHoliday) {
      setStaticValue('officialDocument', undefined);
    } else {
      setDynamicValue(`holidays.${index}.officialDocument`, undefined);
    }
  };

  const handleAddHoliday = () => {
    append({
      holidayType: '',
      reason: '',
      startDate: '',
      endDate: '',
      duration: '',
    });
  };

  const handleDeleteHoliday = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setUploadedFileNames((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const onDynamicSubmit = async (data: AddHolidaysProps) => {
    try {
      console.log('Dynamic holidays data:', data);
      // TODO: Implement API call to save holidays
      // await addHolidays(data);
      navigate(-1);
    } catch (error) {
      console.error('Error adding holidays:', error);
    }
  };

  const onStaticSubmit = async (data: AddStaticHolidayProps) => {
    try {
      console.log('Static holiday data:', data);
      // TODO: Implement API call to save static holiday
      // await addStaticHoliday(data);
      navigate(-1);
    } catch (error) {
      console.error('Error adding static holiday:', error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* Static Holiday Form */}
      {isStaticHoliday ? (
        <form onSubmit={handleStaticSubmit(onStaticSubmit)}>
          <Card>
            <div className="space-y-6">
              {/* Holiday Type */}
              <FormField
                label={t('officialHolidays.holidayType')}
                required
                error={staticErrors.holidayType?.message}
              >
                <Controller
                  name="holidayType"
                  control={staticControl}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setIsStaticHoliday(value === 'static');
                      }}
                      options={holidayTypeOptions}
                      placeholder={t('officialHolidays.selectHolidayType')}
                    />
                  )}
                />
              </FormField>

              {/* Day Name */}
              <FormField
                label={t('officialHolidays.dayName')}
                required
                error={staticErrors.dayName?.message}
              >
                <Controller
                  name="dayName"
                  control={staticControl}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      options={dayNameOptions}
                      placeholder={t('officialHolidays.selectDayName')}
                    />
                  )}
                />
              </FormField>

              {/* Reason */}
              <FormField
                label={t('officialHolidays.reason')}
                required
                error={staticErrors.reason?.message}
              >
                <Controller
                  name="reason"
                  control={staticControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={t('officialHolidays.enterReason')}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  )}
                />
              </FormField>

              {/* Official Document Upload */}
              <FormField label={t('officialHolidays.officialDocument')} optional>
                <FileUpload
                  label=""
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                  onChange={handleFileUpload(0)}
                  onDelete={handleFileDelete(0)}
                  fileName={uploadedFileNames[0]}
                  uploadText={t('officialHolidays.uploadDocument')}
                  formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                  optional
                />
              </FormField>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isStaticSubmitting}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isStaticSubmitting}>
                {t('actions.add')}
              </Button>
            </div>
          </Card>
        </form>
      ) : (
        /* Dynamic Holidays Form */
        <form onSubmit={handleDynamicSubmit(onDynamicSubmit)}>
          <Card>
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('officialHolidays.addHolidays')}</h3>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  <span className="text-xl font-bold">+</span>
                  {t('officialHolidays.addAnother')}
                </button>
              </div>

              {/* Dynamic Holiday Items */}
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-gray-200 p-4">
                  {/* Delete Button (only show if more than 1 item) */}
                  {fields.length > 1 && (
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteHoliday(index)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <img src={TrashIcon} alt="Delete" className="h-4 w-4" />
                        {t('actions.delete')}
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Holiday Type */}
                    <FormField
                      label={t('officialHolidays.holidayType')}
                      required
                      error={dynamicErrors.holidays?.[index]?.holidayType?.message}
                    >
                      <Controller
                        name={`holidays.${index}.holidayType`}
                        control={dynamicControl}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              if (index === 0) {
                                setIsStaticHoliday(value === 'static');
                              }
                            }}
                            options={holidayTypeOptions}
                            placeholder={t('officialHolidays.selectHolidayType')}
                          />
                        )}
                      />
                    </FormField>

                    {/* Reason */}
                    <FormField
                      label={t('officialHolidays.reason')}
                      required
                      error={dynamicErrors.holidays?.[index]?.reason?.message}
                    >
                      <Controller
                        name={`holidays.${index}.reason`}
                        control={dynamicControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder={t('officialHolidays.enterReason')}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      />
                    </FormField>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Start Date */}
                      <FormField
                        label={t('officialHolidays.startDate')}
                        required
                        error={dynamicErrors.holidays?.[index]?.startDate?.message}
                      >
                        <Controller
                          name={`holidays.${index}.startDate`}
                          control={dynamicControl}
                          render={({ field }) => (
                            <input
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
                        error={dynamicErrors.holidays?.[index]?.endDate?.message}
                      >
                        <Controller
                          name={`holidays.${index}.endDate`}
                          control={dynamicControl}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="date"
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          )}
                        />
                      </FormField>
                    </div>

                    {/* Duration */}
                    <FormField
                      label={t('officialHolidays.duration')}
                      required
                      error={dynamicErrors.holidays?.[index]?.duration?.message}
                    >
                      <Controller
                        name={`holidays.${index}.duration`}
                        control={dynamicControl}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            options={durationOptions}
                            placeholder={t('officialHolidays.selectDuration')}
                          />
                        )}
                      />
                    </FormField>

                    {/* Official Document Upload */}
                    <FormField label={t('officialHolidays.officialDocument')} optional>
                      <FileUpload
                        label=""
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg"
                        onChange={handleFileUpload(index)}
                        onDelete={handleFileDelete(index)}
                        fileName={uploadedFileNames[index]}
                        uploadText={t('officialHolidays.uploadDocument')}
                        formatHints={['GIF', 'SVG', 'JPG', 'PNG']}
                        optional
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isDynamicSubmitting}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isDynamicSubmitting}>
                {t('actions.add')}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default AddHolidayForm;
