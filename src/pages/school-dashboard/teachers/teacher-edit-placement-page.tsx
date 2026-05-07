import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Loading from '@/shared/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeacherPersonalData } from '@/redux/features/teachers';
import EditTeacherPlacementForm from './components/EditTeacherPlacementForm';

export default function TeacherEditPlacementPage() {
  const { t } = useTranslation();
  const { id, assignmentId } = useParams<{ id: string; assignmentId: string }>();
  const dispatch = useAppDispatch();

  const teacherPersonalData = useAppSelector((state) => state.teachers.teacherPersonalData);
  const isLoadingPersonalData = useAppSelector((state) => state.teachers.isLoadingPersonalData);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeacherPersonalData(id));
    }
  }, [dispatch, id]);

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.staff'), path: '/teaching-staff?tab=teachers' },
    {
      label: teacherPersonalData?.fullName || t('common.loading'),
      path: `/teaching-staff/teachers/${id}?tab=educational-stages`,
    },
    {
      label: t('teachers.details.educationalStagesAndClassrooms'),
      path: `/teaching-staff/teachers/${id}?tab=educational-stages`,
    },
    { label: t('teachers.placement.editTitle') },
  ];

  if (isLoadingPersonalData || !teacherPersonalData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('teachers.placement.editTitle')} />
      <EditTeacherPlacementForm teacherId={id || ''} assignmentId={assignmentId || ''} />
    </div>
  );
}
