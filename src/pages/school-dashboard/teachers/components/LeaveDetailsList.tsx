import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import NotesIcon from '@gradex/assets/icons/Notes.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import VacationIcon from '@gradex/assets/icons/Vacation.svg';

interface LeaveAttachmentMock {
  fileName: string;
  fileSize: string;
}

interface LeaveRecordMock {
  id: string;
  index: number;
  total: number;
  fromDate: string;
  toDate: string;
  duration: string;
  reason: string;
  attachment?: LeaveAttachmentMock;
}

interface LeaveDetailsListProps {
  leaveTypeKey: string;
}

// TODO: replace with API integration once backend is ready
const TOTAL_LEAVES_BY_TYPE_MOCK: Record<string, { total: number; used: number }> = {
  sickLeave: { total: 24, used: 4 },
  regularLeave: { total: 24, used: 10 },
  casualLeave: { total: 24, used: 10 },
  maternityLeave: { total: 24, used: 10 },
  childCareLeave: { total: 24, used: 10 },
  familyCareLeave: { total: 24, used: 10 },
};

const LEAVE_RECORDS_MOCK: LeaveRecordMock[] = [
  {
    id: '1',
    index: 1,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
    attachment: { fileName: 'ملف طبي', fileSize: '520 KB' },
  },
  {
    id: '2',
    index: 1,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
  },
  {
    id: '3',
    index: 3,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
  },
  {
    id: '4',
    index: 4,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
  },
  {
    id: '5',
    index: 5,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
  },
  {
    id: '6',
    index: 6,
    total: 24,
    fromDate: '12/4/2024',
    toDate: '14/4/2024',
    duration: 'يومين',
    reason: 'تعب في المعدة حاد',
  },
];

export default function LeaveDetailsList({ leaveTypeKey }: LeaveDetailsListProps) {
  const { t } = useTranslation();

  const summary = TOTAL_LEAVES_BY_TYPE_MOCK[leaveTypeKey] ?? { total: 0, used: 0 };
  const leaveTypeName = t(`teachers.details.leavesTab.${leaveTypeKey}`);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Top Card — total of this leave type */}
      <div className="rounded-2xl border border-black-100 bg-white p-4 shadow-[0px_1px_12px_1px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#D3EAFF] bg-[rgba(103,181,255,0.12)]">
              <CustomImage src={VacationIcon} alt="vacation" className="h-6 w-6" />
            </div>
            <span className="text-base font-normal text-[#646969]">
              {t('teachers.details.leaveDetails.totalOf', { type: leaveTypeName })}
            </span>
          </div>

          <span className="text-[18px] font-normal text-black-900">
            {summary.total} {t('teachers.details.leavesTab.daysUnit')}
          </span>
        </div>

        <div className="my-4 h-px w-full bg-[#DDE0E0]" />

        <div className="flex items-start justify-start gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-normal text-[#3A3A3A]">
              {t('teachers.details.leavesTab.used')}:
            </span>
            <span className="text-base font-normal text-black-900">{summary.used}</span>
          </div>
        </div>
      </div>

      {/* Leave Records Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {LEAVE_RECORDS_MOCK.map((leave) => (
          <div
            key={leave.id}
            className="flex flex-col gap-6 rounded-xl border border-black-100 bg-white p-3 shadow-[0px_1px_12px_1px_rgba(0,0,0,0.06)]"
          >
            {/* Header) */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-normal text-black-900">{leaveTypeName}</span>
              <span className="text-base font-normal text-[#646969]">
                {leave.index}/{leave.total}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-3">
              {/* Date range */}
              <div className="flex items-center justify-start gap-2 text-base text-[#646969]">
                <CustomImage src={CalendarIcon} alt="" className="h-5 w-5" />
                <span>{leave.fromDate}</span>
                <span>{t('teachers.details.leaveDetails.to')}</span>
                <span>{leave.toDate}</span>
              </div>

              {/* Duration row */}
              <div className="flex items-center justify-start gap-2 text-base text-[#646969]">
                <CustomImage src={ClockIcon} alt="" className="h-5 w-5" />
                <span>{leave.duration}</span>
              </div>

              {/* Reason row */}
              <div className="flex items-center justify-start gap-2 text-base text-[#646969]">
                <CustomImage src={NotesIcon} alt="" className="h-5 w-5" />
                <span>
                  {t('teachers.details.leaveDetails.leaveReason')}: {leave.reason}
                </span>
              </div>

              {/* Optional attachment */}
              {leave.attachment && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-[#DDE0E0] px-3 py-2">
                  {/* file info  */}
                  <div className="flex flex-1 items-center justify-start gap-3">
                    <CustomImage src={PdfIcon} alt="pdf" className="h-10 w-10" />
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-normal text-black-900">
                        {leave.attachment.fileName}
                      </span>
                      <span className="text-sm font-normal text-[#3A3A3A]">
                        {leave.attachment.fileSize}
                      </span>
                    </div>
                  </div>
                  {/* download button */}
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(17,123,215,0.1)]"
                    aria-label={t('teachers.details.leaveDetails.download')}
                  >
                    <CustomImage src={DownloadIcon} alt="" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
