import { combineReducers } from '@reduxjs/toolkit';
import AuthReducer from './AuthSlice';
import UtilityReducer from './UtilitySlice';
import JournalReducer from './journalSlice';

export const RootReducer = combineReducers({
  login: AuthReducer,
  utility: UtilityReducer,
  journal: JournalReducer,
});
