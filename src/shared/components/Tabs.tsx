import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type TabItem = {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value?: string; // controlled active id
  defaultValue?: string; // uncontrolled initial id
  onChange?: (id: string) => void;
  className?: string;
  listClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  panelClassName?: string;
  variant?: 'underline' | 'pills';
  lazy?: boolean; // mount panels lazily
  searchParamKey?: string; // URL search param key to persist selected tab
};

/**
 * Accessible Tabs component (WAI-ARIA) with keyboard navigation.
 */
const Tabs: React.FC<TabsProps> = ({
  items,
  value,
  defaultValue,
  onChange,
  className,
  listClassName,
  tabClassName,
  activeTabClassName,
  panelClassName,
  variant = 'underline',
  lazy = false,
  searchParamKey,
}) => {
  const internalId = useId();
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial value from URL search params if searchParamKey is provided
  const getInitialValue = () => {
    if (value !== undefined) return value;
    if (searchParamKey) {
      const tabFromUrl = searchParams.get(searchParamKey);
      if (tabFromUrl && ids.includes(tabFromUrl)) return tabFromUrl;
    }
    return defaultValue ?? ids[0];
  };

  const [active, setActive] = useState<string>(getInitialValue);

  // Sync with URL search params when they change
  useEffect(() => {
    if (searchParamKey) {
      const tabFromUrl = searchParams.get(searchParamKey);
      // If tab param exists in URL and is valid
      if (tabFromUrl && ids.includes(tabFromUrl) && tabFromUrl !== active) {
        setActive(tabFromUrl);
        onChange?.(tabFromUrl);
      }
      // If tab param is missing from URL, reset to default
      else if (!tabFromUrl && active !== (defaultValue ?? ids[0])) {
        const defaultTab = defaultValue ?? ids[0];
        setActive(defaultTab);
        onChange?.(defaultTab);
      }
    }
  }, [searchParams, searchParamKey, ids, active, defaultValue, onChange]);

  // Controlled mode sync
  useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  // When items change, ensure active is still valid
  useEffect(() => {
    if (!ids.includes(active)) setActive(ids[0]);
  }, [ids.join('|')]);

  const isControlled = value !== undefined;

  const handleChange = (id: string) => {
    if (!isControlled) setActive(id);
    // Update URL search params if searchParamKey is provided
    if (searchParamKey) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set(searchParamKey, id);
        return newParams;
      });
    }
    onChange?.(id);
  };

  const baseTab =
    tabClassName ??
    'flex-1 py-2 text-center font-medium transition-colors duration-200 text-gray-500 hover:text-green-500 focus:outline-none';
  const activeTab =
    activeTabClassName ??
    (variant === 'underline'
      ? 'border-b-2 border-green-500 text-green-600'
      : 'bg-green-100 text-green-700 rounded-md');

  const listCls = listClassName ?? (variant === 'underline' ? 'flex w-full' : 'flex w-full gap-2');

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = ids.indexOf(active);
    if (currentIndex < 0) return;
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % ids.length;
      e.preventDefault();
      handleChange(ids[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + ids.length) % ids.length;
      e.preventDefault();
      handleChange(ids[nextIndex]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleChange(ids[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      handleChange(ids[ids.length - 1]);
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label="tabs" className={listCls} onKeyDown={onKeyDown}>
        {items.map((item) => {
          const activeNow = item.id === active;
          return (
            <button
              key={item.id}
              id={`${internalId}-tab-${item.id}`}
              role="tab"
              aria-selected={activeNow}
              aria-controls={`${internalId}-panel-${item.id}`}
              tabIndex={activeNow ? 0 : -1}
              disabled={item.disabled}
              className={`${baseTab} ${activeNow ? activeTab : ''}`}
              onClick={() => handleChange(item.id)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className={panelClassName}>
        {items.map((item) => {
          const activeNow = item.id === active;
          if (lazy && !activeNow) return null;
          return (
            <div
              key={item.id}
              id={`${internalId}-panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`${internalId}-tab-${item.id}`}
              hidden={!activeNow}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
