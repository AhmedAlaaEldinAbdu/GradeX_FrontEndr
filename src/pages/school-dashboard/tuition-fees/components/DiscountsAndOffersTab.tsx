import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import DataTable, {
  type DataTableColumn,
  type PaginationData,
} from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import SearchInput from '@/shared/components/SearchInput';

import AddEditDiscountOfferPopup, {
  type DiscountOfferFormValues,
} from '../popups/AddEditDiscountOfferPopup';

type OfferStatusFilter = 'all' | 'active' | 'inactive';

type DiscountOfferRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  discountType: 'value' | 'percentage';
  discountValue: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type DiscountsAndOffersTabProps = {
  openAddSignal?: number;
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

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function DiscountsAndOffersTab({ openAddSignal }: DiscountsAndOffersTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OfferStatusFilter>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const statusOptions = useMemo<CustomSelectOption[]>(
    () => [
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
        nameAr: t('fees.discounts.mock.siblingsOffer'),
        nameEn: "Brothers' Offer",
        discountType: 'value',
        discountValue: '200',
        startDate: '2020-01-01',
        endDate: '2020-01-01',
        isActive: true,
      },
      {
        id: '2',
        nameAr: t('fees.discounts.mock.earlyPaymentOffer'),
        nameEn: 'Early Pay Offer',
        discountType: 'percentage',
        discountValue: '12',
        startDate: '2020-01-01',
        endDate: '2020-01-01',
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
      const name = (currentLang === 'ar' ? r.nameAr : r.nameEn) || r.nameAr || r.nameEn;
      const matchSearch = !q || name.toLowerCase().includes(q);
      const matchStatus =
        status === 'all' ? true : status === 'active' ? r.isActive === true : r.isActive === false;
      return matchSearch && matchStatus;
    });
  }, [currentLang, rows, search, status]);

  const formatDiscount = (row: DiscountOfferRow) => {
    if (row.discountType === 'percentage') {
      return currentLang === 'ar' ? `%${row.discountValue}` : `${row.discountValue}%`;
    }
    return currentLang === 'ar' ? `${row.discountValue} ريال` : `${row.discountValue} SAR`;
  };

  const formatDisplayDate = (value: string) => {
    // Convert YYYY-MM-DD -> D-M-YYYY to match existing table mock format.
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (!iso.test(value)) return value;
    const [y, m, d] = value.split('-');
    return `${Number(d)}-${Number(m)}-${y}`;
  };

  const getRowName = (row: DiscountOfferRow) =>
    (currentLang === 'ar' ? row.nameAr : row.nameEn) || row.nameAr || row.nameEn;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const editingOffer = useMemo<DiscountOfferFormValues | undefined>(() => {
    if (!editingRowId) return undefined;
    const row = rows.find((r) => r.id === editingRowId);
    if (!row) return undefined;
    return {
      id: row.id,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      discountType: row.discountType,
      discountValue: row.discountValue,
      startDate: row.startDate,
      endDate: row.endDate,
      isActive: row.isActive,
    };
  }, [editingRowId, rows]);

  const prevOpenAddSignal = useRef<number | undefined>(undefined);

  useEffect(() => {
    // IMPORTANT: do not auto-open on first mount.
    // Only open when the signal actually changes (e.g., header "Add Offer" click increments it).
    // This avoids opening the popup when switching tabs.
    if (openAddSignal === undefined) {
      prevOpenAddSignal.current = undefined;
      return;
    }

    if (prevOpenAddSignal.current === undefined) {
      prevOpenAddSignal.current = openAddSignal;
      return;
    }

    if (openAddSignal === prevOpenAddSignal.current) return;
    prevOpenAddSignal.current = openAddSignal;

    setModalMode('add');
    setEditingRowId(null);
    setIsModalOpen(true);
  }, [openAddSignal]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () => filtered.slice((safePage - 1) * limit, safePage * limit),
    [filtered, limit, safePage]
  );

  const columns = useMemo<DataTableColumn<DiscountOfferRow>[]>(
    () => [
      {
        header: 'fees.discounts.table.columns.index',
        accessor: (_row: DiscountOfferRow, index?: number) =>
          (index ?? 0) + 1 + (safePage - 1) * limit,
        headerClassName: 'w-[60px]',
      },
      {
        header: 'fees.discounts.table.columns.name',
        accessor: (row: DiscountOfferRow) => getRowName(row),
      },
      {
        header: 'fees.discounts.table.columns.discount',
        accessor: (row: DiscountOfferRow) => formatDiscount(row),
      },
      {
        header: 'fees.discounts.table.columns.startDate',
        accessor: (row: DiscountOfferRow) => formatDisplayDate(row.startDate),
      },
      {
        header: 'fees.discounts.table.columns.endDate',
        accessor: (row: DiscountOfferRow) => formatDisplayDate(row.endDate),
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
                setModalMode('edit');
                setEditingRowId(row.id);
                setIsModalOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLang, limit, safePage, setRows, t]
  );

  const tablePagination = useMemo<PaginationData>(
    () => ({
      page: safePage,
      limit,
      total,
      totalPages,
    }),
    [limit, safePage, total, totalPages]
  );

  const filterComponent = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full lg:w-[25%]">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={t('fees.discounts.filters.searchPlaceholder')}
          />
        </div>
        <div className="w-full lg:w-[15%]">
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
      </div>
    ),
    [search, status, statusOptions, t]
  );

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="space-y-4">
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
            {
              type: 'select',
              name: 'status',
              value: status === 'all' ? '' : status,
              onChange: (v) => setStatus((v as OfferStatusFilter) || 'all'),
              options: statusOptions.map((o) => ({ value: o.value, label: o.label })),
            },
          ]}
          filterComponent={filterComponent}
          pagination={tablePagination}
          onPageChange={(p) => setPage(p)}
          showFilters={true}
          onResetFilters={handleResetFilters}
          emptyMessage={t('common.noResults')}
          t={t}
        />
      </Card>

      <AddEditDiscountOfferPopup
        open={isModalOpen}
        mode={modalMode}
        initialOffer={modalMode === 'edit' ? editingOffer : undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRowId(null);
        }}
        onSubmit={(offers) => {
          if (modalMode === 'add') {
            setRows((prev) => [
              ...offers.map((o) => ({
                id: createId(),
                nameAr: o.nameAr,
                nameEn: o.nameEn,
                discountType: o.discountType,
                discountValue: o.discountValue,
                startDate: o.startDate,
                endDate: o.endDate,
                isActive: o.isActive,
              })),
              ...prev,
            ]);
          } else if (editingRowId) {
            const o = offers[0];
            setRows((prev) =>
              prev.map((r) =>
                r.id === editingRowId
                  ? {
                      ...r,
                      nameAr: o.nameAr,
                      nameEn: o.nameEn,
                      discountType: o.discountType,
                      discountValue: o.discountValue,
                      startDate: o.startDate,
                      endDate: o.endDate,
                      isActive: o.isActive,
                    }
                  : r
              )
            );
          }

          setIsModalOpen(false);
          setEditingRowId(null);
        }}
      />
    </div>
  );
}
