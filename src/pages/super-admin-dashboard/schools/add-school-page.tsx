import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@gradex/shared/components/Button';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import CopyIcon from '@gradex/assets/icons/Copy.svg';
import SchoolForm from './components/SchoolForm';
import { useClipboard } from '@/hooks/useClipboard';

interface AddSchoolPageProps {
  showBreadcrumb?: boolean;
}

const AddSchoolPage: React.FC<AddSchoolPageProps> = ({ showBreadcrumb = true }) => {
  const { t } = useTranslation();
  const { isCopied, copyToClipboard } = useClipboard({
    successDuration: 3000,
    onSuccess: (text) => {
      console.log('Link copied successfully:', text);
    },
    onError: (error) => {
      console.error('Failed to copy link:', error);
    },
  });

  const breadcrumbItems = [
    { label: t('schools.title'), path: '/schools' },
    { label: t('schools.addSchool') },
  ];

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
  };

  return (
    <div dir="rtl" className="pb-8">
      {showBreadcrumb && <Breadcrumb items={breadcrumbItems} />}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('schools.addSchool')}</h1>

        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="border-green-600 bg-transparent text-green-600 hover:bg-green-50"
          aria-label={t('common.copyAdditionLink')}
        >
          <span className="inline-flex items-center gap-2">
            <img src={CopyIcon} alt="" className="h-5 w-5" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {isCopied ? t('common.copied') : t('common.copyAdditionLink')}
            </span>
          </span>
        </Button>
      </div>

      <SchoolForm mode="add" />
    </div>
  );
};

export default AddSchoolPage;
