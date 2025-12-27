import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TeacherPlacementForm from './components/TeacherPlacementForm';

export default function TeacherPlacementPage() {
  const { id } = useParams<{ id: string }>();

  const breadcrumbItems = [
    { label: 'sidebar.teachingStaff', path: '/teachers' },
    { label: 'sidebar.teachers', path: '/teachers' },
    { label: 'teachers.placement.breadcrumb' },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="teachers.placement.title" />
      <TeacherPlacementForm teacherId={id || ''} />
    </div>
  );
}
