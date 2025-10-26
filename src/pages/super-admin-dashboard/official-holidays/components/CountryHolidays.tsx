import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import DeletePopup from '@/shared/components/DeletePopup';
import PopupMessage from '@/shared/components/PopupMessage';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import DotsIcon from '@gradex/assets/icons/Dots.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

interface FixedHoliday {
  id: number;
  date: string;
  dayName: string;
  reason: string;
  isEditable: boolean;
}

interface OfficialHoliday {
  id: number;
  dateRange: string;
  arabicDateRange?: string;
  reason: string;
  hasOfficialDocument: boolean;
  date?: string;
}

export default function CountryHolidays() {
  const { t } = useTranslation();
  const { countryId } = useParams<{ countryId: string }>();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  console.log('Country ID:', countryId);

  const fixedHolidays: FixedHoliday[] = [];

  const officialHolidays: OfficialHoliday[] = [
    {
      id: 1,
      dateRange: '7/1/2025 الثلاثاء',
      reason: 'سبب الاجازة: عيد الميلاد المجيد',
      hasOfficialDocument: true,
      date: '2025-01-07',
    },
    {
      id: 2,
      dateRange: '25/1/2025 السبت',
      reason: 'سبب الاجازة: ثورة 25 يناير وعيد الشرطة',
      hasOfficialDocument: true,
      date: '2025-01-25',
    },
    {
      id: 3,
      dateRange: 'السبت 29/3/2025 - الأربعاء 2/4/2025',
      arabicDateRange: 'السبت 29/3/2025 - الأربعاء 2/4/2025',
      reason: 'سبب الاجازة: عيد الفطر المبارك',
      hasOfficialDocument: false,
      date: '2025-03-29',
    },
    {
      id: 4,
      dateRange: '2/4/2025 الاثنين',
      reason: 'سبب الاجازة: عيد شم النسيم',
      hasOfficialDocument: true,
      date: '2025-04-02',
    },
    {
      id: 5,
      dateRange: '24/4/2026 الخميس',
      reason: 'سبب الاجازة: مناسبة عيد تحرير سيناء (25 أبريل 2026)',
      hasOfficialDocument: false,
      date: '2026-04-24',
    },
    {
      id: 6,
      dateRange: '25/1/2026 السبت',
      reason: 'سبب الاجازة: ثورة 25 يناير وعيد الشرطة',
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
          <button className="rounded p-1 hover:bg-gray-100">
            <img src={DotsIcon} alt="Options" className="h-6 w-6" />
          </button>
        </div>

        {fixedHolidays.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <img src={CheckIcon} alt="Check" className="h-5 w-5" />
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
          <div className="relative">
            {/* Timeline Container */}
            <div className="hidden lg:absolute lg:left-1/2 lg:top-[20px] lg:block lg:h-[calc(100%-40px)] lg:-translate-x-1/2"></div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-8">
              {(() => {
                const midpoint = Math.ceil(officialHolidays.length / 2);
                const leftColumn = officialHolidays.slice(0, midpoint);
                const rightColumn = officialHolidays.slice(midpoint);
                const maxLength = Math.max(leftColumn.length, rightColumn.length);

                return Array.from({ length: maxLength }).map((_, rowIndex) => {
                  const leftHoliday = leftColumn[rowIndex];
                  const rightHoliday = rightColumn[rowIndex];

                  return (
                    <>
                      {/* Left Column */}
                      {leftHoliday && (
                        <div key={`left-${leftHoliday.id}`} className="relative lg:col-start-1">
                          <div className="flex gap-2">
                            {/* Number Circle with Connector Line */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                  !isUpcomingHoliday(leftHoliday.date)
                                    ? 'bg-green-600 text-white'
                                    : 'border border-gray-300 bg-white text-gray-500'
                                }`}
                              >
                                {!isUpcomingHoliday(leftHoliday.date) ? (
                                  <img
                                    src={CheckIcon}
                                    alt="Completed"
                                    className="h-3 w-3 brightness-200 invert saturate-0 filter"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                  />
                                ) : (
                                  rowIndex + 1
                                )}
                              </div>
                              {/* Connector line to next circle */}
                              {rowIndex < leftColumn.length - 1 && (
                                <div
                                  className={`mt-2 w-[2px] flex-1 ${
                                    !isUpcomingHoliday(leftHoliday.date)
                                      ? 'bg-green-600'
                                      : 'bg-gray-200'
                                  }`}
                                  style={{ height: 'calc(100% + 1rem)', width: '2px' }}
                                ></div>
                              )}
                            </div>

                            {/* Holiday Card */}
                            <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
                              {/* Card Content */}
                              <div className="space-y-3">
                                {/* Top Row: Date */}
                                <div className="flex items-center justify-between">
                                  {/* Date with Calendar Icon */}
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-gray-500">:التاريخ</span>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      className="text-gray-400"
                                    >
                                      <rect
                                        x="2"
                                        y="3"
                                        width="12"
                                        height="11"
                                        rx="1"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                      />
                                      <path
                                        d="M2 6H14"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M5 1.5V4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M11 1.5V4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                      {leftHoliday.dateRange}
                                    </span>
                                  </div>
                                </div>

                                {/* Holiday Reason */}
                                <p className="text-start text-sm text-gray-700">
                                  {leftHoliday.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Right Column */}
                      {rightHoliday && (
                        <div key={`right-${rightHoliday.id}`} className="relative lg:col-start-2">
                          <div className="flex gap-2">
                            {/* Number Circle with Connector Line */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                  !isUpcomingHoliday(rightHoliday.date)
                                    ? 'bg-green-600 text-white'
                                    : 'border border-gray-300 bg-white text-gray-500'
                                }`}
                              >
                                {!isUpcomingHoliday(rightHoliday.date) ? (
                                  <img
                                    src={CheckIcon}
                                    alt="Completed"
                                    className="h-3 w-3 brightness-200 invert saturate-0 filter"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                  />
                                ) : (
                                  midpoint + rowIndex + 1
                                )}
                              </div>
                              {/* Connector line to next circle */}
                              {rowIndex < rightColumn.length - 1 && (
                                <div
                                  className={`mt-2 w-[2px] flex-1 ${
                                    !isUpcomingHoliday(rightHoliday.date)
                                      ? 'bg-green-600'
                                      : 'bg-gray-200'
                                  }`}
                                  style={{ height: 'calc(100% + 1rem)', width: '2px' }}
                                ></div>
                              )}
                            </div>

                            {/* Holiday Card */}
                            <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
                              {/* Card Content */}
                              <div className="space-y-3">
                                {/* Top Row: Date */}
                                <div className="flex items-center justify-between">
                                  {/* Date with Calendar Icon */}
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-gray-500">:التاريخ</span>
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      className="text-gray-400"
                                    >
                                      <rect
                                        x="2"
                                        y="3"
                                        width="12"
                                        height="11"
                                        rx="1"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                      />
                                      <path
                                        d="M2 6H14"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M5 1.5V4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M11 1.5V4.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                      {rightHoliday.dateRange}
                                    </span>
                                  </div>
                                </div>

                                {/* Holiday Reason */}
                                <p className="text-start text-sm text-gray-700">
                                  {rightHoliday.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </Card>

      {showDeletePopup && (
        <DeletePopup
          message={t('officialHolidays.confirmDeleteHoliday')}
          iconSrc={BigTrashIcon}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}

      {showSuccessMessage && (
        <PopupMessage
          type="success"
          message={t('officialHolidays.holidayDeletedSuccessfully')}
          autoClose={true}
          duration={3000}
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </div>
  );
}
