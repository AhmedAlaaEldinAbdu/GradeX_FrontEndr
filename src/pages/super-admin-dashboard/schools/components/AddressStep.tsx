import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import Button from '@gradex/shared/components/Button';
import FileUpload from '@gradex/shared/components/FileUpload';
import ViewModeFileDisplay from '@gradex/shared/components/ViewModeFileDisplay';
import MapLocationModal from '@gradex/shared/components/MapLocationModal';
import AddressBranch from './AddressBranch';
import type { SchoolFormData } from '../types/school.types';
import type { ExistingImageAttachment } from '../utils/school-form.transformer';
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
  logo?: string;
  logoFile?: File;
  schoolImageFiles?: File[];
  existingSchoolImages?: ExistingImageAttachment[];
  latitude?: number;
  longitude?: number;
}

interface AddressStepProps {
  readOnly?: boolean;
  onLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoDelete?: () => void;
  logoFileName?: string;
  existingLogo?: string;
  onExistingLogoDelete?: () => void;
  initialBranches?: Array<{
    country: string;
    region: string;
    city: string;
    district: string;
    street: string;
    buildingNumber: string;
    postalCode: string;
    logo?: string;
    logoFile?: File;
    schoolImageFiles?: File[];
    existingSchoolImages?: ExistingImageAttachment[];
    latitude?: number;
    longitude?: number;
  }>;
  onBranchesChange?: (
    branches: Array<{
      country: string;
      region: string;
      city: string;
      district: string;
      street: string;
      buildingNumber: string;
      postalCode: string;
      logo?: string;
      logoFile?: File;
      schoolImageFiles?: File[];
      existingSchoolImages?: ExistingImageAttachment[];
      latitude?: number;
      longitude?: number;
    }>
  ) => void;
}

/**
 * AddressStep - Third step in school form with react-hook-form integration
 * Includes main address and optional branches
 */
