import type { OfficialHoliday } from '@/types/officialHolidays';
import CheckIcon from '@gradex/assets/icons/Check.svg';

interface HolidayCardProps {
  holiday: OfficialHoliday;
  index: number;
  isUpcomingHoliday: (dateString?: string) => boolean;
  showConnector: boolean;
}

export default function HolidayCard({
  holiday,
  index,
  isUpcomingHoliday,
  showConnector,
}: HolidayCardProps) {
  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Number Circle with Connector Line */}
        <div className="relative flex flex-col items-center">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
              !isUpcomingHoliday(holiday.date)
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 bg-white text-gray-500'
            }`}
          >
            {!isUpcomingHoliday(holiday.date) ? (
              <img
                src={CheckIcon}
                alt="Completed"
                className="h-3 w-3 brightness-200 invert saturate-0 filter"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              index
            )}
          </div>
          {/* Connector line to next circle */}
          {showConnector && (
            <div
              className={`mt-2 w-[2px] flex-1 ${
                !isUpcomingHoliday(holiday.date) ? 'bg-green-600' : 'bg-gray-200'
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
                  <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                <span className="font-medium text-gray-700">{holiday.dateRange}</span>
              </div>
            </div>

            {/* Holiday Reason */}
            <p className="text-start text-sm text-gray-700">{holiday.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
