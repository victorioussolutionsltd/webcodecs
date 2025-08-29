import { useEffect, useRef, useState } from 'react';

import { useCamera } from '@/camera-context';
import {
  captureAndEncodeFrames,
  decodeFramesToImages,
} from '@/lib/utils/codec';
import { changeFrameRate } from '@/lib/utils/stream';

export function PatternRecorder() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const { liveRef, startCamera, stopCamera, recording } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [decodedImages, setDecodedImages] = useState<Array<string>>([]);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

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
    let width = 640;
    let height = 480;
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
    const maxFrames = 20;
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
    // Scroll to bottom of gallery with smooth animation
    setTimeout(() => {
      if (galleryRef.current) {
        galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      videoEncoder?.close();
    };
  }, [videoEncoder, startCamera, stopCamera]);

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

      {decodedImages.length > 0 && (
        <div ref={galleryRef} className="flex flex-wrap gap-2 mt-4 w-[80vh]">
          {decodedImages.map((src, idx) => (
            <button
              type="button"
              key={src}
              className="p-0 border-none bg-none cursor-pointer"
              onClick={() => setPreviewIdx(idx)}
              tabIndex={0}
              aria-label={`Preview frame ${idx + 1}`}
            >
              <h2 className="text-white text-2xl font-bold">Frame {idx + 1}</h2>
              <img
                src={src}
                alt={`Frame ${idx + 1}`}
                className="max-w-[15vh] min-h-[20vh] aspect-auto border border-gray-400 block"
              />
            </button>
          ))}
        </div>
      )}
      {previewIdx !== null && decodedImages.length > 0 && (
        <dialog
          open
          className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-[1000] border-none p-0 m-0"
        >
          <button
            type="button"
            onClick={() => setPreviewIdx(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPreviewIdx(null);
              }
            }}
            className="absolute top-6 right-6 bg-white text-gray-800 border-none rounded px-4 py-2 cursor-pointer text-lg z-[1001]"
            aria-label="Close preview"
          >
            Close
          </button>
          <img
            src={decodedImages[previewIdx]}
            alt={`Frame ${previewIdx + 1}`}
            className="max-w-[54vh] min-h-[72vh] aspect-auto border-4 border-white shadow-2xl bg-gray-900 block"
          />
        </dialog>
      )}
    </div>
  );
}
