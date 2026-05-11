import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import AddEditContractForm, {
  type ContractFormValues,
} from './components/AddEditContractForm';

export default function AddContractPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('contracts.title'), path: '/financial-management/contracts' },
    { label: t('contracts.detailsTitle') },
  ];

  const handleSubmit = async (_values: ContractFormValues, _roleDocument: File | null) => {
    // TODO: wire to API thunk once endpoint is available.
    setShowPopupMessage({
      show: true,
      type: 'success',
      message: 'contracts.messages.addSuccess',
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="contracts.detailsTitle" />

      <AddEditContractForm
        mode="add"
        onCancel={() => navigate('/financial-management/contracts')}
        onSubmit={handleSubmit}
      />

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={showPopupMessage.type === 'success'}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
        navigateAfterClose={
          showPopupMessage.type === 'success' ? '/financial-management/contracts' : undefined
        }
      />
    </div>
  );
}
