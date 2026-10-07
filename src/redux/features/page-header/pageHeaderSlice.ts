import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
export interface PageHeaderInfo {
  icon?: string;
  title: string;
  description?: string;
}

interface PageHeaderState {
  info: PageHeaderInfo | null;
}

const initialState: PageHeaderState = {
  info: null,
};

const pageHeaderSlice = createSlice({
  name: 'pageHeader',
  initialState,
  reducers: {
    setPageHeader: (state, action: PayloadAction<PageHeaderInfo>) => {
      state.info = action.payload;
    },
    clearPageHeader: (state) => {
      state.info = null;
    },
  },
});

export const { setPageHeader, clearPageHeader } = pageHeaderSlice.actions;
export default pageHeaderSlice.reducer;
