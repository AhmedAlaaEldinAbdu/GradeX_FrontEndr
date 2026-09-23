import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import { useRoleAccess } from '@/hooks/useRoleAccess';

type HeaderAction = {
  label: string;
  onClick: () => void;
  iconSrc?: string;
  iconAlt?: string;
};

export type ProgressSummaryCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  progress?: number;
  progressColorClassName?: string;
  onClick?: () => void;
  actions?: Action[];
  className?: string;
  headerAction?: HeaderAction;
};

const clampProgress = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

export const getProgressColorClassName = (progress: number) => {
  if (progress > 60) {
    return 'bg-red-500';
  }

  if (progress > 30) {
    return 'bg-yellow-400';
  }

  return 'bg-green-500';
};

export const getProgressTextColorClassName = (progress: number) => {
  if (progress > 60) {
    return 'text-red-600';
  }

  if (progress > 30) {
    return 'text-yellow-600';
  }

  return 'text-green-600';
};

export default function ProgressSummaryCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  progress,
  progressColorClassName,
  onClick,
  actions = [],
  className = '',
  headerAction,
}: ProgressSummaryCardProps) {
  const { guardMutation } = useRoleAccess();
  const normalizedProgress = clampProgress(progress);
  const isClickable = Boolean(onClick);
  const resolvedProgressColorClassName =
    progressColorClassName || getProgressColorClassName(normalizedProgress);

  return (
    <Card
      className={`app-card-shadow rounded-3xl border border-black-100 p-4 ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
      padding="none"
    >
      <div
        className="flex h-full flex-col gap-4"
        onClick={onClick}
        onKeyDown={(event) => {
          if (!onClick) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div className="flex flex-1 items-start justify-between gap-3">
          <div className="flex gap-3">
            {imageSrc ? (
              <CustomImage
                src={imageSrc}
                alt={imageAlt || title}
                className="h-[60px] w-[60px] rounded-lg object-cover"
              />
            ) : null}
            <div className="flex flex-col items-start">
              <div className="text-sm font-normal text-black-900">{title}</div>
              {subtitle ? <div className="text-base text-[#646969]">{subtitle}</div> : null}
            </div>
          </div>

          <div className="flex items-start">
            {headerAction ? (
              <button
                type="button"
                aria-label={headerAction.label}
                title={headerAction.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-500/90"
                onClick={(event) => {
                  event.stopPropagation();
                  guardMutation(headerAction.onClick);
                }}
              >
                {headerAction.iconSrc ? (
                  <CustomImage
                    src={headerAction.iconSrc}
                    alt={headerAction.iconAlt || headerAction.label}
                    className="h-5 w-5"
                  />
                ) : null}
              </button>
            ) : null}
            {actions.length > 0 ? (
              <ActionsDropdown
                actions={actions}
                triggerClassName="flex h-10 w-10 items-center justify-center rounded-full bg-[#878F8F1A] p-0 transition-colors hover:bg-gray-200"
                iconClassName="h-5 w-5"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <span className="text-base font-medium text-black-900">{normalizedProgress}%</span>
          <div className="h-3 flex-1 rounded-full bg-[#EEEEEE]">
            <div
              className={`h-full rounded-full ${resolvedProgressColorClassName}`}
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
