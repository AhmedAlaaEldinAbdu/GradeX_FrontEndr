import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@gradex/shared/components/Card';
import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import { registrationAnnouncementApi } from '@/services/api/registration-announcement/registration-announcement.service';
import type { RegistrationAdvertisementDto } from '@/services/api/registration-announcement/registration-announcement.types';
import useLanguage from '@/hooks/useLanguage';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

export default function RegistrationAnnouncement() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<RegistrationAdvertisementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchAnnouncements = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        const response = await registrationAnnouncementApi.getAll(page, pagination.limit);
        if (response && response.data) {
          setAnnouncements(response.data.registrationAdvertisementDto);
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
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchAnnouncements(pagination.page);
  }, [fetchAnnouncements, pagination.page]);

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
      fetchAnnouncements(pagination.page);
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

  const getStatus = (start: string, end: string) => {
    const now = new Date();
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (now >= startDateObj && now <= endDateObj) {
      return 'valid';
    } else if (now > endDateObj) {
      return 'expired';
    } else {
      return 'pending';
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    // Search Term
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      const stageAr = item.stageNameAr?.toLowerCase() || '';
      const stageEn = item.stageNameEn?.toLowerCase() || '';
      if (!stageAr.includes(termLower) && !stageEn.includes(termLower)) {
        return false;
      }
    }

    // Stage Filter
    if (selectedStage) {
      const stageNameEnLower = item.stageNameEn?.toLowerCase();
      if (!stageNameEnLower.includes(selectedStage.toLowerCase())) {
        return false;
      }
    }

    // Date Filters
    if (startDate) {
      if (new Date(item.startDate) < new Date(startDate)) return false;
    }
    if (endDate) {
      if (new Date(item.endDate) > new Date(endDate)) return false;
    }

    return true;
  });

  const columns: DataTableColumn<RegistrationAdvertisementDto>[] = [
    {
      header: 'registrationAnnouncement.educationalStage',
      accessor: (row) => (isArabic ? row.stageNameAr : row.stageNameEn),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'registrationAnnouncement.startDate',
      accessor: (row) => new Date(row.startDate).toLocaleDateString(isArabic ? 'ar' : 'en'),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'registrationAnnouncement.endDate',
      accessor: (row) => new Date(row.endDate).toLocaleDateString(isArabic ? 'ar' : 'en'),
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'registrationAnnouncement.status',
      accessor: (row) => {
        const status = getStatus(row.startDate, row.endDate);
        switch (status) {
          case 'valid':
            return (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                {t('registrationAnnouncement.valid')}
              </span>
            );
          case 'expired':
            return (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                {t('registrationAnnouncement.expired')}
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {t('registrationAnnouncement.status')}
              </span>
            );
        }
      },
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            ariaLabel="Edit"
            onClick={() =>
              navigate(`/registration-announcement/edit-registration-announcement/${row.id}`)
            }
          />
          <IconButton
            status="delete"
            variant="danger"
            ariaLabel="Delete"
            onClick={() => handleDeleteClick(row.id)}
          />
        </div>
      ),
      headerClassName: 'min-w-[150px]',
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setStartDate('');
    setEndDate('');
  };

  const stageOptions = [
    { value: 'primary', label: t('registrationAnnouncement.primary') || 'Primary' }, // Add keys if missing
    { value: 'middle', label: t('registrationAnnouncement.middle') || 'Middle' },
    { value: 'high', label: t('registrationAnnouncement.high') || 'High' },
    { value: 'kindergarten', label: t('registrationAnnouncement.kindergarten') || 'Kindergarten' },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('registrationAnnouncement.searchByStudentName'),
      value: searchTerm,
      onChange: (val) => setSearchTerm(val as string),
      width: '25%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={stageOptions}
          placeholder={t('registrationAnnouncement.educationalStage')}
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
            onChange={(e) => setStartDate(e.target.value)}
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
            onChange={(e) => setEndDate(e.target.value)}
            className="h-[40px] w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <DataTable
        data={filteredAnnouncements}
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
          announcements.find((a) => a.id === selectedAnnouncementId)
            ? isArabic
              ? announcements.find((a) => a.id === selectedAnnouncementId)?.stageNameAr || ''
              : announcements.find((a) => a.id === selectedAnnouncementId)?.stageNameEn || ''
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </Card>
  );
}
