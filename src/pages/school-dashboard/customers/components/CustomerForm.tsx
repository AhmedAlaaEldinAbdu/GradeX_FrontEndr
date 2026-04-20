import { useState, useEffect, useRef, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { tOptional } from '@/lib/utils';
import { tokenManager } from '@/lib/auth';
import { fetchCountries, fetchRegionsByCountry, clearRegions } from '@/redux/features/lookups';
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
} from '@/redux/features/customers/customersSlice';
import { CustomerTypeEnum } from '@/services/api/types/customer.types';
import { searchStudentsByName } from '@/redux/features/students/studentsSlice';
import type { StudentDto } from '@/services/api/types/students.types';
import { useToast } from '@/shared/context/ToastContext';
import { customerSchema, type CustomerFormValues } from '@/validations/customers-validations';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import PhoneInput from '@/shared/components/PhoneInput';
import Button from '@/shared/components/Button';

type ClientType = 'individual' | 'institution' | 'company';

const clientTypeToNumber: Record<ClientType, number> = {
  company: CustomerTypeEnum.COMPANY,
  institution: CustomerTypeEnum.INSTITUTION,
  individual: CustomerTypeEnum.INDIVIDUAL,
};

const numberToClientType: Record<number, ClientType> = {
  [CustomerTypeEnum.COMPANY]: 'company',
  [CustomerTypeEnum.INSTITUTION]: 'institution',
  [CustomerTypeEnum.INDIVIDUAL]: 'individual',
};

interface ClientFormProps {
  isEditMode?: boolean;
}

