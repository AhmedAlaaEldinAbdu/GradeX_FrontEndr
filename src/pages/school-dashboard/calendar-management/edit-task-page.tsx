import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import { useTranslation } from 'react-i18next';
import TaskForm from './components/TaskForm';
import { TASKS_MOCK } from './data/tasks.mock';

export default function EditTaskPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);

  if (!task) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'sidebar.tasks', path: '/calendar/tasks' },
            { label: 'tasksManagement.editPage.title' },
          ]}
        />
        <PageHeader title="tasksManagement.editPage.title" />
        <Card>
          <div className="p-6 text-center text-gray-600">{t('tasksManagement.messages.notFound')}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.editPage.title' },
        ]}
      />
      <PageHeader title="tasksManagement.editPage.title" />
      <TaskForm mode="edit" initialTask={task} />
    </div>
  );
}