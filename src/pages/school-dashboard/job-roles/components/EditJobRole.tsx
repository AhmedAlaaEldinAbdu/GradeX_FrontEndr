import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import Loading from '@/shared/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchRoleById } from '@/redux/features/roles/rolesSlice';
import JobRoleForm from './JobRoleForm';

export default function EditJobRole() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const role = useAppSelector((state) => state.roles.currentRole);
  const isLoading = useAppSelector((state) => state.roles.isLoading);
  const error = useAppSelector((state) => state.roles.error);

  useEffect(() => {
    if (id) dispatch(fetchRoleById(id));
  }, [dispatch, id]);

  if (isLoading || (!role && !error)) {
    return (
      <Card padding="md">
        <Loading />
      </Card>
    );
  }

  if (!role || role.id !== id) {
    return (
      <Card padding="md">
        <div className="flex min-h-[200px] items-center justify-center text-gray-500">
          {t('rolesManagement.noRolesFound')}
        </div>
      </Card>
    );
  }

  return <JobRoleForm mode="edit" initialData={role} />;
}
