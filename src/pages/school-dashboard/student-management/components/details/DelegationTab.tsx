import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneGreenIcon from '@gradex/assets/icons/PhoneGreen.svg';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentDelegations } from '@/redux/features/student-delegation/studentDelegationSlice';
import { DelegationPersonType } from '@/shared/enums/enums';
import type { StudentDelegation } from '@/services/api/types/student-delegation.types';

interface DelegationTabProps {
  studentId: string;
}

export default function DelegationTab({ studentId }: DelegationTabProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const delegations = useAppSelector((state) => state.studentDelegation.delegations);
  const isLoading = useAppSelector((state) => state.studentDelegation.isLoading);

  useEffect(() => {
    if (!studentId) return;
    dispatch(fetchStudentDelegations({ studentId }));
  }, [dispatch, studentId]);

  const getRelationship = (delegate: StudentDelegation) => {
    if (delegate.personType === DelegationPersonType.Other && delegate.otherPersonName) {
      return delegate.otherPersonName;
    }
    return t(`students.details.delegationPersonType.${delegate.personType}`);
  };

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white p-6">
      <h2 className="mb-6 text-start text-base font-medium text-[#3A3A3A]">
        {t('students.details.delegation')}
      </h2>

      {isLoading ? (
        <p className="text-center text-sm text-[#646969]">{t('common.loading')}</p>
      ) : delegations.length === 0 ? (
        <p className="text-center text-sm text-[#646969]">
          {t('students.details.delegationEmpty')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {delegations.map((delegate) => (
            <div
              key={delegate.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#EDEDED] p-3"
            >
              <div className="flex items-center gap-3">
                <CustomImage
                  src={delegate.identityImagePath || DefaultAvatar}
                  fallbackSrc={DefaultAvatar}
                  alt={delegate.fullName}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
                <div className="text-start">
                  <p className="text-sm font-medium text-[#0E1F1F]">{delegate.fullName}</p>
                  <p className="mt-1 text-xs font-normal text-[#646969]">
                    {getRelationship(delegate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {delegate.mobileNumber && (
                  <a
                    href={`tel:${delegate.mobileNumber.replace(/\s/g, '')}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F4EE] transition-colors hover:bg-[#D5EADF]"
                    aria-label={`${t('students.details.phone')}: ${delegate.mobileNumber}`}
                  >
                    <CustomImage src={PhoneGreenIcon} alt="" className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
