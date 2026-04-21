import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';
import Interviews from './components/Interviews';

export default function InterviewsPage() {
  const interviewsCount = useAppSelector((state) => state.interviews.interviews.length);

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="interviews.title"
        statistics={{ value: interviewsCount, label: 'interviews.interviewCount' }}
      />

      {/* Main Content */}
      <Interviews />
    </div>
  );
}
