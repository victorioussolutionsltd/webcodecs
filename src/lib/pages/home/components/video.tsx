import { useEffect, useRef, useState } from 'react';

import { useCamera } from '@/camera-context';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, MAX_FRAMES } from '@/lib/constants';
import {
  captureAndEncodeFrames,
  decodeFramesToImages,
} from '@/lib/utils/codec';
import { changeFrameRate } from '@/lib/utils/stream';

import { Gallery } from './gallery';

export const Video = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const { liveRef, startCamera, stopCamera, recording } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [decodedImages, setDecodedImages] = useState<Array<string>>([]);

  let videoEncoder: VideoEncoder | null = null;
  let frames: Array<EncodedVideoChunk> = [];

  const initEncoder = () => {
    frames = [];
    videoEncoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk) => {
        frames.push(chunk);
      },
      error: (error) => {
        console.error('decode error', error);
      },
    });

    // Get actual camera dimensions from liveRef
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;
    if (liveRef.current) {
      width = liveRef.current.videoWidth || width;
      height = liveRef.current.videoHeight || height;
    }

    videoEncoder.configure({
      codec: 'vp8',
      width,
      height,
      bitrate: 1_000_000,
      framerate: 2,
    });
  };

  const recordPattern = async () => {
    await startCamera();
    if (!(liveRef.current && canvasRef.current)) {
      return;
    }
    setDecodedImages([]);
    const stream = liveRef.current.srcObject as MediaStream;
    if (!stream) {
      return;
    }

    changeFrameRate({ stream, fps: 2 });
    initEncoder();

    const videoTrack = stream.getVideoTracks()[0];
    const ctx = canvasRef.current.getContext('2d');
    const maxFrames = MAX_FRAMES;

    if (!ctx) {
      return;
    }
    recording.current = true;
    if (!videoEncoder) {
      return;
    }

    await captureAndEncodeFrames(
      videoTrack,
      ctx,
      canvasRef.current,
      videoEncoder,
      recording,
      maxFrames,
    );

    await videoEncoder?.flush();
    videoEncoder?.close();
    videoEncoder = null;
    changeFrameRate({ stream, fps: 20 });
    // Decode and render images
    const decoded = await decodeFramesToImages(frames, ctx, canvasRef.current);
    setDecodedImages(decoded);

    stopCamera();
    // Scroll to bottom of gallery with smooth animation
    setTimeout(() => {
      if (galleryRef.current) {
        galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={recordPattern}
          disabled={recording.current}
          className={
            recording.current
              ? 'px-6 py-3 text-xl font-bold rounded-lg border-none bg-gradient-to-r from-gray-400 to-gray-300 text-white shadow-md cursor-not-allowed mb-2 transition'
              : 'px-6 py-3 text-xl font-bold rounded-lg border-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer mb-2 transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none'
          }
        >
          {recording.current ? 'Recording...' : 'Record 10s Pattern'}
        </button>
      </div>

      <video ref={liveRef} autoPlay muted playsInline className="w-[480px]" />

      <canvas ref={canvasRef} className="hidden" />
      <Gallery images={decodedImages} galleryRef={galleryRef} />
    </div>
  );
};
