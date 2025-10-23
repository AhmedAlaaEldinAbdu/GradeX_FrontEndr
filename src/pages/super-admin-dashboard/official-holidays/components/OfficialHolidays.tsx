import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import HolidayIcon from '@gradex/assets/icons/Holiday.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';

interface OfficialHoliday {
  id: number;
  country: string;
  officialDatesCount: number;
}

export default function OfficialHolidays() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasHolidays] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const holidays: OfficialHoliday[] = [
    {
      id: 1,
      country: 'لبنان',
      officialDatesCount: 16,
    },
    {
      id: 2,
      country: 'الإمارات',
      officialDatesCount: 16,
    },
    {
      id: 3,
      country: 'قطر',
      officialDatesCount: 16,
    },
    {
      id: 4,
      country: 'السعودية',
      officialDatesCount: 16,
    },
    {
      id: 5,
      country: 'قطر',
      officialDatesCount: 16,
    },
    {
      id: 6,
      country: 'مصر',
      officialDatesCount: 16,
    },
  ];

  return (
    <Card>
      {!hasHolidays ? (
        <EmptyState
          imgSrc={HolidayIcon}
          description={t('officialHolidays.noOfficialHolidays')}
          blend={true}
        />
      ) : (
        <div>
          {/* Filters */}
          <div className="mb-6 grid gap-3 lg:grid-cols-3">
            <div className="col-span-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('officialHolidays.searchByCountryName')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[40px] w-full rounded-lg border border-gray-300 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                >
                  <path
                    d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                    fill="#878F8F"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Holiday Cards Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                onClick={() => navigate(`/official-holidays/country/${holiday.id}`)}
                className="flex cursor-pointer flex-col items-start justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
              >
                {/* Country Name */}
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
                  {holiday.country}
                </h3>

                {/* Official Dates Count with Checkmark */}
                <div className="flex items-center gap-2">
                  <img src={CheckIcon} alt="Check Icon" className="h-5 w-5" />
                  <span className="text-sm text-gray-600">
                    {holiday.officialDatesCount} {t('officialHolidays.officialHoliday')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
