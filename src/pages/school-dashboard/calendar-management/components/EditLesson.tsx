import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LessonForm from './LessonForm';
import type { Lesson } from '@/services/api/types/lessons.types';
import Loading from '@/shared/components/Loading';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchLessonByIdSilent } from '@/redux/features/lessons/lessonsSlice';

export default function EditLesson() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [lessonData, setLessonData] = useState<Lesson | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lesson = await dispatch(fetchLessonByIdSilent(id)).unwrap();
        setLessonData(lesson);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
        setError('Failed to load lesson data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-500">Lesson not found</div>
      </div>
    );
  }

  return <LessonForm mode="edit" initialData={lessonData} />;
}