export default function CustomerForm({ isEditMode = false }: ClientFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const lang = i18n.language as 'ar' | 'en';

  // Lookups state
  const countries = useSelector((state: RootState) => state.lookups.countries);
  const isLoadingCountries = useSelector((state: RootState) => state.lookups.isLoadingCountries);
  const regions = useSelector((state: RootState) => state.lookups.regions);
  const isLoadingRegions = useSelector((state: RootState) => state.lookups.isLoadingRegions);
  const isCreating = useSelector((state: RootState) => state.customers.isCreating);
  const isUpdating = useSelector((state: RootState) => state.customers.isUpdating);

  const schoolBrancheId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  // Student autocomplete state
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentSuggestions, setStudentSuggestions] = useState<StudentDto[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  // Non-validated form state
  const [clientType, setClientType] = useState<ClientType>('individual');
  const [idNumber, setIdNumber] = useState('');
  const [additionalMobile, setAdditionalMobile] = useState('');
  const [streetName, setStreetName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');

  // Holds the regionId to restore after regions finish loading in edit mode
  const pendingRegionId = useRef<string>('');

  // Close suggestions on outside click

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(customerSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      clientName: '',
      email: '',
      mobile: '',
      additionalMobile: undefined,
      lkCountryId: '',
      regionId: '',
    },
  });

  const watchedLkCountryId = watch('lkCountryId');

  // Student autocomplete state
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientNameChange = useCallback(
    (value: string) => {
      setValue('clientName', value, { shouldValidate: true });
      setStudentId(null); // clear selection when user types manually
      setShowSuggestions(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setStudentSuggestions([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setIsSearchingStudents(true);
        try {
          const action = await dispatch(
            searchStudentsByName({ schoolBrancheId, studentName: value.trim() })
          );
          if (searchStudentsByName.fulfilled.match(action)) {
            setStudentSuggestions(action.payload);
            setShowSuggestions(action.payload.length > 0);
          }
        } finally {
          setIsSearchingStudents(false);
        }
      }, 350);
    },
    [schoolBrancheId, dispatch, setValue]
  );

  const handleSelectStudent = (student: StudentDto) => {
    const fullName = [student.firstName, student.secondName, student.thirdName, student.fourthName]
      .filter(Boolean)
      .join(' ');
    setValue('clientName', fullName, { shouldValidate: true });
    setStudentId(student.id);
    setShowSuggestions(false);
    setStudentSuggestions([]);
  };

  // Fetch countries on mount
  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  // Pre-populate form when editing
  useEffect(() => {
    if (!isEditMode || !id) return;
    dispatch(fetchCustomerById(id)).then((action) => {
      if (!fetchCustomerById.fulfilled.match(action)) return;
      const d = action.payload;
      setClientType(numberToClientType[d.customerType] ?? 'individual');
      setIdNumber(d.nationalId ?? '');
      setAdditionalMobile(
        d.additionalAreaCode && d.additionalPhoneNumber
          ? `${d.additionalAreaCode}${d.additionalPhoneNumber}`
          : ''
      );
      setBuildingNumber(d.buldingNo ?? '');
      setStreetName(d.streetNo ?? '');
      setDistrictName(d.neighborhood ?? '');
      pendingRegionId.current = d.regionId ?? '';
      reset({
        clientName: d.name ?? '',
        email: d.email ?? '',
        mobile: d.areaCode && d.phoneNumber ? `${d.areaCode}${d.phoneNumber}` : '',
        additionalMobile: undefined,
        lkCountryId: d.lkCountryId ?? '',
        regionId: '',
      });
    });
  }, [isEditMode, id, dispatch, reset]);

  // Fetch regions when country changes
  useEffect(() => {
    if (watchedLkCountryId) {
      dispatch(fetchRegionsByCountry(watchedLkCountryId));
      setValue('regionId', '');
    } else {
      dispatch(clearRegions());
    }
  }, [watchedLkCountryId, dispatch, setValue]);

  useEffect(() => {
    if (pendingRegionId.current && regions.length > 0) {
      setValue('regionId', pendingRegionId.current);
      pendingRegionId.current = '';
    }
  }, [regions, setValue]);

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: lang === 'ar' ? c.arabicName : c.englishName,
  }));

  const regionOptions = regions.map((r) => ({
    value: r.id,
    label: lang === 'ar' ? r.arabicName : r.englishName,
  }));

  const parsePhone = (
    phone: string,
    countryId: string
  ): { areaCode: string; phoneNumber: string } => {
    const country = countries.find((c) => c.id === countryId);
    const areaCode = country?.areaCode ?? '';
    if (areaCode && phone.startsWith(areaCode)) {
      return { areaCode, phoneNumber: phone.slice(areaCode.length) };
    }
    // fallback: treat digits after leading '+XX' as phone number
    const match = phone.match(/^(\+\d{1,3})(\d+)$/);
    if (match) return { areaCode: match[1], phoneNumber: match[2] };
    return { areaCode, phoneNumber: phone };
  };

  const onSubmit = async (data: CustomerFormValues) => {
    const { areaCode, phoneNumber } = parsePhone(data.mobile, data.lkCountryId);
    const { areaCode: addCode, phoneNumber: addPhone } = additionalMobile
      ? parsePhone(additionalMobile, data.lkCountryId)
      : { areaCode: null, phoneNumber: null };

    const payload = {
      studentId: studentId ?? null,
      schoolBranchId: schoolBrancheId || null,
      name: data.clientName,
      customerType: clientTypeToNumber[clientType],
      nationalId: idNumber,
      email: data.email,
      areaCode,
      phoneNumber,
      additionalAreaCode: additionalMobile ? addCode : null,
      additionalPhoneNumber: additionalMobile ? addPhone : null,
      regionId: data.regionId,
      lkCountryId: data.lkCountryId,
      buldingNo: buildingNumber,
      streetNo: streetName,
      neighborhood: districtName,
    };

    try {
      if (isEditMode && id) {
        await dispatch(updateCustomer({ ...payload, id })).unwrap();
        showToast({ message: t('customers.customerUpdatedSuccessfully'), type: 'success' });
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        showToast({ message: t('customers.customerAddedSuccessfully'), type: 'success' });
      }
      navigate('/financial-management/customers');
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : t('common.errorOccurred');
      showToast({ message, type: 'error', isRaw: typeof error === 'string' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('customers.clientData')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('customers.clientName')} required error={errors.clientName?.message}>
            <div ref={suggestionBoxRef} className="relative w-full">
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    onBlur={field.onBlur}
                    onFocus={() => studentSuggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={t('customers.enterClientName')}
                    className="!bg-white"
                  />
                )}
              />
              {isSearchingStudents && (
                <div className="absolute end-3 top-1/2 -translate-y-1/2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                </div>
              )}
              {showSuggestions && studentSuggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  {studentSuggestions.map((student) => {
                    const fullName = [
                      student.firstName,
                      student.secondName,
                      student.thirdName,
                      student.fourthName,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <li
                        key={student.id}
                        onMouseDown={() => handleSelectStudent(student)}
                        className="flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-800">{fullName}</span>
                        {(student.grade || student.className) && (
                          <span className="text-xs text-gray-400">
                            {[student.grade, student.className].filter(Boolean).join(' - ')}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </FormField>

          <FormField label={t('customers.clientType')} required>
            <div className="flex items-center gap-6 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'company'}
                  onChange={() => setClientType('company')}
                />
                <span className="text-base text-black-800">{t('customers.company')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'institution'}
                  onChange={() => setClientType('institution')}
                />
                <span className="text-base text-black-800">{t('customers.institution')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'individual'}
                  onChange={() => setClientType('individual')}
                />
                <span className="text-base text-black-800">{t('customers.individual')}</span>
              </label>
            </div>
          </FormField>

          <div className="md:col-span-2">
            <FormField label={tOptional(t, 'customers.idNumber')}>
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={t('customers.enterIdNumber')}
                className="!bg-white"
              />
            </FormField>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('customers.contactInfo')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label={t('customers.email')} required error={errors.email?.message}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('customers.enterEmail')}
                    className="!bg-white"
                  />
                )}
              />
            </FormField>
          </div>

          <FormField label={t('customers.mobileNumber')} required error={errors.mobile?.message}>
            <Controller
              name="mobile"
              control={control}
              render={({ field }) => <PhoneInput value={field.value} onChange={field.onChange} />}
            />
          </FormField>

          <FormField label={t('customers.additionalMobileNumber')} required>
            <PhoneInput value={additionalMobile} onChange={setAdditionalMobile} />
          </FormField>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('customers.address')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('customers.country')} required error={errors.lkCountryId?.message}>
            <Controller
              name="lkCountryId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(val) => field.onChange(String(val))}
                  options={countryOptions}
                  placeholder={
                    isLoadingCountries ? t('common.loading') : t('customers.chooseCountry')
                  }
                  disabled={isLoadingCountries}
                  showSearch={true}
                />
              )}
            />
          </FormField>

          <FormField label={t('customers.city')} required error={errors.regionId?.message}>
            <Controller
              name="regionId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(val) => field.onChange(String(val))}
                  options={regionOptions}
                  placeholder={
                    isLoadingRegions
                      ? t('common.loading')
                      : !watchedLkCountryId
                        ? t('customers.chooseCountry')
                        : t('customers.chooseCity')
                  }
                  disabled={isLoadingRegions || !watchedLkCountryId}
                  showSearch={true}
                />
              )}
            />
          </FormField>

          <FormField label={tOptional(t, 'customers.streetName')}>
            <Input
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder={t('customers.enterStreetName')}
              className="!bg-white"
            />
          </FormField>

          <FormField label={tOptional(t, 'customers.districtName')}>
            <Input
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder={t('customers.enterDistrictName')}
              className="!bg-white"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={tOptional(t, 'customers.buildingNumber')}>
              <Input
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                placeholder={t('customers.enterBuildingNumber')}
                className="!bg-white"
              />
            </FormField>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/financial-management/customers')}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit(onSubmit)}
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? t('common.loading')
            : isEditMode
              ? t('actions.saveChanges')
              : t('common.add')}
        </Button>
      </div>
    </div>
  );
}
