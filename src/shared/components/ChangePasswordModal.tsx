import PopupFooter from '@/shared/popups/PopupFooter';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEye, FaEyeSlash, FaKey, FaLock, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import { useToast } from '@/shared/context/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { authApiService } from '@/services/api/auth/auth.service';
import { ChangeMyPasswordSchema, type ChangeMyPasswordProps } from '@/validations/auth-validations';
import { logger } from '@/lib/utils/logger';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FieldKey = 'currentPassword' | 'newPassword' | 'confirmPassword';

const fields: Array<{
  key: FieldKey;
  labelKey: string;
  placeholderKey: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'currentPassword',
    labelKey: 'changePassword.currentPassword',
    placeholderKey: 'changePassword.currentPasswordPlaceholder',
    icon: <FaLock />,
  },
  {
    key: 'newPassword',
    labelKey: 'changePassword.newPassword',
    placeholderKey: 'changePassword.newPasswordPlaceholder',
    icon: <FaKey />,
  },
  {
    key: 'confirmPassword',
    labelKey: 'changePassword.confirmPassword',
    placeholderKey: 'changePassword.confirmPasswordPlaceholder',
    icon: <FaShieldAlt />,
  },
];

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const [visible, setVisible] = useState<Record<FieldKey, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangeMyPasswordProps>({
    resolver: yupResolver(ChangeMyPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const scrollToFirstError = useScrollToFirstError<ChangeMyPasswordProps>();

  useEffect(() => {
    if (!isOpen) {
      reset();
      setVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
    }
  }, [isOpen, reset]);

  const toggleVisible = (key: FieldKey) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = async (data: ChangeMyPasswordProps) => {
    try {
      await authApiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showToast({ message: t('changePassword.successMessage'), type: 'success', isRaw: true });
      reset();
      onClose();
    } catch (err: unknown) {
      logger.error('Change password failed', err);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 400 || status === 401) {
        setError('currentPassword', {
          type: 'server',
          message: 'changePassword.incorrectCurrentPassword',
        });
        return;
      }
      showToast({ message: t('changePassword.errorMessage'), type: 'error', isRaw: true });
    }
  };

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={onClose}
      title={t('changePassword.title')}
      size="sm"
    >
      <p className="mb-6 text-center text-sm text-gray-500">{t('changePassword.subtitle')}</p>

      <form
        id="change-password-form"
        onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
        noValidate
        className="space-y-4 text-start"
      >
        {fields.map((field) => {
          const error = errors[field.key]?.message;
          const isVisible = visible[field.key];
          return (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-2 block text-sm font-medium text-gray-700">
                {t(field.labelKey)}
              </label>
              <div className="relative">
                <span
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                    isRTL ? 'right-4' : 'left-4'
                  }`}
                  aria-hidden="true"
                >
                  {field.icon}
                </span>
                <input
                  id={field.key}
                  type={isVisible ? 'text' : 'password'}
                  autoComplete={
                    field.key === 'currentPassword' ? 'current-password' : 'new-password'
                  }
                  {...register(field.key)}
                  className={`w-full rounded-lg border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } bg-white py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:outline-hidden ${
                    error ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                  } ${isRTL ? 'pr-11 pl-12 text-right' : 'pr-12 pl-11 text-left'}`}
                  placeholder={t(field.placeholderKey)}
                />
                <button
                  type="button"
                  onClick={() => toggleVisible(field.key)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                    isRTL ? 'left-4' : 'right-4'
                  }`}
                  aria-label={
                    isVisible
                      ? t('changePassword.hidePassword', { defaultValue: 'Hide password' })
                      : t('changePassword.showPassword', { defaultValue: 'Show password' })
                  }
                >
                  {isVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <FormErrorMessage message={error} />
            </div>
          );
        })}

        <PopupFooter className="flex flex-row-reverse items-center justify-start gap-3">
          <Button
            type="submit"
            form="change-password-form"
            variant="primary"
            size="md"
            loading={isSubmitting}
          >
            {t('changePassword.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('changePassword.cancel')}
          </Button>
        </PopupFooter>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
