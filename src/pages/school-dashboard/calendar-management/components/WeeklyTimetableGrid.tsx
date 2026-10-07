import { useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, format } from 'date-fns';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CustomImage from '@/shared/components/CustomImage';
import { ARABIC_DAY_NAMES, ENGLISH_DAY_NAMES } from '@/lib/utils/date-utils';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import DotsVerticalGray12Icon from '@/assets/icons/DotsVerticalGray12.svg';
import CoffeeAmber14Icon from '@/assets/icons/CoffeeAmber14.svg';
import MosqueGreen14Icon from '@/assets/icons/MosqueGreen14.svg';
import {
  findPeriodRowIndex,
  getSubjectTone,
  type ActivityType,
  type TimetableEvent,
  type TimetableLesson,
  type TimetableRow,
} from './WeeklyCalendarItems';

const TIME_COLUMN_WIDTH = 100;
const DAY_COLUMN_MIN_WIDTH = 150;
const LESSON_DRAG_TYPE = 'application/x-weekly-lesson';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  breakfast: CoffeeAmber14Icon,
  break: CoffeeAmber14Icon,
  assembly: MosqueGreen14Icon,
};

const formatRowTime = (total: number) => {
  const hours = Math.floor(total / 60) % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export type LessonMenuAction = {
  id: string;
  label: string;
  icon?: string;
  color: string;
  actionKey?: Action['actionKey'];
  onClick: (lesson: TimetableLesson) => void;
};

type WeeklyTimetableGridProps = {
  id?: string;
  weekStart: Date;
  days: number[];
  rows: TimetableRow[];
  lessons: TimetableLesson[];
  events: TimetableEvent[];
  eventDays: Set<number>;
  lessonActions: LessonMenuAction[];
  movingLessonId?: string | null;
  onLessonClick: (lesson: TimetableLesson) => void;
  onEmptyCellClick?: (dayIndex: number, row: TimetableRow) => void;
  onLessonDrop?: (lesson: TimetableLesson, dayIndex: number, row: TimetableRow) => void;
};

export default function WeeklyTimetableGrid({
  id,
  weekStart,
  days,
  rows,
  lessons,
  events,
  eventDays,
  lessonActions,
  movingLessonId,
  onLessonClick,
  onEmptyCellClick,
  onLessonDrop,
}: WeeklyTimetableGridProps) {
  const { t, i18n } = useTranslation();
  const dayNames = i18n.language === 'ar' ? ARABIC_DAY_NAMES : ENGLISH_DAY_NAMES;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const gridTemplateColumns = `${TIME_COLUMN_WIDTH}px repeat(${days.length}, minmax(${DAY_COLUMN_MIN_WIDTH}px, 1fr))`;
  const minWidth = TIME_COLUMN_WIDTH + days.length * DAY_COLUMN_MIN_WIDTH;

  const lessonsByCell = new Map<string, TimetableLesson[]>();
  for (const lesson of lessons) {
    const key = `${findPeriodRowIndex(rows, lesson.startMinutes)}-${lesson.dayIndex}`;
    lessonsByCell.set(key, [...(lessonsByCell.get(key) ?? []), lesson]);
  }
  lessonsByCell.forEach((list) => list.sort((a, b) => a.startMinutes - b.startMinutes));

  const eventsByCell = new Map<string, TimetableEvent[]>();
  for (const event of events) {
    const key = `${findPeriodRowIndex(rows, event.startMinutes)}-${event.dayIndex}`;
    eventsByCell.set(key, [...(eventsByCell.get(key) ?? []), event]);
  }

  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  const handleDrop = (event: DragEvent, dayIndex: number, row: TimetableRow) => {
    event.preventDefault();
    const lesson = lessonById.get(event.dataTransfer.getData(LESSON_DRAG_TYPE));
    setDropTarget(null);
    setDraggingId(null);
    if (!lesson || !onLessonDrop) return;
    const sameSlot = lesson.dayIndex === dayIndex && lesson.startMinutes === row.start;
    if (!sameSlot) onLessonDrop(lesson, dayIndex, row);
  };

  const renderTimeCell = (row: TimetableRow, withBackground: boolean) => (
    <div
      className={`flex flex-col items-center justify-center border-e border-[#E2E8F0] px-2 text-sm leading-[19.6px] font-semibold ${
        withBackground ? 'bg-[rgba(248,250,252,0.3)] py-2' : ''
      }`}
    >
      <span className="text-[black]">{formatRowTime(row.start)}</span>
      <span className="text-[#9D9D9D]">{formatRowTime(row.end)} -</span>
    </div>
  );

  const renderLessonCard = (lesson: TimetableLesson, row: TimetableRow, compact: boolean) => {
    const tone = getSubjectTone(lesson.subject);
    const isMoving = movingLessonId === lesson.id;
    const showTime = lesson.startMinutes !== row.start || lesson.endMinutes !== row.end;
    const menuActions: Action[] = lessonActions.map((action) => ({
      id: `${action.id}-${lesson.id}`,
      label: action.label,
      icon: action.icon,
      color: action.color,
      actionKey: action.actionKey,
      onClick: () => action.onClick(lesson),
    }));

    const iconChip = (
      <span className="flex shrink-0 items-center justify-center rounded-md bg-[rgba(255,255,255,0.7)] p-1 shadow-[0px_1px_4px_0px_rgba(12,12,13,0.05)]">
        <CustomImage src={compact ? tone.compactIcon : tone.icon} alt="" />
      </span>
    );

    return (
      <div
        key={lesson.id}
        role="button"
        tabIndex={0}
        draggable={Boolean(onLessonDrop) && !isMoving}
        onDragStart={(event) => {
          event.dataTransfer.setData(LESSON_DRAG_TYPE, lesson.id);
          event.dataTransfer.effectAllowed = 'move';
          setDraggingId(lesson.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDropTarget(null);
        }}
        onClick={() => onLessonClick(lesson)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onLessonClick(lesson);
          }
        }}
        className={`group/lesson relative w-full cursor-pointer rounded-lg border text-start transition-shadow hover:shadow-md ${tone.card} ${
          compact
            ? 'flex items-center justify-between gap-2 p-[7px]'
            : 'flex min-h-[79px] flex-1 flex-col justify-evenly px-2 py-1.5'
        } ${draggingId === lesson.id || isMoving ? 'opacity-50' : ''}`}
      >
        {compact ? (
          <>
            <div className="flex min-w-0 flex-col gap-1.5 pb-[3px]">
              <span className={`truncate text-xs leading-[15px] font-semibold ${tone.title}`}>
                {lesson.subject}
              </span>
              <span className={`truncate text-[10px] leading-[15px] ${tone.teacher}`}>
                {lesson.teacherName}
                {showTime ? ` · ${lesson.startTime} - ${lesson.endTime}` : ''}
              </span>
            </div>
            {iconChip}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className={`truncate text-xs leading-4 font-semibold ${tone.title}`}>
                {lesson.subject}
              </span>
              {iconChip}
            </div>
            <div className="flex flex-col">
              <span className={`truncate text-[11px] leading-[16.5px] ${tone.teacher}`}>
                {lesson.teacherName}
              </span>
              {showTime ? (
                <span className={`text-[10px] leading-[15px] ${tone.teacher}`} dir="ltr">
                  {lesson.startTime} - {lesson.endTime}
                </span>
              ) : null}
            </div>
          </>
        )}

        {isMoving ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="size-4 animate-spin rounded-full border-2 border-[#A7F3D0] border-t-[#1E7A52]" />
          </span>
        ) : menuActions.length > 0 ? (
          <div
            className="absolute end-1 top-1 opacity-0 transition-opacity group-hover/lesson:opacity-100 focus-within:opacity-100"
            onClick={(event) => event.stopPropagation()}
          >
            <ActionsDropdown
              actions={menuActions}
              triggerIcon={DotsVerticalGray12Icon}
              triggerClassName="flex size-5 items-center justify-center rounded-md bg-white/90 shadow-xs hover:bg-white"
              iconClassName=""
            />
          </div>
        ) : null}
      </div>
    );
  };

  const renderPeriodRow = (row: TimetableRow, rowIndex: number) => (
    <div
      key={row.key}
      className="grid min-h-[92px] border-b border-[#F1F5F9]"
      style={{ gridTemplateColumns }}
    >
      {renderTimeCell(row, true)}
      {days.map((dayIndex, position) => {
        const cellKey = `${rowIndex}-${dayIndex}`;
        const cellLessons = lessonsByCell.get(cellKey) ?? [];
        const cellEvents = eventsByCell.get(cellKey) ?? [];
        const isEmpty = cellLessons.length === 0 && cellEvents.length === 0;
        const compact = cellLessons.length + cellEvents.length > 1;
        const isDropTarget = dropTarget === cellKey;

        return (
          <div
            key={dayIndex}
            onDragOver={(event) => {
              if (!onLessonDrop || !draggingId) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (dropTarget !== cellKey) setDropTarget(cellKey);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDropTarget((current) => (current === cellKey ? null : current));
              }
            }}
            onDrop={(event) => handleDrop(event, dayIndex, row)}
            className={`group relative flex flex-col gap-1.5 p-1.5 transition-colors ${
              position < days.length - 1 ? 'border-e border-[#E2E8F0]' : ''
            } ${isDropTarget ? 'bg-[#ECFDF5]' : ''}`}
          >
            {cellLessons.map((lesson) => renderLessonCard(lesson, row, compact))}

            {cellEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-[7px] text-xs leading-4 font-semibold text-[#334155]"
              >
                <span className="truncate">{event.title}</span>
              </div>
            ))}

            {isEmpty && onEmptyCellClick ? (
              <button
                type="button"
                onClick={() => onEmptyCellClick(dayIndex, row)}
                aria-label={t('weeklyCalendar.toolbar.addLesson')}
                className="absolute inset-1.5 flex items-center justify-center rounded-lg border border-dashed border-transparent opacity-0 transition-all group-hover:border-[#A7F3D0] group-hover:bg-[rgba(236,253,245,0.5)] group-hover:opacity-100 focus-visible:opacity-100"
              >
                <CustomImage src={GreenPlusCircleIcon} alt="" className="h-6 w-6" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const renderActivityRow = (row: Extract<TimetableRow, { kind: 'activity' }>) => {
    const label = t(`weeklyCalendar.specialColumns.${row.type}`);
    const appliesToAll = days.every((day) => row.days.includes(day));
    const badge = (
      <>
        <span className="flex shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white p-[5px]">
          <CustomImage src={ACTIVITY_ICONS[row.type]} alt="" />
        </span>
        <span className="text-sm leading-[19.6px] font-semibold whitespace-nowrap text-[black]">
          {label}
        </span>
      </>
    );

    return (
      <div
        key={row.key}
        className="grid border-b border-[#F1F5F9] bg-[rgba(248,250,252,0.6)]"
        style={{ gridTemplateColumns }}
      >
        {renderTimeCell(row, false)}
        {appliesToAll ? (
          <div className="flex items-center gap-2 py-[5px]" style={{ gridColumn: '2 / -1' }}>
            <span className="mx-4 h-px flex-1 bg-[#E2E8F0]" />
            {badge}
            <span className="mx-4 h-px flex-1 bg-[#E2E8F0]" />
          </div>
        ) : (
          days.map((dayIndex, position) => (
            <div
              key={dayIndex}
              className={`flex items-center justify-center gap-2 py-[5px] ${
                position < days.length - 1 ? 'border-e border-[#E2E8F0]' : ''
              }`}
            >
              {row.days.includes(dayIndex) ? badge : null}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div id={id} className="w-full overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
      <div style={{ minWidth }}>
        <div
          className="grid border-b border-[#E2E8F0] bg-[rgba(248,250,252,0.75)]"
          style={{ gridTemplateColumns }}
        >
          <div className="flex items-center justify-center border-e border-[#E2E8F0] px-2 py-6 text-sm leading-[19.6px] font-semibold text-[black]">
            {t('weeklyCalendar.grid.time')}
          </div>
          {days.map((dayIndex, position) => (
            <div
              key={dayIndex}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2.5 text-sm leading-[19.6px] ${
                position < days.length - 1 ? 'border-e border-[#E2E8F0]' : ''
              }`}
            >
              <span className="font-bold text-[black]">{dayNames[dayIndex]}</span>
              <span className="text-[#9D9D9D]">{format(addDays(weekStart, dayIndex), 'd/M')}</span>
              <span className="flex h-2 items-end">
                {eventDays.has(dayIndex) ? (
                  <span
                    className="size-1.5 rounded-full bg-[#1E7A52]"
                    title={t('weeklyCalendar.grid.hasEvents')}
                  />
                ) : null}
              </span>
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) =>
          row.kind === 'period' ? renderPeriodRow(row, rowIndex) : renderActivityRow(row)
        )}
      </div>
    </div>
  );
}
