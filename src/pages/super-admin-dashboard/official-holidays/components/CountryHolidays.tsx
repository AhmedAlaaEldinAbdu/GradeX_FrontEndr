import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import i18n from '@/i18n';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import DeletePopup from '@/shared/components/DeletePopup';
import HolidayTimeline from './HolidayTimeline';
import type { FixedHoliday, OfficialHoliday } from '@/types/officialHolidays';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import { ActionsDropdown, Loading, type Action } from '@/shared/components/components';
import {
  fetchOfficialHolidays,
  deleteHoliday,
  selectOfficialHolidays,
  selectIsDeleting,
  selectIsLoading,
} from '@/redux/features/official-holidays';
import { LeaveCategoryEnum } from '@/services/api';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import { useToast } from '@/shared/context/ToastContext';

export default function CountryHolidays() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { countryId } = useParams<{ countryId: string }>();
  const { showToast } = useToast();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(null);

  const currentLang = i18n.language as 'ar' | 'en';

  const holidays = useSelector(selectOfficialHolidays);
  const isDeleting = useSelector(selectIsDeleting);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    if (countryId) {
      dispatch(
        fetchOfficialHolidays({
          page: 1,
          limit: 100,
          filters: {
            countryId,
          },
        })
      );
    }
  }, [dispatch, countryId]);

  const countryName = useMemo(() => {
    if (holidays.length > 0) {
      return currentLang === 'ar' ? holidays[0].countryNameAR : holidays[0].countryNameEN;
    }
    return '';
  }, [holidays, currentLang]);

  const fixedHolidays: FixedHoliday[] = useMemo(() => {
    return holidays
      .filter((holiday) => holiday?.leaveCategory?.toLowerCase() === LeaveCategoryEnum.STATIC)
      .map((holiday) => ({
        id: holiday.id,
        date: holiday.startDate,
        dayName: new Date(holiday.startDate).toLocaleDateString(currentLang, { weekday: 'long' }),
        reason: (currentLang === 'ar' && holiday.reasonAR) || holiday.reasonEN,
        isEditable: true,
      }));
  }, [holidays, currentLang]);

  const officialHolidays: OfficialHoliday[] = useMemo(() => {
    return holidays
      .filter((holiday) => holiday.leaveCategory.toLowerCase() === LeaveCategoryEnum.OFFICIAL)
      .map((holiday) => {
        const startDate = new Date(holiday.startDate);
        const endDate = new Date(holiday.endDate);

        // Format date range
        const isSameDay = startDate.toDateString() === endDate.toDateString();
        const dateRange = isSameDay
          ? startDate.toLocaleDateString(currentLang, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              weekday: 'long',
            })
          : `${startDate.toLocaleDateString(currentLang, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              weekday: 'long',
            })} - ${endDate.toLocaleDateString(currentLang, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              weekday: 'long',
            })}`;

        return {
          id: holiday.id,
          dateRange,
          arabicDateRange: dateRange,
          reason: (currentLang === 'ar' && holiday.reasonAR) || holiday.reasonEN,
          hasOfficialDocument: !!holiday.filePath && holiday.filePath !== 'string',
          date: holiday.startDate,
        };
      });
  }, [holidays, currentLang]);

  const isUpcomingHoliday = (dateString?: string): boolean => {
    if (!dateString) return false;
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHolidayId) return;

    try {
      await dispatch(deleteHoliday(selectedHolidayId)).unwrap();
      setShowDeletePopup(false);
      setSelectedHolidayId(null);

      showToast({
        message: t('officialHolidays.holidayDeletedSuccessfully'),
        type: 'success',
        duration: 3000,
      });

      if (countryId) {
        dispatch(
          fetchOfficialHolidays({
            page: 1,
            limit: 100,
            filters: {
              countryId,
            },
          })
        );
      }
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  const getHolidayActions = (holidayId: string): Action[] => [
    {
      id: 'edit',
      label: t('actions.edit'),
      icon: EditFilledIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: () => navigate(`/official-holidays/edit/${holidayId}`),
    },
    {
      id: 'delete',
      label: t('actions.delete'),
      icon: TrashIcon,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => {
        setSelectedHolidayId(holidayId);
        setShowDeletePopup(true);
      },
      disabled: isDeleting,
    },
  ];

  const breadcrumbItems = [
    { label: t('officialHolidays.title'), path: '/official-holidays' },
    { label: countryName },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {<Breadcrumb items={breadcrumbItems} />}

      {/* Country Name Header with Search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{countryName}</h1>
      </div>

      {/* Fixed Holidays Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-start text-lg font-semibold text-gray-800">
            {t('officialHolidays.fixedHolidays')}
          </h2>
        </div>

        {fixedHolidays.length > 0 ? (
          <div className="space-y-3">
            {fixedHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300"
              >
                <div className="flex items-center gap-3">
                  <img src={CheckIcon} alt="Check" className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{holiday.dayName}</p>
                    <p className="text-xs text-gray-600">{holiday.reason}</p>
                  </div>
                </div>
                <ActionsDropdown actions={getHolidayActions(holiday.id)} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            imgSrc={BigTrashIcon}
            description={t('officialHolidays.noFixedHolidaysYet')}
            blend={true}
          />
        )}
      </Card>

      {/* Official Holidays Card */}
      <Card>
        <h2 className="mb-6 text-start text-lg font-semibold text-gray-800">
          {t('officialHolidays.officialHolidays')}
        </h2>

        {officialHolidays.length === 0 ? (
          <EmptyState
            imgSrc={BigTrashIcon}
            description={t('officialHolidays.noOfficialHolidays')}
            blend={true}
          />
        ) : (
          <HolidayTimeline holidays={officialHolidays} isUpcomingHoliday={isUpcomingHoliday} />
        )}
      </Card>

      <DeletePopup
        open={showDeletePopup}
        message={t('officialHolidays.confirmDeleteHoliday')}
        iconSrc={BigTrashIcon}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
