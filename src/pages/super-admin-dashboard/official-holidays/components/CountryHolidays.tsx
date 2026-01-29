import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import i18n from '@/i18n';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import DeletePopup from '@/shared/popups/DeletePopup';
import HolidayTimeline from './HolidayTimeline';
import FixedHolidayCard from './FixedHolidayCard';
import type { FixedHoliday, OfficialHoliday } from '@/types/officialHolidays';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { Loading } from '@/shared/components/components';
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
        reason: (currentLang === 'ar' && holiday.reasonAr) || holiday.reasonEN,
        isEditable: true,
        dateRange: '',
        hasOfficialDocument: !!holiday.filePath && holiday.filePath !== 'string',
        filePath: holiday.filePath,
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
          reason: (currentLang === 'ar' && holiday.reasonAr) || holiday.reasonEN,
          hasOfficialDocument: !!holiday.filePath && holiday.filePath !== 'string',
          date: holiday.startDate,
          filePath: holiday.filePath,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {fixedHolidays.map((holiday) => (
              <FixedHolidayCard key={holiday.id} holiday={holiday} />
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
        message="officialHolidays.confirmDeleteHoliday"
        itemName={(() => {
          if (!selectedHolidayId) return '';
          const found = holidays.find((h) => h.id === selectedHolidayId);
          if (!found) return '';
          return (currentLang === 'ar' ? found.reasonAr : found.reasonEN) || found.reasonEN || '';
        })()}
        iconSrc={BigTrashIcon}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
