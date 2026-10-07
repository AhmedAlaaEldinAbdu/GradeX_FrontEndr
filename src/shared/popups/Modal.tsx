import React, { useEffect, useState } from 'react';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import CustomImage from '@/shared/components/CustomImage';
import { ModalFooterContext } from './modalFooterContext';

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
  placement?: 'center' | 'end';
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
  placement = 'center',
}) => {
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);

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

  const isSidePanel = placement === 'end';

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
    <div
      className={`fixed inset-0 z-50 flex ${
        isSidePanel ? 'items-stretch justify-end' : 'items-center justify-center'
      }`}
    >
      {/* Overlay */}
      <div
        className={`bg-black/60 bg-opacity-50 absolute inset-0 transition-opacity ${
          isSidePanel ? 'animate-fade-in motion-reduce:animate-none' : ''
        }`}
        onClick={handleOverlayClick}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full bg-white shadow-xl ${sizeClasses[size]} flex flex-col ${
          isSidePanel
            ? 'h-full animate-slide-in-from-right overflow-hidden rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! motion-reduce:animate-none rtl:animate-slide-in-from-left'
            : 'mx-4 max-h-[90vh] rounded-3xl'
        } ${panelClassName}`}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && isSidePanel && (
          <div
            className={`flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px] ${headerClassName}`}
          >
            <div className="min-w-0 text-start">
              {typeof title === 'string' ? (
                <h2 className={`text-xl leading-7 font-bold text-[black] ${titleClassName}`}>
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
              >
                <CustomImage src={CloseXGreenIcon} alt="" />
              </button>
            )}
          </div>
        )}
        {showHeader && (title || showCloseButton) && !isSidePanel && (
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
        <ModalFooterContext.Provider value={isSidePanel ? footerSlot : null}>
          <div className={`min-h-0 flex-1 overflow-y-auto p-6 ${contentClassName}`}>{children}</div>
        </ModalFooterContext.Provider>
        {isSidePanel && (
          <div
            ref={setFooterSlot}
            className="shrink-0 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5 empty:hidden"
          />
        )}
      </div>
    </div>
  );
};

export default Modal;
