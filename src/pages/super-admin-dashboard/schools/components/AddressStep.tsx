import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import Button from '@gradex/shared/components/Button';
import MapLocationModal from '@gradex/shared/components/MapLocationModal';
import AddressBranch from './AddressBranch';
import type { SchoolFormData } from '../types/school.types';
import {
  fetchCountries,
  selectCountries,
  selectIsLoadingCountries,
} from '@gradex/redux/features/lookups';
import CustomSelect from '@/shared/components/CustomSelect';
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

interface AddressStepProps {
  readOnly?: boolean;
}

/**
 * AddressStep - Third step in school form with react-hook-form integration
 * Includes main address and optional branches
 */
const AddressStep: React.FC<AddressStepProps> = ({ readOnly = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext<SchoolFormData>();

  const currentLang = i18n.language as 'ar' | 'en';

  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  const hasBranches = watch('hasBranches');

  const [branches, setBranches] = useState<BranchData[]>([
    {
      country: '',
      region: '',
      city: '',
      district: '',
      street: '',
      buildingNumber: '',
      postalCode: '',
    },
  ]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(null);

  const handleAddBranch = () => {
    setBranches([
      ...branches,
      {
        country: '',
        region: '',
        city: '',
        district: '',
        street: '',
        buildingNumber: '',
        postalCode: '',
      },
    ]);
  };

  const handleBranchChange = (index: number, field: string, value: string) => {
    const updatedBranches = [...branches];
    updatedBranches[index] = {
      ...updatedBranches[index],
      [field]: value,
    };
    setBranches(updatedBranches);
  };

  const handleOpenMapModal = (branchIndex: number | null = null) => {
    setSelectedBranchIndex(branchIndex);
    setIsMapModalOpen(true);
  };

  const handleCloseMapModal = () => {
    setIsMapModalOpen(false);
    setSelectedBranchIndex(null);
  };

  const handleConfirmLocation = (location: { lat: number; lng: number; address: string }) => {
    console.log('Selected location:', location);
    // TODO: Update form data with selected location
  };

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  return (
    <div className="space-y-6 p-4">
      {/* Map Button */}
      {!readOnly && (
        <div className="mb-6 flex w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenMapModal(null)}
            className="border-none bg-transparent text-left text-lg font-semibold text-green-600 hover:bg-transparent"
          >
            تحديد علي الخريطة
          </Button>
        </div>
      )}

      {/* Main Address Fields - Row 1 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.countryWithAl')}
          required
          error={errors.addressCountry?.message && t(errors.addressCountry.message)}
        >
          <Controller
            name="addressCountry"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value || ''}
                onChange={(value) => {
                  field.onChange(value);
                  trigger('addressCountry');
                }}
                options={countries.map((country) => ({
                  value: country.id,
                  label: currentLang === 'ar' ? country.arabicName : country.englishName,
                }))}
                placeholder={isLoadingCountries ? t('common.loading') : t('schools.selectCountry')}
                disabled={isLoadingCountries || readOnly}
                maxHeight="200px"
              />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.region')}
          required
          error={errors.region?.message && t(errors.region.message)}
        >
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t('schools.enterRegion')} disabled={readOnly} />
            )}
          />
        </FormField>
      </div>

      {/* Main Address Fields - Row 2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.city')}
          required
          error={errors.city?.message && t(errors.city.message)}
        >
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t('schools.enterCity')} disabled={readOnly} />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.district')}
          required
          error={errors.district?.message && t(errors.district.message)}
        >
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t('schools.enterDistrict')} disabled={readOnly} />
            )}
          />
        </FormField>
      </div>

      {/* Main Address Fields - Row 3 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.street')}
          required
          error={errors.street?.message && t(errors.street.message)}
        >
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t('schools.enterStreet')} disabled={readOnly} />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.buildingNumber')}
          required
          error={errors.buildingNumber?.message && t(errors.buildingNumber.message)}
        >
          <Controller
            name="buildingNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterBuildingNumber')}
                disabled={readOnly}
              />
            )}
          />
        </FormField>
      </div>

      {/* Main Address Fields - Row 4 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.postalCode')}
          required
          error={errors.postalCode?.message && t(errors.postalCode.message)}
        >
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder={t('schools.enterPostalCode')} disabled={readOnly} />
            )}
          />
        </FormField>

        <div className="md:col-span-1"></div>
      </div>

      {/* Has Branches Toggle */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="هل لديكم فروع اخري؟" required>
          <Controller
            name="hasBranches"
            control={control}
            render={({ field }) => (
              <div className="flex gap-6 text-right">
                <div className="flex items-center justify-end">
                  <label
                    htmlFor="hasBranchesSwitch"
                    className="items-centers relative inline-flex h-6 w-11 cursor-pointer"
                  >
                    <input
                      id="hasBranchesSwitch"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="peer sr-only"
                      aria-label="هل لديكم فروع اخري"
                      disabled={readOnly}
                    />
                    <div
                      className={`h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600 ${readOnly ? 'opacity-50' : ''}`}
                    ></div>
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5`}
                    ></span>
                  </label>
                </div>
              </div>
            )}
          />
        </FormField>
      </div>

      {/* Branch Sections */}
      {hasBranches && (
        <AddressBranch
          branches={branches}
          onBranchChange={handleBranchChange}
          onAddBranch={handleAddBranch}
          onOpenMapModal={handleOpenMapModal}
          readOnly={readOnly}
        />
      )}

      {/* Map Location Modal */}
      <MapLocationModal
        isOpen={isMapModalOpen}
        onClose={handleCloseMapModal}
        onConfirm={handleConfirmLocation}
        title={
          selectedBranchIndex === null
            ? 'تحديد موقع المدرسة'
            : `تحديد موقع الفرع ${selectedBranchIndex === 0 ? 'الثاني' : `${selectedBranchIndex + 2}`}`
        }
      />
    </div>
  );
};

export default AddressStep;
