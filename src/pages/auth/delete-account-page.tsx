import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { AppDispatch } from '@gradex/redux/store/store';
import classtiSchoolSmartLogo from '@/assets/identity/classtiSchoolSmartLogo.svg';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { useForm } from 'react-hook-form';
import { DeleteAccountSchema, type DeleteAccountProps } from '@/validations/auth-validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import CustomImage from '@/shared/components/CustomImage';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import PhoneInput from '@/shared/components/PhoneInput';
import FormField from '@/shared/components/FormField';
import { deleteTeacherAccount } from '@/redux/features/teachers/teachersSlice';
import { normalizePhoneForApi } from '@/lib/utils/phone-utils';
import { deleteParentAccount } from '@/redux/features/parent/parentSlice';
import { useToast } from '@/shared/context/ToastContext';

const DeleteAccountPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, direction } = useLanguage();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<'parentAccount' | 'teacherAccount'>(
    'parentAccount'
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountProps>({
    resolver: yupResolver(DeleteAccountSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  });

  const scrollToFirstError = useScrollToFirstError<DeleteAccountProps>();

  const onSubmit = async (data: DeleteAccountProps) => {
    try {
      setPhoneError(null);

      if (!phoneNumber.trim()) {
        setPhoneError(t('validation.phoneRequired'));
        return;
      }

      // Normalize phone number to separate country code and phone number
      const normalizedPhone = normalizePhoneForApi(phoneNumber);

      if (!normalizedPhone.countryCode || !normalizedPhone.phoneNumber) {
        setPhoneError(t('validation.invalidPhone'));
        return;
      }

      const action = accountType === 'parentAccount' ? deleteParentAccount : deleteTeacherAccount;

      const resultAction = await dispatch(
        action({
          phoneNumber: normalizedPhone.phoneNumber,
          countryCode: normalizedPhone.countryCode,
          password: data.password,
        })
      );

      if (action.fulfilled.match(resultAction)) {
        showToast({
          message: t('account.deleteAccountSuccess'),
          type: 'success',
        });

        navigate('/login');
      } else {
        setDeleteAccountError(resultAction.payload as string);
      }
    } catch (error) {
      setDeleteAccountError(typeof error === 'string' ? error : t('account.deleteAccountError'));
    }
  };

  return (
    <div className="flex min-h-screen" dir={direction}>
      <div className="flex w-full flex-col justify-between bg-[#DFF8ED]">
        <div className={`flex justify-center p-6 pt-8`}>
          {/* classtiSchoolSmartLogo */}
          <CustomImage src={classtiSchoolSmartLogo} alt="Classti" />
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center justify-start rounded-3xl border border-[#DDE0E0] bg-white p-6 pb-12 sm:w-[80%] lg:h-[600px] lg:w-[1155px]">
            {/* Language Toggle */}
            <div className="flex w-full justify-end pb-10">
              <LanguageSwitcher />
            </div>

            <div className="flex w-full flex-1 flex-col items-center justify-center">
              {/* Title */}
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-700">
                  {t('account.deleteAccount')}
                </h1>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
                noValidate={true}
                className="w-full max-w-sm space-y-6"
              >
                {/* Radio Account */}
                <div className="flex items-center gap-10">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={accountType === 'parentAccount'}
                      onChange={() => setAccountType('parentAccount')}
                    />
                    <span className="text-base text-black-800">{t('account.parentAccount')}</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={accountType === 'teacherAccount'}
                      onChange={() => setAccountType('teacherAccount')}
                    />
                    <span className="text-base text-black-800">{t('account.teacherAccount')}</span>
                  </label>
                </div>

                {/* Country Code + Phone Number */}
                <PhoneInput
                  label={t('rolesManagement.phoneNumber')}
                  value={phoneNumber}
                  onChange={(value) => {
                    setPhoneNumber(value);
                    setPhoneError(null);
                  }}
                  error={phoneError || ''}
                  required
                  showDialCodeInField={true}
                />
                {/* Password Field */}
                <FormField
                  label={t('login.passwordLabel')}
                  required
                  error={errors?.password?.message}
                >
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder={t('login.passwordInput')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isRTL ? 'left-4' : 'right-4'
                      } text-gray-400 hover:text-gray-600`}
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_1761_65302)">
                            <path
                              d="M7.49635 10.9966C7.49635 12.3771 8.61952 13.5002 10 13.5002C11.3806 13.5002 12.5037 12.3771 12.5037 10.9966C12.5037 9.61603 11.3806 8.49286 10 8.49286C8.61952 8.49286 7.49635 9.61603 7.49635 10.9966ZM11.327 10.9966C11.327 11.7282 10.7317 12.3235 10 12.3235C9.26837 12.3235 8.6731 11.7282 8.6731 10.9966C8.6731 10.2649 9.26837 9.66961 10 9.66961C10.7317 9.66961 11.327 10.2649 11.327 10.9966Z"
                              fill="currentColor"
                            />
                            <path
                              d="M19.8808 10.6415C19.836 10.5823 18.7649 9.17742 17.0274 7.75755C16.426 7.26618 15.8173 6.83326 15.207 6.46156L15.8237 5.60163C16.0131 5.33757 15.9525 4.96995 15.6885 4.78057C15.4244 4.59119 15.0568 4.65176 14.8675 4.91578L14.1691 5.88962C14.083 5.84718 13.9969 5.80556 13.9108 5.76571C12.7905 5.24645 11.6757 4.94481 10.5884 4.8642V3.43676C10.5884 3.11182 10.3249 2.84839 10 2.84839C9.67506 2.84839 9.41162 3.11182 9.41162 3.43676V4.86424C8.32427 4.94485 7.20946 5.24653 6.08915 5.76575C6.00313 5.8056 5.91707 5.84726 5.83093 5.88966L5.13253 4.91582C4.94319 4.65184 4.57565 4.59123 4.31147 4.78061C4.04745 4.96999 3.98689 5.33757 4.17627 5.60167L4.79296 6.4616C4.18274 6.83329 3.574 7.26622 2.97265 7.75759C1.23514 9.17742 0.164019 10.5823 0.119264 10.6415C-0.0397545 10.8515 -0.0397545 11.1417 0.119264 11.3517C0.164019 11.4108 1.2351 12.8157 2.97269 14.2356C3.99975 15.0748 5.04824 15.7449 6.08915 16.2274C7.35149 16.8124 8.60685 17.1217 9.82376 17.149C9.88233 17.1507 9.94104 17.1517 10 17.1517C10.059 17.1517 10.1177 17.1507 10.1762 17.149C11.3931 17.1217 12.6485 16.8124 13.9108 16.2274C14.9518 15.7449 16.0003 15.0747 17.0273 14.2356C18.7649 12.8157 19.836 11.4108 19.8807 11.3517C20.0398 11.1417 20.0398 10.8515 19.8808 10.6415ZM14.9785 10.9966C14.9785 13.6958 12.8191 15.9002 10.1371 15.973C10.0914 15.974 10.0458 15.975 10 15.975C9.94662 15.975 9.89343 15.9735 9.8402 15.9722C7.16882 15.8874 5.0216 13.6882 5.0216 10.9966C5.0216 8.29729 7.18102 6.09292 9.86299 6.02008C9.90861 6.01914 9.95422 6.01812 10 6.01812C10.0534 6.01812 10.1066 6.01965 10.1598 6.02095C12.8313 6.10567 14.9785 8.30498 14.9785 10.9966ZM1.34716 10.9968C1.86725 10.3835 3.05451 9.08497 4.64328 7.96776C4.13535 8.86256 3.84485 9.89622 3.84485 10.9966C3.84485 12.0975 4.13567 13.1317 4.64414 14.0268C4.31657 13.7975 4.01329 13.5654 3.73816 13.3413C2.60754 12.4205 1.76361 11.4886 1.34716 10.9968ZM15.3568 14.0254C15.8647 13.1306 16.1552 12.0969 16.1552 10.9966C16.1552 9.89559 15.8644 8.86138 15.356 7.96627C15.6835 8.19562 15.9868 8.42771 16.262 8.6518C17.3925 9.57261 18.2363 10.5044 18.6529 10.9964C18.1328 11.6096 16.9456 12.9082 15.3568 14.0254Z"
                              fill="currentColor"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1761_65302">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 3L17 17M10.5 14.5C9.17 14.8 7.7 14.3 6.5 13.5C5 12.5 3.5 11 2.5 10C3.5 8.5 4.8 7 6.5 6C7.7 5.2 9.17 4.7 10.5 5M15 10.5C15.5 10 16 9.5 16.5 9C15.5 7.5 14.2 6 12.5 5C12 4.8 11.5 4.6 11 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormField>
                {/* Submit Button */}
                <Button
                  variant="outlineDanger"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>{t('account.deleteAccountInprogress')}</span>
                    </div>
                  ) : (
                    <span>{t('account.deleteAccount')}</span>
                  )}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg"
                  onClick={() => navigate('/login')}
                >
                  <span>{t('login.back')}</span>
                </Button>
                {/* Error Message */}
                {deleteAccountError && (
                  <div className="rounded-lg border border-red-200 bg-red-100 p-3 text-sm text-red-500">
                    {deleteAccountError}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
