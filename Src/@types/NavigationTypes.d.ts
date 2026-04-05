import { JournalEntry } from '../features/journal/types';

export type PostListFilters = {
  keyword: string;
  label: string;
  startDate: number | null;
  endDate: number | null;
};

export type RootStackParamsList = {
  Login: undefined;
};
export type MainStackParamsList = {
  HomeScreen:
    | {
        filters?: PostListFilters;
      }
    | undefined;
  PostScreen: {
    entry?: JournalEntry;
  } | undefined;
  PostDetailsScreen: {
    entry: JournalEntry;
  };
  FilterScreen: {
    filters: PostListFilters;
  };
};
