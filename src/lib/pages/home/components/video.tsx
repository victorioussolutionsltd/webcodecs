import { useEffect, useRef } from 'react';

export const Video = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ask for camera + microphone access
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err);
      });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl shadow-lg w-[640px] h-[480px]"
      />
    </div>
  );
};
