import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskForm from './components/AddEditTaskForm';
import { TASKS_MOCK } from './data/tasks.mock';

export default function EditTaskPage() {
  const { id } = useParams();

  const task = useMemo(() => TASKS_MOCK.find((item) => item.id === id), [id]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.editPage.title' },
        ]}
      />
      <PageHeader title="tasksManagement.editPage.title" />
      <AddEditTaskForm mode="edit" initialTask={task} />
    </div>
  );
}
