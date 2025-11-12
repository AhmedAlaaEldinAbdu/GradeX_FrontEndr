import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AcademicSystemTab from './AcademicSystemTab';
import EducationalStagesTab from './EducationalStagesTab';
import Tabs from '@/shared/components/Tabs';
import { ACADEMICSYSTEM, EDUCATIONALSTAGES, type IAcademicSystemProps } from '../types/academicSystem.types';

export default function AcademicSystem({ setSelectedTab }: IAcademicSystemProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<typeof ACADEMICSYSTEM | typeof EDUCATIONALSTAGES>(
    ACADEMICSYSTEM
  );

  const tabs = [
    {
      id: 'AcademicSystem',
      label: t('academicSystem.title'),
      content: <AcademicSystemTab />,
    },
    {
      id: 'EducationalStages',
      label: t('academicSystem.educationalStages'),
      content: <EducationalStagesTab />,
    },
  ];

  return (
    <div>
      <div className="mb-5 w-full px-1">
        <div>
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={(id) => {
              setActiveTab(id as typeof ACADEMICSYSTEM | typeof EDUCATIONALSTAGES);
              setSelectedTab(id as typeof ACADEMICSYSTEM | typeof EDUCATIONALSTAGES);
            }}
            variant="underline"
            listClassName="flex w-[100%] md:w-[75%] lg:w-[35%] gap-2 mb-5 px-1 flex-wrap"
          />
        </div>
      </div>
    </div>
  );
}
