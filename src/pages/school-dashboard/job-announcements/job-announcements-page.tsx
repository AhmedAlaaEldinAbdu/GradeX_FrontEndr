import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { jobAdvertismentApiService } from '@/services/api/job-advertisments/job-advertisments.service';
import type { JobAdvertisment } from '@/services/api/types/job-advertisment.types';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import TeachersBlueIcon from '@gradex/assets/icons/TeachersBlue.svg';
import TeachersYellowIcon from '@gradex/assets/icons/TeachersYellow.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import JobAnnouncementsList from './components/JobAnnouncementsList';

type JobAnnouncementStatistics = {
  teacherAnnouncements: number;
  employeeAnnouncements: number;
  activeAnnouncements: number;
  expiredAnnouncements: number;
};

const initialStatistics: JobAnnouncementStatistics = {
  teacherAnnouncements: 0,
  employeeAnnouncements: 0,
  activeAnnouncements: 0,
  expiredAnnouncements: 0,
};

const isTeacherAnnouncement = (announcement: JobAdvertisment) => {
  if (announcement.qualificationType === 2) {
    return true;
  }

  return Boolean(
    announcement.materialId ||
      announcement.lkTeacherLevelId ||
      announcement.jobAdvertismentMaterialDto?.length
  );
};

const isEmployeeAnnouncement = (announcement: JobAdvertisment) => {
  if (announcement.qualificationType === 1) {
    return true;
  }

  return Boolean(
    announcement.lkAdministrativePositionId ||
      announcement.lkAdministrativePositionNameAr ||
      announcement.lkAdministrativePositionNameEn
  );
};

const isExpiredAnnouncement = (announcement: JobAdvertisment) => {
  const endDateValue = announcement.advertisementEndDate;
  if (!endDateValue) {
    return false;
  }

  const endDate = new Date(endDateValue);
  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate.getTime() < Date.now();
};

export default function JobAnnouncementsPage() {
  const { t } = useTranslation();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [statistics, setStatistics] = useState<JobAnnouncementStatistics>(initialStatistics);

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.jobAnnouncements') },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      try {
        const response = await jobAdvertismentApiService.getJobAdvertisments({
          PageIndex: 1,
          PageSize: 10000,
          SchoolBranchId: schoolBranchId,
        });

        if (!isMounted) {
          return;
        }

        const announcements = response.data?.jobAdvertismentDto ?? [];
        const nextStatistics = announcements.reduce<JobAnnouncementStatistics>(
          (accumulator, announcement) => {
            if (isTeacherAnnouncement(announcement)) {
              accumulator.teacherAnnouncements += 1;
            }

            if (isEmployeeAnnouncement(announcement)) {
              accumulator.employeeAnnouncements += 1;
            }

            if (isExpiredAnnouncement(announcement)) {
              accumulator.expiredAnnouncements += 1;
            } else {
              accumulator.activeAnnouncements += 1;
            }

            return accumulator;
          },
          { ...initialStatistics }
        );

        setStatistics(nextStatistics);
      } catch {
        if (isMounted) {
          setStatistics(initialStatistics);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [schoolBranchId]);

  const metrics = useMemo(
    () => [
      {
        title: t('jobAnnouncement.statistics.teacherAnnouncements'),
        value: statistics.teacherAnnouncements,
        icon: (
          <CustomImage
            src={TeachersBlueIcon}
            alt={t('jobAnnouncement.statistics.teacherAnnouncements')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-blue-50 text-blue-600',
      },
      {
        title: t('jobAnnouncement.statistics.employeeAnnouncements'),
        value: statistics.employeeAnnouncements,
        icon: (
          <CustomImage
            src={TeachersYellowIcon}
            alt={t('jobAnnouncement.statistics.employeeAnnouncements')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-yellow-50 text-yellow-600',
      },
      {
        title: t('jobAnnouncement.statistics.activeAnnouncements'),
        value: statistics.activeAnnouncements,
        icon: (
          <CustomImage
            src={CheckMarkIcon}
            alt={t('jobAnnouncement.statistics.activeAnnouncements')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-green-50 text-green-600',
      },
      {
        title: t('jobAnnouncement.statistics.expiredAnnouncements'),
        value: statistics.expiredAnnouncements,
        icon: (
          <CustomImage
            src={XmarkCircleRedIcon}
            alt={t('jobAnnouncement.statistics.expiredAnnouncements')}
            className="h-6 w-6"
          />
        ),
        iconClassName: 'bg-red-50 text-red-600',
      },
    ],
    [statistics, t]
  );

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="jobAnnouncement.title"
        hasHeaderControls={true}
        actions={[
          {
            label: 'jobAnnouncement.addAnnouncement',
            to: '/job-announcements/add-job-announcements',
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
          />
        ))}
      </div>

      <JobAnnouncementsList />
    </div>
  );
}
