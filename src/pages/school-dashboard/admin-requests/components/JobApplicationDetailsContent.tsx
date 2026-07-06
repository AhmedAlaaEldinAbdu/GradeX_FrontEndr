import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

import WorkGreenIcon from '@gradex/assets/icons/WorkGreen.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

import { WorkType, JobApplicationStatus, type JobApplicationDto } from '../admin-requests.types';
import { editApplicationsJobAdvertisementStatus } from '@/redux/features/applications-job-advertisements/applicationsJobAdvertisementsSlice';
import { JOB_APPLICATION_STATUS } from '@/pages/school-dashboard/job-announcements/components/applicants-data';
import ScheduleInterviewPopup from '../popups/ScheduleInterviewPopup';
import ArchiveConfirmPopup from '../popups/ArchiveConfirmPopup';
import AcceptConfirmPopup from '../popups/AcceptConfirmPopup';

interface JobApplicationDetailsContentProps {
  application: JobApplicationDto;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start gap-2 text-base">
    <span className="text-[#646969]">{label}:</span>
    <span className="font-medium text-[#0E1F1F]">{value}</span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl border border-[#E6E6E6] bg-white p-6">
    <h2 className="mb-5 text-start text-lg font-semibold text-[#0E1F1F]">{title}</h2>
    {children}
  </div>
);

const JobApplicationDetailsContent: React.FC<JobApplicationDetailsContentProps> = ({
  application,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const currentLang = (i18n.language || 'en') as 'ar' | 'en';
  const currentSchoolBranchId = getCurrentSchoolBranchId();

  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const [isArchiveOpen, setArchiveOpen] = useState(false);
  const [isAcceptOpen, setAcceptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (val: any) => {
    if (val == null || val === '') return '-';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') {
      if (/^\d{4}$/.test(val)) return val;
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        });
      }
      return val;
    }
    if (val instanceof Date) {
      return val.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }
    return String(val);
  };

  const workTypeLabel = t(
    application.workType === WorkType.Full
      ? 'adminRequests.workType.full'
      : application.workType === WorkType.Part
        ? 'adminRequests.workType.part'
        : 'adminRequests.workType.both'
  );

  const isAccepted = application.status === JobApplicationStatus.Accepted;
  const isArchived = application.status === JobApplicationStatus.Archived;
  const actionsDisabled = isAccepted || isArchived;

  const updateStatus = async (applicationStatus: number, successKey: string) => {
    try {
      setIsProcessing(true);
      await dispatch(
        editApplicationsJobAdvertisementStatus({
          applicationsJobAdvertisementId: id as string,
          applicationStatus,
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess) {
            const successMessage = res.message || res.data?.message || t(successKey);
            showToast({ message: successMessage, type: 'success' });
            navigate('/admin-requests');
            return true;
          } else {
            showToast({ message: res?.message || t('common.error'), type: 'error' });
            return false;
          }
        });
    } catch (err: unknown) {
      const errorObj = err as any;
      const errorMessage =
        errorObj?.message ||
        errorObj?.data?.message ||
        errorObj?.payload?.message ||
        err ||
        t('common.error');
      showToast({ message: errorMessage, type: 'error' });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptConfirm = async () => {
    const success = await updateStatus(
      JOB_APPLICATION_STATUS.ACCEPT,
      'adminRequests.jobApplication.toasts.accepted'
    );
    if (success) setAcceptOpen(false);
  };

  const handleScheduleConfirm = () => {
    setScheduleOpen(false);
    showToast({ message: t('adminRequests.jobApplication.toasts.scheduled'), type: 'success' });
  };

  const handleArchiveConfirm = async () => {
    const success = await updateStatus(
      JOB_APPLICATION_STATUS.ARCHIVED,
      'adminRequests.jobApplication.toasts.archived'
    );
    if (success) setArchiveOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-medium text-black-900">
          {t('adminRequests.jobApplication.detailsTitle')}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="success"
            onClick={() => setAcceptOpen(true)}
            disabled={actionsDisabled || isProcessing}
          >
            {t('adminRequests.jobApplication.actions.accept')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setScheduleOpen(true)}
            disabled={actionsDisabled || isProcessing}
          >
            {t('adminRequests.jobApplication.actions.schedule')}
          </Button>
          <Button
            variant="outlineWarning"
            onClick={() => setArchiveOpen(true)}
            disabled={actionsDisabled || isProcessing}
          >
            {t('adminRequests.jobApplication.actions.archive')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-2xl border border-[#E6E6E6] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F4EE]">
              <CustomImage src={WorkGreenIcon} alt="" className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-green-500">
                {application.announcementName}
              </span>
              <span className="text-start text-sm text-[#646969]">{workTypeLabel}</span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
            {t('adminRequests.jobApplication.status.active')}
          </span>
        </div>

        <div className="flex items-center gap-5 rounded-2xl border border-[#C5F0DD] bg-[#EEFDF6] p-6">
          <CustomImage
            src={application.applicantAvatarPath || DefaultAvatar}
            fallbackSrc={DefaultAvatar}
            alt={application.applicantName}
            className="h-[94px] w-[94px] shrink-0 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1 text-start">
            <p className="text-lg font-medium text-[#0E1F1F]">{application.applicantName}</p>
            <p className="text-sm font-normal text-[#646969]">{application.role}</p>
          </div>
        </div>

        <Section title={t('adminRequests.jobApplication.sections.personal')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow
              label={t('adminRequests.jobApplication.fields.phone')}
              value={application.phone}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.email')}
              value={application.email}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.maritalStatus')}
              value={application.maritalStatus}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.nationality')}
              value={application.nationality}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.country')}
              value={application.country}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.residenceCountry')}
              value={application.residenceCountry}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.nationalId')}
              value={application.nationalId}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.birthDate')}
              value={formatDate(application.birthDate)}
            />
            <InfoRow
              label={t('adminRequests.jobApplication.fields.idType')}
              value={application.idType}
            />
            <div className="md:col-span-2">
              <InfoRow
                label={t('adminRequests.jobApplication.fields.address')}
                value={application.address}
              />
            </div>
          </div>
        </Section>

        <Section title={t('adminRequests.jobApplication.sections.education')}>
          {application.qualifications.length > 0 ? (
            <div className="flex flex-col gap-4">
              {application.qualifications.map((q, idx) => (
                <div key={q?.id ?? idx} className="rounded-xl border border-[#E6E6E6] bg-white p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoRow
                      label={t('adminRequests.jobApplication.fields.qualification')}
                      value={
                        currentLang === 'ar'
                          ? (q.qualificationNameAr ?? q.qualificationNameEn ?? '-')
                          : (q.qualificationNameEn ?? q.qualificationNameAr ?? '-')
                      }
                    />
                    <InfoRow
                      label={t('adminRequests.jobApplication.fields.university')}
                      value={
                        currentLang === 'ar'
                          ? (q.universityNameAr ?? q.universityNameEn ?? '-')
                          : (q.universityNameEn ?? q.universityNameAr ?? '-')
                      }
                    />
                    <InfoRow
                      label={t('adminRequests.jobApplication.fields.country')}
                      value={
                        currentLang === 'ar'
                          ? (q.countryUniversityNameAr ?? q.countryUniversityNameEn ?? '-')
                          : (q.countryUniversityNameEn ?? q.countryUniversityNameAr ?? '-')
                      }
                    />
                    <InfoRow
                      label={t('adminRequests.jobApplication.fields.graduationYear')}
                      value={formatDate(q.graduationYear)}
                    />
                    <InfoRow
                      label={t('adminRequests.jobApplication.fields.college')}
                      value={q.college}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoRow
                label={t('adminRequests.jobApplication.fields.university')}
                value={application.university}
              />
              <InfoRow
                label={t('adminRequests.jobApplication.fields.subject')}
                value={application.subject}
              />
              <InfoRow
                label={t('adminRequests.jobApplication.fields.qualification')}
                value={application.qualification}
              />
              <InfoRow
                label={t('adminRequests.jobApplication.fields.graduationYear')}
                value={application.graduationYear}
              />
            </div>
          )}
        </Section>

        <Section title={t('adminRequests.jobApplication.sections.training')}>
          <div className="flex flex-col gap-4">
            {application.courses.map((course, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoRow
                  label={t('adminRequests.jobApplication.fields.courseName')}
                  value={course.name}
                />
                <InfoRow
                  label={t('adminRequests.jobApplication.fields.courseDuration')}
                  value={course.duration}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title={t('adminRequests.jobApplication.sections.experience')}>
          <InfoRow
            label={t('adminRequests.jobApplication.fields.experienceYears')}
            value={`${application.experienceYears} ${t('adminRequests.jobApplication.fields.yearsUnit')}`}
          />
          <p className="mb-2 mt-5 text-start text-sm text-[#646969]">
            {t('adminRequests.jobApplication.fields.previousExperience')}:
          </p>
          <ul className="flex flex-col items-start gap-2">
            {application.previousExperiences.map((experience, index) => (
              <li key={index} className="text-base text-[#0E1F1F]">
                {experience.title} ({experience.period})
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('adminRequests.jobApplication.sections.languages')}>
          <p className="mb-2 text-start text-sm text-[#646969]">
            {t('adminRequests.jobApplication.fields.languagesLevels')}:
          </p>
          <ul className="flex flex-col items-start gap-2">
            {application.languages.map((language, index) => (
              <li key={index} className="text-base text-[#0E1F1F]">
                {language.name}: {language.level}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t('adminRequests.jobApplication.sections.attachments')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {application.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-xl border border-[#E6E6E6] p-4"
              >
                <div className="flex w-full items-center gap-3">
                  <CustomImage src={PdfIcon} alt="" className="h-9 w-9" />
                  <div className="flex w-full flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#0E1F1F]">{attachment.name}</span>
                      <button
                        type="button"
                        aria-label={t('common.download')}
                        onClick={() =>
                          attachment.url && window.open(attachment.url, '_blank', 'noopener')
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F2FB] transition-opacity hover:opacity-80"
                      >
                        <CustomImage src={DownloadIcon} alt="" className="h-5 w-5" />
                      </button>
                    </div>
                    <span className="text-start text-xs text-[#646969]">{attachment.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <ScheduleInterviewPopup
        isOpen={isScheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={handleScheduleConfirm}
        schoolBranchesId={application.schoolBranchesId || currentSchoolBranchId}
        jobAdvertisementId={application.jobAdvertismentId}
        teacherId={application.teacherId}
        supervisorId={application.supervisorId}
        isProcessing={isProcessing}
      />

      <ArchiveConfirmPopup
        open={isArchiveOpen}
        isProcessing={isProcessing}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveOpen(false)}
      />

      <AcceptConfirmPopup
        open={isAcceptOpen}
        isProcessing={isProcessing}
        onConfirm={handleAcceptConfirm}
        onCancel={() => setAcceptOpen(false)}
      />
    </>
  );
};

export default JobApplicationDetailsContent;
