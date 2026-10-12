import { useTranslation } from 'react-i18next';

export default function SubjectStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs leading-4 font-semibold whitespace-nowrap ${
        isActive ? 'bg-[#ECFDF5] text-[#1E7A52]' : 'bg-[#FFF1F2] text-[#EF4444]'
      }`}
    >
      <span className={`size-1.5 rounded-full ${isActive ? 'bg-[#1E7A52]' : 'bg-[#EF4444]'}`} />
      {t(isActive ? 'subjects.status.active' : 'subjects.status.inactive')}
    </span>
  );
}
