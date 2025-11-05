import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddSystemTypePopupProps {
  onConfirm?: () => void;
  onCancel: () => void;
}

export default function AddSystemTypePopup({ onConfirm, onCancel }: AddSystemTypePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleAddSystemType = () => {};
  // const onSystemTypeChange = () => {};

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
          <div>
            <FormField label={t('academicSystem.systemType')} required>
              <Input
                id="systemType"
                type={'text'}
                placeholder={t('academicSystem.enterSystemType')}
                // {...register('systemType')}
              />
            </FormField>
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
            className="w-[110px] rounded-xl bg-green-600 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-700"
          >
            {t('actions.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
