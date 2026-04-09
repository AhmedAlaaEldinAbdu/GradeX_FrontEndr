import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddEditTaskCorrectionForm from './components/AddEditTaskCorrectionForm';

export default function EditTaskCorrectionPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'sidebar.tasks', path: '/calendar/tasks' },
          { label: 'tasksManagement.detailsPage.title', path: `/calendar/tasks/details/${id}` },
          { label: 'tasksManagement.editCorrectionPage.title' },
        ]}
      />

      <PageHeader title="tasksManagement.editCorrectionPage.title" />

      <AddEditTaskCorrectionForm mode="edit" />
    </div>
  );
}
