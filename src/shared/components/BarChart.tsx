import React from 'react';
import Tooltip, { type TooltipPlacement } from '@/shared/components/Tooltip';

export interface BarChartDatum {
  key: string;
  label: React.ReactNode;
  value: number;
  /** Optional hover tooltip content for both the bar and its x-axis label. */
  tooltip?: React.ReactNode;
}

interface BarChartProps {
  data: BarChartDatum[];
  /** Y-axis ticks, descending — include the max and 0 (e.g. [100, 90, …, 0]). */
  yTicks: number[];
  /** Value that maps to a full-height bar. */
  max: number;
  /** Render a y-axis tick label. Default: the raw number. */
  renderTick?: (tick: number) => React.ReactNode;
  /** Bar fill colour class. Default: the brand green. */
  barClassName?: string;
  /** Bar width class. Default: w-10. */
  barWidthClassName?: string;
  /** Plot/Y-axis height class. Default: h-[280px]. */
  plotHeightClassName?: string;
  tooltipPlacement?: TooltipPlacement;
}

/**
 * Shared vertical bar chart: dashed gridlines, a y-axis, hoverable bars and
 * x-axis labels (both showing the same tooltip). Renders LTR regardless of
 * page direction so bars stay left-to-right.
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  yTicks,
  max,
  renderTick = (tick) => tick,
  barClassName = 'bg-[#4D9E7B]',
  barWidthClassName = 'w-10',
  plotHeightClassName = 'h-[280px]',
  tooltipPlacement = 'top',
}) => {
  return (
    <div dir="ltr" className="flex gap-3">
      {/* Y axis — height matches the plot so "0" lines up with the bar baseline */}
      <div
        className={`sticky left-0 z-10 flex ${plotHeightClassName} shrink-0 flex-col justify-between bg-white pe-2 text-xs font-normal text-[#A9A7A7]`}
      >
        {yTicks.map((tick, index) => (
          <span
            key={tick}
            className={`${index === 0 ? 'translate-y-0' : '-translate-y-1/2'} whitespace-nowrap leading-none`}
          >
            {renderTick(tick)}
          </span>
        ))}
      </div>

      {/* Plot */}
      <div className="flex-1">
        <div className={`relative ${plotHeightClassName}`}>
          <div className="absolute inset-0 flex flex-col justify-between">
            {yTicks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-[#DDE0E0]" />
            ))}
          </div>
          <div className="relative flex h-full items-end justify-around gap-4">
            {data.map((bar) => (
              <div
                key={bar.key}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div
                  className={barWidthClassName}
                  style={{ height: `${Math.min(100, (bar.value / max) * 100)}%` }}
                >
                  <Tooltip
                    content={bar.tooltip}
                    placement={tooltipPlacement}
                    wrapperClassName="block h-full w-full"
                  >
                    <div
                      className={`h-full w-full rounded-t-md transition-all ${barClassName}`}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-around gap-4">
          {data.map((bar) => (
            <div key={bar.key} className="flex flex-1 justify-center">
              <Tooltip content={bar.tooltip} placement={tooltipPlacement}>
                <span className="cursor-default text-sm font-normal text-[#0E1F1F]">
                  {bar.label}
                </span>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
