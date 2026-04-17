import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TaskCorrectionPreview from './components/TaskCorrectionPreview';
import { useParams } from 'react-router-dom';

export default function TaskCorrectionPreviewPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.detailsPage.title', path: `/calendar/tasks/details/${id}` },
          { label: 'tasksManagement.correctionPage.title' },
        ]}
      />

      <PageHeader title="tasksManagement.correctionPage.title" />

      <TaskCorrectionPreview />
    </div>
  );
}
