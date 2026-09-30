import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import AddEditContractForm, { type ContractFormValues } from './components/AddEditContractForm';
import { useAppDispatch } from '@/hooks/useRedux';
import { updateContract } from '@/redux/features/contracts/contractsSlice';
import { tokenManager } from '@/lib/auth/token-manager';
import {
  IdentityType,
  Semester,
  SchoolKind,
  WithdrawalTime,
  type UpdateSchoolContractRequest,
} from '@/services/api/types/contracts.types';

// TODO(api): replace these placeholder initial values with data from a real
// "get school contract template" endpoint once it's available. The Id below
// also needs to come from that fetch so the PUT body can target the right
// record.
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

const MOCK_CONTRACT_ID = '';

const mapTermToSemester = (term: string): Semester => {
  if (term === 'term-1') return Semester.First;
  return Semester.Second;
};

const buildUpdatePayload = (
  values: ContractFormValues,
  roleDocument: File | null,
  schoolBranchId: string,
  contractId: string
): UpdateSchoolContractRequest => ({
  id: contractId,
  schoolBranchId,
  description: values.schoolKind === 'foundation' ? SchoolKind.Foundation : SchoolKind.Company,
  commercialRegister: values.commercialRegister,
  nationalAddress: values.shortNationalAddress,
  representativeName: values.representativeName,
  representativePosition: values.representativeRole,
  representativeDocument: roleDocument,
  identityType: values.idType === 'resident' ? IdentityType.Resident : IdentityType.National,
  mobileNumber: values.mobile,
  phoneNumber: values.phone,
  email: values.email,
  nationalityId: values.nationality,
  administrativeFees: Number(values.adminFees || 0),
  valueAddedtax: Number(values.taxNumber || 0),
  withdrawalPeriods: [
    {
      semester: mapTermToSemester(values.term),
      withdrawalPeriodText: values.withdrawalPeriod || null,
      adminFeeDiscountPercentage: Number(values.adminFeesDiscountPercentage || 0),
      totalFees: 0,
      withdrawalTime:
        values.withdrawalType === 'afterTerm'
          ? WithdrawalTime.AfterTerm
          : WithdrawalTime.BeforeTerm,
    },
  ],
});

export default function EditContractPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

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

  const handleSubmit = async (values: ContractFormValues, roleDocument: File | null) => {
    if (!schoolBranchId) {
      setShowPopupMessage({ show: true, type: 'error', message: 'common.errorOccurred' });
      return;
    }

    try {
      const payload = buildUpdatePayload(values, roleDocument, schoolBranchId, MOCK_CONTRACT_ID);
      await dispatch(updateContract(payload)).unwrap();
      setShowPopupMessage({
        show: true,
        type: 'success',
        message: 'contracts.messages.editSuccess',
      });
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || 'common.errorOccurred';
      setShowPopupMessage({ show: true, type: 'error', message });
    }
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
