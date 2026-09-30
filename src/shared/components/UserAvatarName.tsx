import type { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

type UserAvatarNameSize = 'sm' | 'md';
type UserAvatarNameAlign = 'start' | 'center' | 'between';

interface UserAvatarNameProps {
  name?: string | null;
  avatarSrc?: string | null;
  fallbackSrc?: string;
  onView?: MouseEventHandler<HTMLButtonElement>;
  viewLabel?: string;
  viewCount?: number;
  size?: UserAvatarNameSize;
  align?: UserAvatarNameAlign;
  className?: string;
  specificClassName?: string;
}

const SIZE_CLASSES: Record<
  UserAvatarNameSize,
  { gap: string; avatar: string; button: string; icon: string }
> = {
  sm: { gap: 'gap-2', avatar: 'h-9 w-9', button: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { gap: 'gap-3', avatar: 'h-10 w-10', button: 'h-10 w-10', icon: 'h-6 w-6' },
};

const ALIGN_CLASSES: Record<UserAvatarNameAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
};

export default function UserAvatarName({
  name,
  avatarSrc,
  fallbackSrc = DefaultAvatar,
  onView,
  viewLabel,
  viewCount,
  size = 'md',
  align = 'center',
  className = '',
  specificClassName = '',
}: UserAvatarNameProps) {
  const { t } = useTranslation();
  const sizeClasses = SIZE_CLASSES[size];
  const label = viewLabel ?? t('common.view');
  const hasViewCount = viewCount !== undefined && viewCount !== null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const resolvedAvatarSrc = avatarSrc
    ? /^https?:\/\//.test(avatarSrc)
      ? avatarSrc
      : `${baseUrl}/${avatarSrc}`
    : undefined;

  return (
    <div className={`flex items-center ${ALIGN_CLASSES[align]} ${sizeClasses.gap} ${className}`}>
      <div
        className={`flex items-center ${ALIGN_CLASSES[align]} ${sizeClasses.gap} ${specificClassName}`}
      >
        <CustomImage
          src={resolvedAvatarSrc ?? fallbackSrc}
          fallbackSrc={fallbackSrc}
          alt={name ?? ''}
          className={`${sizeClasses.avatar} shrink-0 rounded-lg object-cover`}
        />
        {name ? (
          <span
            className="w-[150px] truncate text-start text-sm font-normal text-[#646969]"
            title={name ?? ''}
          >
            {name?.trim() ? name : '-'}

            {hasViewCount && (
              <span className="mx-2 shrink-0 text-start text-base font-medium text-[#087B48]">
                <bdi>+{viewCount}</bdi>
              </span>
            )}
          </span>
        ) : (
          ''
        )}
      </div>
      {onView && (
        <IconButton
          variant="blue"
          ariaLabel={label}
          onClick={!hasViewCount ? onView : undefined}
          className={`${sizeClasses.button} shrink-0 ${hasViewCount ? 'invisible' : ''}`}
        >
          <CustomImage src={EyeStyledIcon} alt={label} className={`${sizeClasses.icon} `} />
        </IconButton>
      )}
    </div>
  );
}
