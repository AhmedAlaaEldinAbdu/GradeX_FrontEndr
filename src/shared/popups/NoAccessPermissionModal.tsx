import React from 'react';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import LockIcon from '@/assets/icons/Lock.svg';
import FlagEgyptIcon from '@/assets/icons/FlagEgypt.svg';
import FlagSaudiArabiaIcon from '@/assets/icons/FlagSaudiArabia.svg';
import { useTranslation } from 'react-i18next';

interface NoAccessPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
}

interface SupportContact {
  countryKey: string;
  flagIcon: string;
  phone: string;
  whatsappNumber: string;
}

const supportContacts: SupportContact[] = [
  {
    countryKey: 'noAccessPermission.countries.egypt',
    flagIcon: FlagEgyptIcon,
    phone: '+201099016920',
    whatsappNumber: '201099016920',
  },
  {
    countryKey: 'noAccessPermission.countries.saudiArabia',
    flagIcon: FlagSaudiArabiaIcon,
    phone: '+966550124712',
    whatsappNumber: '966550124712',
  },
];

const NoAccessPermissionModal: React.FC<NoAccessPermissionModalProps> = ({
  isOpen,
  onClose,
  phone,
}) => {
  const { t } = useTranslation();

  const contacts = phone
    ? [
        {
          countryKey: 'noAccessPermission.countries.saudiArabia',
          flagIcon: FlagSaudiArabiaIcon,
          phone,
          whatsappNumber: phone.replace(/\D/g, '').replace(/^0/, '966'),
        },
      ]
    : supportContacts;

  const handleWhatsapp = (whatsappNumber: string) => {
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
        <div className="grid w-full grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <button
              type="button"
              key={contact.countryKey}
              onClick={() => handleWhatsapp(contact.whatsappNumber)}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-[#DDE0E0] p-2 text-start transition-colors hover:bg-[#F7FFFB]"
            >
              <CustomImage src={contact.flagIcon} alt="" className="h-5 w-7 shrink-0 rounded-sm" />
              <div className="min-w-0">
                <span className="block text-xs font-medium leading-5 text-[#646969]">
                  {t(contact.countryKey)}
                </span>
                <span className="block truncate text-sm font-normal leading-7 text-black-900">
                  <bdi>{contact.phone}</bdi>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default NoAccessPermissionModal;
