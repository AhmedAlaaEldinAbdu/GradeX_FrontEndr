import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { useTranslation } from 'react-i18next';

type ActionType = {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'outline' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  fullWidth?: boolean;
};

type PageHeaderProps = {
  title: string;
  actions?: ActionType[];
};

const PageHeader = ({ title, actions = [] }: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-gray-800">{t(`${title}`)}</h1>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) =>
            action.to ? (
              <Link key={index} to={action.to}>
                <Button
                  variant={action.variant}
                  size={action.size}
                  icon={action.icon}
                  fullWidth={action.fullWidth}
                >
                  {t(`${action.label}`)}
                </Button>
              </Link>
            ) : (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant}
                size={action.size}
                icon={action.icon}
                fullWidth={action.fullWidth}
              >
                {t(`${action.label}`)}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
