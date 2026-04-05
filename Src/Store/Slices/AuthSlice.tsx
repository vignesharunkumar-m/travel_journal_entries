import { createSlice } from '@reduxjs/toolkit';
import { LoginReducerProps } from '../../@types/ReduerTypes';

const initialState: LoginReducerProps = {
  userData: null,
  userDetails: null,
};

const { actions, reducer } = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    StoreUserData: (state, action) => {
      state.userData = action.payload;
    },
    StoreUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    ClearAuthReduxData: () => {
      return initialState;
    },
  },
});

export const { StoreUserData, StoreUserDetails, ClearAuthReduxData } = actions;

export default reducer;
