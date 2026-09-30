import React, { useEffect } from 'react';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import CustomImage from '@/shared/components/CustomImage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showCloseButton?: boolean;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  panelClassName?: string;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showHeader = true,
  showCloseButton = true,
  headerClassName = '',
  titleClassName = '',
  contentClassName = '',
  panelClassName = '',
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="bg-black/60 bg-opacity-50 absolute inset-0 transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full rounded-3xl bg-white shadow-xl ${sizeClasses[size]} mx-4 flex max-h-[90vh] flex-col ${panelClassName}`}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <div className={`relative flex items-center p-6 ${headerClassName}`}>
            {/* Title - Centered */}
            {title && (
              <div className="flex-1 text-center">
                {typeof title === 'string' ? (
                  <h2 className={`text-lg font-medium text-black-900 ${titleClassName}`}>
                    {title}
                  </h2>
                ) : (
                  <div className={`inline-block ${titleClassName}`}>{title}</div>
                )}
              </div>
            )}
            {/* Close Button - Absolute positioned at start */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute inset-e-6 transition-opacity hover:opacity-80"
                aria-label="Close"
              >
                <CustomImage src={XmarkCircleRedIcon} alt="Close" className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
