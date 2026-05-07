import { useTranslation } from 'react-i18next';

interface LeavesTabProps {
  teacherId: string;
  isActive?: boolean;
}

interface LeaveTypeMock {
  key: string;
  total: number;
  used: number;
  remaining: number;
}

// TODO: replace with API integration once backend is ready
const TOTAL_ANNUAL_LEAVES_MOCK = {
  totalDays: 100,
  used: 4,
  remaining: 20,
};

const LEAVE_TYPES_MOCK: LeaveTypeMock[] = [
  { key: 'sickLeave', total: 24, used: 4, remaining: 20 },
  { key: 'regularLeave', total: 24, used: 10, remaining: 14 },
  { key: 'casualLeave', total: 24, used: 10, remaining: 14 },
  { key: 'maternityLeave', total: 24, used: 10, remaining: 14 },
  { key: 'childCareLeave', total: 24, used: 10, remaining: 14 },
  { key: 'familyCareLeave', total: 24, used: 10, remaining: 14 },
];

const HolidayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
      fill="#67B5FF"
    />
    <path d="M11.5 13.5l-2 2 1 1 1-1 3 3 1-1-4-4z" fill="#67B5FF" />
  </svg>
);

export default function LeavesTab({ isActive = true }: LeavesTabProps) {
  const { t } = useTranslation();

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-6 pb-8" dir="rtl">
      {/* Total Annual Leaves Card */}
      <div className="rounded-2xl border border-[#E6E6E6] bg-white p-4 shadow-[0px_1px_12px_1px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          {/* Right (start in RTL): icon + label */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#D3EAFF] bg-[rgba(103,181,255,0.12)]">
              <HolidayIcon />
            </div>
            <span className="text-base font-normal text-[#646969]">
              {t('teachers.details.leavesTab.totalAnnualLeaves')}
            </span>
          </div>

          {/* Left (end in RTL): total days */}
          <span className="text-[18px] font-normal text-[#0E1F1F]">
            {TOTAL_ANNUAL_LEAVES_MOCK.totalDays} {t('teachers.details.leavesTab.daysUnit')}
          </span>
        </div>

        <div className="my-4 h-px w-full bg-[#DDE0E0]" />

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-normal text-[#3A3A3A]">
              {t('teachers.details.leavesTab.used')}:
            </span>
            <span className="text-base font-normal text-[#0E1F1F]">
              {TOTAL_ANNUAL_LEAVES_MOCK.used}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-normal text-[#3A3A3A]">
              {t('teachers.details.leavesTab.remaining')}:
            </span>
            <span className="text-base font-normal text-[#0E1F1F]">
              {TOTAL_ANNUAL_LEAVES_MOCK.remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Leave Type Cards Grid */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {LEAVE_TYPES_MOCK.map((leave) => (
          <div
            key={leave.key}
            className="rounded-xl border border-[#E6E6E6] bg-white p-3 shadow-[0px_1px_12px_1px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between gap-2">
              {/* Right (start in RTL): leave type name */}
              <span className="text-base font-normal text-[#0E1F1F]">
                {t(`teachers.details.leavesTab.${leave.key}`)}
              </span>
              {/* Left (end in RTL): total badge */}
              <div className="flex h-[35px] min-w-[33px] items-center justify-center rounded-[10px] bg-[rgba(0,224,127,0.08)] px-2">
                <span className="text-base font-normal text-[#0E1F1F]">{leave.total}</span>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-normal text-[#3A3A3A]">
                  {t('teachers.details.leavesTab.used')}:
                </span>
                <span className="text-base font-normal text-[#0E1F1F]">{leave.used}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-normal text-[#3A3A3A]">
                  {t('teachers.details.leavesTab.remaining')}:
                </span>
                <span className="text-base font-normal text-[#0E1F1F]">{leave.remaining}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
