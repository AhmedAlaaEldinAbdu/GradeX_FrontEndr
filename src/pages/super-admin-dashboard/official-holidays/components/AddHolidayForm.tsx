import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import { createHoliday } from '@/redux/features/official-holidays/officialHolidaysSlice';
import {
  createOfficialHolidayRequest,
  createFixedHolidayRequest,
} from '../utils/holiday-form.transformer';
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
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { getBackendMessage } from '@/lib/http';

const AddHolidayForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isFixedHoliday, setIsFixedHoliday] = useState(false);
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isMessageRaw?: boolean;
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

    if (holidayType === 1) {
      setIsFixedHoliday(true);
      if (!isFixedHoliday) {
        setFixedValue('holidayType', 1);
      }
    } else if (holidayType === 2) {
      setIsFixedHoliday(false);
      if (isFixedHoliday) {
        setOfficialValue('holidayType', 2);
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
    { value: '1', label: t('officialHolidays.fixedHoliday') },
    { value: '2', label: t('officialHolidays.officialHoliday') },
  ];

  const onOfficialSubmit = async (data: AddHolidaysProps) => {
    try {
      const dataWithFiles = {
        ...data,
        officialDocuments: files[0] || [],
      };
      const requestData = createOfficialHolidayRequest(dataWithFiles);
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
          message: result.errors?.[0] || t('common.errorOccurred'),
          isMessageRaw: Boolean(result.errors?.[0]),
        });
      }
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: getBackendMessage(error) || t('common.errorOccurred'),
        isMessageRaw: Boolean(getBackendMessage(error)),
      });
    }
  };

  const onFixedSubmit = async (data: AddFixedHolidayProps) => {
    try {
      const dataWithFiles = {
        ...data,
        officialDocuments: files[0] || [],
      };
      const requestData = createFixedHolidayRequest(dataWithFiles);
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
          message: result.errors?.[0] || t('common.errorOccurred'),
          isMessageRaw: Boolean(result.errors?.[0]),
        });
      }
    } catch (error: any) {
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: getBackendMessage(error) || t('common.errorOccurred'),
        isMessageRaw: Boolean(getBackendMessage(error)),
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleHolidayTypeChange = (field: any, value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    const numericValue = parseInt(selectedValue);
    field.onChange(numericValue);

    if (numericValue === 1) {
      setFixedValue('holidayType', 1);
      setIsFixedHoliday(true);
    } else if (numericValue === 2) {
      setOfficialValue('holidayType', 2);
      setIsFixedHoliday(false);
    }
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
                    value={field.value.toString()}
                    onChange={(value) => handleHolidayTypeChange(field, value)}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                    error={!!officialErrors.holidayType}
                    showSearch={false}
                  />
                )}
              />
            ) : (
              <Controller
                name="holidayType"
                control={fixedControl.control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value.toString()}
                    onChange={(value) => handleHolidayTypeChange(field, value)}
                    options={holidayTypeOptions}
                    placeholder={t('officialHolidays.selectHolidayType')}
                    error={!!fixedErrors.holidayType}
                    showSearch={false}
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
          isMessageRaw={showPopupMessage.isMessageRaw}
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
