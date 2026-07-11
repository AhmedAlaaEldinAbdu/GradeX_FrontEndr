import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';

import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import { useToast } from '@/shared/context/ToastContext';
import LeaveRequestDetailsPopup from '../popups/LeaveRequestDetailsPopup';
import LeaveRequestDecisionPopup from '../popups/LeaveRequestDecisionPopup';
import Input from '@/shared/components/Input';

type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar: string | null;
  status: LeaveRequestStatus;
  leaveType: string;
  leaveDays: number;
  leaveFrom: string;
  leaveTo: string;
  attachmentUrl: string | null;
}

const PAGE_SIZE = 10;

const LEAVE_REQUESTS_DUMMY_DATA: LeaveRequest[] = [
  {
    id: '1',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'pending',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: null,
  },
  {
    id: '2',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'approved',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: '/mock-task-homework.pdf',
  },
  {
    id: '3',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'pending',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: null,
  },
  {
    id: '4',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'pending',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: '/mock-task-homework.pdf',
  },
  {
    id: '5',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'approved',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: null,
  },
  {
    id: '6',
    employeeName: 'أحمد معتز حسن',
    employeeAvatar: null,
    status: 'rejected',
    leaveType: 'مرضية',
    leaveDays: 1,
    leaveFrom: '1/1/2020',
    leaveTo: '-',
    attachmentUrl: '/mock-task-homework.pdf',
  },
];

