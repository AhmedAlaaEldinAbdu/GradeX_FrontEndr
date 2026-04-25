import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Input from '@gradex/shared/components/Input';
import FormField from '@gradex/shared/components/FormField';
import Button from '@gradex/shared/components/Button';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@gradex/shared/components/FileUpload';
import { selectCountries, selectIsLoadingCountries } from '@gradex/redux/features/lookups';
import i18n from '@/i18n';
import type { ExistingImageAttachment } from '../utils/school-form.transformer';

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
}

interface AddressBranchProps {
  branches: BranchData[];
  onBranchChange: (index: number, field: string, value: string) => void;
  onAddBranch: () => void;
  onOpenMapModal: (index: number) => void;
  onBranchLogoChange?: (branchIndex: number, file: File | null) => void;
  onBranchImagesAdd?: (branchIndex: number, files: File[]) => void;
  onBranchImageDelete?: (branchIndex: number, fileIndex: number) => void;
  readOnly?: boolean;
}

const AddressBranch: React.FC<AddressBranchProps> = ({
  branches,
  onBranchChange,
  onAddBranch,
  onOpenMapModal,
  onBranchLogoChange,
  onBranchImagesAdd,
  onBranchImageDelete,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const logoInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const imagesInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const countries = useSelector(selectCountries);
  const isLoadingCountries = useSelector(selectIsLoadingCountries);

  const handleLogoChange = (branchIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onBranchLogoChange?.(branchIndex, file);
  };

  const handleImagesChange = (branchIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    onBranchImagesAdd?.(branchIndex, files);
    // reset so same files can be re-selected
    if (imagesInputRefs.current[branchIndex]) {
      imagesInputRefs.current[branchIndex]!.value = '';
    }
  };

  const allImageFileNames = (branch: BranchData): string[] => [
    ...(branch.existingSchoolImages?.map((a) => a.attachmentFile) || []),
    ...(branch.schoolImageFiles?.map((f) => f.name) || []),
  ];

  const allImageFiles = (branch: BranchData): File[] => branch.schoolImageFiles || [];

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
                className="border-none bg-transparent text-left text-sm font-semibold text-green-500 hover:bg-transparent"
                style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
              >
                {t('schools.mapLocation')}
              </Button>
            </div>
          )}

          {/* Branch Fields - Row 1 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label={t('schools.countryWithAl')} required>
              <CustomSelect
                value={branch.country || ''}
                onChange={(value) => {
                  const normalized = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
                  onBranchChange(index, 'country', normalized);
                }}
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

          {/* Branch Logo */}
          {!readOnly ? (
            <div className="space-y-2">
              <FormField label={t('schools.branchLogo')} optional>
                <div className="flex items-center gap-3">
                  <input
                    ref={(el) => {
                      logoInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoChange(index, e)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRefs.current[index]?.click()}
                  >
                    {branch.logoFile
                      ? branch.logoFile.name
                      : branch.logo || t('schools.uploadLogo')}
                  </Button>
                  {branch.logoFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={() => onBranchLogoChange?.(index, null)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </FormField>
            </div>
          ) : branch.logo ? (
            <FormField label={t('schools.branchLogo')}>
              <Input value={branch.logo} readOnly className="!bg-gray-50 !text-gray-500" />
            </FormField>
          ) : null}

          {/* Branch School Images */}
          {!readOnly ? (
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <FormField label={t('schools.schoolImages')} optional>
                <FileUpload
                  label=""
                  accept="image/*"
                  formatHints={['JPG', 'JPEG', 'PNG', 'SVG', 'WEBP']}
                  onChange={(e) => handleImagesChange(index, e)}
                  onDelete={(fileIndex?: number) => {
                    if (fileIndex !== undefined) onBranchImageDelete?.(index, fileIndex);
                  }}
                  fileNames={allImageFileNames(branch)}
                  files={allImageFiles(branch)}
                  uploadText={t('schools.uploadMedia')}
                  multiple={true}
                />
              </FormField>
            </div>
          ) : allImageFileNames(branch).length > 0 ? (
            <div className="space-y-2 rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700">{t('schools.schoolImages')}</p>
              {allImageFileNames(branch).map((name, i) => (
                <p key={i} className="text-sm text-gray-500">
                  {name}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default AddressBranch;
