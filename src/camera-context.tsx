import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

export type CameraContextType = {
  liveRef: React.RefObject<HTMLVideoElement | null>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  recording: React.RefObject<boolean>;
};

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  const liveRef = useRef<HTMLVideoElement>(null);
  const recording = useRef(false);

  const startCamera = useCallback(async () => {
    if (!liveRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 3840 }, // try 4K
          height: { ideal: 2160 },
          facingMode: 'user', // or "environment" for back camera
        },
        audio: false,
      });

      liveRef.current.srcObject = stream;
    } catch (error) {
      console.error('failed to get camera', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (liveRef.current?.srcObject) {
      const tracks = (liveRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      // Do not set srcObject to null, just stop tracks to pause stream
    }
  }, []);

  const value = useMemo(
    () => ({ liveRef, startCamera, stopCamera, recording }),
    [startCamera, stopCamera],
  );

  return (
    <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
  );
};

export function useCamera() {
  const ctx = useContext(CameraContext);
  if (!ctx) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return ctx;
}
