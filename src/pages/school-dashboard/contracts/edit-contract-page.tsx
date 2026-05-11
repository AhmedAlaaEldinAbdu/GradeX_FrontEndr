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

// Pre-populated mock values for the edit form — replace with API data when wired.
const MOCK_CONTRACT_VALUES: Partial<ContractFormValues> = {
  shortNationalAddress: '7060RFFA',
  schoolKind: 'company',
  commercialRegister: '7007701779',
  adminFees: '3500',
  taxNumber: '50',
  representativeName: 'عبدالكريم محمد عبدالكريم النمر',
  representativeRole: 'ممثل نظامي',
  email: 'ibrasalato@gmail.com',
  idType: 'national',
  mobile: '+966556831361',
  phone: '+966556831361',
  nationality: '',
  withdrawalType: 'beforeTerm',
  term: 'term-1',
  withdrawalPeriod: 'قبل بدء العام الدراسي بـ 90 يوم',
  adminFeesDiscountPercentage: '50',
};

export default function EditContractPage() {
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
    { label: t('contracts.editTitle') },
  ];

  const handleSubmit = async (_values: ContractFormValues, _roleDocument: File | null) => {
    // TODO: wire to API thunk once endpoint is available.
    setShowPopupMessage({
      show: true,
      type: 'success',
      message: 'contracts.messages.editSuccess',
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="contracts.editTitle" />

      <AddEditContractForm
        mode="edit"
        initialValues={MOCK_CONTRACT_VALUES}
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
