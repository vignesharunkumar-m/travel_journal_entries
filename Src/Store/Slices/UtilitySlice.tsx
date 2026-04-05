import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOADING_TEXT } from '../../Utility/Constants';
import {
  UtilityReducerProps,
  StoreIsLoadingParams,
} from '../../@types/ReduerTypes';

const initialState: UtilityReducerProps = {
  insets: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  loader: {
    isLoading: false,
    text: '',
  },
  isNetworkConnected: null,
};

const { actions, reducer } = createSlice({
  name: 'UtilitySlice',
  initialState,
  reducers: {
    StoreInsetsData: (state, action) => {
      state.insets = action.payload;
    },
    StoreIsLoading: {
      reducer: (state, action: PayloadAction<StoreIsLoadingParams>) => {
        state.loader.isLoading = action.payload.isLoading;
        state.loader.text = action.payload.textKey
          ? LOADING_TEXT[action.payload.textKey] || ''
          : '';
      },
      prepare: (isLoading, textKey = ''): { payload: StoreIsLoadingParams } => {
        return {
          payload: { isLoading, textKey },
        };
      },
    },
    ClearUtilityReduxData: () => {
      return initialState;
    },
  },
});

export const { StoreInsetsData, StoreIsLoading, ClearUtilityReduxData } =
  actions;

export default reducer;
