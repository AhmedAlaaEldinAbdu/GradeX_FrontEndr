import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import XmarkCircleIcon from '@gradex/assets/icons/XmarkCircle.svg';

interface AcademicDetailsPopupProps {
  title: string;
  onClose: () => void;
}

export default function AcademicDetailsPopup({ title, onClose }: AcademicDetailsPopupProps) {
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
    setTimeout(onClose, 200);
  };

  const dummyData = {
    sysName: 'عالمي',
    sysType: 'امريكي',
    eduStages: ['المرحلة الأبتدائية', 'المرحلة الأعدادية', 'رياض الأطفال'],
    countries: ['قطر', 'السعودية', 'الإمارات', 'مصر'],
  };

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
          <div className="w-[100%] text-2xl font-medium text-gray-800">{t(`${title}`)}</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 font-semibold text-gray-800">
              <span>{t('academicSystem.academicSystemName')}:</span>
              <span className="text-sm text-gray-700">{dummyData.sysName}</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-gray-800">
              <span>{t('academicSystem.systemType')}:</span>{' '}
              <span className="text-sm text-gray-700">{dummyData.sysType}</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-gray-800">
              <span className='flex flex-shrink-0'>{t('academicSystem.educationalStages')}:</span>{' '}
              <span className="flex items-center gap-2 flex-wrap">
                {dummyData.eduStages?.map((stage) => (
                  <span className="flex items-center justify-center gap-2 rounded-md bg-green-100 p-2 text-sm text-gray-700">
                    {stage}
                    <img src={XmarkCircleIcon} className='cursor-pointer' alt="Xmark" />
                  </span>
                ))}
              </span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-gray-800">
              <span className='flex flex-shrink-0'>{t('academicSystem.countries')}:</span>{' '}
              <span className="flex items-center gap-2 flex-wrap">
                {dummyData.countries?.map((country) => (
                  <span className="flex items-center justify-center gap-2 rounded-md bg-green-100 p-2 text-sm text-gray-700">
                    {country}
                    <img src={XmarkCircleIcon} className='cursor-pointer' alt="Xmark" />
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
