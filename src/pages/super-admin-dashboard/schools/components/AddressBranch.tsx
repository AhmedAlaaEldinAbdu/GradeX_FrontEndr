import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import Button from '@gradex/shared/components/Button';
import CustomSelect from '@/shared/components/CustomSelect';
import { selectCountries, selectIsLoadingCountries } from '@gradex/redux/features/lookups';
import i18n from '@/i18n';

interface BranchData {
  country: string;
  region: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
}

interface AddressBranchProps {
  branches: BranchData[];
  onBranchChange: (index: number, field: string, value: string) => void;
  onAddBranch: () => void;
  onOpenMapModal: (index: number) => void;
  readOnly?: boolean;
}

const AddressBranch: React.FC<AddressBranchProps> = ({
  branches,
  onBranchChange,
  onAddBranch,
  onOpenMapModal,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  return (
    <div className="space-y-8">
      {branches.map((branch, index) => (
        <div key={index} className="space-y-6 rounded-lg border border-gray-200 p-4">
          {/* Branch Header with Add Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">
              الفرع {index === 0 ? 'الثاني' : `${index + 2}`}
            </h3>
            {!readOnly && (
              <Button
                type="button"
                onClick={onAddBranch}
                className="flex h-10 w-10 items-center justify-center bg-green-600 p-0 text-white hover:bg-green-700"
                style={{ borderRadius: '50%' }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Button>
            )}
          </div>

          {/* Branch Map Button */}
          {!readOnly && (
            <div className="mb-4 flex w-full justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenMapModal(index)}
                className="border-none bg-transparent text-left text-sm font-semibold text-green-600 hover:bg-transparent"
                style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
              >
                تحديد علي الخريطة
              </Button>
            </div>
          )}

          {/* Branch Fields - Row 1 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('schools.countryWithAl')} required>
              <CustomSelect
                value={branch.country || ''}
                onChange={(value) => onBranchChange(index, 'country', value)}
                options={countries.map((country) => ({
                  value: country.id,
                  label: currentLang === 'ar' ? country.arabicName : country.englishName,
                }))}
                placeholder={isLoadingCountries ? t('common.loading') : t('schools.selectCountry')}
                disabled={isLoadingCountries || readOnly}
                maxHeight="200px"
              />
            </FormField>

            <FormField label={t('schools.region')} required>
              <Input
                value={branch.region}
                onChange={(e) => onBranchChange(index, 'region', e.target.value)}
                placeholder={t('schools.enterRegion')}
                disabled={readOnly}
              />
            </FormField>
          </div>

          {/* Branch Fields - Row 2 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('schools.city')} required>
              <Input
                value={branch.city}
                onChange={(e) => onBranchChange(index, 'city', e.target.value)}
                placeholder={t('schools.enterCity')}
                disabled={readOnly}
              />
            </FormField>

            <FormField label={t('schools.district')} required>
              <Input
                value={branch.district}
                onChange={(e) => onBranchChange(index, 'district', e.target.value)}
                placeholder={t('schools.enterDistrict')}
                disabled={readOnly}
              />
            </FormField>
          </div>

          {/* Branch Fields - Row 3 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('schools.street')} required>
              <Input
                value={branch.street}
                onChange={(e) => onBranchChange(index, 'street', e.target.value)}
                placeholder={t('schools.enterStreet')}
                disabled={readOnly}
              />
            </FormField>

            <FormField label={t('schools.buildingNumber')} required>
              <Input
                value={branch.buildingNumber}
                onChange={(e) => onBranchChange(index, 'buildingNumber', e.target.value)}
                placeholder={t('schools.enterBuildingNumber')}
                disabled={readOnly}
              />
            </FormField>
          </div>

          {/* Branch Fields - Row 4 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('schools.postalCode')} required>
              <Input
                value={branch.postalCode}
                onChange={(e) => onBranchChange(index, 'postalCode', e.target.value)}
                placeholder={t('schools.enterPostalCode')}
                disabled={readOnly}
              />
            </FormField>

            <div className="md:col-span-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressBranch;
