import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import BarChart from '@/shared/components/BarChart';
import Loading from '@/shared/components/Loading';
import type { SchoolCourseEducationalContentItem } from '@/services/api/types/school-course.types';

export type ContentFilter = 'month' | 'week' | 'day';

type EducationalContentCardProps = {
  filter: ContentFilter;
  isLoading: boolean;
  educationalContent: SchoolCourseEducationalContentItem[];
  onFilterChange: (filter: ContentFilter) => void;
};

const FILTERS: ContentFilter[] = ['day', 'week', 'month'];
const HOURS = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const WEEKS = ['week1', 'week2', 'week3', 'week4'] as const;
const CONTENT_MAX = 100;
const Y_TICKS = [100, 80, 60, 40, 20];

export default function EducationalContentCard({
  filter,
  isLoading,
  educationalContent,
  onFilterChange,
}: EducationalContentCardProps) {
  const { t } = useTranslation();

  const renderTooltip = (item: SchoolCourseEducationalContentItem) => (
    <div className="flex min-w-[140px] flex-col gap-2">
      {[
        { key: 'exams', value: item.examsCount },
        { key: 'courses', value: item.coursesCount },
      ].map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-5">
          <span className="text-sm font-medium text-white/85">
            {t(`eLearning.programs.${row.key}`)}
          </span>
          <span className="text-sm font-semibold text-white">{row.value}</span>
        </div>
      ))}
    </div>
  );

  const labels =
    filter === 'day'
      ? HOURS.map((hour) => ({ key: hour, label: hour }))
      : filter === 'month'
        ? WEEKS.map((week) => ({ key: week, label: t(`eLearning.content.weeks.${week}`) }))
        : DAYS.map((day) => ({ key: day, label: t(`eLearning.content.days.${day}`) }));

  const data = labels.map((label, index) => {
    const item = educationalContent[index] ?? { examsCount: 0, coursesCount: 0 };
    return {
      ...label,
      value: item.examsCount + item.coursesCount,
      tooltip: renderTooltip(item),
    };
  });

  return (
    <Card
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border border-[#DDE0E0]"
      padding="md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium text-[#3A3A3A]">{t('eLearning.content.title')}</h3>
        <div className="flex items-center gap-1 rounded-full border border-[#DDE0E0] p-1">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onFilterChange(option)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filter === option
                  ? 'bg-green-500 text-white'
                  : 'text-[#646969] hover:text-[#3A3A3A]'
              }`}
            >
              {t(`eLearning.content.filters.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[315px] w-full min-w-0 max-w-full">
        {isLoading ? (
          <div className="flex min-h-[315px] items-center justify-center">
            <Loading size="md" />
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden pb-2">
            <div className={filter === 'day' ? 'w-[1120px] max-w-none' : 'w-full min-w-0'}>
              <BarChart
                data={data}
                yTicks={Y_TICKS}
                max={CONTENT_MAX}
                renderTick={(tick) => tick}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
