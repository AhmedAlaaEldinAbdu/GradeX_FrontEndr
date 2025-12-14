import PageHeader from '@/shared/components/PageHeader';
import Interviews from './components/Interviews';

export default function InterviewsPage() {
  return (
    <div>
      {/* Page Header */}
      <PageHeader title="interviews.title" />

      {/* Main Content */}
      <Interviews />
    </div>
  );
}
