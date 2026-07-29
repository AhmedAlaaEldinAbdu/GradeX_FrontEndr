import React from 'react';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import LockIcon from '@/assets/icons/Lock.svg';
import PhoneGreenSmIcon from '@/assets/icons/PhoneGreenSm.svg';
import WhatsappGreenSmIcon from '@/assets/icons/WhatsappGreenSm.svg';
import { useTranslation } from 'react-i18next';

interface NoAccessPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
}

const NoAccessPermissionModal: React.FC<NoAccessPermissionModalProps> = ({
  isOpen,
  onClose,
  phone = '0541558852',
}) => {
  const { t } = useTranslation();

  const handleCall = () => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsapp = () => {
    const cleanPhone = phone.replace(/\D/g, '');

    // لو الرقم سعودي يبدأ بـ 0 حوله إلى 966
    const whatsappNumber = cleanPhone.startsWith('0') ? `966${cleanPhone.slice(1)}` : cleanPhone;

    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showHeader={false}>
      <div className="flex flex-col items-center text-center">
        {/* Lock Icon */}
        <div className="mb-6 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#FEF8E6]">
          <CustomImage src={LockIcon} alt="Lock" />
        </div>

        {/* Title */}
        <div className="mb-3 text-sm font-bold text-black-900">{t('noAccessPermission.title')}</div>

        {/* Description */}
        <p className="text-sm leading-6 text-[#3A3A3A]">
          {t('noAccessPermission.description')}
          <br />
          {t('noAccessPermission.contactSupport')}
        </p>

        {/* Divider */}
        <div className="my-3 h-px w-full bg-[#E5FFF4]" />

        {/* Contact Title */}
        <h3 className="mb-4 text-sm font-medium leading-7 text-green-500">
          {t('noAccessPermission.contactCustomerService')}
        </h3>

        {/* Contact Buttons */}
        <div className="grid w-full gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#DDE0E0] p-2">
            <div
              onClick={handleCall}
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-xl bg-[#E5FFF4]"
            >
              <CustomImage src={PhoneGreenSmIcon} alt="Phone" />
            </div>
            <span onClick={handleCall} className="cursor-pointer text-sm font-normal leading-7">
              {phone}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#DDE0E0] p-2">
            <div
              onClick={handleWhatsapp}
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-xl bg-[#E5FFF4]"
            >
              <CustomImage src={WhatsappGreenSmIcon} alt="Whatsapp" />
            </div>
            <span onClick={handleWhatsapp} className="cursor-pointer text-sm font-normal leading-7">
              {phone}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NoAccessPermissionModal;
