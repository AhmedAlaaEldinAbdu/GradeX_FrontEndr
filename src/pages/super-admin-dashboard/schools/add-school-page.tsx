import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@gradex/shared/components/Button';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import CopyIcon from '@gradex/assets/icons/Copy.svg';
import SchoolForm from './components/SchoolForm';

const AddSchoolPage: React.FC = () => {
  const { t } = useTranslation();

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

      <SchoolForm mode="add" />
    </div>
  );
};

export default AddSchoolPage;
