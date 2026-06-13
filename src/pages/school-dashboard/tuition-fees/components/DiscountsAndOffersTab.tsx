import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import DataTable, {
  type DataTableColumn,
  type PaginationData,
} from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import SearchInput from '@/shared/components/SearchInput';
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import DeletePopup from '@/shared/popups/DeletePopup';
import PopupMessage from '@/shared/popups/PopupMessage';
import BigTrashIcon from '@/assets/icons/BigTrash.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { useToast } from '@/shared/context/ToastContext';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import { resolveErrorMessage, getBackendMessage } from '@/lib/http';
import { deleteOffer, fetchOffers, updateOffer } from '@/redux/features/offers/offersSlice';
import type { OfferDto } from '@/services/api/types/offer.types';
import type { DiscountOfferFormValues } from './AddEditDiscountOfferForm';
import {
  offerDtoToFormValues,
  formValuesToOfferPayload,
  toInputDate,
} from '../utils/discount-offer-mappers';

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

export default function DiscountsAndOffersTab() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const { offers, isLoading, pagination } = useAppSelector((state) => state.offers);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OfferStatusFilter>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  const statusOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'active', label: t('fees.discounts.filters.statusActive') },
      { value: 'inactive', label: t('fees.discounts.filters.statusInactive') },
    ],
    [t]
  );

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

  const findOfferById = (id: string | null | undefined) => {
    if (!id) return undefined;
    return (offers ?? []).find((o) => o.id === id);
  };

  const buildPayload = (form: DiscountOfferFormValues, base?: OfferDto) =>
    formValuesToOfferPayload(schoolBranchId, form, base);

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
        headerClassName: 'min-w-[180px]',
      },
      {
        header: 'fees.discounts.table.columns.discount',
        accessor: (row: DiscountOfferRow) => formatDiscount(row),
        headerClassName: 'min-w-[140px]',
      },
      {
        header: 'fees.discounts.table.columns.startDate',
        accessor: (row: DiscountOfferRow) => formatDisplayDate(row.startDate),
        headerClassName: 'min-w-[140px]',
      },
      {
        header: 'fees.discounts.table.columns.endDate',
        accessor: (row: DiscountOfferRow) => formatDisplayDate(row.endDate),
        headerClassName: 'min-w-[140px]',
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
                    ...buildPayload(
                      {
                        ...offerDtoToFormValues(base),
                        isActive: next,
                      },
                      base
                    ),
                  })
                )
                  .unwrap()
                  .then((res) => {
                    if (res.isSuccess) {
                      dispatch(
                        fetchOffers({
                          SchoolBranchId: schoolBranchId,
                          Search: search || undefined,
                          IsActive: status === 'all' ? undefined : status === 'active',
                          PageIndex: page,
                          PageSize: limit,
                        })
                      );
                      setShowPopupMessage({
                        show: true,
                        type: 'success',
                        message: 'fees.discounts.messages.editSuccess',
                        isRaw: false,
                      });
                    } else {
                      setShowPopupMessage({
                        show: true,
                        type: 'error',
                        message: 'common.error',
                        isRaw: false,
                      });
                    }
                  });

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
                const validationErrors = (e as any)?.validationErrors;
                const { message, isRaw } = validationErrors
                  ? {
                      message: formatValidationErrors(validationErrors, t('common.errorOccurred')),
                      isRaw: true,
                    }
                  : resolveErrorMessage(e);
                setShowPopupMessage({
                  show: true,
                  type: 'error',
                  message,
                  isRaw,
                });
              }
            }}
          />
        ),
        headerClassName: 'min-w-[100px]',
      },
      {
        header: 'fees.discounts.table.columns.actions',
        accessor: (row: DiscountOfferRow) => (
          <div className="flex items-center justify-center gap-2">
            <IconButton
              status="edit"
              ariaLabel={t('actions.edit')}
              onClick={() => {
                navigate(`/financial-management/fees/edit-discount-offer/${row.id}`);
              }}
            />
            <IconButton
              status="delete"
              ariaLabel={t('actions.delete')}
              onClick={() => {
                setPendingDeleteId(row.id);
                setIsDeletePopupOpen(true);
              }}
            />
          </div>
        ),
        headerClassName: 'min-w-[120px]',
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

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteOffer(pendingDeleteId))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess || res === pendingDeleteId) {
            showToast({
              message: t('fees.discounts.messages.deleteSuccess'),
              type: 'success',
            });
            setIsDeletePopupOpen(false);
            setPendingDeleteId(null);
            showToast({ message: t('fees.discounts.messages.deleteSuccess'), type: 'success' });
            dispatch(
              fetchOffers({
                SchoolBranchId: schoolBranchId,
                Search: search || undefined,
                IsActive: status === 'all' ? undefined : status === 'active',
                PageIndex: page,
                PageSize: limit,
              })
            );
          } else {
            showToast({ message: t('common.error'), type: 'error' });
          }
        });
    } catch (error) {
      showToast({ message: getBackendMessage(error) || t('common.error'), type: 'error' });
      setIsDeletePopupOpen(false);
    }
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

      <DeletePopup
        open={isDeletePopupOpen}
        message="fees.discounts.messages.deleteConfirm"
        itemName={(() => {
          const base = findOfferById(pendingDeleteId);
          if (!base) return '';
          return (currentLang === 'ar' ? base.nameAr : base.nameEn) || base.nameAr || base.nameEn;
        })()}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeletePopupOpen(false);
          setPendingDeleteId(null);
        }}
        iconSrc={BigTrashIcon}
      />

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isRaw}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        autoClose={true}
        onClose={() => setShowPopupMessage({ ...showPopupMessage, show: false })}
      />
    </div>
  );
}
