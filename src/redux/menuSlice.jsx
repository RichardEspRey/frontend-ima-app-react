import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeMenu: null,
  expandedMenu: null,
  selectedSubMenu: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setExpandedMenu: (state, action) => {
      state.expandedMenu = action.payload;
    },
    setSelectedSubMenu: (state, action) => {
      state.selectedSubMenu = action.payload;
    },
  },
});

export const { setActiveMenu, setExpandedMenu, setSelectedSubMenu } = menuSlice.actions;
export default menuSlice.reducer;
