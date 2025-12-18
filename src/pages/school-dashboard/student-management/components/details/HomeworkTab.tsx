import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';

interface HomeworkTabProps {
  studentId: string;
}

export default function HomeworkTab({ studentId }: HomeworkTabProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="py-8 text-center text-gray-500">
        <p>{t('students.details.homeworkComingSoon')}</p>
        <p className="mt-2 text-sm text-gray-400">Student ID: {studentId}</p>
      </div>
    </Card>
  );
}
