import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskForm from './components/AddEditTaskForm';
import { useTranslation } from 'react-i18next';

export default function AddTaskPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: 'sidebar.tasks', path: '/calendar/tasks' },
    { label: t('tasksManagement.addPage.title') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="tasksManagement.addPage.title" />
      <AddEditTaskForm mode="add" />
    </div>
  );
}
