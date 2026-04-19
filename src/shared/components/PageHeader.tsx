import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import HeaderControls from './HeaderControls';

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
};

type PageHeaderProps = {
  title: string;
  actions?: ActionType[];
  hasHeaderControls?: boolean;
};

const PageHeader = ({ title, actions = [], hasHeaderControls = false }: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-[2rem] font-medium text-black-900">{t(`${title}`)}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) =>
          action.to ? (
            <Link key={index} to={action.to}>
              <Button
                variant={action.variant}
                size={action.size}
                icon={action.icon}
                imgSrc={action.imgSrc}
                imgClassName={action.imgClassName}
                fullWidth={action.fullWidth}
                className={action.className}
              >
                {action.label ? t(`${action.label}`) : null}
              </Button>
            </Link>
          ) : (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant}
              size={action.size}
              icon={action.icon}
              imgSrc={action.imgSrc}
              imgClassName={action.imgClassName}
              fullWidth={action.fullWidth}
              className={action.className}
            >
              {action.label ? t(`${action.label}`) : null}
            </Button>
          )
        )}
        {hasHeaderControls && <HeaderControls />}
      </div>
    </div>
  );
};

export default PageHeader;
