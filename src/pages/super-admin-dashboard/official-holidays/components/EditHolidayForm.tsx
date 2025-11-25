import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import {
  updateHoliday,
  getHolidayById,
} from '@/redux/features/official-holidays/officialHolidaysSlice';
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
import EditFixedHolidayForm from './EditFixedHolidayForm';
import EditOfficialHolidayForm from './EditOfficialHolidayForm';
import PopupMessage from '@/shared/components/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';

const EditHolidayForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { selectedHoliday, isLoadingHoliday } = useAppSelector((state) => state.officialHolidays);
  const [isFixedHoliday, setIsFixedHoliday] = useState(false);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
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
    reset: resetOfficial,
    formState: { errors: officialErrors },
  } = officialControl;

  const {
    setValue: setFixedValue,
    watch: watchFixed,
    reset: resetFixed,
    formState: { errors: fixedErrors },
  } = fixedControl;

  // Fetch countries on component mount
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  // Load holiday data by ID
  useEffect(() => {
    if (id) {
      dispatch(getHolidayById(id));
    }
  }, [id, dispatch]);

  // Populate form when selectedHoliday changes
  useEffect(() => {
    if (!selectedHoliday) return;

    const holiday = selectedHoliday;

    try {
      // Map backend leaveCategory to numeric value
      // Backend returns: "Static" for fixed (1) or "Official" for official (2)
      const leaveCategoryMap: Record<string, number> = {
        Static: 1,
        static: 1,
        Official: 2,
        official: 2,
      };

      const leaveCategory =
        typeof holiday.leaveCategory === 'string'
          ? leaveCategoryMap[holiday.leaveCategory] || 1
          : holiday.leaveCategory;

      const isFixed = leaveCategory === 1;
      setIsFixedHoliday(isFixed);

      // Store existing file information or reset if no file
      if (holiday.filePath) {
        setExistingFilePath(holiday.filePath);
        setExistingFileName(holiday.fileName || holiday.filePath.split('/').pop() || 'document');
      } else {
        setExistingFilePath(null);
        setExistingFileName(null);
      }

      if (isFixed) {
        // Load fixed holiday data
        resetFixed({
          holidayType: 1,
          day: holiday.day || 0,
          country: holiday.lkCountryId || '',
          reasonAr: holiday.reasonAr || '',
          reasonEn: holiday.reasonEN || '',
          officialDocuments: [],
        });
      } else {
        // Load official holiday data
        const formatDateForInput = (dateString: string): string => {
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        resetOfficial({
          holidayType: 2,
          startDate: formatDateForInput(holiday.startDate),
          endDate: formatDateForInput(holiday.endDate),
          country: holiday.lkCountryId || '',
          reasonAr: holiday.reasonAr || '',
          reasonEn: holiday.reasonEN || '',
          officialDocuments: [],
        });
      }
    } catch (error: any) {
      console.error('Failed to populate form:', error);
    }
  }, [selectedHoliday, resetFixed, resetOfficial]);

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
    if (!id) return;

    try {
      const dataWithFiles = {
        ...data,
        officialDocuments: files[0] || [],
      };
      const requestData = createOfficialHolidayRequest(dataWithFiles);
      const result = await dispatch(updateHoliday({ id, data: requestData })).unwrap();

      if (result.isSuccess) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: result.successMessage || t('officialHolidays.holidayUpdatedSuccessfully'),
        });
      } else {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: result.errors?.[0] || t('common.errorOccurred'),
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
    if (!id) return;

    try {
      const dataWithFiles = {
        ...data,
        officialDocuments: files[0] || [],
      };
      const requestData = createFixedHolidayRequest(dataWithFiles);
      const result = await dispatch(updateHoliday({ id, data: requestData })).unwrap();

      if (result.isSuccess) {
        setShowPopupMessage({
          show: true,
          type: 'success',
          message: result.successMessage || t('officialHolidays.holidayUpdatedSuccessfully'),
        });
      } else {
        setShowPopupMessage({
          show: true,
          type: 'error',
          message: result.errors?.[0] || t('common.errorOccurred'),
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

  if (isLoadingHoliday || !selectedHoliday) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </Card>
    );
  }

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
          <EditFixedHolidayForm
            control={fixedControl}
            onSubmit={onFixedSubmit}
            onCancel={handleCancel}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            getFileNames={getFileNames}
            isSubmitting={fixedControl.formState.isSubmitting}
            existingFilePath={existingFilePath}
            existingFileName={existingFileName}
          />
        ) : (
          /* Official Holiday Form */
          <EditOfficialHolidayForm
            control={officialControl}
            onSubmit={onOfficialSubmit}
            onCancel={handleCancel}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            getFileNames={getFileNames}
            isSubmitting={officialControl.formState.isSubmitting}
            existingFilePath={existingFilePath}
            existingFileName={existingFileName}
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

export default EditHolidayForm;
