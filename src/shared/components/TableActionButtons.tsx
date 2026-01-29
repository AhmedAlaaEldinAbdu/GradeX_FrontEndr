import React from 'react';
import { useTranslation } from 'react-i18next';
import RefreshSolidIcon from '@gradex/assets/icons/RefreshSolid.svg';
import MaterialPdfIcon from '@gradex/assets/icons/MaterialPdf.svg';
import ExcelFileIcon from '@gradex/assets/icons/ExcelFile.svg';
import PrinterIcon from '@gradex/assets/icons/Printer.svg';

interface TableActionButtonsProps {
  onReload?: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  labels?: {
    reload?: string;
    exportPdf?: string;
    exportExcel?: string;
    print?: string;
  };
}

const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  onReload,
  onExportPdf,
  onExportExcel,
  onPrint,
  labels,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onReload && (
        <button
          onClick={onReload}
          className="inline-flex items-center gap-2 rounded-[10px] bg-blue-50 px-4 py-2 text-base font-normal text-black-900 transition-colors hover:bg-blue-100"
        >
          <img src={RefreshSolidIcon} alt="" className="h-4 w-4" />
          {labels?.reload || t('studentManagement.reload')}
        </button>
      )}
      {onExportPdf && (
        <button
          onClick={onExportPdf}
          className="inline-flex items-center gap-2 rounded-[10px] bg-red-50 px-4 py-2 text-base font-normal text-black-900 transition-colors hover:bg-red-100"
        >
          <img src={MaterialPdfIcon} alt="" className="h-4 w-4" />
          {labels?.exportPdf || t('studentManagement.exportPdf')}
        </button>
      )}
      {onExportExcel && (
        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 rounded-[10px] bg-green-50 px-4 py-2 text-base font-normal text-black-900 transition-colors hover:bg-green-100"
        >
          <img src={ExcelFileIcon} alt="" className="h-4 w-4" />
          {labels?.exportExcel || t('studentManagement.exportExcel')}
        </button>
      )}
      {onPrint && (
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-2 rounded-[10px] bg-blue-50 px-4 py-2 text-base font-normal text-black-900 transition-colors hover:bg-blue-100"
        >
          <img src={PrinterIcon} alt="" className="h-4 w-4" />
          {labels?.print || t('studentManagement.print')}
        </button>
      )}
    </div>
  );
};

export default TableActionButtons;
