import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import {
  clearPageHeader,
  setPageHeader,
  type PageHeaderInfo,
} from '@/redux/features/page-header/pageHeaderSlice';

export function usePageHeader({ icon, title, description, isRaw }: PageHeaderInfo) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageHeader({ icon, title, description, isRaw }));
    return () => {
      dispatch(clearPageHeader());
    };
  }, [dispatch, icon, title, description, isRaw]);
}
