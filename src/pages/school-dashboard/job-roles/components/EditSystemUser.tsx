import { useParams } from 'react-router-dom';
import SystemUserForm from './SystemUserForm';
import { MOCK_SYSTEM_USERS } from '../data/mockSystemUsers';

export default function EditSystemUser() {
  const { id } = useParams<{ id: string }>();
  const user = MOCK_SYSTEM_USERS.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return <SystemUserForm mode="edit" initialData={user} />;
}
