import { useSelector } from 'react-redux';
import { ReducerProps } from '../@types/ReduerTypes';

export const useInsets = () => {
  return useSelector((state: ReducerProps) => state.utility.insets);
};

export const useLoader = () => {
  return useSelector((state: ReducerProps) => state.utility.loader);
};
