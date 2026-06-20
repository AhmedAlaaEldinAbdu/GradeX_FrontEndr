import TasksManagement from './components/TasksManagement';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function TasksPage() {
  return (
    <div className="space-y-6">
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
