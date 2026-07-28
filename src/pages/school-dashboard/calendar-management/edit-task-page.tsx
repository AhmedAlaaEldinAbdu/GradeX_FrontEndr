import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskForm from './components/AddEditTaskForm';
import { useTranslation } from 'react-i18next';

export default function EditTaskPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: 'sidebar.tasks', path: '/calendar/tasks' },
    { label: t('tasksManagement.editPage.title') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="tasksManagement.editPage.title" />
      <AddEditTaskForm mode="edit" />
    </div>
  );
}
