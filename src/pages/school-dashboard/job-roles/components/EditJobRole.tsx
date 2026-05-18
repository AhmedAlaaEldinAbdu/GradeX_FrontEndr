import { useParams } from 'react-router-dom';
import JobRoleForm from './JobRoleForm';
import { MOCK_ROLES } from '../data/mockRoles';

export default function EditJobRole() {
  const { id } = useParams<{ id: string }>();

  // Dummy lookup — replace with an API fetch on backend integration.
  const role = MOCK_ROLES.find((r) => r.id === id);

  if (!role) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">Role not found</div>
      </div>
    );
  }

  return <JobRoleForm mode="edit" initialData={role} />;
}
