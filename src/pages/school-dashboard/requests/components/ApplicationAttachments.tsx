import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import type { StudentApplicationDetailDto } from '@/services/api/student-applications/student-applications.types';

interface ApplicationAttachmentsProps {
  data: StudentApplicationDetailDto;
  baseUrl: string;
}

const ApplicationAttachments: React.FC<ApplicationAttachmentsProps> = ({ data, baseUrl }) => {
  const { t } = useTranslation();

  const attachments = [
    {
      name: t('studentApplications.details.guardianIdentity'),
      path: data.guardianIdentityPath,
    },
    {
      name: t('studentApplications.details.vaccinationCertificate'),
      path: data.vaccinationCertificatePath,
    },
    {
      name: t('studentApplications.details.lastEducationCertificate'),
      path: data.lastEducationCertificatePath,
    },
    {
      name: t('studentApplications.details.educationalCustody'),
      path: data.educationalCustodyPath,
    },
    {
      name: t('studentApplications.details.fatherIdentity'),
      path: data.fatherIdentityPath,
    },
    {
      name: t('studentApplications.details.fatherEducationalCertificate'),
      path: data.fatherEducationalCertificatePath,
    },
    {
      name: t('studentApplications.details.motherIdentity'),
      path: data.motherIdentityPath,
    },
    {
      name: t('studentApplications.details.motherEducationalCertificate'),
      path: data.motherEducationalCertificatePath,
    },
    {
      name: t('studentApplications.details.familyCard'),
      path: data.familyCardPath,
    },
  ];

  // Include book files as attachments (if any)
  const bookAttachments = (data.books || []).map((book) => ({
    name: book.name,
    path: book.filePath || book.fileName,
  }));

  const availableAttachments = attachments
    .concat(bookAttachments)
    .filter((attachment) => attachment.path);

  if (availableAttachments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <h2 className="mb-4 text-start text-lg font-bold text-gray-900">
        {t('studentApplications.details.attachments')}
      </h2>
      <div className="space-y-3">
        {availableAttachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
          >
            {/* File info on the right (RTL start) */}
            <div className="flex items-center gap-3">
              <CustomImage src={PdfIcon} alt="PDF" className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
              </div>
            </div>

            {/* Download button on the left (RTL end) */}
            <a
              href={`${baseUrl}/${attachment.path}`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <CustomImage src={DownloadIcon} alt="Download" className="h-5 w-5" />
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationAttachments;
