import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import Select from '@gradex/shared/components/Select';
import FormField from '@gradex/shared/components/FormField';
import Button from '@gradex/shared/components/Button';
import MapLocationModal from '@gradex/shared/components/MapLocationModal';

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
  formData: {
    country: string;
    region: string;
    state: string;
    city: string;
    street: string;
    district: string;
    buildingNumber: string;
    postalCode: string;
    hasBranches: boolean;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onRadioChange: (name: string, value: boolean) => void;
  readOnly?: boolean;
}

const AddressStep: React.FC<AddressStepProps> = ({
  formData,
  onInputChange,
  onRadioChange,
  readOnly = false,
}) => {
  const { t } = useTranslation();
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

  const handleBranchInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedBranches = [...branches];
    updatedBranches[index] = { ...updatedBranches[index], [name]: value };
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
    // If selectedBranchIndex is null, it's for main address
    // Otherwise, it's for a specific branch
  };

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

      {/* Main Address Fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.countryWithAl')} required>
          <Select
            name="country"
            value={formData.country}
            onChange={onInputChange}
            options={[
              { value: '', label: t('schools.selectCountry') },
              { value: 'egypt', label: 'مصر' },
              { value: 'saudi', label: 'السعودية' },
            ]}
            required
            disabled={readOnly}
          />
        </FormField>

        <FormField label={t('schools.region')} required>
          <Input
            name="region"
            value={formData.region}
            onChange={onInputChange}
            placeholder={t('schools.enterRegion')}
            disabled={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.city')} required>
          <Input
            name="city"
            value={formData.city}
            onChange={onInputChange}
            placeholder={t('schools.enterCity')}
            disabled={readOnly}
          />
        </FormField>

        <FormField label={t('schools.district')} required>
          <Input
            name="district"
            value={formData.district}
            onChange={onInputChange}
            placeholder={t('schools.enterDistrict')}
            disabled={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.street')} required>
          <Input
            name="street"
            value={formData.street}
            onChange={onInputChange}
            placeholder={t('schools.enterStreet')}
            disabled={readOnly}
          />
        </FormField>

        <FormField label={t('schools.buildingNumber')} required>
          <Input
            name="buildingNumber"
            value={formData.buildingNumber}
            onChange={onInputChange}
            placeholder={t('schools.enterBuildingNumber')}
            disabled={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label={t('schools.postalCode')} required>
          <Input
            name="postalCode"
            value={formData.postalCode}
            onChange={onInputChange}
            placeholder={t('schools.enterPostalCode')}
            disabled={readOnly}
          />
        </FormField>

        <div className="md:col-span-1"></div>
      </div>

      {/* Has Branches Toggle */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="هل لديكم فروع اخري؟" required>
          <div className="flex gap-6 text-right">
            <div className="flex items-center justify-end">
              <label
                htmlFor="hasBranchesSwitch"
                className="items-centers relative inline-flex h-6 w-11 cursor-pointer"
              >
                <input
                  id="hasBranchesSwitch"
                  type="checkbox"
                  checked={formData.hasBranches}
                  onChange={(e) => onRadioChange('hasBranches', e.target.checked)}
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
        </FormField>
      </div>

      {/* Branch Sections */}
      {formData.hasBranches && (
        <div className="space-y-8">
          {branches.map((branch, index) => (
            <div key={index} className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              {/* Branch Header with Add Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  الفرع {index === 0 ? 'الثاني' : `${index + 2}`}
                </h3>
                <Button
                  type="button"
                  onClick={handleAddBranch}
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
              </div>

              {/* Branch Map Button */}
              <div className="mb-4 flex w-full justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenMapModal(index)}
                  className="border-none bg-transparent text-left text-sm font-semibold text-green-600 hover:bg-transparent"
                  style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                >
                  تحديد علي الخريطة
                </Button>
              </div>

              {/* Branch Fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label={t('schools.countryWithAl')} required>
                  <Select
                    name="country"
                    value={branch.country}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    options={[
                      { value: '', label: t('schools.selectCountry') },
                      { value: 'egypt', label: 'مصر' },
                      { value: 'saudi', label: 'السعودية' },
                    ]}
                    required
                  />
                </FormField>

                <FormField label={t('schools.region')} required>
                  <Input
                    name="region"
                    value={branch.region}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterRegion')}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label={t('schools.city')} required>
                  <Input
                    name="city"
                    value={branch.city}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterCity')}
                  />
                </FormField>

                <FormField label={t('schools.district')} required>
                  <Input
                    name="district"
                    value={branch.district}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterDistrict')}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label={t('schools.street')} required>
                  <Input
                    name="street"
                    value={branch.street}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterStreet')}
                  />
                </FormField>

                <FormField label={t('schools.buildingNumber')} required>
                  <Input
                    name="buildingNumber"
                    value={branch.buildingNumber}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterBuildingNumber')}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label={t('schools.postalCode')} required>
                  <Input
                    name="postalCode"
                    value={branch.postalCode}
                    onChange={(e) => handleBranchInputChange(index, e)}
                    placeholder={t('schools.enterPostalCode')}
                  />
                </FormField>

                <div className="md:col-span-1"></div>
              </div>
            </div>
          ))}
        </div>
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
