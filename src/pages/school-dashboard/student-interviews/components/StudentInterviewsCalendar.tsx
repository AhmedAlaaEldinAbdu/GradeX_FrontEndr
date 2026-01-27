import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import AddEditStudentInterviewPopup from '../popups/AddEditStudentInterviewPopup';
import StudentInterviewDetailsPopup from '../popups/StudentInterviewDetailsPopup';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import Card from '@/shared/components/Card';
import type { StudentInterviewFormProps } from '@/validations/student-interviews-validations';

interface CalendarStudentInterview extends CalendarEvent {
  studentName: string;
  educationalStage: string;
  supervisorName: string;
  notes?: string;
}

export default function StudentInterviewsCalendar() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<CalendarStudentInterview[]>([
    {
      id: '1',
      title: 'مقابلة محمد أحمد',
      studentName: 'محمد أحمد',
      educationalStage: 'المرحلة الابتدائية',
      supervisorName: 'أحمد علي',
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(10, 0, 0, 0)),
    },
    {
      id: '2',
      title: 'مقابلة سارة خالد',
      studentName: 'سارة خالد',
      educationalStage: 'المرحلة الإعدادية',
      supervisorName: 'منى سعيد',
      start: new Date(new Date().setHours(11, 0, 0, 0)),
      end: new Date(new Date().setHours(12, 0, 0, 0)),
    },
  ]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<StudentInterviewFormProps | null>(
    null
  );
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<CalendarStudentInterview | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenAdd = (date?: Date) => {
    setEditorMode('add');
    setEditorInitialValues(null);
    setSelectedDateForEditor(date || new Date());
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (event: CalendarStudentInterview) => {
    setEditorMode('edit');
    setEditingId(event.id);
    setEditorInitialValues({
      studentName: event.studentName,
      educationalStage: event.educationalStage,
      supervisorName: event.supervisorName,
      interviewDate: event.start.toISOString().split('T')[0],
      startTime: event.start.toTimeString().slice(0, 5),
      endTime: event.end.toTimeString().slice(0, 5),
      notes: event.notes ?? null,
    });
    setSelectedDateForEditor(event.start);
    setIsEditorOpen(true);
  };

  const handleSubmit = async (values: StudentInterviewFormProps) => {
    const start = new Date(`${values.interviewDate}T${values.startTime}`);
    const end = new Date(`${values.interviewDate}T${values.endTime}`);
    const title = `مقابلة ${values.studentName}`;

    if (editorMode === 'add') {
      const newEvent: CalendarStudentInterview = {
        id: (Math.random() * 1000).toString(),
        title,
        start,
        end,
        studentName: values.studentName,
        educationalStage: values.educationalStage,
        supervisorName: values.supervisorName,
        notes: values.notes ?? undefined,
      };
      setEvents([...events, newEvent]);
    } else {
      setEvents(
        events.map((ev) =>
          ev.id === editingId
            ? {
                ...ev,
                title,
                start,
                end,
                studentName: values.studentName,
                educationalStage: values.educationalStage,
                supervisorName: values.supervisorName,
                notes: values.notes ?? undefined,
              }
            : ev
        )
      );
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id));
    setDetailsOpen(false);
  };

  const contextMenuActions: ContextMenuAction[] = [
    {
      label: t('interviews.details'),
      icon: EyeFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const fullEvent = events.find((e) => e.id === event.id);
          if (fullEvent) {
            setSelectedInterview(fullEvent);
            setDetailsOpen(true);
          }
        }
      },
      color: 'primary',
      showOnEvent: true,
      showOnDate: false,
    },
    {
      label: t('interviews.addInterview'),
      icon: GreenPlusIcon,
      onClick: (date) => handleOpenAdd(date),
      color: 'green',
    },
    {
      label: t('interviews.editInterview'),
      icon: EditFillIcon,
      onClick: (_date, event) => {
        if (event) {
          const fullEvent = events.find((e) => e.id === event.id);
          if (fullEvent) handleOpenEdit(fullEvent);
        }
      },
      color: 'success',
      showOnEvent: true,
      showOnDate: false,
    },
    {
      label: t('interviews.deleteInterview'),
      icon: TrashFillIcon,
      onClick: (_date, event) => {
        if (event) handleDelete(event.id);
      },
      color: 'danger',
      showOnEvent: true,
      showOnDate: false,
    },
  ];

  return (
    <Card>
      <SharedCalendar events={events} contextMenuActions={contextMenuActions} defaultView="month" />

      <AddEditStudentInterviewPopup
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handleSubmit}
        mode={editorMode}
        initialValues={editorInitialValues as StudentInterviewFormProps}
        selectedDate={selectedDateForEditor}
      />

      <StudentInterviewDetailsPopup
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        interview={selectedInterview}
        onEdit={(id) => {
          setDetailsOpen(false);
          const ev = events.find((e) => e.id === id);
          if (ev) handleOpenEdit(ev);
        }}
        onDelete={handleDelete}
      />
    </Card>
  );
}
