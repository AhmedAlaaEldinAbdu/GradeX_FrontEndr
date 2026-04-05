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
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
      />

      <TasksManagement />
    </div>
  );
}
