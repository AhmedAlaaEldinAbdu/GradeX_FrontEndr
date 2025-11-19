import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addAcademicSubSystem, getAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { useToast } from '@/shared/context/ToastContext';
import {
  AcademicSubsystemSchema,
  type AcademicSubsystemForm,
} from '@/validations/academic-subsystem-validations';

interface AddSystemTypePopupProps {
  onConfirm?: (isSuccess: boolean) => void;
  onCancel: () => void;
}

interface AddSystemTypeForm {
  nameAr: string;
  nameEn: string;
}

export default function AddSystemTypePopup({ onConfirm, onCancel }: AddSystemTypePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const isCreating = useAppSelector((state) => state.academicSubSystems.isCreating);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AcademicSubsystemForm>({
    resolver: yupResolver(AcademicSubsystemSchema),
    defaultValues: { nameAr: '', nameEn: '' },
  });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleAddSystemType = handleSubmit((data: AddSystemTypeForm) => {
    dispatch(addAcademicSubSystem({ nameAr: data.nameAr, nameEn: data.nameEn }))
      .unwrap()
      .then((res) => {
        if (res.isSuccess) {
          dispatch(getAcademicSubSystems({pageIndex: 1, pageSize: 1000}));
          handleClose();
          reset();
          onConfirm?.(true);
        } else if (!res.isSuccess) {
          showToast({
            message: 'common.errorOccurred',
            type: 'error',
          });
        }
      })
      .catch(() => {
        showToast({
          message: 'common.errorOccurred',
          type: 'error',
        });
      });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[520px] transform rounded-2xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute left-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <div className="mb-8">
          <div className="my-6 flex flex-col items-center gap-7 py-3">
            <p className="w-[100%] font-medium text-gray-800 md:text-xl lg:w-[75%] lg:text-2xl">
              {t('academicSystem.addSystemType')}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <FormField
                label={t('academicSystem.systemTypeAr')}
                required
                htmlFor="systemTypeAr"
                error={errors.nameAr?.message && t(errors.nameAr.message)}
              >
                <Controller
                  name="nameAr"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="systemTypeAr"
                      type="text"
                      placeholder={t('academicSystem.enterSystemTypeAr')}
                      required
                    />
                  )}
                />
              </FormField>
            </div>
            <div>
              <FormField
                label={t('academicSystem.systemTypeEn')}
                required
                htmlFor="systemTypeEn"
                error={errors.nameEn?.message && t(errors.nameEn.message)}
              >
                <Controller
                  name="nameEn"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="systemTypeEn"
                      type="text"
                      placeholder={t('academicSystem.enterSystemTypeEn')}
                      required
                    />
                  )}
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-xl border border-green-700 px-5 py-2 text-green-700 transition-colors duration-200 hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleAddSystemType}
            disabled={isCreating}
            className="w-[130px] rounded-xl bg-green-600 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? t('common.loading') : t('actions.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
