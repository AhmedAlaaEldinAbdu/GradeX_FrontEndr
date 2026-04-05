import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskForm from './components/AddEditTaskForm';

export default function AddTaskPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.addPage.title' },
        ]}
      />
      <PageHeader title="tasksManagement.addPage.title" />
      <AddEditTaskForm mode="add" />
    </div>
  );
}
