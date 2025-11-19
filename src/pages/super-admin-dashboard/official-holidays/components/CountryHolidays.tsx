import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import DeletePopup from '@/shared/components/DeletePopup';
import PopupMessage from '@/shared/components/PopupMessage';
import HolidayTimeline from './HolidayTimeline';
import type { FixedHoliday, OfficialHoliday } from '@/types/officialHolidays';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import { ActionsDropdown, type Action } from '@/shared/components/components';

export default function CountryHolidays() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countryId } = useParams<{ countryId: string }>();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  console.log('Country ID:', countryId);

  const fixedHolidays: FixedHoliday[] = [];

  const officialHolidays: OfficialHoliday[] = [
    {
      id: 1,
      dateRange: '7/1/2025 الثلاثاء',
      reason: 'عيد الميلاد المجيد',
      hasOfficialDocument: true,
      date: '2025-01-07',
    },
    {
      id: 2,
      dateRange: '25/1/2025 السبت',
      reason: 'ثورة 25 يناير وعيد الشرطة',
      hasOfficialDocument: true,
      date: '2025-01-25',
    },
    {
      id: 3,
      dateRange: 'السبت 29/3/2025 - الأربعاء 2/4/2025',
      arabicDateRange: 'السبت 29/3/2025 - الأربعاء 2/4/2025',
      reason: 'عيد الفطر المبارك',
      hasOfficialDocument: false,
      date: '2025-03-29',
    },
    {
      id: 4,
      dateRange: '2/4/2025 الاثنين',
      reason: 'عيد شم النسيم',
      hasOfficialDocument: true,
      date: '2025-04-02',
    },
    {
      id: 5,
      dateRange: '24/4/2026 الخميس',
      reason: 'مناسبة عيد تحرير سيناء (25 أبريل 2026)',
      hasOfficialDocument: false,
      date: '2026-04-24',
    },
    {
      id: 6,
      dateRange: '25/1/2026 السبت',
      reason: 'ثورة 25 يناير وعيد الشرطة',
      hasOfficialDocument: true,
      date: '2026-01-25',
    },
  ];

  const isUpcomingHoliday = (dateString?: string): boolean => {
    if (!dateString) return false;
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  };

  const handleDeleteConfirm = () => {
    setShowDeletePopup(false);
    setShowSuccessMessage(true);
  };

  const actions: Action[] = [
    {
      id: 'edit',
      label: t('actions.edit'),
      icon: EditFilledIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: () => navigate(`/official-holidays/edit/1`),
    },
    {
      id: 'delete',
      label: t('actions.delete'),
      icon: TrashIcon,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => {
        setShowDeletePopup(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Country Name Header with Search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">مصر</h1>
      </div>

      {/* Fixed Holidays Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('officialHolidays.fixedHolidays')}
          </h2>
          {/* <button className="rounded p-1 hover:bg-gray-100">
            <img src={DotsIcon} alt="Options" className="h-6 w-6" />
          </button> */}
          <ActionsDropdown actions={actions} />
        </div>

        {fixedHolidays.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <img src={CheckIcon} alt="Check" className="h-4 w-4" />
            <span>يوم الجمعة و السبت</span>
          </div>
        ) : (
          <EmptyState
            imgSrc={BigTrashIcon}
            description={t('officialHolidays.noFixedHolidaysYet')}
            blend={true}
          />
        )}
      </Card>

      {/* Official Holidays Card */}
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-gray-800">
          {t('officialHolidays.officialHolidays')}
        </h2>

        {officialHolidays.length === 0 ? (
          <EmptyState
            imgSrc={BigTrashIcon}
            description={t('officialHolidays.noOfficialHolidays')}
            blend={true}
          />
        ) : (
          <HolidayTimeline holidays={officialHolidays} isUpcomingHoliday={isUpcomingHoliday} />
        )}
      </Card>

      <DeletePopup
        open={showDeletePopup}
        message={t('officialHolidays.confirmDeleteHoliday')}
        iconSrc={BigTrashIcon}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
      />

      <PopupMessage
        open={showSuccessMessage}
        type="success"
        message={t('officialHolidays.holidayDeletedSuccessfully')}
        autoClose={true}
        iconSrc={BigSuccessIcon}
        duration={3000}
        onClose={() => setShowSuccessMessage(false)}
      />
    </div>
  );
}
