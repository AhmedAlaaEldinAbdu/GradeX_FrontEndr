import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/useRedux';
import CustomImage from '@/shared/components/CustomImage';

export default function HeaderPageInfo() {
  const { t } = useTranslation();
  const info = useAppSelector((state) => state.pageHeader.info);

  if (!info) return <div className="min-w-0 flex-1" />;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      {info.icon ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#1E7A52] bg-[#ECFDF5]">
          <CustomImage src={info.icon} alt="" className="size-5" />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col items-start justify-center gap-0.5 sm:gap-1">
        <h1 className="w-full truncate text-start text-sm font-bold text-[black] sm:text-base">
          {info.isRaw ? info.title : t(info.title)}
        </h1>
        {info.description ? (
          <p className="w-full truncate text-start text-[11px] text-[#9D9D9D] sm:text-xs">
            {info.isRaw ? info.description : t(info.description)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
