import { useParams } from 'react-router-dom';
import LiveClassForm from './components/LiveClassForm';
import { LIVE_CLASSES } from './components/live-classes-data';

export default function EditLiveClassPage() {
  const { id } = useParams<{ id: string }>();
  const liveClass = LIVE_CLASSES.find((item) => item.id === id);

  if (!liveClass) {
    return null;
  }

  return <LiveClassForm mode="edit" initialData={liveClass} />;
}
