import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import SystemUserForm from './SystemUserForm';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchUserById } from '@/redux/features/user-management';

export default function EditSystemUser() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.userManagement.currentUser);
  const isLoading = useAppSelector((state) => state.userManagement.isLoading);

  useEffect(() => {
    if (id) dispatch(fetchUserById(id));
  }, [dispatch, id]);

  if (isLoading || !currentUser || currentUser.id !== id) {
    return (
      <Card padding="md">
        <Loading />
      </Card>
    );
  }

  return (
    <SystemUserForm
      mode="edit"
      initialData={{
        userId: currentUser.id,
        roleId: currentUser.roleId ?? '',
      }}
    />
  );
}
