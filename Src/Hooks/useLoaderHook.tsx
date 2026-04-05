import { useDispatch } from 'react-redux';
import { StoreIsLoading } from '../Store/Slices/UtilitySlice';
import { LoadingTextKey } from '../@types/StaticTypes';

export default function useLoaderHook() {
  const dispatch = useDispatch();

  return {
    setLoading: (val: true | false, text: LoadingTextKey = 'EMPTY') => {
      dispatch(StoreIsLoading(val, text));
    },
  };
}
