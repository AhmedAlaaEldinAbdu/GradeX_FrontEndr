import { useParams } from 'react-router-dom';
import LessonForm, { type LessonData } from './LessonForm';

// Demo lesson data for testing (will be replaced with API call)
const DEMO_LESSON_DATA: Record<string, LessonData> = {
  'sun-1': {
    id: 'sun-1',
    subjectId: 'arabic',
    teacherId: '1',
    bookId: '1',
    classworkFromPage: '15',
    classworkToPage: '20',
    homeworkFromPage: '12',
    homeworkToPage: '15',
    descriptionAr: 'ادخل وصف للواجب',
    descriptionEn: '',
    sendTo: 'all',
    attachments: [],
    selectedStudents: [],
  },
  'sun-2': {
    id: 'sun-2',
    subjectId: 'arabic',
    teacherId: '2',
    bookId: '1',
    classworkFromPage: '20',
    classworkToPage: '25',
    homeworkFromPage: '15',
    homeworkToPage: '18',
    descriptionAr: '',
    descriptionEn: '',
    sendTo: 'specific',
    attachments: [],
    selectedStudents: [
      { id: '1', name: 'علي محمد', avatar: '' },
      { id: '2', name: 'علي محمد', avatar: '' },
    ],
  },
};

export default function EditLesson() {
  const { id } = useParams<{ id: string }>();

  // TODO: Replace with actual API call to fetch lesson data
  const lessonData = id ? DEMO_LESSON_DATA[id] : undefined;

  // In a real application, you would fetch the lesson data here
  // useEffect(() => {
  //   if (id) {
  //     dispatch(fetchLessonById(id));
  //   }
  // }, [id, dispatch]);

  return <LessonForm mode="edit" initialData={lessonData} />;
}
