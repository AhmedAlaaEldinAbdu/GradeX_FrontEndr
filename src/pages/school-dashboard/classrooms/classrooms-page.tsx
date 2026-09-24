import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import CustomImage from '@/shared/components/CustomImage';
import ClassroomsList from './components/ClassroomsList';
import BookOutlineGreenIcon from '@gradex/assets/icons/BookOutlineGreen.svg';

export default function ClassroomsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.eduStages') },
    { label: t('grades.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#1E7A52] bg-[#ECFDF5]">
          <CustomImage src={BookOutlineGreenIcon} alt="" className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-start justify-center gap-1">
          <h1 className="text-2xl leading-8 font-bold tracking-[-0.6px] text-[black]">
            {t('grades.title')}
          </h1>
          <p className="text-sm leading-[19.6px] text-[#9D9D9D]">{t('grades.subtitle')}</p>
        </div>
      </div>

      {/* Main Content */}
      <ClassroomsList />
    </div>
  );
}
