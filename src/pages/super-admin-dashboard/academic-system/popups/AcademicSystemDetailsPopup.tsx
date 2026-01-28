import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AcademicSubSystemResponse } from '@/services/api/types/academic-system.types';

interface AcademicDetailsPopupProps {
  open: boolean;
  system: AcademicSubSystemResponse;
  onClose: () => void;
}

export default function AcademicDetailsPopup({ open, system, onClose }: AcademicDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentLang = i18n.language as 'ar' | 'en';

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!open) return null;

  // Extract data from system object
  const systemName = currentLang === 'ar' ? system.nameAr : system.nameEn;
  const systemTypes = system.academicSubSystemDto?.map((sub) =>
    currentLang === 'ar' ? sub.nameAr : sub.nameEn
  );
  const countries = system.lkCountriesDto?.map((country) =>
    currentLang === 'ar' ? country.arabicName : country.englishName
  );
  const gradeCount = system.gradeCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[550px] transform rounded-2xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute left-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col justify-start gap-7 py-3">
          <div className="w-[100%] text-2xl font-medium text-gray-800">{systemName}</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 font-semibold text-gray-800">
              <span className="flex flex-shrink-0">{t('academicSystem.academicSystemName')}:</span>
              <span className="py-1 text-base text-black-800">
                {currentLang === 'ar' ? system.nameAr : system.nameEn}
              </span>
            </div>
            <div className="flex items-start gap-3 font-semibold text-gray-800">
              <span className="flex flex-shrink-0">{t('academicSystem.systemType')}:</span>{' '}
              <span className="flex py-1 text-base text-black-800">
                {systemTypes?.join(' - ') || '-'}
              </span>
            </div>
            <div className="flex items-start gap-3 font-semibold text-gray-800">
              <span className="flex flex-shrink-0">
                {t('academicSystem.educationalStagesCount')}:
              </span>{' '}
              <span className="py-1 text-base text-black-800">{gradeCount}</span>
              {/* <span className="flex flex-shrink-0">{t('academicSystem.educationalStages')}:</span>{' '}
              <span className="flex flex-wrap items-start gap-2">
                {dummyData.eduStages?.map((stage) => (
                  <span className="flex items-center justify-center gap-2 rounded-md bg-green-100 p-2 text-base text-black-800">
                  {stage}
                    <CustomImage src={XmarkCircleIcon} className="cursor-pointer" alt="Xmark" />
                  </span>
                  ))}
              </span> */}
            </div>
            <div className="flex items-center gap-3 font-semibold text-gray-800">
              <span className="flex flex-shrink-0">{t('academicSystem.countries')}:</span>{' '}
              <span className="flex flex-wrap items-center gap-2 py-1">
                {countries && countries.length > 0 ? (
                  countries.map((country, index) => (
                    <span
                      key={index}
                      className="flex items-center justify-center gap-2 rounded-md bg-green-100 p-2 text-base text-black-800"
                    >
                      {country}
                    </span>
                  ))
                ) : (
                  <span className="text-base text-black-800">-</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
