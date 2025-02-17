import { MD_SCREEN_QUERY } from '@/constants';
import { useMediaQuery } from 'react-responsive';

export function useIsMobile() {
  const isMdScreen = useMediaQuery({ query: MD_SCREEN_QUERY });
  return isMdScreen;
}