const LeaveRequestsTab: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS_DUMMY_DATA);
  const [detailsTarget, setDetailsTarget] = useState<LeaveRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);

  const statusBadgeConfig = {
    pending: {
      className: 'bg-[#FEF8E6] text-[#D99A00]',
      label: t('adminRequests.leave.status.pending'),
    },
    approved: {
      className: 'bg-[#E8F8F0] text-[#30B97E]',
      label: t('adminRequests.leave.status.approved'),
    },
    rejected: {
      className: 'bg-[#FCE8E8] text-[#F04444]',
      label: t('adminRequests.leave.status.rejected'),
    },
  } as const;

  const statusOptions = [
    { value: 'pending', label: t('adminRequests.leave.status.pending') },
    { value: 'approved', label: t('adminRequests.leave.status.approved') },
    { value: 'rejected', label: t('adminRequests.leave.status.rejected') },
  ];

  const leaveTypeOptions = [
    { value: 'مرضية', label: t('adminRequests.leave.types.sick') },
    { value: 'سنوية', label: t('adminRequests.leave.types.annual') },
    { value: 'طارئة', label: t('adminRequests.leave.types.emergency') },
  ];

  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch =
        !searchTerm || item.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesLeaveType = !selectedLeaveType || item.leaveType === selectedLeaveType;
      const matchesDate = !selectedDate || item.leaveFrom === selectedDate;

      return matchesSearch && matchesStatus && matchesLeaveType && matchesDate;
    });
  }, [searchTerm, selectedStatus, selectedLeaveType, selectedDate]);

  const handleViewRequest = (row: LeaveRequest) => {
    setDetailsTarget(row);
  };

  const handleApprove = (row: LeaveRequest) => {
    setDetailsTarget(null);
    setApproveTarget(row);
  };

  const handleReject = (row: LeaveRequest) => {
    setDetailsTarget(null);
    setRejectTarget(row);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;

    setRequests((current) =>
      current.map((item) => (item.id === approveTarget.id ? { ...item, status: 'approved' } : item))
    );

    setApproveTarget(null);
    showToast({
      message: t('adminRequests.leave.approvePopup.success'),
      type: 'success',
    });
  };

  const confirmReject = () => {
    if (!rejectTarget) return;

    setRequests((current) =>
      current.map((item) => (item.id === rejectTarget.id ? { ...item, status: 'rejected' } : item))
    );

    setRejectTarget(null);
    showToast({
      message: t('adminRequests.leave.rejectPopup.success'),
      type: 'success',
    });
  };

  const handleEdit = (row: LeaveRequest) => {
    console.log('edit leave request', row);
  };

  const columns: DataTableColumn<LeaveRequest>[] = [
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
      header: t('adminRequests.leave.columns.previewRequest'),
      accessor: (row) => (
        <IconButton
          variant="darkBlue"
          ariaLabel={t('common.view')}
          onClick={() => handleViewRequest(row)}
        >
          <CustomImage src={EyeDarkBlueIcon} alt="" className="h-6 w-6" />
        </IconButton>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.employeeName'),
      accessor: (row) => (
        <UserAvatarName
          name={row.employeeName}
          avatarSrc={row.employeeAvatar}
          onView={() => handleViewRequest(row)}
        />
      ),
      headerClassName: 'min-w-[240px]',
      className: 'min-w-[240px]',
    },
    {
      header: t('adminRequests.leave.columns.status'),
      accessor: (row) => (
        <span
          className={`inline-flex rounded-full px-4 py-1 text-sm font-medium ${
            statusBadgeConfig[row.status].className
          }`}
        >
          {statusBadgeConfig[row.status].label}
        </span>
      ),
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.leaveType'),
      accessor: (row) => <span className="text-gray-700">{row.leaveType}</span>,
      headerClassName: 'min-w-[130px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.leaveDays'),
      accessor: (row) => <span className="text-gray-700">{row.leaveDays}</span>,
      headerClassName: 'min-w-[130px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.leaveFrom'),
      accessor: (row) => <span className="text-gray-700">{row.leaveFrom}</span>,
      headerClassName: 'min-w-[130px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.leaveTo'),
      accessor: (row) => <span className="text-gray-700">{row.leaveTo}</span>,
      headerClassName: 'min-w-[130px] text-center',
      className: 'text-center',
    },
    {
      header: t('adminRequests.leave.columns.attachments'),
      accessor: (row) => (
        <div className="flex justify-center">
          {row.attachmentUrl ? (
            <button
              type="button"
              aria-label={t('adminRequests.leave.columns.attachments')}
              onClick={() => window.open(row.attachmentUrl!, '_blank', 'noopener')}
              className="transition-opacity hover:opacity-80"
            >
              <CustomImage src={PdfIcon} alt="" className="h-8 w-8" />
            </button>
          ) : (
            <span className="text-gray-700">-</span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: t('common.actions'),
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          {row.status === 'pending' ? (
            <>
              <IconButton
                variant="success"
                ariaLabel={t('common.accept')}
                onClick={() => handleApprove(row)}
              >
                <CustomImage src={CheckMarkIcon} alt="" className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="danger"
                ariaLabel={t('common.reject')}
                onClick={() => handleReject(row)}
              >
                <CustomImage src={XmarkCircleRedIcon} alt="" className="h-5 w-5" />
              </IconButton>
            </>
          ) : (
            <IconButton
              variant="success"
              ariaLabel={t('common.edit')}
              onClick={() => handleEdit(row)}
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
      placeholder: t('adminRequests.leave.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'leave-type-filter',
      value: selectedLeaveType,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedLeaveType}
          onChange={(value) => {
            setSelectedLeaveType(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={leaveTypeOptions}
          placeholder={t('adminRequests.leave.filters.leaveType')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('adminRequests.leave.filters.status')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'scheduled-interview-date',
      value: selectedDate,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <Input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setPage(1);
          }}
          placeholder={t('adminRequests.scheduleInterview.datePlaceholder')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedLeaveType('');
    setSelectedDate('');
    setPage(1);
  };

  return (
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
      <LeaveRequestDetailsPopup
        isOpen={Boolean(detailsTarget)}
        request={detailsTarget}
        onClose={() => setDetailsTarget(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <LeaveRequestDecisionPopup
        open={Boolean(approveTarget)}
        type="approve"
        onConfirm={confirmApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <LeaveRequestDecisionPopup
        open={Boolean(rejectTarget)}
        type="reject"
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </Card>
  );
};

export default LeaveRequestsTab;
