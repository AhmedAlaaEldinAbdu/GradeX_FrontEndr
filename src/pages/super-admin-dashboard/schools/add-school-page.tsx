import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import Button from '@gradex/shared/components/Button';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import FileIcon from '@gradex/assets/icons/file.svg';
import PhoneFillIcon from '@gradex/assets/icons/phone-fill.svg';
import LocationFillIcon from '@gradex/assets/icons/location-fill.svg';
import DiamondIcon from '@gradex/assets/icons/diamond.svg';
import CopyIcon from '@gradex/assets/icons/copy.svg';
import StepIndicator from './components/StepIndicator';
import BasicInfoStep from './components/BasicInfoStep';
import ContactInfoStep from './components/ContactInfoStep';
import AddressStep from './components/AddressStep';
import FacilitiesStep from './components/FacilitiesStep';

const AddSchoolPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    // Basic Info
    schoolName: '',
    academicSystem: '',
    foundationDate: '',
    aboutSchool: '',
    hasCurrentSystem: false,
    country: '',

    // Application Features
    applicationFeatures: {
      attendanceAndDeparture: false,
      remoteBookTracking: false,
      expensesTrackingOnly: false,
      fullExpensesPayment: false,
    },

    // Financial Data
    bankName: '',
    accountNumber: '',
    ibanNumber: '',

    // Contact Info
    phoneNumber: '',
    email: '',
    website: '',
    contactPerson: '',

    // Address
    region: '',
    state: '',
    city: '',
    street: '',
    district: '',
    buildingNumber: '',
    postalCode: '',
    hasBranches: false,

    // Facilities
    hasOtherBranches: false,

    // Features
    attendanceFeature: false,
    buyBooksFeature: false,
    payCashFeature: false,
    payInstallmentFeature: false,
    facilities: {
      playground: false,
      library: false,
      laboratory: false,
      sportField: false,
      canteen: false,
      busService: false,
    },
  });
  const steps = [
    {
      id: 1,
      label: t('schools.basicInfo'),
      icon: <img src={FileIcon} className="h-5 w-5" alt="Basic Info" />,
    },
    {
      id: 2,
      label: t('schools.contactInfo'),
      icon: <img src={PhoneFillIcon} className="h-5 w-5" alt="Contact Info" />,
    },
    {
      id: 3,
      label: t('schools.address'),
      icon: <img src={LocationFillIcon} className="h-5 w-5" alt="Address" />,
    },
    {
      id: 4,
      label: t('schools.facilities'),
      icon: <img src={DiamondIcon} className="h-5 w-5" alt="Facilities" />,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleApplicationFeatureChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      applicationFeatures: {
        ...prev.applicationFeatures,
        [name]: checked,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
  };

  const handleCertificateDelete = () => {
    setCertificateFile(null);
  };

  const handleFacilityCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [name]: checked,
      },
    }));
  };

  const handleRadioChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    navigate('/schools');
  };

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    { label: t('schools.addSchool') },
  ];

  return (
    <div dir="rtl" className="pb-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('schools.addSchool')}</h1>
        <Button
          variant="outline"
          onClick={() => {
            console.log('Copy link clicked');
          }}
          className="border-green-600 bg-transparent text-green-600 hover:bg-green-50"
        >
          <span className="inline-flex items-center gap-2">
            <img src={CopyIcon} alt="copy" className="h-5 w-5" />
            <span className="whitespace-nowrap">{t('schools.copyAdditionLink')}</span>
          </span>
        </Button>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="border border-gray-200 shadow-sm">
        <div className="min-h-[500px] px-8">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              onInputChange={handleInputChange}
              onRadioChange={handleRadioChange}
              onCheckboxChange={handleApplicationFeatureChange}
              onLogoUpload={handleLogoUpload}
              logoFileName={logoFile?.name}
            />
          )}
          {currentStep === 2 && (
            <ContactInfoStep
              formData={formData}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
          {currentStep === 3 && (
            <AddressStep
              formData={formData}
              onInputChange={handleInputChange}
              onRadioChange={handleRadioChange}
            />
          )}
          {currentStep === 4 && (
            <FacilitiesStep
              formData={formData}
              onCheckboxChange={handleFacilityCheckboxChange}
              onImageUpload={handleImageUpload}
              onCertificateUpload={handleCertificateUpload}
              onImageDelete={handleImageDelete}
              onCertificateDelete={handleCertificateDelete}
              imageFileName={imageFile?.name}
              certificateFileName={certificateFile?.name}
            />
          )}
        </div>

        <div className="mx-2 mt-8 flex items-center justify-end gap-3 border-t px-8 pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-8"
          >
            {t('actions.cancel')}
          </Button>

          {currentStep < steps.length ? (
            <Button variant="primary" onClick={handleNext} className="px-8">
              {t('actions.next')}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} className="px-8">
              {t('actions.save')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AddSchoolPage;
