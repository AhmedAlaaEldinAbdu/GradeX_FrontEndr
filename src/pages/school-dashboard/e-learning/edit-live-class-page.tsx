import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import LiveClassForm from './components/LiveClassForm';
import Loading from '@/shared/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchLessonById } from '@/redux/features/lessons/lessonsSlice';

export default function EditLiveClassPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const currentLesson = useAppSelector((state) => state.lessons.currentLesson);
  const isLoading = useAppSelector((state) => state.lessons.isLoading);
  const error = useAppSelector((state) => state.lessons.error);

  useEffect(() => {
    if (id) {
      dispatch(fetchLessonById(id));
    }
  }, [dispatch, id]);

  if (isLoading || (id && (!currentLesson || currentLesson.id !== id) && !error)) {
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

  if (!currentLesson || currentLesson.id !== id) {
    return null;
  }

  return <LiveClassForm mode="edit" initialData={currentLesson} />;
}
