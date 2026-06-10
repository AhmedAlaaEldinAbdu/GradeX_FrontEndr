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
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import FullReceiptIcon from '@gradex/assets/icons/FullReceipt.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchContracts } from '@/redux/features/contracts/contractsSlice';
import { tokenManager } from '@/lib/auth/token-manager';
import type { ContractListItem } from '@/services/api/types/contracts.types';

type ContractsListProps = {
  /** Notifies the parent how many contracts the data source has (unfiltered). */
  onContractsCountChange?: (count: number) => void;
};

export default function ContractsList({ onContractsCountChange }: ContractsListProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const contracts = useAppSelector((state) => state.contracts.contracts);
  const pagination = useAppSelector((state) => state.contracts.pagination);
  const isLoading = useAppSelector((state) => state.contracts.isLoading);

  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch the contracts list whenever the page changes.
  // Search/code stay client-side for now (no server filter params confirmed yet).
  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(
      fetchContracts({
        SchoolBranchId: schoolBranchId,
        PageNumber: page,
        PageSize: limit,
      })
    );
  }, [dispatch, schoolBranchId, page]);

  // Surface the unfiltered count so the page header can swap its action button
  // (Add vs Edit) based on whether any contract has been set up yet.
  useEffect(() => {
    onContractsCountChange?.(contracts.length);
  }, [contracts.length, onContractsCountChange]);

  const filteredRows = useMemo(() => {
    return (contracts ?? []).filter((row) => {
      const studentName = row.studentName ?? '';
      const rowCode = row.code ?? '';
      const matchesSearch =
        !search.trim() || studentName.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCode = !code || rowCode === code;
      return matchesSearch && matchesCode;
    });
  }, [contracts, search, code]);

  const codeOptions = useMemo<CustomSelectOption[]>(
    () =>
      Array.from(new Set((contracts ?? []).map((c) => c.code).filter(Boolean) as string[])).map(
        (c) => ({ value: c, label: c })
      ),
    [contracts]
  );

  const handleViewStudent = (row: ContractListItem) => {
    if (!row.studentId) return;
    navigate(`/students/${row.studentId}`, { state: { from: 'contracts' } });
  };

  const handleViewContract = (row: ContractListItem) => {
    if (row.contractFileUrl) {
      window.open(row.contractFileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const totalItems = pagination?.totalItems ?? filteredRows.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const columns = useMemo<DataTableColumn<ContractListItem>[]>(
    () => [
      {
        header: 'contracts.table.index',
        accessor: (_row, index) => (index ?? 0) + 1 + (safePage - 1) * limit,
        headerClassName: 'w-[60px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.code',
        accessor: (row) => <span className="text-sm text-[#646969]">{row.code ?? '-'}</span>,
        headerClassName: 'min-w-[120px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.studentName',
        accessor: (row) => (
          <UserAvatarName
            name={row.studentName}
            avatarSrc={row.studentAvatar}
            size="sm"
            onView={row.studentId ? () => handleViewStudent(row) : undefined}
          />
        ),
        headerClassName: 'min-w-[260px] text-center',
      },
      {
        header: 'contracts.table.date',
        accessor: (row) => <span className="text-sm text-[#646969]">{row.date ?? '-'}</span>,
        headerClassName: 'min-w-[120px] text-center',
        className: 'text-center',
      },
      {
        header: 'contracts.table.contract',
        accessor: (row) =>
          row.contractFileUrl ? (
            <button
              type="button"
              onClick={() => handleViewContract(row)}
              className="flex justify-center transition-opacity hover:opacity-80"
              aria-label={t('contracts.table.contract')}
            >
              <CustomImage src={PdfIcon} alt="PDF" className="h-9 w-8" />
            </button>
          ) : (
            <span className="text-sm text-[#9CA3AF]">-</span>
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
  const shouldShowEmptyState = !isLoading && (contracts?.length ?? 0) === 0 && !hasActiveFilters;

  if (shouldShowEmptyState) {
    return (
      <Card className="rounded-2xl" padding="lg">
        <EmptyState
          imgSrc={FullReceiptIcon}
          title={t('contracts.emptyTitle')}
          description={t('contracts.emptyDescription')}
          actionLabel={t('contracts.addAction')}
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
        data={filteredRows}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
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
