import { LoadingTextKey } from "./StaticTypes";
import { JournalState } from '../features/journal/types';

export type LoginReducerProps = {
  userData: LoginReducersUserDataProps | null;
  userDetails: userDetailsProps | null;
};

export type userDetailsProps = {
  address: string;
  email: string;
  img_path: string;
  name: string;
  phone: string;
  user_id: number;
  default_countdown: number;
};

export type LoginReducersUserDataProps = {
  token: string;
  user_name: string;
  user_type: number;
  user_id: number;
};

export type UtilityReducerProps = {
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  loader: ReducerLoaderProps;
  isNetworkConnected: boolean | null;
};

export type ReducerLoaderProps = {
  isLoading: boolean;
  text: string;
};

export type StoreIsLoadingParams = {
  isLoading: boolean;
  textKey?: LoadingTextKey;
};

export type ReducerProps = {
  login: LoginReducerProps;
  utility: UtilityReducerProps;
  journal: JournalState;
};
