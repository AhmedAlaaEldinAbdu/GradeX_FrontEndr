import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskCorrectionForm from './components/AddEditTaskCorrectionForm';
import { TASKS_MOCK } from './data/tasks.mock';

export default function EditTaskCorrectionPage() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);
  const localizedTaskName = task
    ? isArabic
      ? task.nameAr
      : task.nameEn
    : 'tasksManagement.detailsPage.title';

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: localizedTaskName, path: `/calendar/tasks/details/${id}` },
          { label: 'tasksManagement.editCorrectionPage.title' },
        ]}
      />

      <PageHeader title="tasksManagement.editCorrectionPage.title" />

      <AddEditTaskCorrectionForm mode="edit" />
    </div>
  );
}