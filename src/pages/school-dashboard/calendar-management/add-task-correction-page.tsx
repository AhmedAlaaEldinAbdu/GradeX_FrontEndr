import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskCorrectionForm from './components/AddEditTaskCorrectionForm';
import { useParams } from 'react-router-dom';

export default function AddTaskCorrectionPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.academicAffairs' },
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.detailsPage.title', path: `/calendar/tasks/details/${id}` },
          { label: 'tasksManagement.correctionFormPage.title' },
        ]}
      />

      <PageHeader title="tasksManagement.correctionFormPage.title" />

      <AddEditTaskCorrectionForm mode="create" />
    </div>
  );
}
