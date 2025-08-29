import { useEffect } from 'react';

import { useTheme } from '@/lib/components/theme-provider';
import { ONE_SEC_IN_MS } from '@/lib/constants';
import { Video } from '@/lib/pages/home/components/video';

const Home = () => {
  const { setTheme, theme } = useTheme();

  // Automatically toggle color every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }, ONE_SEC_IN_MS);
    return () => clearInterval(interval);
  }, [theme, setTheme]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <Video />
    </div>
  );
};

export default Home;
