import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import HeaderControls from './HeaderControls';
import CustomImage from './CustomImage';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import type { SchoolActionKey } from '@/constants/role-access';
import { useRoleAccess } from '@/hooks/useRoleAccess';

type ActionType = {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'outline' | 'danger' | 'secondary' | 'info' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  imgSrc?: string;
  imgClassName?: string;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  circle?: boolean;
  actionKey?: SchoolActionKey;
};

type StatisticType = {
  value: string | number;
  label: string;
  className?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ActionType[];
  statistics?: StatisticType;
  statisticsClassName?: string;
  hasHeaderControls?: boolean;
};

const PageHeader = ({
  title,
  subtitle,
  actions = [],
  statistics,
  statisticsClassName,
  hasHeaderControls = false,
}: PageHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canPerformAction, denyAction } = useRoleAccess();

  const canRunAction = (action: ActionType) =>
    canPerformAction({
      control: 'page-header',
      actionKey: action.actionKey,
      destination: action.to,
      buttonType: action.type,
      variant: action.variant,
    });

  const runAction = (action: ActionType) => {
    if (!canRunAction(action)) {
      denyAction();
      return;
    }

    if (action.to) {
      navigate(action.to);
      return;
    }

    action.onClick?.();
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-lg font-medium text-black-900">{t(`${title}`)}</h1>
        {subtitle && <p className="text-sm font-normal text-[#3A3A3A]">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action, index) =>
          action.to ? (
            action.circle ? (
              <CustomImage
                key={index}
                onClick={() => runAction(action)}
                src={GreenPlusIcon}
                className={`${action.imgClassName} cursor-pointer`}
              />
            ) : (
              <Link
                key={index}
                to={action.to}
                onClick={(event) => {
                  if (!canRunAction(action)) {
                    event.preventDefault();
                    denyAction();
                  }
                }}
              >
                <Button
                  variant={action.variant}
                  size={action.size}
                  icon={action.icon}
                  imgSrc={action.imgSrc}
                  imgClassName={action.imgClassName}
                  fullWidth={action.fullWidth}
                  className={action.className}
                  disabled={action.disabled}
                  loading={action.loading}
                  type={action.type}
                  actionKey={action.actionKey}
                >
                  {action.label ? t(`${action.label}`) : null}
                </Button>
              </Link>
            )
          ) : action.circle ? (
            <CustomImage
              key={index}
              onClick={() => runAction(action)}
              src={GreenPlusIcon}
              className={`${action.imgClassName} cursor-pointer`}
            />
          ) : (
            <Button
              key={index}
              onClick={() => runAction(action)}
              variant={action.variant}
              size={action.size}
              icon={action.icon}
              imgSrc={action.imgSrc}
              imgClassName={action.imgClassName}
              fullWidth={action.fullWidth}
              className={action.className}
              disabled={action.disabled}
              loading={action.loading}
              type={action.type}
              actionKey={action.actionKey}
            >
              {action.label ? t(`${action.label}`) : null}
            </Button>
          )
        )}

        {statistics && (
          <div
            className={`flex items-center justify-center rounded-3xl bg-blue-100 px-4 py-1 text-sm font-normal text-[#0A6FC2] ${statisticsClassName ? statisticsClassName : ''}`}
          >
            <span className="whitespace-nowrap">
              {statistics.value}
              {statistics.label ? ` ${t(`${statistics.label}`)}` : ''}
            </span>
          </div>
        )}

        {hasHeaderControls && <HeaderControls />}
      </div>
    </div>
  );
};

export default PageHeader;
