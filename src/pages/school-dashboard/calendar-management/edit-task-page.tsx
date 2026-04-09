import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskForm from './components/AddEditTaskForm';

export default function EditTaskPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.editPage.title' },
        ]}
      />
      <PageHeader title="tasksManagement.editPage.title" />
      <AddEditTaskForm mode="edit" />
    </div>
  );
}
