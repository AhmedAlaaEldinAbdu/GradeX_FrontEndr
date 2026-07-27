import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import BarChart from '@/shared/components/BarChart';

type ContentFilter = 'month' | 'week' | 'day';

const FILTERS: ContentFilter[] = ['day', 'week', 'month'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00'] as const;
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu'] as const;
const WEEKS = ['week1', 'week2', 'week3', 'week4'] as const;

const CONTENT_MAX = 400;
const Y_TICKS = [400, 350, 300, 250, 200, 150, 100, 50, 0];

const TOOLTIP_ROWS = [
  { key: 'exams', color: '#178D4E', value: 0 },
  { key: 'courses', color: '#117BD7', value: 0 },
  { key: 'workshops', color: '#A353DD', value: 0 },
] as const;

export default function EducationalContentCard() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ContentFilter>('week');

  const renderTooltip = () => (
    <div className="flex min-w-[120px] flex-col gap-1">
      {TOOLTIP_ROWS.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-4">
          <span className="font-medium" style={{ color: row.color }}>
            {row.value}
          </span>
          <span className="text-[#3A3A3A]">{t(`eLearning.programs.${row.key}`)}</span>
        </div>
      ))}
    </div>
  );

  const data = (
    filter === 'day'
      ? HOURS.map((hour) => ({ key: hour, label: hour }))
      : filter === 'month'
        ? WEEKS.map((week) => ({ key: week, label: t(`eLearning.content.weeks.${week}`) }))
        : DAYS.map((day) => ({ key: day, label: t(`eLearning.content.days.${day}`) }))
  ).map((item) => ({
    ...item,
    value: 0,
    tooltip: renderTooltip(),
  }));

  return (
    <Card className="flex flex-1 flex-col gap-6 rounded-3xl border border-[#DDE0E0]" padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium text-[#3A3A3A]">{t('eLearning.content.title')}</h3>
        <div className="flex items-center gap-1 rounded-full border border-[#DDE0E0] p-1">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
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

      <BarChart
        data={data}
        yTicks={Y_TICKS}
        max={CONTENT_MAX}
        renderTick={(tick) => (tick === CONTENT_MAX ? `${tick}+` : tick)}
      />
    </Card>
  );
}