const AddressStep: React.FC<AddressStepProps> = ({
  readOnly = false,
  onLogoUpload,
  onLogoDelete,
  logoFileName,
  existingLogo,
  onExistingLogoDelete,
  initialBranches,
  onBranchesChange,
}) => {
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
      schoolImageFiles: [],
      existingSchoolImages: [],
    },
  ]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(null);

  const handleBranchChange = (index: number, field: string, value: string) => {
    const updatedBranches = [...branches];
    updatedBranches[index] = {
      ...updatedBranches[index],
      [field]: value,
    };
    setBranches(updatedBranches);

    if (onBranchesChange) {
      onBranchesChange(updatedBranches);
    }
  };

  const handleAddBranch = () => {
    const newBranches = [
      ...branches,
      {
        country: '',
        region: '',
        city: '',
        district: '',
        street: '',
        buildingNumber: '',
        postalCode: '',
        schoolImageFiles: [],
        existingSchoolImages: [],
      },
    ];
    setBranches(newBranches);

    if (onBranchesChange) {
      onBranchesChange(newBranches);
    }
  };

  const handleBranchLogoChange = (branchIndex: number, file: File | null) => {
    const updatedBranches = [...branches];
    updatedBranches[branchIndex] = {
      ...updatedBranches[branchIndex],
      logoFile: file ?? undefined,
    };
    setBranches(updatedBranches);
    if (onBranchesChange) onBranchesChange(updatedBranches);
  };

  const handleBranchImagesAdd = (branchIndex: number, newFiles: File[]) => {
    const updatedBranches = [...branches];
    const existing = updatedBranches[branchIndex].schoolImageFiles || [];
    updatedBranches[branchIndex] = {
      ...updatedBranches[branchIndex],
      schoolImageFiles: [...existing, ...newFiles],
    };
    setBranches(updatedBranches);
    if (onBranchesChange) onBranchesChange(updatedBranches);
  };

  const handleBranchImageDelete = (branchIndex: number, fileIndex: number) => {
    const updatedBranches = [...branches];
    const branch = updatedBranches[branchIndex];
    const existingCount = (branch.existingSchoolImages || []).length;

    if (fileIndex < existingCount) {
      updatedBranches[branchIndex] = {
        ...branch,
        existingSchoolImages: (branch.existingSchoolImages || []).filter((_, i) => i !== fileIndex),
      };
    } else {
      const newIdx = fileIndex - existingCount;
      updatedBranches[branchIndex] = {
        ...branch,
        schoolImageFiles: (branch.schoolImageFiles || []).filter((_, i) => i !== newIdx),
      };
    }

    setBranches(updatedBranches);
    if (onBranchesChange) onBranchesChange(updatedBranches);
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

  // Initialize branches from initialBranches prop (for edit/view mode)
  useEffect(() => {
    if (initialBranches && initialBranches.length > 0) {
      console.log('📍 AddressStep: Initializing branches from props:', initialBranches);
      setBranches(initialBranches);
    }
  }, [initialBranches]);

  return (
    <div className="space-y-6 p-4">
      {/* Map Button */}
      {!readOnly && (
        <div className="mb-6 flex w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenMapModal(null)}
            className="border-none bg-transparent text-left text-lg font-semibold text-green-500 hover:bg-transparent"
          >
            {t('schools.mapLocation')}
          </Button>
        </div>
      )}

      {/* Main Address Fields - Row 1 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.countryWithAl')}
          required
          htmlFor="addressCountry"
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
          htmlFor="region"
          error={errors.region?.message && t(errors.region.message)}
        >
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterRegion')}
                disabled={readOnly}
                id="region"
              />
            )}
          />
        </FormField>
      </div>

      {/* Main Address Fields - Row 2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.city')}
          required
          htmlFor="city"
          error={errors.city?.message && t(errors.city.message)}
        >
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterCity')}
                disabled={readOnly}
                id="city"
              />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.district')}
          required
          htmlFor="district"
          error={errors.district?.message && t(errors.district.message)}
        >
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterDistrict')}
                disabled={readOnly}
                id="district"
              />
            )}
          />
        </FormField>
      </div>

      {/* Main Address Fields - Row 3 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label={t('schools.street')}
          required
          htmlFor="street"
          error={errors.street?.message && t(errors.street.message)}
        >
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterStreet')}
                disabled={readOnly}
                id="street"
              />
            )}
          />
        </FormField>

        <FormField
          label={t('schools.buildingNumber')}
          required
          htmlFor="buildingNumber"
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
                id="buildingNumber"
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
          htmlFor="postalCode"
          error={errors.postalCode?.message && t(errors.postalCode.message)}
        >
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('schools.enterPostalCode')}
                disabled={readOnly}
                id="postalCode"
              />
            )}
          />
        </FormField>

        <div className="md:col-span-1"></div>
      </div>
      {/* Main Branch Logo Upload (Optional) */}
      {!readOnly ? (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <FormField label={t('schools.branchLogo') || 'شعار الفرع الرئيسي'} optional>
            <FileUpload
              label=""
              accept="image/*"
              formatHints={['JPG', 'JPEG', 'PNG', 'SVG', 'WEBP']}
              onChange={onLogoUpload || (() => {})}
              onDelete={onLogoDelete ? () => onLogoDelete() : undefined}
              fileNames={logoFileName ? [logoFileName] : []}
              files={[]}
              uploadText={t('schools.uploadLogo') || 'رفع الشعار'}
              multiple={false}
            />
          </FormField>

          {/* Existing logo stored on the server */}
          {existingLogo && (
            <ViewModeFileDisplay
              files={[existingLogo]}
              onDelete={onExistingLogoDelete ? () => onExistingLogoDelete() : undefined}
            />
          )}
        </div>
      ) : existingLogo ? (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <ViewModeFileDisplay
            files={[existingLogo]}
            label={t('schools.branchLogo') || 'شعار الفرع الرئيسي'}
          />
        </div>
      ) : null}

      {/* Has Branches Toggle */}
      {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      aria-label={t('schools.hasOtherBranches')}
                      disabled={readOnly}
                    />
                    <div
                      className={`h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-green-600 ${readOnly ? 'opacity-50' : ''}`}
                    ></div>
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5`}
                    ></span>
                  </label>
                </div>
              </div>
            )}
          />
        </FormField>
      </div> */}

      {/* Branch Sections */}
      {hasBranches && (
        <AddressBranch
          branches={branches}
          onBranchChange={handleBranchChange}
          onAddBranch={handleAddBranch}
          onOpenMapModal={handleOpenMapModal}
          onBranchLogoChange={handleBranchLogoChange}
          onBranchImagesAdd={handleBranchImagesAdd}
          onBranchImageDelete={handleBranchImageDelete}
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
            ? t('schools.setSchoolLocation')
            : `${t('schools.setBranchLocation')} ${selectedBranchIndex === 0 ? t('schools.secondBranch') : `${selectedBranchIndex + 2}`}`
        }
      />
    </div>
  );
};

export default AddressStep;
