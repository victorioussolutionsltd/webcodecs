import { useEffect, useState } from 'react';

import { Video } from '@/lib/pages/home/components/video';

import { SomeText } from './components/some-text';

const Home = () => {
  const [isWhite, setIsWhite] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsWhite((prev) => !prev);
    }, 500); // Flicker every 500ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: isWhite ? '#fff' : '#000',
        transition: 'background-color 0.1s linear',
      }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center"
    >
      <SomeText />
      <Video />
    </div>
  );
};

export default Home;
