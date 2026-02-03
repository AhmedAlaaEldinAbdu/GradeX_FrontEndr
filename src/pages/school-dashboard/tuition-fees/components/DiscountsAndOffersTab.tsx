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
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { useToast } from '@/shared/context/ToastContext';
import {
  createOffer,
  deleteOffer,
  fetchOffers,
  updateOffer,
} from '@/redux/features/offers/offersSlice';
import type { OfferDto } from '@/services/api/types/offer.types';

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

export default function DiscountsAndOffersTab({ openAddSignal }: DiscountsAndOffersTabProps) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const { offers, isLoading, pagination } = useAppSelector((state) => state.offers);

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

  const toInputDate = (value: string) => {
    if (!value) return '';
    // Supports both ISO timestamps and YYYY-MM-DD.
    const isoDate = value.split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : value;
  };

  useEffect(() => {
    if (!schoolBranchId) return;

    dispatch(
      fetchOffers({
        SchoolBranchId: schoolBranchId,
        Search: search || undefined,
        IsActive: status === 'all' ? undefined : status === 'active',
        PageIndex: page,
        PageSize: limit,
      })
    );
  }, [dispatch, limit, page, schoolBranchId, search, status]);

  const rows = useMemo<DiscountOfferRow[]>(() => {
    return (offers ?? []).map((o) => {
      const discountType: DiscountOfferRow['discountType'] =
        o.percentage !== null && o.percentage !== undefined ? 'percentage' : 'value';

      const discountValue =
        discountType === 'percentage' ? String(o.percentage ?? '') : String(o.amount ?? '');

      return {
        id: o.id,
        nameAr: o.nameAr,
        nameEn: o.nameEn,
        discountType,
        discountValue,
        startDate: toInputDate(o.startDate),
        endDate: toInputDate(o.endDate),
        isActive: !!o.isActive,
      };
    });
  }, [offers]);

  const formatDiscount = (row: DiscountOfferRow) => {
    if (row.discountType === 'percentage') {
      return currentLang === 'ar' ? `%${row.discountValue}` : `${row.discountValue}%`;
    }
    return currentLang === 'ar' ? `${row.discountValue} ريال` : `${row.discountValue} SAR`;
  };

  const formatDisplayDate = (value: string) => {
    // Convert YYYY-MM-DD or ISO -> D-M-YYYY to match existing table mock format.
    const date = toInputDate(value);
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (!iso.test(date)) return value;
    const [y, m, d] = date.split('-');
    return `${Number(d)}-${Number(m)}-${y}`;
  };

  const getRowName = (row: DiscountOfferRow) =>
    (currentLang === 'ar' ? row.nameAr : row.nameEn) || row.nameAr || row.nameEn;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const findOfferById = (id: string | null | undefined) => {
    if (!id) return undefined;
    return (offers ?? []).find((o) => o.id === id);
  };

  const offerDtoToFormValues = (o: OfferDto): DiscountOfferFormValues => {
    const discountType: DiscountOfferFormValues['discountType'] =
      o.percentage !== null && o.percentage !== undefined ? 'percentage' : 'value';

    return {
      id: o.id,
      nameAr: o.nameAr,
      nameEn: o.nameEn,
      discountType,
      discountValue:
        discountType === 'percentage' ? String(o.percentage ?? '') : String(o.amount ?? ''),
      startDate: toInputDate(o.startDate),
      endDate: toInputDate(o.endDate),
      isActive: !!o.isActive,
    };
  };

  const formValuesToOfferPayload = (form: DiscountOfferFormValues, base?: OfferDto) => {
    const numericValue = form.discountValue === '' ? null : Number(form.discountValue);

    return {
      schoolBranchId: base?.schoolBranchId ?? schoolBranchId,
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      offerType: base?.offerType ?? 1,
      amount: form.discountType === 'value' ? numericValue : null,
      percentage: form.discountType === 'percentage' ? numericValue : null,
      applyOn: base?.applyOn ?? 1,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : (base?.startDate ?? ''),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : (base?.endDate ?? ''),
      isActive: !!form.isActive,
      matchAllConditions: base?.matchAllConditions ?? true,
      conditions: (base?.conditions ?? []).map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
      })),
    };
  };

  const editingOffer = useMemo<DiscountOfferFormValues | undefined>(() => {
    const o = findOfferById(editingRowId);
    return o ? offerDtoToFormValues(o) : undefined;
  }, [editingRowId, offers]);

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

  const total = pagination?.totalItems ?? rows.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

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
          <ToggleSwitch
            checked={row.isActive}
            onChange={async (next) => {
              const base = findOfferById(row.id);
              if (!base) return;

              try {
                await dispatch(
                  updateOffer({
                    id: base.id,
                    ...formValuesToOfferPayload(
                      {
                        ...offerDtoToFormValues(base),
                        isActive: next,
                      },
                      base
                    ),
                  })
                ).unwrap();

                dispatch(
                  fetchOffers({
                    SchoolBranchId: schoolBranchId,
                    Search: search || undefined,
                    IsActive: status === 'all' ? undefined : status === 'active',
                    PageIndex: page,
                    PageSize: limit,
                  })
                );
              } catch (e) {
                showToast({ message: t('common.error'), type: 'error' });
              }
            }}
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
              onClick={async () => {
                try {
                  await dispatch(deleteOffer(row.id)).unwrap();
                  showToast({ message: t('common.success'), type: 'success' });
                  dispatch(
                    fetchOffers({
                      SchoolBranchId: schoolBranchId,
                      Search: search || undefined,
                      IsActive: status === 'all' ? undefined : status === 'active',
                      PageIndex: page,
                      PageSize: limit,
                    })
                  );
                } catch (e) {
                  showToast({ message: t('common.error'), type: 'error' });
                }
              }}
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
    [
      currentLang,
      dispatch,
      limit,
      offers,
      page,
      safePage,
      schoolBranchId,
      search,
      showToast,
      status,
      t,
    ]
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
          data={rows}
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
          isLoading={isLoading}
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
          (async () => {
            try {
              if (modalMode === 'add') {
                // API currently expects more fields than the popup shows.
                // We send sensible defaults for now and no conditions.
                await Promise.all(
                  offers.map((o) =>
                    dispatch(
                      createOffer({
                        ...formValuesToOfferPayload(o),
                        conditions: [],
                      })
                    ).unwrap()
                  )
                );
              } else if (editingRowId) {
                const base = findOfferById(editingRowId);
                if (!base) return;
                const o = offers[0];
                await dispatch(
                  updateOffer({
                    id: base.id,
                    ...formValuesToOfferPayload(o, base),
                  })
                ).unwrap();
              }

              showToast({ message: t('common.success'), type: 'success' });
              dispatch(
                fetchOffers({
                  SchoolBranchId: schoolBranchId,
                  Search: search || undefined,
                  IsActive: status === 'all' ? undefined : status === 'active',
                  PageIndex: 1,
                  PageSize: limit,
                })
              );
              setPage(1);
              setIsModalOpen(false);
              setEditingRowId(null);
            } catch (e) {
              showToast({ message: t('common.error'), type: 'error' });
            }
          })();
        }}
      />
    </div>
  );
}
