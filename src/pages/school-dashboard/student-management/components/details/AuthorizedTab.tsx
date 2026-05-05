import { useTranslation } from 'react-i18next';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import PhoneGreenIcon from '@gradex/assets/icons/PhoneGreen.svg';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';

interface Delegate {
  id: string;
  name: string;
  nameEn: string;
  relationship: string;
  relationshipEn: string;
  pictureProfilePath: string | null;
  email?: string;
  phone?: string;
}

interface AuthorizedTabProps {
  studentId: string;
  delegates?: Delegate[];
}

const mockDelegates: Delegate[] = [
  {
    id: '1',
    name: 'سارة محمد السيد',
    nameEn: 'Sarah Mohamed El Sayed',
    relationship: 'والدة الطالب',
    relationshipEn: 'Mother',
    pictureProfilePath: null,
    email: 'sara@gmail.com',
    phone: '+20 10 1234 5678',
  },
  {
    id: '2',
    name: 'أحمد محمود عبدالله',
    nameEn: 'Ahmed Mahmoud Abdullah',
    relationship: 'والد الطالب',
    relationshipEn: 'Father',
    pictureProfilePath: null,
    email: 'ahmed@gmail.com',
    phone: '+20 10 1234 5678',
  },
];

export default function AuthorizedTab({ delegates = mockDelegates }: AuthorizedTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white p-6">
      <h2 className="mb-6 text-start text-base font-medium text-[#3A3A3A]">
        {t('students.details.authorized')}
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {delegates.map((delegate) => (
          <div
            key={delegate.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#EDEDED] p-3"
          >
            <div className="flex items-center gap-3">
              <CustomImage
                src={delegate.pictureProfilePath || DefaultAvatar}
                fallbackSrc={DefaultAvatar}
                alt={currentLang === 'ar' ? delegate.name : delegate.nameEn}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
              />
              <div className="text-start">
                <p className="text-sm font-medium text-[#0E1F1F]">
                  {currentLang === 'ar' ? delegate.name : delegate.nameEn}
                </p>
                <p className="mt-1 text-xs font-normal text-[#646969]">
                  {currentLang === 'ar' ? delegate.relationship : delegate.relationshipEn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {delegate.email && (
                <a
                  href={`mailto:${delegate.email}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3E2] transition-colors hover:bg-[#FDE7C5]"
                  aria-label={`${t('students.details.email')}: ${delegate.email}`}
                >
                  <CustomImage src={EmailYellowIcon} alt="" className="h-5 w-5" />
                </a>
              )}
              {delegate.phone && (
                <a
                  href={`tel:${delegate.phone.replace(/\s/g, '')}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F4EE] transition-colors hover:bg-[#D5EADF]"
                  aria-label={`${t('students.details.phone')}: ${delegate.phone}`}
                >
                  <CustomImage src={PhoneGreenIcon} alt="" className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
