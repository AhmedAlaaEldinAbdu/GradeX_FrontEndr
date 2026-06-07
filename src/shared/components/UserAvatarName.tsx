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
  size?: UserAvatarNameSize;
  align?: UserAvatarNameAlign;
  className?: string;
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
  size = 'md',
  align = 'center',
  className = '',
}: UserAvatarNameProps) {
  const { t } = useTranslation();
  const sizeClasses = SIZE_CLASSES[size];
  const label = viewLabel ?? t('common.view');

  return (
    <div className={`flex items-center ${ALIGN_CLASSES[align]} ${sizeClasses.gap} ${className}`}>
      <CustomImage
        src={avatarSrc || fallbackSrc}
        fallbackSrc={fallbackSrc}
        alt={name ?? ''}
        className={`${sizeClasses.avatar} shrink-0 rounded-lg object-cover`}
      />
      <span
        className="w-[150px] truncate text-start text-sm font-normal text-[#646969]"
        title={name ?? ''}
      >
        {name?.trim() ? name : '-'}
      </span>
      {onView && (
        <IconButton
          variant="blue"
          ariaLabel={label}
          onClick={onView}
          className={`${sizeClasses.button} shrink-0`}
        >
          <CustomImage src={EyeStyledIcon} alt={label} className={sizeClasses.icon} />
        </IconButton>
      )}
    </div>
  );
}
