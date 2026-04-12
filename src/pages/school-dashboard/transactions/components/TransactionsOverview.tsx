import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import MetricCard from '@/shared/components/MetricCard';

import BillingIcon from '@gradex/assets/icons/Billing.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import FileIcon from '@gradex/assets/icons/File.svg';
import SchoolRegularIcon from '@gradex/assets/icons/SchoolRegular.svg';
import BusIcon from '@gradex/assets/icons/Bus.svg';
import UniversityIcon from '@gradex/assets/icons/University.svg';

export default function TransactionsOverview() {
  const { t } = useTranslation();
  const [, setSelectedYear] = useState('2024');

  const kpis = [
    {
      id: 1,
      title: 'financialManagement.totalPayments',
      value: '2.284',
      icon: (
        <CustomImage
          src={BillingIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(32%) sepia(61%) saturate(2311%) hue-rotate(206deg) brightness(97%) contrast(89%)',
          }}
        />
      ),
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      title: 'financialManagement.pendingAmounts',
      value: '2.284',
      icon: (
        <CustomImage
          src={TimeSyncIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(73%) sepia(50%) saturate(1900%) hue-rotate(1deg) brightness(101%) contrast(94%)',
          }}
        />
      ),
      iconBg: 'bg-yellow-50 text-yellow-600',
    },
    {
      id: 3,
      title: 'financialManagement.spentBudget',
      value: '2.284',
      icon: (
        <CustomImage
          src={CheckCircleIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(49%) sepia(43%) saturate(541%) hue-rotate(85deg) brightness(96%) contrast(91%)',
          }}
        />
      ),
      iconBg: 'bg-green-50 text-green-600',
    },
    {
      id: 4,
      title: 'financialManagement.remainingBalance',
      value: '2.284',
      icon: (
        <CustomImage
          src={FileIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(46%) sepia(7%) saturate(588%) hue-rotate(178deg) brightness(94%) contrast(88%)',
          }}
        />
      ),
      iconBg: 'bg-gray-100 text-gray-600',
    },
  ];

  const feeTypes = [
    {
      id: 1,
      title: 'financialManagement.tuitionFees',
      total: '2.284 / 2.284',
      pending: '١٥٣,٦٠٠',
      collectedPercent: 88,
      icon: (
        <CustomImage
          src={SchoolRegularIcon}
          className="h-5 w-5"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(26%) sepia(50%) saturate(723%) hue-rotate(97deg) brightness(97%) contrast(93%)', // green-800
          }}
        />
      ),
      iconBgClass: 'bg-green-100',
      color: 'bg-green-800',
    },
    {
      id: 2,
      title: 'financialManagement.transportFees',
      total: '2.284 / 2.284',
      pending: '١٥٣,٦٠٠',
      collectedPercent: 88,
      icon: (
        <CustomImage
          src={BusIcon}
          className="h-5 w-5"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(49%) sepia(34%) saturate(1549%) hue-rotate(94deg) brightness(97%) contrast(85%)', // green-600
          }}
        />
      ),
      iconBgClass: 'bg-green-50',
      color: 'bg-green-500',
    },
    {
      id: 3,
      title: 'financialManagement.schoolUniform',
      total: '2.284 / 2.284',
      pending: '١٥٣,٦٠٠',
      collectedPercent: 88,
      icon: (
        <CustomImage
          src={UniversityIcon}
          className="h-5 w-5"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(43%) sepia(91%) saturate(1512%) hue-rotate(200deg) brightness(101%) contrast(94%)', // blue-500
          }}
        />
      ),
      iconBgClass: 'bg-blue-50',
      color: 'bg-blue-500',
    },
    {
      id: 4,
      title: 'financialManagement.activities',
      total: '2.284 / 2.284',
      pending: '١٥٣,٦٠٠',
      collectedPercent: 88,
      icon: (
        <CustomImage
          src={UniversityIcon}
          className="h-5 w-5"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(53%) sepia(74%) saturate(1131%) hue-rotate(352deg) brightness(97%) contrast(87%)', // amber-600
          }}
        />
      ),
      iconBgClass: 'bg-orange-50',
      color: 'bg-amber-600',
    },
  ];

  const revenuesExpensesData = [
    {
      month: 'financialManagement.november',
      revenue: 30,
      expense: 210,
    },
    {
      month: 'financialManagement.october',
      revenue: 210,
      expense: 140,
    },
    {
      month: 'financialManagement.september',
      revenue: 120,
      expense: 210,
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            title={t(kpi.title)}
            value={kpi.value}
            icon={kpi.icon}
            iconClassName={kpi.iconBg}
          />
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenues & Expenses */}
        <Card className="app-card-shadow flex flex-col justify-between p-6">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {t('financialManagement.revenuesAndExpenses')}
            </h3>
            <div className="w-40">
              <CustomSelect
                options={[{ label: t('financialManagement.academicYear'), value: '2024' }]}
                value="2024"
                onChange={(val) => setSelectedYear(val as string)}
                placeholder={t('financialManagement.academicYear')}
              />
            </div>
          </div>

          {/* Chart Wrapper */}
          <div className="relative mt-auto flex h-64 w-full items-end justify-around border-b border-gray-200 pb-6">
            {/* Y-axis Labels */}
            <div className="absolute bottom-6 left-0 top-0 flex w-8 flex-col justify-between pr-2 text-xs text-gray-400">
              <span>400+</span>
              <span>350</span>
              <span>300</span>
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Horizontal Grid lines */}
            <div className="pointer-events-none absolute inset-0 bottom-6 left-8 flex flex-col justify-between">
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-100"></div>
              <div className="w-full border-b border-gray-400"></div>
            </div>

            {/* Bars */}
            <div className="z-10 flex h-[90%] w-full items-end justify-around pl-8">
              {revenuesExpensesData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-4">
                  <div className="flex h-48 items-end gap-2">
                    {/* Revenue Bar */}
                    <div
                      className="w-6 rounded-t-lg bg-yellow-400 transition-all duration-500 ease-in-out"
                      style={{ height: `${(data.revenue / 400) * 100}%` }}
                    ></div>
                    {/* Expense Bar */}
                    <div
                      className="w-6 rounded-t-lg bg-green-600 transition-all duration-500 ease-in-out"
                      style={{ height: `${(data.expense / 400) * 100}%` }}
                    ></div>
                  </div>
                  {/* X-Axis Label */}
                  <span className="text-sm font-medium text-gray-600">{t(data.month)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">{t('financialManagement.expenses')}</span>
              <div className="h-4 w-4 rounded bg-green-600"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">{t('financialManagement.revenues')}</span>
              <div className="h-4 w-4 rounded bg-yellow-400"></div>
            </div>
          </div>
        </Card>

        {/*Fee Types */}
        <Card className="app-card-shadow flex flex-col gap-6 p-6">
          <h3 className="text-lg font-bold text-gray-800">
            {t('financialManagement.typesOfFees')}
          </h3>
          <div className="flex flex-col gap-6">
            {feeTypes.map((fee) => (
              <div key={fee.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  {/* Right part Top (Renders First in RTL) */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${fee.iconBgClass}`}
                    >
                      {fee.icon}
                    </div>
                    <span className="font-medium text-gray-800">{t(fee.title)}</span>
                  </div>
                  {/* Left part Top (Renders Second in RTL) */}
                  <div className="flex items-center gap-2" dir="ltr">
                    <span className="text-gray-400">{fee.total.split(' / ')[0]} /</span>
                    <span className="font-bold text-green-800">{fee.total.split(' / ')[1]}</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="my-1 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`${fee.color} float-right h-2 rounded-full`}
                    style={{ width: `${fee.collectedPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {/* Right part Bottom (Renders First in RTL) */}
                  <span className="text-gray-500">
                    % {fee.collectedPercent} {t('financialManagement.collected')}
                  </span>
                  {/* Left part Bottom (Renders Second in RTL) */}
                  <span className="font-medium text-orange-500">
                    {t('financialManagement.pending')} {fee.pending}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
