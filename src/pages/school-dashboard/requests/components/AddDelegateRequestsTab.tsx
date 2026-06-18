import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import PhoneGreenIcon from '@gradex/assets/icons/PhoneGreen.svg';
import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

import type { DelegateRequestDto } from '@/services/api/requests/requests.types';
import { MOCK_DELEGATE_REQUESTS } from '../requests.mock';
import DelegateDetailsPopup from '../popups/DelegateDetailsPopup';

const PAGE_SIZE = 10;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const AddDelegateRequestsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDelegate, setSelectedDelegate] = useState<DelegateRequestDto | null>(null);

  const data = MOCK_DELEGATE_REQUESTS;

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        const matchesSearch =
          !searchTerm ||
          row.studentName.includes(searchTerm) ||
          row.delegateName.includes(searchTerm);
        const matchesStage = !selectedStage || row.stage === selectedStage;
        const matchesClassroom = !selectedClassroom || row.classroom === selectedClassroom;
        return matchesSearch && matchesStage && matchesClassroom;
      }),
    [data, searchTerm, selectedStage, selectedClassroom]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toOptions = (values: string[]) =>
    Array.from(new Set(values)).map((v) => ({ value: v, label: v }));
  const stageOptions = useMemo(() => toOptions(data.map((r) => r.stage)), [data]);
  const classroomOptions = useMemo(() => toOptions(data.map((r) => r.classroom)), [data]);

  const columns: DataTableColumn<DelegateRequestDto>[] = [
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
      header: 'requests.requestPreview',
      accessor: (row) => (
        <div className="flex justify-center">
          <IconButton
            variant="darkBlue"
            ariaLabel={t('common.view')}
            className="h-10 w-10"
            onClick={() => setSelectedDelegate(row)}
          >
            <CustomImage src={EyeDarkBlueIcon} alt={t('common.view')} className="h-6 w-6" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.popup.studentName',
      accessor: (row) => (
        <UserAvatarName
          name={row.studentName}
          avatarSrc={row.studentAvatarPath}
          align="center"
          onView={() => navigate(`/students/student-details/${row.studentId}`)}
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.delegate.delegateName',
      accessor: (row) => (
        <UserAvatarName
          name={row.delegateName}
          avatarSrc={row.delegateAvatarPath}
          align="center"
          onView={() => setSelectedDelegate(row)}
        />
      ),
      headerClassName: 'min-w-[240px] text-center',
      className: 'text-center',
    },
    {
      header: 'requests.delegate.contactInfo',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label={t('requests.delegate.email')}
            onClick={() => window.open(`mailto:${row.email}`, '_blank')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 transition-colors hover:bg-orange-100"
          >
            <CustomImage src={EmailYellowIcon} alt="" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="WhatsApp"
            onClick={() => window.open(`https://wa.me/${onlyDigits(row.whatsapp)}`, '_blank')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 transition-colors hover:bg-green-100"
          >
            <CustomImage src={WhatsAppIcon} alt="" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={t('requests.delegate.mobile')}
            onClick={() => window.open(`tel:${onlyDigits(row.mobile)}`)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 transition-colors hover:bg-green-100"
          >
            <CustomImage src={PhoneGreenIcon} alt="" className="h-5 w-5" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('requests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      value: selectedStage,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => {
            setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={stageOptions}
          placeholder={t('requests.earlyLeave.stage')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'classroom-filter',
      value: selectedClassroom,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedClassroom}
          onChange={(value) => {
            setSelectedClassroom(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={classroomOptions}
          placeholder={t('requests.earlyLeave.classroom')}
          showSearch={false}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedClassroom('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={pageData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{ page, limit: PAGE_SIZE, total: filteredData.length, totalPages }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        t={t}
      />

      <DelegateDetailsPopup
        isOpen={Boolean(selectedDelegate)}
        onClose={() => setSelectedDelegate(null)}
        delegate={selectedDelegate}
      />
    </Card>
  );
};

export default AddDelegateRequestsTab;
