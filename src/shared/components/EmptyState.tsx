import React from 'react';
import CustomImage from '@/shared/components/CustomImage';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  imgSrc?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  blend?: boolean;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  imgSrc,
  title,
  description,
  actionLabel,
  blend,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 text-gray-300">
        {imgSrc ? (
          <div>
            <CustomImage
              src={imgSrc as string}
              alt="Empty State"
              className={`mx-auto max-w-xs ${blend ? 'mix-blend-luminosity' : ''}`}
            />
          </div>
        ) : (
          icon
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-800">{title}</h3>
      <p className={`max-w-md text-center text-gray-600 ${onAction ? 'mb-6' : ''}`}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={<span>+</span>}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
