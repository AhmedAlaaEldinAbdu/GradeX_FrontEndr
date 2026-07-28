import TasksManagement from './components/TasksManagement';
import PageHeader from '@/shared/components/PageHeader';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import { useTranslation } from 'react-i18next';

export default function TasksPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('tasksManagement.title') },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="tasksManagement.title"
        actions={[
          {
            label: 'tasksManagement.addTaskButton',
            to: '/calendar/tasks/add-task',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      <TasksManagement />
    </div>
  );
}
