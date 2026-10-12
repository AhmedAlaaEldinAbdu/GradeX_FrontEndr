const STAGE_STYLES: [string[], string][] = [
  [['primary', 'ابتدائ', 'إبتدائ'], 'border-[#ECFDF5] bg-[#ECFDF5] text-[#1E7A52]'],
  [['preparatory', 'middle', 'متوسط'], 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'],
  [['secondary', 'ثانوي'], 'border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]'],
  [['kindergarten', 'روضة'], 'border-[#E9D5FF] bg-[#FAF5FF] text-[#7E22CE]'],
];

const DEFAULT_STYLE = 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]';

type SubjectStageBadgeProps = {
  label: string;
  nameEn: string;
};

export default function SubjectStageBadge({ label, nameEn }: SubjectStageBadgeProps) {
  const key = `${nameEn} ${label}`.toLowerCase();
  const style =
    STAGE_STYLES.find(([keywords]) => keywords.some((keyword) => key.includes(keyword)))?.[1] ??
    DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-[11px] py-[3px] text-xs leading-[16.8px] font-medium whitespace-nowrap ${style}`}
    >
      {label}
    </span>
  );
}
