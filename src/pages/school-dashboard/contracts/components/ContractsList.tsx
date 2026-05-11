import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, {
  type DataTableColumn,
  type PaginationData,
} from '@/shared/components/DataTable';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import SearchInput from '@/shared/components/SearchInput';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import MonyBagIcon from '@/assets/icons/MonyBag.svg';

type ContractRow = {
  id: string;
  code: string;
  studentName: string;
  studentAvatar: string | null;
  date: string;
  contractFileUrl?: string | null;
};

// Mock data — swap for API once the endpoint is wired.
const mockContracts: ContractRow[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `${i + 1}`,
  code: '26258',
  studentName: 'أحمد معتز حسن',
  studentAvatar: null,
  date: '1/1/2020',
  contractFileUrl: null,
}));

type ContractsListProps = {
  /** Notifies the parent how many contracts the data source has (unfiltered). */
  onContractsCountChange?: (count: number) => void;
};

export default function ContractsList({ onContractsCountChange }: ContractsListProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Surface the unfiltered count so the page header can swap its action button
  // (Add vs Edit) based on whether any contract has been set up yet.
  useEffect(() => {
    // onContractsCountChange?.(mockContracts.length);
  }, [onContractsCountChange]);

  const filteredRows = useMemo(() => {
    return mockContracts.filter((row) => {
      const matchesSearch =
        !search.trim() || row.studentName.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCode = !code || row.code === code;
      return matchesSearch && matchesCode;
    });
  }, [search, code]);

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * limit, safePage * limit);

  const codeOptions = useMemo<CustomSelectOption[]>(
    () =>
      Array.from(new Set(mockContracts.map((c) => c.code))).map((c) => ({
        value: c,
        label: c,
      })),
    []
  );

  const handleViewStudent = (row: ContractRow) => {
    navigate(`/students/${row.id}`, { state: { from: 'contracts' } });
  };

  const handleViewContract = (row: ContractRow) => {
    if (row.contractFileUrl) {
      window.open(row.contractFileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const columns = useMemo<DataTableColumn<ContractRow>[]>(
    () => [
      {
        header: 'contracts.table.index',
        accessor: (_row, index) => (index ?? 0) + 1 + (safePage - 1) * limit,
        headerClassName: 'w-[60px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.code',
        accessor: (row) => <span className="text-sm text-[#646969]">{row.code}</span>,
        headerClassName: 'min-w-[120px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.studentName',
        accessor: (row) => (
          <div className="flex items-center justify-center gap-2">
            <CustomImage
              src={row.studentAvatar || DefaultAvatar}
              fallbackSrc={DefaultAvatar}
              alt={row.studentName}
              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
            />
            <span className="text-sm text-[#646969]">{row.studentName}</span>
            <IconButton
              variant="blue"
              ariaLabel={t('common.view')}
              onClick={() => handleViewStudent(row)}
              className="h-8 w-8"
            >
              <CustomImage src={EyeStyledIcon} alt={t('common.view')} className="h-4 w-4" />
            </IconButton>
          </div>
        ),
        headerClassName: 'min-w-[260px] text-center',
      },
      {
        header: 'contracts.table.date',
        accessor: (row) => <span className="text-sm text-[#646969]">{row.date}</span>,
        headerClassName: 'min-w-[120px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.contract',
        accessor: (row) => (
          <button
            type="button"
            onClick={() => handleViewContract(row)}
            className="flex justify-center transition-opacity hover:opacity-80"
            aria-label={t('contracts.table.contract')}
          >
            <CustomImage src={PdfIcon} alt="PDF" className="h-9 w-8" />
          </button>
        ),
        headerClassName: 'min-w-[100px] text-center',
        className: 'text-center',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safePage, t]
  );

  const tablePagination = useMemo<PaginationData>(
    () => ({ page: safePage, limit, total: totalItems, totalPages }),
    [safePage, limit, totalItems, totalPages]
  );

  const hasActiveFilters = search.trim().length > 0 || code !== '';
  const shouldShowEmptyState = mockContracts.length === 0 && !hasActiveFilters;

  if (shouldShowEmptyState) {
    return (
      <Card className="rounded-2xl" padding="lg">
        <EmptyState
          imgSrc={MonyBagIcon}
          title={t('contracts.emptyTitle')}
          description={t('contracts.emptyDescription')}
          actionLabel={t('contracts.addAction')}
          onAction={() => navigate('/financial-management/contracts/add-contract')}
          blend
        />
      </Card>
    );
  }

  const filterComponent = (
    <div className="flex flex-wrap items-center gap-4">
      <div className="w-[300px]">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t('contracts.searchPlaceholder')}
        />
      </div>
      <div className="w-[200px]">
        <CustomSelect
          value={code}
          onChange={(v) => {
            setCode(v as string);
            setPage(1);
          }}
          options={codeOptions}
          placeholder={t('contracts.filterByCodePlaceholder')}
          showSearch={false}
        />
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={pagedRows}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={[
          {
            type: 'search',
            name: 'search',
            value: search,
            onChange: (v) => setSearch(v as string),
          },
          { type: 'select', name: 'code', value: code, onChange: (v) => setCode(v as string) },
        ]}
        filterComponent={filterComponent}
        pagination={tablePagination}
        onPageChange={setPage}
        showFilters={true}
        onResetFilters={() => {
          setSearch('');
          setCode('');
          setPage(1);
        }}
        emptyMessage={t('common.noResults')}
        t={t}
      />
    </Card>
  );
}
