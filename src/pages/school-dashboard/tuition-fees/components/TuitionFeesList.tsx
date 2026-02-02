import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, {
  type DataTableColumn,
  type PaginationData,
} from '@/shared/components/DataTable';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import SearchInput from '@/shared/components/SearchInput';
import MonyBagIcon from '@/assets/icons/MonyBag.svg';
import BigTrashIcon from '@/assets/icons/BigTrash.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchLKPaymentMethods } from '@/redux/features/lookups/lookupsSlice';
import {
  deleteTuitionFees,
  fetchTuitionFees,
} from '@/redux/features/tuition-fees/tuitionFeesSlice';
import { useToast } from '@/shared/context/ToastContext';

type PaymentMethodFilter = 'all' | string;

type TuitionFeeRow = {
  id: string;
  educationalStageId: string;
  tuitionAmount: string;
  includes: string[];
  excludes: string[];
  paymentMethods: Array<'cash' | 'online' | 'installment'>;
};

type TuitionFeesListProps = {
  onAdd?: () => void;
};

export default function TuitionFeesList({ onAdd }: TuitionFeesListProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const { showToast } = useToast();

  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const { tuitionFees, isLoading, pagination, isDeleting } = useAppSelector(
    (state) => state.tuitionFees
  );
  const { educationalStages } = useAppSelector((state) => state.educationalStages);
  const { lkPaymentMethods, isLoadingLKPaymentMethods } = useAppSelector((state) => state.lookups);

  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodFilter>('all');
  const [page, setPage] = useState(1);
  const limit = 7;

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 10000, schoolBranchId }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (lkPaymentMethods.length > 0) return;
    dispatch(fetchLKPaymentMethods({ params: { PageIndex: 1, PageSize: 1000 } }));
  }, [dispatch, lkPaymentMethods.length]);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(
      fetchTuitionFees({
        SchoolBrancheId: schoolBranchId,
        Search: search || undefined,
        PaymentMethodId: paymentMethod === 'all' ? undefined : paymentMethod,
        PageIndex: page,
        PageSize: limit,
      })
    );
  }, [dispatch, limit, page, paymentMethod, schoolBranchId, search]);

  const rows = useMemo<TuitionFeeRow[]>(() => {
    return (tuitionFees ?? []).map((fee) => {
      const paymentMethods: Array<'cash' | 'online' | 'installment'> = (fee.paymentMethodIds ?? [])
        .map((m) => m.englishName?.toLowerCase() || m.arabicName?.toLowerCase() || '')
        .map((name) => {
          if (name.includes('installment') || name.includes('تقسيط')) return 'installment';
          if (name.includes('online') || name.includes('اونلاين') || name.includes('إلكتروني'))
            return 'online';
          if (name.includes('cash') || name.includes('نقد')) return 'cash';
          return null;
        })
        .filter((x): x is 'cash' | 'online' | 'installment' => !!x);

      return {
        id: fee.id,
        educationalStageId: fee.gradeId,
        tuitionAmount: String(fee.tuitionAmount ?? ''),
        includes: (fee.tuitionFeesServicesDto ?? []).map((s) =>
          currentLang === 'ar' ? s.nameAr : s.nameEn
        ),
        excludes: (fee.tuitionFeesPaidServicesDto ?? []).map((s) =>
          currentLang === 'ar' ? s.nameAr : s.nameEn
        ),
        paymentMethods,
      };
    });
  }, [currentLang, tuitionFees]);

  const paymentMethodOptions = useMemo<CustomSelectOption[]>(() => {
    const base: CustomSelectOption[] = [];

    const opts = lkPaymentMethods.map((m) => ({
      value: m.id,
      label: (currentLang === 'ar' ? m.arabicName : m.englishName) || m.arabicName || m.englishName,
    }));

    return [...base, ...opts];
  }, [currentLang, lkPaymentMethods, t]);

  const total = pagination?.totalItems ?? rows.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getStageName = (stageId: string) => {
    const stage = educationalStages.find((s) => s.id === stageId);
    if (!stage) return '-';
    return (currentLang === 'ar' ? stage.nameAr : stage.nameEn) || stage.nameAr || stage.nameEn;
  };

  const columns = useMemo<DataTableColumn<TuitionFeeRow>[]>(
    () => [
      {
        header: 'fees.tuition.list.table.columns.index',
        accessor: (_row: TuitionFeeRow, index?: number) =>
          (index ?? 0) + 1 + (safePage - 1) * limit,
        headerClassName: 'w-[60px]',
      },
      {
        header: 'fees.tuition.list.table.columns.stageName',
        accessor: (row: TuitionFeeRow) => getStageName(row.educationalStageId),
      },
      {
        header: 'fees.tuition.list.table.columns.tuitionAmount',
        accessor: (row: TuitionFeeRow) => row.tuitionAmount,
      },
      {
        header: 'fees.tuition.list.table.columns.includes',
        accessor: (row: TuitionFeeRow) => (
          <div className="flex flex-col gap-1">
            {row.includes.map((v, idx) => (
              <span key={idx}>{v}</span>
            ))}
          </div>
        ),
      },
      {
        header: 'fees.tuition.list.table.columns.excludes',
        accessor: (row: TuitionFeeRow) => (
          <div className="flex flex-col gap-1">
            {row.excludes.map((v, idx) => (
              <span key={idx}>{v}</span>
            ))}
          </div>
        ),
      },
      {
        header: 'fees.tuition.list.table.columns.paymentMethods',
        accessor: (row: TuitionFeeRow) => (
          <span>
            {row.paymentMethods
              .map((m) =>
                m === 'cash'
                  ? t('fees.tuition.form.payCash')
                  : m === 'online'
                    ? t('fees.tuition.form.payOnline')
                    : t('fees.tuition.form.payInstallment')
              )
              .join(' - ')}
          </span>
        ),
      },
      {
        header: 'fees.tuition.list.table.columns.actions',
        accessor: (row: TuitionFeeRow) => (
          <div className="flex items-center justify-center gap-2">
            <IconButton
              status="delete"
              ariaLabel={t('actions.delete')}
              onClick={() => {
                setPendingDeleteId(row.id);
                setIsDeletePopupOpen(true);
              }}
            />
            <IconButton
              status="edit"
              ariaLabel={t('actions.edit')}
              onClick={() => {
                navigate(`/fees/edit-tuition-fee/${row.id}`);
              }}
            />
          </div>
        ),
      },
    ],
    [dispatch, educationalStages, limit, navigate, safePage, t]
  );

  const hasActiveFilters = search.trim().length > 0 || paymentMethod !== 'all';
  const shouldShowEmptyState = !isLoading && rows.length === 0 && !hasActiveFilters;

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
        <div className="w-[300px]">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={t('fees.tuition.list.filters.searchPlaceholder')}
          />
        </div>

        <div className="w-[220px]">
          <CustomSelect
            value={paymentMethod}
            onChange={(v) => {
              setPaymentMethod(v as PaymentMethodFilter);
              setPage(1);
            }}
            options={paymentMethodOptions}
            placeholder={t('fees.tuition.list.filters.paymentMethodsPlaceholder')}
            showSearch={false}
            disabled={isLoadingLKPaymentMethods}
          />
        </div>
      </div>
    ),
    [isLoadingLKPaymentMethods, paymentMethod, paymentMethodOptions, search, t]
  );

  const handleResetFilters = () => {
    setSearch('');
    setPaymentMethod('all');
    setPage(1);
  };

  if (shouldShowEmptyState) {
    return (
      <Card className="rounded-2xl" padding="lg">
        <EmptyState
          imgSrc={MonyBagIcon}
          title={t('fees.tuition.emptyTitle')}
          description={t('fees.tuition.emptyDescription')}
          actionLabel={t('fees.tuition.addAction')}
          onAction={onAdd}
          blend
        />
      </Card>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteTuitionFees(pendingDeleteId))
        .unwrap()
        .then((res) => {
          if (res?.isSuccess || res === (pendingDeleteId as any)) {
            setIsDeletePopupOpen(false);
            setPendingDeleteId(null);
            showToast({
              message: 'academicSystem.systemDeletedSuccessfully',
              type: 'success',
            });
            dispatch(
              fetchTuitionFees({
                SchoolBrancheId: schoolBranchId,
                Search: search || undefined,
                PaymentMethodId: paymentMethod === 'all' ? undefined : paymentMethod,
                PageIndex: page,
                PageSize: limit,
              })
            );
          } else {
            showToast({
              message: res?.errors?.[0] || t('common.errorOccurred'),
              type: 'error',
            });
            setIsDeletePopupOpen(false);
          }
        });
    } catch {
      showToast({
        message: 'common.errorOccurred',
        type: 'error',
      });
      setIsDeletePopupOpen(false);
    }
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={rows}
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
          {
            type: 'select',
            name: 'paymentMethod',
            value: paymentMethod === 'all' ? '' : paymentMethod,
            onChange: (v) => setPaymentMethod(v as PaymentMethodFilter),
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

      <DeletePopup
        open={isDeletePopupOpen}
        message="actions.confirmDelete"
        itemName={(() => {
          if (!pendingDeleteId) return '';
          const row = rows.find((r) => r.id === pendingDeleteId);
          if (!row) return '';
          return getStageName(row.educationalStageId);
        })()}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeletePopupOpen(false);
          setPendingDeleteId(null);
        }}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </Card>
  );
}
