import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import { createHoliday } from '@/redux/features/official-holidays/officialHolidaysSlice';
import { createHolidayRequest, createFixedHolidayRequest } from '../utils/holiday-form.transformer';
import { useHolidayForm } from '../hooks/useHolidayForm';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import type {
  AddHolidaysProps,
  AddFixedHolidayProps,
} from '@/validations/official-holidays-validations';
import AddFixedHolidayForm from './AddFixedHolidayForm';
import AddOfficialHolidayForm from './AddOfficialHolidayForm';
import PopupMessage from '@/shared/components/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

const AddHolidayForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isFixedHoliday, setIsFixedHoliday] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Use custom holiday form hook
  const { officialControl, fixedControl, handleFileUpload, handleFileDelete, getFileNames, files } =
    useHolidayForm();

  // Extract form methods
  const {
    watch: watchOfficial,
    setValue: setOfficialValue,
    formState: { errors: officialErrors },
  } = officialControl;

  const {
    setValue: setFixedValue,
    watch: watchFixed,
    formState: { errors: fixedErrors },
  } = fixedControl;

  // Fetch countries on component mount
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const watchOfficialHolidayType = watchOfficial('holidayType');
  const watchFixedHolidayType = watchFixed('holidayType');

  useEffect(() => {
    const holidayType = isFixedHoliday ? watchFixedHolidayType : watchOfficialHolidayType;

    if (holidayType === 'fixed') {
      setIsFixedHoliday(true);
      if (!isFixedHoliday) {
        setFixedValue('holidayType', 'fixed');
      }
    } else if (holidayType === 'official') {
      setIsFixedHoliday(false);
      if (isFixedHoliday) {
        setOfficialValue('holidayType', 'official');
      }
    }
  }, [
    watchOfficialHolidayType,
    watchFixedHolidayType,
    isFixedHoliday,
    setFixedValue,
    setOfficialValue,
  ]);

  const holidayTypeOptions = [
    { value: 'fixed', label: t('officialHolidays.fixedHoliday') },
    { value: 'official', label: t('officialHolidays.officialHoliday') },
  ];

  const onOfficialSubmit = async (data: AddHolidaysProps) => {
    try {
      // Update data with actual files from hook state
      const dataWithFiles = {
        ...data,
        officialDocuments: files[0] || [],
      };

      const requestData = createHolidayRequest(dataWithFiles, 1);
      const result = await dispatch(createHoliday(requestData)).unwrap();
      if (result.isSuccess) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: result.successMessage || t('officialHolidays.holidayAddedSuccessfully'),
        });
      } else {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: result.errors?.join(', ') || t('common.errorOccurred'),
        });
      }
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: error || t('common.errorOccurred'),
      });
    }
  };

  const onFixedSubmit = async (data: AddFixedHolidayProps) => {
    try {
      const promises = data.holidays.map(async (holiday, index) => {
        const holidayWithFiles = {
          ...holiday,
          officialDocuments: files[index] || [],
        };
        const requestData = createFixedHolidayRequest(holidayWithFiles);
        return dispatch(createHoliday(requestData)).unwrap();
      });
      const results = await Promise.all(promises);
      if (results.every((result) => result.isSuccess)) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: t('officialHolidays.holidayAddedSuccessfully'),
        });
      } else {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message:
            results
              .map((r) => r.errors)
              .flat()
              .join(', ') || t('common.errorOccurred'),
        });
      }
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: error || t('common.errorOccurred'),
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleHolidayTypeChange = (field: any, value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    field.onChange(selectedValue);
    setOfficialValue('holidayType', selectedValue);
    setFixedValue('holidayType', selectedValue);
    setIsFixedHoliday(selectedValue === 'fixed');
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Holiday Type */}
        <div className="mb-5">
          <FormField
            label={t('officialHolidays.holidayType')}
            required
            error={
              isFixedHoliday
                ? fixedErrors.holidayType?.message
                : officialErrors.holidayType?.message
            }
          >
            {!isFixedHoliday ? (
              <Controller
                name="holidayType"
                control={officialControl.control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => handleHolidayTypeChange(field, value)}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                  />
                )}
              />
            ) : (
              <Controller
                name="holidayType"
                control={fixedControl.control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(value) => handleHolidayTypeChange(field, value)}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                  />
                )}
              />
            )}
          </FormField>
        </div>

        {/* Fixed Holiday Form */}
        {isFixedHoliday ? (
          <AddFixedHolidayForm
            control={fixedControl}
            onSubmit={onFixedSubmit}
            onCancel={handleCancel}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            getFileNames={getFileNames}
            isSubmitting={fixedControl.formState.isSubmitting}
          />
        ) : (
          /* Official Holiday Form */
          <AddOfficialHolidayForm
            control={officialControl}
            onSubmit={onOfficialSubmit}
            onCancel={handleCancel}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            getFileNames={getFileNames}
            isSubmitting={officialControl.formState.isSubmitting}
          />
        )}
        {/* Popups */}
        <PopupMessage
          open={showPopupMessage.show}
          type={showPopupMessage.type}
          message={showPopupMessage.message}
          iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
          autoClose={true}
          onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
          navigateAfterClose={showPopupMessage.type === 'success' ? -1 : undefined}
        />
      </div>
    </Card>
  );
};

export default AddHolidayForm;
