import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import { useState } from 'react';
import AcademicSystemTab from './AcademicSystemTab';
import EducationalStagesTab from './EducationalStagesTab';

interface IAcademicSystemProps {
  setSelectedTab: (tab: 'AcademicSystem' | 'EducationalStages') => void;
}

export default function AcademicSystem({ setSelectedTab }: IAcademicSystemProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'AcademicSystem' | 'EducationalStages'>(
    'AcademicSystem'
  );

  const tabs = [
    { id: 'AcademicSystem', label: 'academicSystem.title' },
    { id: 'EducationalStages', label: 'academicSystem.educationalStages' },
  ] as const;

  const handleTabChange = (id: 'AcademicSystem' | 'EducationalStages') => {
    setActiveTab(id);
    setSelectedTab(id);
  };

  return (
    <div>
      <div className="mb-5 w-full max-w-lg px-1">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 text-center font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-green-500'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>
      <div>
        {activeTab === 'AcademicSystem' && <AcademicSystemTab />}
        {activeTab === 'EducationalStages' && <EducationalStagesTab />}
      </div>
    </div>
  );
}
