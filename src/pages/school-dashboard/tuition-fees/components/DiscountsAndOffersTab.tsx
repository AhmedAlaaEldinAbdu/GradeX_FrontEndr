import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import Pagination from '@/shared/components/Pagination';
import SearchInput from '@/shared/components/SearchInput';
import Table from '@/shared/components/Table';

type OfferStatusFilter = 'all' | 'active' | 'inactive';

type DiscountOfferRow = {
  id: string;
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

function StatusToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        checked ? 'bg-green-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function DiscountsAndOffersTab() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OfferStatusFilter>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const statusOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'all', label: t('fees.discounts.filters.statusAll') },
      { value: 'active', label: t('fees.discounts.filters.statusActive') },
      { value: 'inactive', label: t('fees.discounts.filters.statusInactive') },
    ],
    [t]
  );

  const [rows, setRows] = useState<DiscountOfferRow[]>(() => {
    // Mock data to match the Figma/table layout. Replace with API integration later.
    const base: DiscountOfferRow[] = [
      {
        id: '1',
        name: t('fees.discounts.mock.siblingsOffer'),
        discount: t('fees.discounts.mock.siblingsOfferDiscount'),
        startDate: '1-1-2020',
        endDate: '1-5-2020',
        isActive: true,
      },
      {
        id: '2',
        name: t('fees.discounts.mock.earlyPaymentOffer'),
        discount: t('fees.discounts.mock.earlyPaymentOfferDiscount'),
        startDate: '1-1-2020',
        endDate: '1-5-2020',
        isActive: true,
      },
    ];

    // Expand to show pagination in UI.
    const extra = Array.from({ length: 10 }).map((_, i) => ({
      ...base[i % base.length],
      id: String(i + 3),
    }));

    return [...base, ...extra];
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSearch = !q || r.name.toLowerCase().includes(q);
      const matchStatus =
        status === 'all' ? true : status === 'active' ? r.isActive === true : r.isActive === false;
      return matchSearch && matchStatus;
    });
  }, [rows, search, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => filtered.slice((safePage - 1) * limit, safePage * limit),
    [filtered, limit, safePage]
  );

  const columns = useMemo(
    () => [
      {
        header: 'fees.discounts.table.columns.index',
        accessor: (_row: DiscountOfferRow, index?: number) =>
          (index ?? 0) + 1 + (safePage - 1) * limit,
        headerClassName: 'w-[60px]',
      },
      {
        header: 'fees.discounts.table.columns.name',
        accessor: (row: DiscountOfferRow) => row.name,
      },
      {
        header: 'fees.discounts.table.columns.discount',
        accessor: (row: DiscountOfferRow) => row.discount,
      },
      {
        header: 'fees.discounts.table.columns.startDate',
        accessor: (row: DiscountOfferRow) => row.startDate,
      },
      {
        header: 'fees.discounts.table.columns.endDate',
        accessor: (row: DiscountOfferRow) => row.endDate,
      },
      {
        header: 'fees.discounts.table.columns.status',
        accessor: (row: DiscountOfferRow) => (
          <StatusToggle
            checked={row.isActive}
            onChange={(next) =>
              setRows((prev) => prev.map((p) => (p.id === row.id ? { ...p, isActive: next } : p)))
            }
          />
        ),
      },
      {
        header: 'fees.discounts.table.columns.actions',
        accessor: (row: DiscountOfferRow) => (
          <div className="flex items-center justify-center gap-2">
            <IconButton
              status="delete"
              ariaLabel={t('actions.delete')}
              onClick={() => setRows((prev) => prev.filter((p) => p.id !== row.id))}
            />
            <IconButton
              status="edit"
              ariaLabel={t('actions.edit')}
              onClick={() => {
                // TODO: wire edit navigation when the edit page exists
              }}
            />
          </div>
        ),
      },
    ],
    [limit, safePage, setRows, t]
  );

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl" padding="lg">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="w-full md:w-[220px]">
            <CustomSelect
              value={status}
              onChange={(v) => {
                setStatus(v as OfferStatusFilter);
                setPage(1);
              }}
              options={statusOptions}
              placeholder={t('fees.discounts.filters.statusPlaceholder')}
              showSearch={false}
            />
          </div>

          <div className="w-full min-w-[240px] flex-1">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={t('fees.discounts.filters.searchPlaceholder')}
              debounce={300}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table columns={columns} data={pagedRows} keyExtractor={(row) => row.id} />
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            to={Math.min(safePage * limit, total)}
            from={total}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </Card>
    </div>
  );
}
