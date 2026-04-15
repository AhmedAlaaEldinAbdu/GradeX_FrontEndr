import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { tOptional } from '@/lib/utils';
import { fetchCountries, fetchRegionsByCountry, clearRegions } from '@/redux/features/lookups';
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
} from '@/redux/features/customers/customersSlice';
import { CustomerTypeEnum } from '@/services/api/types/customer.types';
import { useToast } from '@/shared/context/ToastContext';
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

  // Form state
  const [clientType, setClientType] = useState<ClientType>('individual');
  const [clientName, setClientName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [additionalMobile, setAdditionalMobile] = useState('');

  const [lkCountryId, setLkCountryId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [streetName, setStreetName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');

  // Holds the regionId to restore after regions finish loading in edit mode
  const pendingRegionId = useRef<string>('');

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
      setClientName(d.name ?? '');
      setIdNumber(d.nationalId ?? '');
      setEmail(d.email ?? '');
      setMobile(d.areaCode && d.phoneNumber ? `${d.areaCode}${d.phoneNumber}` : '');
      setAdditionalMobile(
        d.additionalAreaCode && d.additionalPhoneNumber
          ? `${d.additionalAreaCode}${d.additionalPhoneNumber}`
          : ''
      );
      setBuildingNumber(d.buldingNo ?? '');
      setStreetName(d.streetNo ?? '');
      setDistrictName(d.neighborhood ?? '');
      pendingRegionId.current = d.regionId ?? '';
      setLkCountryId(d.lkCountryId ?? '');
    });
  }, [isEditMode, id, dispatch]);

  // Fetch regions when country changes
  useEffect(() => {
    if (lkCountryId) {
      dispatch(fetchRegionsByCountry(lkCountryId));
      setRegionId('');
    } else {
      dispatch(clearRegions());
    }
  }, [lkCountryId, dispatch]);

  useEffect(() => {
    if (pendingRegionId.current && regions.length > 0) {
      setRegionId(pendingRegionId.current);
      pendingRegionId.current = '';
    }
  }, [regions]);

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

  const handleSubmit = async () => {
    const { areaCode, phoneNumber } = parsePhone(mobile, lkCountryId);
    const { areaCode: addCode, phoneNumber: addPhone } = additionalMobile
      ? parsePhone(additionalMobile, lkCountryId)
      : { areaCode: null, phoneNumber: null };

    const payload = {
      name: clientName,
      customerType: clientTypeToNumber[clientType],
      nationalId: idNumber,
      email,
      areaCode,
      phoneNumber,
      additionalAreaCode: additionalMobile ? addCode : null,
      additionalPhoneNumber: additionalMobile ? addPhone : null,
      regionId,
      lkCountryId,
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
          <FormField label={t('customers.clientName')} required>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={t('customers.enterClientName')}
              className="!bg-white"
            />
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
            <FormField label={t('customers.idNumber')} required>
              <Input
                value={idNumber}
                onChange={(e) => !isEditMode && setIdNumber(e.target.value)}
                placeholder={t('customers.enterIdNumber')}
                className={isEditMode ? 'cursor-not-allowed !bg-gray-100' : '!bg-white'}
                readOnly={isEditMode}
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
            <FormField label={t('customers.email')} required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('customers.enterEmail')}
                className="!bg-white"
              />
            </FormField>
          </div>

          <FormField label={t('customers.mobileNumber')} required>
            <PhoneInput value={mobile} onChange={setMobile} />
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
          <FormField label={t('customers.country')} required>
            <CustomSelect
              value={lkCountryId}
              onChange={(val) => setLkCountryId(String(val))}
              options={countryOptions}
              placeholder={isLoadingCountries ? t('common.loading') : t('customers.chooseCountry')}
              disabled={isLoadingCountries}
              showSearch={true}
            />
          </FormField>

          <FormField label={t('customers.city')} required>
            <CustomSelect
              value={regionId}
              onChange={(val) => setRegionId(String(val))}
              options={regionOptions}
              placeholder={
                isLoadingRegions
                  ? t('common.loading')
                  : !lkCountryId
                    ? t('customers.chooseCountry')
                    : t('customers.chooseCity')
              }
              disabled={isLoadingRegions || !lkCountryId}
              showSearch={true}
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
        <Button variant="success" onClick={handleSubmit} disabled={isCreating || isUpdating}>
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
