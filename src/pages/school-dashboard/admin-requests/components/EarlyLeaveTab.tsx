import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import EarlyLeaveDetailsPopup from '../popups/EarlyLeaveDetailsPopup';

interface EarlyLeaveRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  applicantName: string;
  applicantAvatar: string;
  time: string;
  duration: string;
}

const EARLY_LEAVE_DUMMY_DATA: EarlyLeaveRequest[] = [
  {
    id: '1',
    status: 'pending',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
  {
    id: '2',
    status: 'approved',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
  {
    id: '3',
    status: 'pending',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
  {
    id: '4',
    status: 'pending',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
  {
    id: '5',
    status: 'approved',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
  {
    id: '6',
    status: 'rejected',
    requestDate: '1/1/2020',
    applicantName: 'أحمد معتز حسن',
    applicantAvatar: '',
    time: '2 مساءا',
    duration: 'ساعتين',
  },
];

const EarlyLeaveTab: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EarlyLeaveRequest | null>(null);

  const PAGE_SIZE = 10;

  // Define status labels dynamically with translation
  const statusBadgeConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: t('adminRequests.earlyLeave.pending'),
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: t('adminRequests.earlyLeave.approved'),
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: t('adminRequests.earlyLeave.rejected'),
    },
  } as const;

  const handleViewDetails = (request: EarlyLeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailsPopupOpen(true);
  };

  const handleCloseDetailsPopup = () => {
    setIsDetailsPopupOpen(false);
    setSelectedRequest(null);
  };

  const filteredData = useMemo(() => {
    return EARLY_LEAVE_DUMMY_DATA.filter((item) => {
      const matchSearch =
        searchTerm === '' || item.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === '' || item.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, selectedStatus]);

  const statusOptions = [
    { value: 'pending', label: t('adminRequests.earlyLeave.pending') },
    { value: 'approved', label: t('adminRequests.earlyLeave.approved') },
    { value: 'rejected', label: t('adminRequests.earlyLeave.rejected') },
  ];

  const columns: DataTableColumn<EarlyLeaveRequest>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index || 0) + 1 + (page - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.previewRequest'),
      accessor: (row) => (
        <IconButton
          variant="darkBlue"
          ariaLabel={t('common.view')}
          imgClassName="h-5 w-5"
          onClick={() => handleViewDetails(row)}
        >
          <CustomImage src={EyeDarkBlueIcon} alt="" className="h-6 w-6" />
        </IconButton>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.applicant'),
      accessor: (row) => (
        <UserAvatarName
          name={row.applicantName}
          avatarSrc={row.applicantAvatar}
          onView={() => handleViewDetails(row)}
        />
      ),
      headerClassName: 'min-w-[200px]',
      className: 'min-w-[200px]',
    },
    {
      header: t('adminRequests.earlyLeave.time'),
      accessor: (row) => <span className="text-gray-700">{row.time}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.earlyLeaveDuration'),
      accessor: (row) => <span className="text-gray-700">{row.duration}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.requestStatus'),
      accessor: (row) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${statusBadgeConfig[row.status].bg} ${statusBadgeConfig[row.status].text}`}
          >
            {statusBadgeConfig[row.status].label}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.requestDate'),
      accessor: (row) => <span className="text-gray-700">{row.requestDate}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.earlyLeave.actions'),
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          {row.status === 'pending' ? (
            <>
              <IconButton
                variant="success"
                ariaLabel={t('adminRequests.popup.approve')}
                className="rounded-full bg-green-100 p-2.5 hover:bg-green-200"
                onClick={() => handleViewDetails(row)}
              >
                <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="danger"
                ariaLabel={t('adminRequests.popup.reject')}
                className="rounded-full bg-red-100 p-2.5 hover:bg-red-200"
                onClick={() => handleViewDetails(row)}
              >
                <CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />
              </IconButton>
            </>
          ) : (
            <IconButton
              variant="blue"
              ariaLabel={t('common.edit')}
              className="rounded-full bg-green-100 p-2.5 hover:bg-green-200"
              onClick={() => handleViewDetails(row)}
            >
              <CustomImage src={EditIcon} alt="" className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('adminRequests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('adminRequests.earlyLeave.chooseStatus')}
          showSearch={false}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setPage(1);
  };

  return (
    <>
      <Card className="rounded-2xl" padding="lg">
        <DataTable
          data={filteredData}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filterConfigs}
          showFilters={true}
          pagination={{
            page,
            limit: PAGE_SIZE,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / PAGE_SIZE),
          }}
          onPageChange={setPage}
          onResetFilters={handleResetFilters}
          emptyMessage="adminRequests.empty"
          isLoading={false}
          t={t}
        />
      </Card>
      <EarlyLeaveDetailsPopup
        isOpen={isDetailsPopupOpen}
        onClose={handleCloseDetailsPopup}
        request={selectedRequest}
      />
    </>
  );
};

export default EarlyLeaveTab;
