import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TaskDetails from './components/TaskDetails';

export default function TaskDetailsPage() {

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.detailsPage.title' },
        ]}
      />

      <PageHeader title="tasksManagement.detailsPage.title" />

      <TaskDetails />
    </div>
  );
}