import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import PhoneInput from '@/shared/components/PhoneInput';
import Button from '@/shared/components/Button';

type ClientType = 'individual' | 'institution' | 'company';

export default function AddClientForm({ onCancel }: { onCancel?: () => void }) {
  const { t } = useTranslation();

  const [clientType, setClientType] = useState<ClientType>('individual');
  const [clientName, setClientName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [additionalMobile, setAdditionalMobile] = useState('');

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [streetName, setStreetName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');

  const handleAdd = () => {
    // Add logic later
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('clients.clientData')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('clients.clientName')} required>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={t('clients.enterClientName')}
              className="!bg-white"
            />
          </FormField>

          <FormField label={t('clients.clientType')} required>
            <div className="flex items-center gap-6 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'company'}
                  onChange={() => setClientType('company')}
                />
                <span className="text-base text-black-800">{t('clients.company')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'institution'}
                  onChange={() => setClientType('institution')}
                />
                <span className="text-base text-black-800">{t('clients.institution')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={clientType === 'individual'}
                  onChange={() => setClientType('individual')}
                />
                <span className="text-base text-black-800">{t('clients.individual')}</span>
              </label>
            </div>
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t('clients.idNumber')} required>
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={t('clients.enterIdNumber')}
                className="!bg-white"
              />
            </FormField>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('clients.contactInfo')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField label={t('clients.email')} required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('clients.enterEmail')}
                className="!bg-white"
              />
            </FormField>
          </div>

          <FormField label={t('clients.mobileNumber')} required>
            <PhoneInput value={mobile} onChange={setMobile} />
          </FormField>

          <FormField label={t('clients.additionalMobileNumber')} required>
            <PhoneInput value={additionalMobile} onChange={setAdditionalMobile} />
          </FormField>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <h3 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('clients.address')}
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('clients.country')} required>
            <CustomSelect
              value={country}
              onChange={(val) => setCountry(String(val))}
              options={[]}
              placeholder={t('clients.chooseCountry')}
              showSearch={true}
            />
          </FormField>

          <FormField label={t('clients.city')} required>
            <CustomSelect
              value={city}
              onChange={(val) => setCity(String(val))}
              options={[]}
              placeholder={t('clients.chooseCity')}
              showSearch={true}
            />
          </FormField>

          <FormField label={t('clients.streetNameOptional')}>
            <Input
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder={t('clients.enterStreetName')}
              className="!bg-white"
            />
          </FormField>

          <FormField label={t('clients.districtNameOptional')}>
            <Input
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder={t('clients.enterDistrictName')}
              className="!bg-white"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t('clients.buildingNumberOptional')}>
              <Input
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                placeholder={t('clients.enterBuildingNumber')}
                className="!bg-white"
              />
            </FormField>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="success" onClick={handleAdd}>
          {t('common.add')}
        </Button>
      </div>
    </div>
  );
}
