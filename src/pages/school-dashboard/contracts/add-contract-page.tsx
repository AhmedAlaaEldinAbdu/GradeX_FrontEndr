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
import { createContract } from '@/redux/features/contracts/contractsSlice';
import { tokenManager } from '@/lib/auth/token-manager';
import {
  IdentityType,
  Semester,
  SchoolKind,
  WithdrawalTime,
  type CreateSchoolContractRequest,
} from '@/services/api/types/contracts.types';

/**
 * Map the form's "term-1" / "term-2" / "term-3" select values to the API's
 * `Semester` enum. The third option is currently treated as Second — flip this
 * once the backend exposes the actual semester ids.
 */
const mapTermToSemester = (term: string): Semester => {
  if (term === 'term-1') return Semester.First;
  return Semester.Second;
};

const buildCreatePayload = (
  values: ContractFormValues,
  roleDocument: File | null,
  schoolBranchId: string
): CreateSchoolContractRequest => ({
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
      // The form intentionally omits totalFees — defaulting to 0 until the
      // backend confirms whether it computes this or the UI must supply it.
      totalFees: 0,
      withdrawalTime:
        values.withdrawalType === 'afterTerm'
          ? WithdrawalTime.AfterTerm
          : WithdrawalTime.BeforeTerm,
    },
  ],
});

export default function AddContractPage() {
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
    { label: t('contracts.detailsTitle') },
  ];

  const handleSubmit = async (values: ContractFormValues, roleDocument: File | null) => {
    if (!schoolBranchId) {
      setShowPopupMessage({ show: true, type: 'error', message: 'common.errorOccurred' });
      return;
    }

    try {
      const payload = buildCreatePayload(values, roleDocument, schoolBranchId);
      await dispatch(createContract(payload)).unwrap();
      setShowPopupMessage({
        show: true,
        type: 'success',
        message: 'contracts.messages.addSuccess',
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
