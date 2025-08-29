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
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={recordPattern}
          disabled={recording.current}
        >
          {recording.current ? 'Recording...' : 'Record 10s Pattern'}
        </button>
      </div>
      <video ref={liveRef} autoPlay muted playsInline style={{ width: 480 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {decodedImages.length > 0 && (
        <div
          ref={galleryRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 16,
            width: '80vh',
          }}
        >
          {decodedImages.map((src, idx) => (
            <button
              type="button"
              key={src}
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewIdx(idx)}
              tabIndex={0}
              aria-label={`Preview frame ${idx + 1}`}
            >
              <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 600 }}>
                Frame {idx + 1}
              </h2>
              <img
                src={src}
                alt={`Frame ${idx + 1}`}
                style={{
                  maxWidth: '15vh',
                  minHeight: '20vh',
                  aspectRatio: 'auto',
                  border: '1px solid #888',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
      )}
      {previewIdx !== null && decodedImages.length > 0 && (
        <dialog
          open
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setPreviewIdx(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPreviewIdx(null);
              }
            }}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: '#fff',
              color: '#222',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 18,
              zIndex: 1001,
            }}
            aria-label="Close preview"
            // autoFocus removed for accessibility
          >
            Close
          </button>
          <img
            src={decodedImages[previewIdx]}
            alt={`Frame ${previewIdx + 1}`}
            style={{
              maxWidth: '54vh',
              minHeight: '72vh',
              aspectRatio: 'auto',
              border: '4px solid #fff',
              boxShadow: '0 0 24px #000',
              background: '#222',
              display: 'block',
            }}
          />
        </dialog>
      )}
    </div>
  );
}
