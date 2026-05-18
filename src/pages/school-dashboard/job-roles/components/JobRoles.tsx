import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Tabs from '@/shared/components/Tabs';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import PeopleSupportIcon from '@/assets/icons/PeopleSupport.svg';
import JobRolesList from './JobRolesList';

interface JobRolesProps {
  onTabChange?: (tab: string) => void;
}

export default function JobRoles({ onTabChange }: JobRolesProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'roles-permissions');

  useEffect(() => {
    onTabChange?.(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs = [
    {
      id: 'roles-permissions',
      label: t('rolesManagement.rolesAndPermissions'),
      content: <JobRolesList />,
    },
    {
      id: 'system-users',
      label: t('rolesManagement.systemUsers'),
      content: (
        <Card>
          <EmptyState
            imgSrc={PeopleSupportIcon}
            description={t('rolesManagement.noUsersMessage')}
            blend={true}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 w-full px-1">
        <div>
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={handleTabChange}
            variant="underline"
            listClassName="flex w-[100%] md:w-[50%] lg:w-[25%] gap-2 mb-5 px-1 flex-wrap"
            lazy={true}
            searchParamKey="tab"
          />
        </div>
      </div>
    </div>
  );
}
