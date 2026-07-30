import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ActionsDropdown, { type Action } from './ActionsDropdown';
import RefreshSolidBlackIcon from '@gradex/assets/icons/RefreshSolidBlack.svg';
import MaterialPdfBlackIcon from '@gradex/assets/icons/MaterialPdfBlack.svg';
import ExcelFileBlackIcon from '@gradex/assets/icons/ExcelFileBlack.svg';
import PrinterBlackIcon from '@gradex/assets/icons/PrinterBlack.svg';
import DotsBlackIcon from '@gradex/assets/icons/DotsBlack.svg';

export type HeaderAction = {
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

export default function HeaderControls() {
  const { t, i18n } = useTranslation();

  const handleReload = () => {
    console.log('Reloading...');
  };

  const handleExportPdf = () => {
    console.log('Exporting PDF...');
  };

  const handleExportExcel = () => {
    console.log('Exporting Excel...');
  };

  const handlePrint = () => {
    console.log('Printing...');
  };

  const builtInDropdownActions: Action[] = [
    {
      id: 'reload',
      label: t('studentManagement.reload'),
      icon: RefreshSolidBlackIcon,
      onClick: handleReload,
      color: 'bg-gray-100 hover:bg-gray-200',
      actionKey: 'reload',
    },
    {
      id: 'print',
      label: t('studentManagement.print'),
      icon: PrinterBlackIcon,
      onClick: handlePrint,
      color: 'bg-blue-100 hover:bg-blue-200',
      actionKey: 'print',
    },
    {
      id: 'export-pdf',
      label: t('studentManagement.exportPdf'),
      icon: MaterialPdfBlackIcon,
      onClick: handleExportPdf,
      color: 'bg-red-100 hover:bg-red-200',
      actionKey: 'exportPdf',
    },
    {
      id: 'export-excel',
      label: t('studentManagement.exportExcel'),
      icon: ExcelFileBlackIcon,
      onClick: handleExportExcel,
      color: 'bg-green-100 hover:bg-green-200',
      actionKey: 'exportExcel',
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <ActionsDropdown
        actions={builtInDropdownActions}
        triggerIcon={DotsBlackIcon}
        triggerClassName="flex items-center justify-center rounded-full bg-[#878F8F1A] w-[37px] h-[37px] p-2.5 transition-colors hover:bg-gray-200"
        iconClassName="h-5 w-5"
        dropdownClassName={`fixed z-10 mt-2 w-max min-w-[7rem] max-w-[10rem] ${i18n.language === 'ar' ? 'max-w-[10rem]' : 'max-w-[11rem]'} rounded-lg border border-gray-200 bg-white flex flex-col gap-3 p-3 shadow-lg`}
      />
    </div>
  );
}
