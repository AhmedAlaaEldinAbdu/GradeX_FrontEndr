import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import { registrationAnnouncementApi } from '@/services/api/registration-announcement/registration-announcement.service';
import type { RegistrationAdvertisementDto } from '@/services/api/registration-announcement/registration-announcement.types';
import useLanguage from '@/hooks/useLanguage';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import SignBlueIcon from '@gradex/assets/icons/SignBlue.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';

type AnnouncementStatus = 'valid' | 'expired';

const ANNOUNCEMENT_STATUS_VALUE: Record<AnnouncementStatus, number> = {
  valid: 1,
  expired: 2,
};

const formatAnnouncementDate = (value: string, locale: 'ar' | 'en') => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-GB');
};

export default function RegistrationAnnouncement() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const locale = isArabic ? 'ar' : 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [announcements, setAnnouncements] = useState<RegistrationAdvertisementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'' | AnnouncementStatus>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    SchoolBranchesId: schoolBranchId,
  });

  const requestParams = useMemo(
    () => ({
      pageIndex: pagination.page,
      pageSize: pagination.limit,
      searchTerm: searchTerm.trim() || undefined,
      status: selectedStatus ? ANNOUNCEMENT_STATUS_VALUE[selectedStatus] : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      SchoolBranchesId: schoolBranchId,
    }),
    [
      endDate,
      pagination.limit,
      pagination.page,
      searchTerm,
      selectedStatus,
      startDate,
      schoolBranchId,
    ]
  );

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await registrationAnnouncementApi.getAll(requestParams);

      if (response?.data) {
        setAnnouncements(response.data.registrationAdvertisementDto || []);
        setPagination((prev) => ({
          ...prev,
          page: response.data.pageIndex,
          limit: response.data.pageSize,
          total: response.data.totalItems,
          totalPages: response.data.totalPages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDeleteClick = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncementId) return;

    try {
      setIsDeleting(true);
      await registrationAnnouncementApi.delete(selectedAnnouncementId);
      showToast({
        message: t('registrationAnnouncement.deletedSuccessfully'),
        type: 'success',
      });
      setShowDeletePopup(false);
      setSelectedAnnouncementId('');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      showToast({
        message: t('common.errorOccurred'),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatus = (announcement: RegistrationAdvertisementDto): AnnouncementStatus => {
    if (announcement.status === ANNOUNCEMENT_STATUS_VALUE.valid) {
      return 'valid';
    }

    if (announcement.status === ANNOUNCEMENT_STATUS_VALUE.expired) {
      return 'expired';
    }

    const now = new Date();
    const startDateObj = new Date(announcement.startDate);
    const endDateObj = new Date(announcement.endDate);

    if (now >= startDateObj && now <= endDateObj) {
      return 'valid';
    }

    return 'expired';
  };

  const selectedAnnouncement = useMemo(
    () => announcements.find((item) => item.id === selectedAnnouncementId),
    [announcements, selectedAnnouncementId]
  );

  const metrics = useMemo(
    () => ({
      total: pagination.total,
      valid: announcements.filter((item) => getStatus(item) === 'valid').length,
      expired: announcements.filter((item) => getStatus(item) === 'expired').length,
    }),
    [announcements, pagination.total]
  );

  const columns: DataTableColumn<RegistrationAdvertisementDto>[] = [
    {
      header: '#',
      accessor: (_row, index = 0) => (
        <span>{(pagination.page - 1) * pagination.limit + index + 1}</span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'registrationAnnouncement.educationalStage',
      accessor: (row) => <span>{isArabic ? row.stageNameAr : row.stageNameEn}</span>,
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'registrationAnnouncement.startDate',
      accessor: (row) => <span>{formatAnnouncementDate(row.startDate, locale)}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'registrationAnnouncement.endDate',
      accessor: (row) => <span>{formatAnnouncementDate(row.endDate, locale)}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'registrationAnnouncement.status',
      accessor: (row) => {
        const status = getStatus(row);
        switch (status) {
          case 'valid':
            return (
              <span className="inline-flex min-w-[110px] justify-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {t('registrationAnnouncement.valid')}
              </span>
            );
          default:
            return (
              <span className="inline-flex min-w-[110px] justify-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                {t('registrationAnnouncement.expired')}
              </span>
            );
        }
      },
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel={t('actions.edit')}
            onClick={() =>
              navigate(`/registration-announcement/edit-registration-announcement/${row.id}`)
            }
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel={t('actions.delete')}
            onClick={() => handleDeleteClick(row.id)}
          />
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statusOptions = [
    { value: 'valid', label: t('registrationAnnouncement.valid') },
    { value: 'expired', label: t('registrationAnnouncement.expired') },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'registration-announcement-search',
      placeholder: t('registrationAnnouncement.searchByEducationalStage'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
      width: '35%',
    },
    {
      type: 'custom',
      name: 'registration-announcement-status',
      value: selectedStatus,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(
              (Array.isArray(value) ? value[0] : value || '') as '' | AnnouncementStatus
            );
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          options={statusOptions}
          placeholder={t('registrationAnnouncement.status')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'start-date-filter',
      value: startDate,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <div className="relative">
          <input
            type="text"
            placeholder={t('registrationAnnouncement.startDate')}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = 'text')}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="h-[40px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ),
    },
    {
      type: 'custom',
      name: 'end-date-filter',
      value: endDate,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <div className="relative">
          <input
            type="text"
            placeholder={t('registrationAnnouncement.endDate')}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = 'text')}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="h-[40px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title={t('registrationAnnouncement.metrics.total')}
          value={metrics.total}
          icon={
            <CustomImage
              src={SignBlueIcon}
              alt={t('registrationAnnouncement.alt.total')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-blue-50 text-blue-600"
        />
        <MetricCard
          title={t('registrationAnnouncement.metrics.valid')}
          value={metrics.valid}
          icon={
            <CustomImage
              src={CheckMarkIcon}
              alt={t('registrationAnnouncement.alt.valid')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-green-50 text-green-600"
        />
        <MetricCard
          title={t('registrationAnnouncement.metrics.expired')}
          value={metrics.expired}
          icon={
            <CustomImage
              src={XmarkCircleRedIcon}
              alt={t('registrationAnnouncement.alt.expired')}
              className="h-6 w-6"
            />
          }
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      <Card>
        <DataTable
          data={announcements}
          columns={columns}
          keyExtractor={(row) => row.id}
          pagination={pagination}
          onPageChange={handlePageChange}
          filters={filterConfigs}
          showFilters={true}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          emptyMessage={t('registrationAnnouncement.noAnnouncementsMessage')}
          t={t}
        />
        <DeletePopup
          open={showDeletePopup}
          message="registrationAnnouncement.confirmDelete"
          itemName={
            selectedAnnouncement
              ? isArabic
                ? selectedAnnouncement.stageNameAr || ''
                : selectedAnnouncement.stageNameEn || ''
              : ''
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeletePopup(false)}
          iconSrc={BigTrashIcon}
          isProcessing={isDeleting}
        />
      </Card>
    </div>
  );
}
