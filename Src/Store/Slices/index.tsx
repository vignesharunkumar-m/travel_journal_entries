import { combineReducers } from '@reduxjs/toolkit';
import UtilityReducer from './UtilitySlice';
import JournalReducer from './journalSlice';

export const RootReducer = combineReducers({
  utility: UtilityReducer,
  journal: JournalReducer,
});
