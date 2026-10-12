import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import StatTeachersGreenIcon from '@/assets/icons/StatTeachersGreen28.svg';
import StatBookAmberIcon from '@/assets/icons/StatBookAmber28.svg';

const ICON_SHADOW = 'shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_1px_2px_rgba(12,12,13,0.05)]';

type StatCardProps = {
  title: string;
  badge: string;
  value: number;
  hint: string;
  icon: string;
  iconBgClass: string;
  badgeClass: string;
};

function StatCard({ title, badge, value, hint, icon, iconBgClass, badgeClass }: StatCardProps) {
  return (
    <div className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white px-6 py-[17px] sm:px-[49px]">
      <div className="flex min-w-0 flex-col items-start gap-2">
        <span className="text-base leading-[22.4px] font-medium text-[#9D9D9D]">{title}</span>
        <div className="flex items-center gap-4">
          <span className="text-[28px] leading-[39.2px] font-bold text-[black]">{value}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs leading-[16.8px] font-medium ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
        <span className="text-xs leading-[16.8px] font-medium text-[#9D9D9D]">{hint}</span>
      </div>
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${iconBgClass} ${ICON_SHADOW}`}
      >
        <CustomImage src={icon} alt="" />
      </div>
    </div>
  );
}

type SubjectsStatsCardsProps = {
  subjectsCount: number;
  teachersCount: number;
};

export default function SubjectsStatsCards({
  subjectsCount,
  teachersCount,
}: SubjectsStatsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <StatCard
        title={t('subjects.totalSubjects')}
        badge={t('subjects.stats.subjectsBadge')}
        value={subjectsCount}
        hint={t('subjects.stats.subjectsHint')}
        icon={StatBookAmberIcon}
        iconBgClass="bg-[#FFFBEB]"
        badgeClass="bg-[#FFFBEB] text-[#D97706]"
      />
      <StatCard
        title={t('teachers.totalTeachers')}
        badge={t('subjects.stats.teachersBadge')}
        value={teachersCount}
        hint={t('subjects.stats.teachersHint')}
        icon={StatTeachersGreenIcon}
        iconBgClass="bg-[#ECFDF5]"
        badgeClass="bg-[#ECFDF5] text-[#1E7A52]"
      />
    </div>
  );
}
