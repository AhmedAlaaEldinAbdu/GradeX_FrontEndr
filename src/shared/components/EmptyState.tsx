import React from "react";
import Button from "./Button";

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
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="text-gray-300 mb-6">
        {imgSrc ? (
          <div>
            <img
              src={imgSrc as string}
              alt="Empty State"
              className={`max-w-xs mx-auto ${
                blend ? "mix-blend-luminosity" : ""
              }`}
            />
          </div>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p
        className={`text-gray-600 text-center max-w-md ${
          onAction ? "mb-6" : ""
        }`}
      >
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
