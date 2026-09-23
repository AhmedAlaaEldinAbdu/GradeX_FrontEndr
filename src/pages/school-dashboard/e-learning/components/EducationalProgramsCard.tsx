import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';

type ProgramDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type EducationalProgramsCardProps = {
  examsCount: number;
  coursesCount: number;
};

const RADIUS = 70;
const STROKE = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function EducationalProgramsCard({
  examsCount,
  coursesCount,
}: EducationalProgramsCardProps) {
  const { t } = useTranslation();

  const programs: ProgramDatum[] = [
    { key: 'exams', label: t('eLearning.programs.exams'), value: examsCount, color: '#117BD7' },
    { key: 'courses', label: t('eLearning.courses.title'), value: coursesCount, color: '#1BD867' },
  ];

  const total = programs.reduce((sum, program) => sum + program.value, 0);
  const completion = total === 0 ? 0 : Math.round((coursesCount / total) * 100);

  let consumed = 0;
  const arcs = programs.map((program) => {
    const share = total === 0 ? 1 / programs.length : program.value / total;
    const length = share * CIRCUMFERENCE;
    const arc = {
      color: program.color,
      dashArray: `${length} ${CIRCUMFERENCE - length}`,
      dashOffset: -consumed,
    };
    consumed += length;
    return arc;
  });

  return (
    <Card className="flex flex-col gap-6 rounded-3xl border border-[#DDE0E0]" padding="md">
      <h3 className="text-base font-medium text-black-900">{t('eLearning.programs.title')}</h3>

      {/* Donut */}
      <div className="relative mx-auto h-[200px] w-[200px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          {arcs.map((arc, index) => (
            <circle
              key={programs[index].key}
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-lg border border-black-100 bg-white px-3 py-1 text-sm font-normal text-black-900 shadow-xs">
            {completion}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-6">
        {programs.map((program) => (
          <div key={program.key} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: program.color }}
              />
              <span className="text-base font-normal text-[#3A3A3A]">{program.label}</span>
            </div>
            <span className="text-sm font-normal text-[#3A3A3A]">{program.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
