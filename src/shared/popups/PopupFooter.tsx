import { useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ModalFooterContext } from './modalFooterContext';

interface PopupFooterProps {
  className?: string;
  children: ReactNode;
}

export default function PopupFooter({ className = '', children }: PopupFooterProps) {
  const slot = useContext(ModalFooterContext);
  const content = <div className={className}>{children}</div>;

  return slot ? createPortal(content, slot) : content;
}
